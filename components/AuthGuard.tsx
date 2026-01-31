
import React, { useState } from 'react';
import { User, Company, UserRole } from '../types';

interface AuthGuardProps {
  companies: Company[];
  users: User[];
  onUnlock: (userId: string) => void;
  onRegister: (name: string, adminName: string, adminEmail: string, adminPass: string) => string;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ companies, users, onUnlock, onRegister }) => {
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
           <div className="h-16 w-16 rounded-2xl bg-indigo-600 mb-6 flex items-center justify-center text-white font-black text-2xl shadow-2xl mx-auto">T</div>
           <h2 className="text-3xl font-black tracking-tightest uppercase">TRACKR<span className="text-indigo-600">.</span></h2>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">Enterprise Gateway</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/10 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-2xl text-center animate-shake">
            {error}
          </div>
        )}

        {view === 'LOGIN' ? (
          <form onSubmit={handleLogin} className="space-y-4 animate-in slide-in-from-bottom-4">
             <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Email Address</label>
                <input 
                  type="email"
                  placeholder="name@company.com" 
                  className="w-full bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] font-bold text-sm border-none shadow-sm" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                />
             </div>
             <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Password</label>
                <input 
                  type="password"
                  placeholder="••••••••" 
                  className="w-full bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] font-bold text-sm border-none shadow-sm" 
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                />
             </div>
             <button type="submit" className="w-full py-5 mt-4 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest active-scale shadow-xl shadow-indigo-500/20">Sign In</button>
             <button type="button" onClick={() => setView('SIGNUP')} className="w-full text-[10px] font-black text-indigo-600 uppercase tracking-widest pt-4">Need a business account? Sign Up</button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4 animate-in slide-in-from-bottom-4">
             <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Business Name</label>
                <input 
                  placeholder="Azeem Traders" 
                  className="w-full bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] font-bold text-sm border-none shadow-sm" 
                  value={formData.company} 
                  onChange={e => setFormData({...formData, company: e.target.value})} 
                />
             </div>
             <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Admin Full Name</label>
                <input 
                  placeholder="Zain Azeem" 
                  className="w-full bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] font-bold text-sm border-none shadow-sm" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
             </div>
             <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Email</label>
                <input 
                  type="email"
                  placeholder="admin@trackr.com" 
                  className="w-full bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] font-bold text-sm border-none shadow-sm" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Password</label>
                   <input 
                     type="password"
                     placeholder="••••" 
                     className="w-full bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] font-bold text-sm border-none shadow-sm" 
                     value={formData.password} 
                     onChange={e => setFormData({...formData, password: e.target.value})} 
                   />
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Confirm</label>
                   <input 
                     type="password"
                     placeholder="••••" 
                     className="w-full bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] font-bold text-sm border-none shadow-sm" 
                     value={formData.confirmPassword} 
                     onChange={e => setFormData({...formData, confirmPassword: e.target.value})} 
                   />
                </div>
             </div>
             <button type="submit" className="w-full py-5 mt-4 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest active-scale shadow-xl shadow-indigo-500/20">Create My ERP</button>
             <button type="button" onClick={() => setView('LOGIN')} className="w-full text-[10px] font-black text-indigo-600 uppercase tracking-widest pt-4">Already registered? Login</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthGuard;
