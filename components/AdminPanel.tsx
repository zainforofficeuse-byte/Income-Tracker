
import React, { useState, useMemo } from 'react';
import { Transaction, Account, UserSettings, Company, User, UserRole } from '../types';
import { Icons } from '../constants';

interface AdminPanelProps {
  companies: Company[];
  users: User[];
  // Updated to match handleRegisterCompany signature in App.tsx
  onRegister: (name: string, adminName: string, adminEmail: string, adminPass: string) => any;
  transactions: Transaction[];
  accounts: Account[];
  settings: UserSettings;
  onUpdateConfig: (config: any) => void;
  onConnect: () => void;
  isOnline: boolean;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ companies, users, onRegister, transactions, accounts, settings, isOnline }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState(''); // Added email state
  const [newAdminPin, setNewAdminPin] = useState('');

  const syncStats = useMemo(() => {
    const pending = transactions.filter(t => t.syncStatus === 'PENDING').length;
    return { pending };
  }, [transactions]);

  const handleRegister = () => {
    // Corrected to pass all 4 required arguments to onRegister
    if (!newCompanyName || !newAdminName || !newAdminEmail || newAdminPin.length !== 4) return;
    onRegister(newCompanyName, newAdminName, newAdminEmail, newAdminPin);
    setNewCompanyName('');
    setNewAdminName('');
    setNewAdminEmail('');
    setNewAdminPin('');
    setIsAdding(false);
  };

  const handleManualBackup = () => {
    const data = { companies, users, transactions, accounts, settings };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TRACKR_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-10 animate-slide-up pb-20">
      <div className="text-center">
         <h2 className="text-2xl font-black tracking-tightest uppercase">System Control</h2>
         <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-1 italic">Software Provider Authority</p>
      </div>

      <section className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 premium-shadow flex flex-col items-center border border-black/[0.02] dark:border-white/5">
           <p className="text-[8px] font-black text-slate-400 uppercase mb-2 text-center">Cloud Health</p>
           <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <p className={`text-sm font-black uppercase ${isOnline ? 'text-emerald-500' : 'text-rose-500'}`}>{isOnline ? 'Online' : 'Offline'}</p>
           </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 premium-shadow flex flex-col items-center border border-black/[0.02] dark:border-white/5">
           <p className="text-[8px] font-black text-slate-400 uppercase mb-2 text-center">Sync Queue</p>
           <p className={`text-sm font-black ${syncStats.pending > 0 ? 'text-amber-500' : 'text-indigo-500'}`}>
             {syncStats.pending} Pending
           </p>
        </div>
      </section>

      {/* Manual Backup Utility */}
      <section className="bg-slate-950 rounded-[3rem] p-8 text-white space-y-4">
         <div className="flex items-center justify-between">
           <h3 className="text-[10px] font-black uppercase tracking-widest opacity-50">Enterprise Vault</h3>
           <Icons.Admin className="w-5 h-5 text-indigo-500" />
         </div>
         <p className="text-xs font-bold opacity-80 leading-relaxed">Download a complete snapshot of your local database. Use this as a failsafe for manual migrations.</p>
         <button 
           onClick={handleManualBackup}
           className="w-full py-4 bg-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] active-scale shadow-lg shadow-indigo-500/20"
         >
           Export Offline Data
         </button>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Client Registry</h3>
            <button onClick={() => setIsAdding(!isAdding)} className="h-10 w-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg active-scale">
               {isAdding ? '×' : '+'}
            </button>
        </div>

        {isAdding && (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] premium-shadow border-2 border-indigo-500/10 space-y-6 animate-in zoom-in-95 duration-300">
             <div className="space-y-1">
               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Company Name</label>
               <input value={newCompanyName} onChange={e => setNewCompanyName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 font-black text-sm border-none" placeholder="e.g. Azeem Solutions" />
             </div>
             {/* Added Email Input for New Companies */}
             <div className="space-y-1">
               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Admin Email</label>
               <input value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 font-black text-sm border-none" placeholder="admin@company.com" />
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Admin Name</label>
                 <input value={newAdminName} onChange={e => setNewAdminName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 font-black text-sm border-none" />
               </div>
               <div className="space-y-1">
                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Initial PIN</label>
                 <input maxLength={4} value={newAdminPin} onChange={e => setNewAdminPin(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 font-black text-sm border-none text-center" />
               </div>
             </div>
             <button onClick={handleRegister} className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest active-scale">Provision License</button>
          </div>
        )}

        <div className="space-y-4">
          {companies.map(company => (
            <div key={company.id} className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 premium-shadow border border-black/[0.02] dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-indigo-500 font-black text-xl">
                   {company.name[0]}
                 </div>
                 <div>
                   <h4 className="font-black text-sm">{company.name}</h4>
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                     Admin: {users.find(u => u.companyId === company.id && u.role === UserRole.ADMIN)?.name || 'Unassigned'}
                   </p>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminPanel;