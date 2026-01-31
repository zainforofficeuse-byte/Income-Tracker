
import React, { useState, useMemo } from 'react';
import { User, Company, UserRole } from '../types';

interface AuthGuardProps {
  companies: Company[];
  users: User[];
  onUnlock: (userId: string) => void;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ companies, users, onUnlock }) => {
  const [step, setStep] = useState<'COMPANY' | 'USER' | 'PIN'>('COMPANY');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const filteredUsers = useMemo(() => {
    if (!selectedCompanyId) return [];
    return users.filter(u => u.companyId === selectedCompanyId);
  }, [selectedCompanyId, users]);

  const handlePinPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        if (selectedUser && selectedUser.pin === newPin) {
          onUnlock(selectedUser.id);
        } else {
          setError(true);
          setTimeout(() => { setPin(''); setError(false); }, 500);
        }
      }
    }
  };

  if (step === 'COMPANY') {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-8 bg-[#fcfcfd] dark:bg-[#0f172a] animate-in fade-in duration-500 overflow-y-auto no-scrollbar">
        <div className="h-16 w-16 rounded-2xl bg-indigo-600 shadow-xl mb-6 flex items-center justify-center text-white font-black text-2xl">T</div>
        <h2 className="text-2xl font-black tracking-tightest mb-2 text-center uppercase text-slate-900 dark:text-white">Enterprise Portal</h2>
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-12">Select Organization</p>
        
        <div className="w-full max-w-xs space-y-4 pb-10">
          <button 
            onClick={() => { setSelectedCompanyId('SYSTEM'); setStep('USER'); }}
            className="w-full flex items-center justify-between p-6 bg-slate-900 dark:bg-slate-800 text-white rounded-[2rem] active-scale transition-all border border-white/10"
          >
             <span className="font-black text-xs uppercase tracking-widest">System Master</span>
             <div className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>
          </button>

          <div className="flex items-center gap-4 py-4">
             <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
             <span className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">Registered Clients</span>
             <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
          </div>

          {companies.map(c => (
            <button key={c.id} onClick={() => { setSelectedCompanyId(c.id); setStep('USER'); }} className="w-full flex items-center gap-4 p-5 bg-white dark:bg-slate-800/80 rounded-[2rem] premium-shadow border border-black/[0.03] dark:border-white/5 active-scale text-left">
               <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500 font-black text-xl">{c.name[0]}</div>
               <div>
                  <p className="font-black text-sm text-slate-900 dark:text-white">{c.name}</p>
                  <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Active License</p>
               </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 'USER') {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-8 bg-[#fcfcfd] dark:bg-[#0f172a] animate-in slide-in-from-right-10 duration-500 overflow-y-auto no-scrollbar">
        <button onClick={() => setStep('COMPANY')} className="mb-8 text-[9px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Switch Organization
        </button>
        <h2 className="text-xl font-black tracking-tightest mb-8 text-center uppercase text-slate-900 dark:text-white">Identify Profile</h2>
        <div className="grid grid-cols-2 gap-6 w-full max-w-xs pb-10">
          {filteredUsers.map(u => (
            <button key={u.id} onClick={() => { setSelectedUser(u); setStep('PIN'); }} className="flex flex-col items-center gap-3 active-scale group">
               <div className="h-24 w-24 rounded-[3rem] bg-indigo-50 dark:bg-slate-800 flex items-center justify-center border-2 border-transparent group-hover:border-indigo-500 transition-all overflow-hidden text-2xl font-black text-indigo-500 shadow-sm">
                  {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : u.name[0]}
               </div>
               <div className="text-center">
                 <p className="text-xs font-black text-slate-900 dark:text-white">{u.name}</p>
                 <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{u.role}</p>
               </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col items-center justify-between py-16 px-8 bg-[#fcfcfd] dark:bg-[#0f172a] animate-in zoom-in-95 duration-500">
      <div className="flex flex-col items-center">
        <button onClick={() => { setSelectedUser(null); setStep('USER'); setPin(''); }} className="mb-8 text-[9px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
           <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
           Back to Users
        </button>
        <div className="h-24 w-24 rounded-[2.5rem] bg-indigo-50 dark:bg-slate-800 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-2xl overflow-hidden mb-6 text-3xl font-black text-indigo-500">
           {selectedUser?.avatar ? <img src={selectedUser.avatar} className="w-full h-full object-cover" /> : selectedUser?.name[0]}
        </div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Hi, {selectedUser?.name.split(' ')[0]}</h3>
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Enter Security PIN</p>
      </div>

      <div className="space-y-10 w-full max-w-xs flex flex-col items-center pb-10">
        <div className={`flex gap-6 ${error ? 'animate-bounce' : ''}`}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`h-4 w-4 rounded-full transition-all duration-300 ${pin.length > i ? (error ? 'bg-rose-500' : 'bg-indigo-600 scale-125') : 'bg-slate-200 dark:bg-slate-800'}`} />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-x-8 gap-y-6">
          {['1','2','3','4','5','6','7','8','9','','0','C'].map((val, idx) => (
            val === '' ? <div key={idx} /> : (
              <button 
                key={idx} 
                onClick={() => val === 'C' ? setPin('') : handlePinPress(val)}
                className="h-16 w-16 rounded-full flex items-center justify-center text-xl font-black text-slate-900 dark:text-white active:bg-slate-100 dark:active:bg-slate-800 transition-colors"
              >
                {val}
              </button>
            )
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuthGuard;
