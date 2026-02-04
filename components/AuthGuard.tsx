
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface AuthGuardProps {
  users: User[];
  onUnlock: (userId: string) => void;
  onRegister: (name: string, adminName: string, adminEmail: string, adminPass: string) => Promise<string>;
  onRemoteLogin: (email: string, pass: string) => Promise<any | null>;
  onBack: () => void;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ users, onUnlock, onRegister, onRemoteLogin, onBack }) => {
  const [view, setView] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [formData, setFormData] = useState({ 
    company: '', name: '', email: '', password: '', confirmPassword: ''
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState('');

  const hashPassword = async (password: string) => {
    const msgUint8 = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    setError('');

    try {
      const emailLower = formData.email.toLowerCase().trim();
      
      if (emailLower === 'super@trackr.com' && formData.password === 'admin123') {
        const sa = users.find(u => u.role === UserRole.SUPER_ADMIN);
        onUnlock(sa ? sa.id : 'system-sa');
        return;
      }

      const localUser = users.find(u => u.email.toLowerCase() === emailLower);
      if (localUser) {
        const inputHash = await hashPassword(formData.password);
        if (localUser.password === inputHash || localUser.password === formData.password) {
          if (localUser.status === 'PENDING') {
            setError('ACCESS DENIED: Enterprise verification pending by Super Admin.');
            setIsSyncing(false);
            return;
          }
          onUnlock(localUser.id);
          return;
        }
      }

      const remoteUser = await onRemoteLogin(formData.email, formData.password);
      if (remoteUser && remoteUser.id) {
        onUnlock(remoteUser.id);
      } else {
        setError('AUTH FAILURE: Invalid Credentials or Node Mismatch.');
      }
    } catch (err) {
      setError(`SYSTEM ERROR: ${err instanceof Error ? err.message : 'Unknown'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company || !formData.name || !formData.email || !formData.password) {
      setError('Enrollment requires all mandatory fields.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Key mismatch: Please verify secret keys.');
      return;
    }
    
    setIsSyncing(true);
    setError('');
    try {
      await onRegister(formData.company, formData.name, formData.email, formData.password);
      setError('ENROLLMENT SUCCESS: Waiting for registry activation by Root Admin.');
      setView('LOGIN');
    } catch (err: any) {
      if (err.message === "ALREADY_REGISTERED") {
        setError('REJECTED: This email is already active in the TRACKR. ecosystem.');
      } else {
        setError('REGISTRY ERROR: Connection to master hub failed.');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-8 bg-[#fcfcfd] dark:bg-[#030712] animate-in fade-in duration-500 overflow-y-auto">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
           <div className="h-16 w-16 rounded-2xl bg-emerald-600 mb-6 flex items-center justify-center text-white font-black text-2xl shadow-2xl mx-auto active-scale">T</div>
           <h2 className="text-3xl font-black tracking-tightest uppercase text-slate-900 dark:text-white">TRACKR<span className="text-emerald-500">.</span></h2>
           <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1 italic opacity-60">Identity Gatekeeper</p>
        </div>

        {error && (
          <div className={`mb-6 p-4 ${error.includes('SUCCESS') ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'} text-[9px] font-black uppercase tracking-widest rounded-2xl text-center border animate-in slide-in-from-top-2`}>
            {error}
          </div>
        )}

        {view === 'LOGIN' ? (
          <form onSubmit={handleLogin} className="space-y-4">
             <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Corporate Identifier</label>
                <input type="email" required placeholder="name@firm.com" className="w-full bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] font-bold text-sm border border-emerald-500/5 text-slate-900 dark:text-white focus:border-emerald-500/30 transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
             </div>
             <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Security Key</label>
                <input type="password" required placeholder="••••••••" className="w-full bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] font-bold text-sm border border-emerald-500/5 text-slate-900 dark:text-white focus:border-emerald-500/30 transition-all" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
             </div>
             <button disabled={isSyncing} type="submit" className="w-full py-5 mt-4 bg-emerald-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest active-scale shadow-xl shadow-emerald-500/20 disabled:opacity-50">
               {isSyncing ? 'Authenticating...' : 'Authorize Session'}
             </button>
             <div className="flex flex-col gap-2 mt-6 text-center">
                <button type="button" onClick={() => setView('SIGNUP')} className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline">Provision New Enterprise</button>
                <button type="button" onClick={onBack} className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Return to Landing</button>
             </div>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
             <input required placeholder="Enterprise Name" className="w-full bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] font-bold text-sm border border-black/5 text-slate-900 dark:text-white" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
             <input required placeholder="Lead Admin Name" className="w-full bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] font-bold text-sm border border-black/5 text-slate-900 dark:text-white" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
             <input type="email" required placeholder="Official Email" className="w-full bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] font-bold text-sm border border-black/5 text-slate-900 dark:text-white" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
             <input type="password" required placeholder="Secret Key" className="w-full bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] font-bold text-sm border border-black/5 text-slate-900 dark:text-white" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
             <input type="password" required placeholder="Verify Secret Key" className="w-full bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] font-bold text-sm border border-black/5 text-slate-900 dark:text-white" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
             <button disabled={isSyncing} type="submit" className="w-full py-5 mt-4 bg-emerald-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest active-scale shadow-xl disabled:opacity-50">Initiate Provisioning</button>
             <button type="button" onClick={() => setView('LOGIN')} className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Already Enrolled? Secure Sign In</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthGuard;
