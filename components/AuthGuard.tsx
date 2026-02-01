
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
      
      // 1. HARD BYPASS FOR SUPER ADMIN
      if (emailLower === 'super@trackr.com' && formData.password === 'admin123') {
        const sa = users.find(u => u.id === 'system-sa');
        if (sa) {
          onUnlock(sa.id);
          return;
        }
      }

      // 2. Normal Local Auth
      const localUser = users.find(u => u.email.toLowerCase() === emailLower);
      if (localUser) {
        const inputHash = await hashPassword(formData.password);
        if (localUser.password === inputHash || localUser.password === formData.password) {
          if (localUser.status === 'PENDING' && localUser.role !== UserRole.SUPER_ADMIN) {
            setError('Account Pending: Waiting for Provider Approval.');
            setIsSyncing(false);
            return;
          }
          onUnlock(localUser.id);
          return;
        }
      }

      // 3. Remote Cloud Auth
      const remoteUser = await onRemoteLogin(formData.email, formData.password);
      if (remoteUser && remoteUser.id) {
        if (remoteUser.status === 'PENDING') {
          setError('Remote Account Pending Approval.');
        } else {
          onUnlock(remoteUser.id);
        }
      } else {
        setError('Verification failed. Invalid ID or Pin.');
      }
    } catch (err) {
      setError('Internal security error.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company || !formData.name || !formData.email || !formData.password) {
      setError('All fields are mandatory.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    setIsSyncing(true);
    try {
      await onRegister(formData.company, formData.name, formData.email, formData.password);
      setError('Success! Account is now PENDING approval.');
      setView('LOGIN');
    } catch (err) {
      setError('Registration restricted.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-8 bg-[#fcfcfd] dark:bg-[#030712] animate-in fade-in duration-500 overflow-y-auto">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
           <div className="h-16 w-16 rounded-2xl bg-emerald-600 mb-6 flex items-center justify-center text-white font-black text-2xl shadow-2xl mx-auto">T</div>
           <h2 className="text-3xl font-black tracking-tightest uppercase text-slate-900 dark:text-white">TRACKR<span className="text-emerald-500">.</span></h2>
           <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1 italic opacity-60">Security Gateway</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-2xl text-center border border-emerald-500/10">
            {error}
          </div>
        )}

        {view === 'LOGIN' ? (
          <form onSubmit={handleLogin} className="space-y-4">
             <div className="space-y-1">
                <label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest ml-4">Authorized Email</label>
                <input type="email" required placeholder="name@company.com" className="w-full bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] font-bold text-sm border border-emerald-500/5 text-slate-900 dark:text-white" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
             </div>
             <div className="space-y-1">
                <label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest ml-4">Access Secret</label>
                <input type="password" required placeholder="••••••••" className="w-full bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] font-bold text-sm border border-emerald-500/5 text-slate-900 dark:text-white" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
             </div>
             <button disabled={isSyncing} type="submit" className="w-full py-5 mt-4 bg-emerald-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest active-scale shadow-xl shadow-emerald-500/20 disabled:opacity-50">
               {isSyncing ? 'Authenticating...' : 'Sign In'}
             </button>
             <div className="flex flex-col gap-2 mt-4 text-center">
                <button type="button" onClick={() => setView('SIGNUP')} className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Register Enterprise</button>
                <button type="button" onClick={onBack} className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">Back</button>
             </div>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
             <input required placeholder="Enterprise Name" className="w-full bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] font-bold text-sm border border-emerald-500/5 text-slate-900 dark:text-white" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
             <input required placeholder="Administrator Name" className="w-full bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] font-bold text-sm border border-emerald-500/5 text-slate-900 dark:text-white" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
             <input type="email" required placeholder="Auth Email" className="w-full bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] font-bold text-sm border border-emerald-500/5 text-slate-900 dark:text-white" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
             <input type="password" required placeholder="Choose Password" className="w-full bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] font-bold text-sm border border-emerald-500/5 text-slate-900 dark:text-white" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
             <input type="password" required placeholder="Verify Password" className="w-full bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] font-bold text-sm border border-emerald-500/5 text-slate-900 dark:text-white" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
             <button disabled={isSyncing} type="submit" className="w-full py-5 mt-4 bg-emerald-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest active-scale shadow-xl disabled:opacity-50">Provision Request</button>
             <button type="button" onClick={() => setView('LOGIN')} className="w-full text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-4">Legacy Portal</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthGuard;
