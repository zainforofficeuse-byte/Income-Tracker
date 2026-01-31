
import React, { useState } from 'react';
import { User, Company, UserRole } from '../types';

interface AuthGuardProps {
  companies: Company[];
  users: User[];
  onUnlock: (userId: string) => void;
  onRegister: (name: string, adminName: string, adminEmail: string, adminPass: string) => string;
  onBack: () => void;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ companies, users, onUnlock, onRegister, onBack }) => {
  const [view, setView] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [formData, setFormData] = useState({ 
    company: '', 
    name: '', 
    email: '', 
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.email === formData.email && u.password === formData.password);
    if (user) {
      onUnlock(user.id);
    } else {
      setError('Invalid email or password');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company || !formData.name || !formData.email || !formData.password) {
      setError('All fields are required');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (users.find(u => u.email === formData.email)) {
      setError('Email already registered');
      return;
    }

    const newId = onRegister(formData.company, formData.name, formData.email, formData.password);
    onUnlock(newId);
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-8 bg-[#fcfcfd] dark:bg-[#030712] animate-in fade-in duration-500 overflow-y-auto">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
           <button onClick={onBack} className="h-16 w-16 rounded-2xl bg-emerald-600 mb-6 flex items-center justify-center text-white font-black text-2xl shadow-2xl mx-auto active-scale transition-transform">T</button>
           <h2 className="text-3xl font-black tracking-tightest uppercase text-slate-900 dark:text-white">TRACKR<span className="text-emerald-500">.</span></h2>
           <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1 italic opacity-60">Enterprise Gateway</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/10 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-2xl text-center animate-shake">
            {error}
          </div>
        )}

        {view === 'LOGIN' ? (
          <form onSubmit={handleLogin} className="space-y-4 animate-in slide-in-from-bottom-4">
             <div className="space-y-1">
                <label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest ml-4">Email Address</label>
                <input 
                  type="email"
                  placeholder="name@company.com" 
                  className="w-full bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] font-bold text-sm border border-emerald-500/5 shadow-sm focus:ring-2 focus:ring-emerald-500/10" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                />
             </div>
             <div className="space-y-1">
                <label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest ml-4">Password</label>
                <input 
                  type="password"
                  placeholder="••••••••" 
                  className="w-full bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] font-bold text-sm border border-emerald-500/5 shadow-sm focus:ring-2 focus:ring-emerald-500/10" 
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                />
             </div>
             <button type="submit" className="w-full py-5 mt-4 bg-emerald-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest active-scale shadow-xl shadow-emerald-500/20">Sign In</button>
             <div className="flex flex-col gap-2 mt-4">
                <button type="button" onClick={() => setView('SIGNUP')} className="w-full text-[10px] font-black text-emerald-600 uppercase tracking-widest">Need a business account? Sign Up</button>
                <button type="button" onClick={onBack} className="w-full text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">Return to Home</button>
             </div>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4 animate-in slide-in-from-bottom-4">
             <div className="space-y-1">
                <label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest ml-4">Business Name</label>
                <input 
                  placeholder="Azeem Traders" 
                  className="w-full bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] font-bold text-sm border border-emerald-500/5 shadow-sm focus:ring-2 focus:ring-emerald-500/10" 
                  value={formData.company} 
                  onChange={e => setFormData({...formData, company: e.target.value})} 
                />
             </div>
             <div className="space-y-1">
                <label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest ml-4">Admin Full Name</label>
                <input 
                  placeholder="Zain Azeem" 
                  className="w-full bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] font-bold text-sm border border-emerald-500/5 shadow-sm focus:ring-2 focus:ring-emerald-500/10" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
             </div>
             <div className="space-y-1">
                <label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest ml-4">Email</label>
                <input 
                  type="email"
                  placeholder="admin@trackr.com" 
                  className="w-full bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] font-bold text-sm border border-emerald-500/5 shadow-sm focus:ring-2 focus:ring-emerald-500/10" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                   <label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest ml-4">Password</label>
                   <input 
                     type="password"
                     placeholder="••••" 
                     className="w-full bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] font-bold text-sm border border-emerald-500/5 shadow-sm focus:ring-2 focus:ring-emerald-500/10" 
                     value={formData.password} 
                     onChange={e => setFormData({...formData, password: e.target.value})} 
                   />
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest ml-4">Confirm</label>
                   <input 
                     type="password"
                     placeholder="••••" 
                     className="w-full bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] font-bold text-sm border border-emerald-500/5 shadow-sm focus:ring-2 focus:ring-emerald-500/10" 
                     value={formData.confirmPassword} 
                     onChange={e => setFormData({...formData, confirmPassword: e.target.value})} 
                   />
                </div>
             </div>
             <button type="submit" className="w-full py-5 mt-4 bg-emerald-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest active-scale shadow-xl shadow-emerald-500/20">Create My ERP</button>
             <div className="flex flex-col gap-2 mt-4 text-center">
                <button type="button" onClick={() => setView('LOGIN')} className="w-full text-[10px] font-black text-emerald-600 uppercase tracking-widest">Already registered? Login</button>
                <button type="button" onClick={onBack} className="w-full text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">Back to Landing</button>
             </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthGuard;
