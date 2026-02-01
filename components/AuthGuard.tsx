
import React, { useState } from 'react';
import { User, Company, UserRole } from '../types';

interface AuthGuardProps {
  companies: Company[];
  users: User[];
  onUnlock: (userId: string) => void;
  onRegister: (name: string, adminName: string, adminEmail: string, adminPass: string) => Promise<string>;
  onRemoteLogin: (email: string, pass: string) => Promise<string | null>;
  onBack: () => void;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ companies, users, onUnlock, onRegister, onRemoteLogin, onBack }) => {
  const [view, setView] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [formData, setFormData] = useState({ 
    company: '', 
    name: '', 
    email: '', 
    password: '',
    confirmPassword: ''
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
      const hashedInput = await hashPassword(formData.password);
      const localUser = users.find(u => u.email.toLowerCase() === formData.email.toLowerCase() && (u.password === hashedInput || u.password === formData.password));
      
      if (localUser) {
        onUnlock(localUser.id);
        return;
      }

      const remoteId = await onRemoteLogin(formData.email, formData.password);
      if (remoteId) {
        onUnlock(remoteId);
      } else {
        setError('Authentication failed. Check credentials or connectivity.');
      }
    } catch (err) {
      setError('System Error. Please retry.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company || !formData.name || !formData.email || !formData.password) {
      setError('Required fields missing.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords mismatch.');
      return;
    }
    
    setIsSyncing(true);
    try {
      const newId = await onRegister(formData.company, formData.name, formData.email, formData.password);
      onUnlock(newId);
    } catch (err) {
      setError('Registration failed.');
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
           <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1 italic opacity-60">
             {isSyncing ? 'Authenticating Cloud...' : 'Enterprise Security Gateway'}
           </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/10 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-2xl text-center">
            {error}
          </div>
        )}

        {view === 'LOGIN' ? (
          <form onSubmit={handleLogin} className="space-y-4 animate-in slide-in-from-bottom-4">
             <div className="space-y-1">
                <label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest ml-4">Email Address</label>
                <input 
                  type="email"
                  required
                  placeholder="name@company.com" 
                  className="w-full bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] font-bold text-sm border border-emerald-500/5 shadow-sm focus:ring-2 focus:ring-emerald-500/10 text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                />
             </div>
             <div className="space-y-1">
                <label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest ml-4">Password</label>
                <input 
                  type="password"
                  required
                  placeholder="••••••••" 
                  className="w-full bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] font-bold text-sm border border-emerald-500/5 shadow-sm focus:ring-2 focus:ring-emerald-500/10 text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700" 
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                />
             </div>
             <button disabled={isSyncing} type="submit" className="w-full py-5 mt-4 bg-emerald-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest active-scale shadow-xl shadow-emerald-500/20 disabled:opacity-50">
               {isSyncing ? 'Synchronizing...' : 'Authorize Sign In'}
             </button>
             <div className="flex flex-col gap-2 mt-4">
                <button type="button" onClick={() => setView('SIGNUP')} className="w-full text-[10px] font-black text-emerald-600 uppercase tracking-widest">Enterprise Enrollment</button>
                <button type="button" onClick={onBack} className="w-full text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">Back to Landing</button>
             </div>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4 animate-in slide-in-from-bottom-4">
             <div className="space-y-1">
                <label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest ml-4">Business Unit Name</label>
                <input 
                  required
                  placeholder="Azeem Traders" 
                  className="w-full bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] font-bold text-sm border border-emerald-500/5 shadow-sm text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700" 
                  value={formData.company} 
                  onChange={e => setFormData({...formData, company: e.target.value})} 
                />
             </div>
             <div className="space-y-1">
                <label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest ml-4">Full Name</label>
                <input 
                  required
                  placeholder="Zain Azeem" 
                  className="w-full bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] font-bold text-sm border border-emerald-500/5 shadow-sm text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
             </div>
             <div className="space-y-1">
                <label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest ml-4">Login Email</label>
                <input 
                  type="email"
                  required
                  placeholder="admin@company.com" 
                  className="w-full bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] font-bold text-sm border border-emerald-500/5 shadow-sm text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                   <label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest ml-4">Access Code</label>
                   <input 
                     type="password"
                     required
                     placeholder="••••" 
                     className="w-full bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] font-bold text-sm border border-emerald-500/5 shadow-sm text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700" 
                     value={formData.password} 
                     onChange={e => setFormData({...formData, password: e.target.value})} 
                   />
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest ml-4">Verify Code</label>
                   <input 
                     type="password"
                     required
                     placeholder="••••" 
                     className="w-full bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] font-bold text-sm border border-emerald-500/5 shadow-sm text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700" 
                     value={formData.confirmPassword} 
                     onChange={e => setFormData({...formData, confirmPassword: e.target.value})} 
                   />
                </div>
             </div>
             <button disabled={isSyncing} type="submit" className="w-full py-5 mt-4 bg-emerald-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest active-scale shadow-xl disabled:opacity-50">
                {isSyncing ? 'Provisioning...' : 'Initiate License'}
             </button>
             <button type="button" onClick={() => setView('LOGIN')} className="w-full text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-4">Legacy Access Portal</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthGuard;
