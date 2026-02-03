
import React, { useState, useMemo } from 'react';
import { Transaction, Account, UserSettings, Company, User, UserRole } from '../types';
import { Icons } from '../constants';

interface AdminPanelProps {
  companies: Company[];
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;
  onRegister: (name: string, adminName: string, adminEmail: string, adminPass: string) => any;
  onUpdateCompany: (compId: string, updates: Partial<Company>, adminUpdates: Partial<User>) => void;
  transactions: Transaction[];
  accounts: Account[];
  settings: UserSettings;
  isOnline: boolean;
  onTriggerBackup?: () => void;
  onGlobalRefresh?: () => void;
  isSyncing?: boolean;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ companies, users, setUsers, setCompanies, onRegister, transactions, accounts, settings, isOnline, onTriggerBackup, onGlobalRefresh, isSyncing }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  // Find users waiting for approval (Global Queue)
  const pendingApprovals = useMemo(() => users.filter(u => u.status === 'PENDING'), [users]);

  const handleAction = () => {
    if (editingId) {
      resetForm();
    } else {
      if (!formData.name || !formData.adminName || !formData.adminEmail || formData.adminPin?.length !== 4) return;
      onRegister(formData.name, formData.adminName, formData.adminEmail, formData.adminPin);
      resetForm();
    }
  };

  const approveUser = async (userId: string) => {
    const userToApprove = users.find(u => u.id === userId);
    if (!userToApprove) return;

    // 1. Update Locally
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'ACTIVE' } : u));
    setCompanies(prev => prev.map(c => c.id === userToApprove.companyId ? { ...c, status: 'ACTIVE' } : c));
    
    // 2. Trigger Global Push
    if (onTriggerBackup) {
      setTimeout(() => onTriggerBackup(), 500);
    }
  };

  const rejectUser = (userId: string) => {
    if (confirm("Permanently reject this access request?")) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'REJECTED' } : u));
      if (onTriggerBackup) setTimeout(() => onTriggerBackup(), 500);
    }
  };

  const resetForm = () => {
    setFormData({});
    setIsAdding(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-10 animate-slide-up pb-20 max-w-2xl mx-auto px-2">
      <div className="flex justify-between items-center">
         <div>
            <h2 className="text-3xl font-black tracking-tightest text-slate-900 dark:text-white uppercase">Root Control</h2>
            <div className="flex items-center gap-2 mt-1">
               <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest italic">Enterprise Provider Authority</p>
               {isSyncing && (
                 <span className="text-[8px] font-black text-amber-500 uppercase animate-pulse flex items-center gap-1">
                    <div className="h-1 w-1 bg-amber-500 rounded-full" /> Checking Cloud...
                 </span>
               )}
            </div>
         </div>
         <button onClick={onGlobalRefresh} className="px-6 py-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-2xl text-[9px] font-black uppercase tracking-widest active-scale flex items-center gap-2 border border-emerald-500/10">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={isSyncing ? 'animate-spin' : ''}><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
            Force Refresh
         </button>
      </div>

      {/* Enrollment Queue */}
      <section className="space-y-4">
         <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em]">Global Enrollment Queue ({pendingApprovals.length})</h3>
            {pendingApprovals.length > 0 && <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />}
         </div>
         {pendingApprovals.length > 0 ? (
           <div className="space-y-4">
             {pendingApprovals.map(user => {
               const company = companies.find(c => c.id === user.companyId);
               return (
                 <div key={user.id} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] premium-shadow border border-rose-500/10 flex flex-col gap-6 animate-in zoom-in-95 duration-300">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="h-14 w-14 rounded-2xl bg-rose-50 dark:bg-rose-950 flex items-center justify-center font-black text-2xl text-rose-500 border border-rose-500/10">
                             {company?.name?.[0] || user.name[0]}
                          </div>
                          <div>
                             <h4 className="font-black text-lg text-slate-900 dark:text-white">{company?.name || 'New Enterprise'}</h4>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Awaiting Verification</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Admin Lead</p>
                          <p className="text-xs font-black text-slate-900 dark:text-white">{user.name}</p>
                       </div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-black/5">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Authorization Email</p>
                       <p className="text-sm font-bold text-slate-900 dark:text-white">{user.email}</p>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => approveUser(user.id)} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest active-scale shadow-xl shadow-emerald-500/20">Authorize & Activate</button>
                       <button onClick={() => rejectUser(user.id)} className="px-8 py-4 bg-rose-50 dark:bg-rose-900/10 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest active-scale border border-rose-100 dark:border-rose-500/20">Decline</button>
                    </div>
                 </div>
               );
             })}
           </div>
         ) : (
           <div className="py-16 text-center bg-slate-50 dark:bg-slate-900/30 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-slate-200 opacity-50"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Enrollment Queue Empty</p>
           </div>
         )}
      </section>

      {/* Sheet Migration */}
      <section className="bg-emerald-950 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full"></div>
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
               <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-50 mb-1">Global Safety</p>
               <h3 className="text-2xl font-black">Sheet Migration</h3>
               <p className="text-xs opacity-40 mt-1 uppercase font-bold">Push entire ecosystem state to master drive</p>
            </div>
            <button 
              onClick={onTriggerBackup}
              disabled={!isOnline || isSyncing}
              className="px-10 py-5 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active-scale disabled:opacity-30 disabled:pointer-events-none"
            >
               {isSyncing ? 'Processing...' : 'Deploy Backup'}
            </button>
         </div>
      </section>

      {/* Registry Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Active Client Registry</h3>
            <button onClick={() => setIsAdding(!isAdding)} className={`h-12 w-12 text-white rounded-2xl flex items-center justify-center shadow-lg active-scale transition-all ${isAdding ? 'bg-rose-500 rotate-45' : 'bg-slate-900 dark:bg-emerald-600'}`}>
               <Icons.Add className="w-6 h-6" />
            </button>
        </div>

        {isAdding && (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] premium-shadow border-2 border-emerald-500/10 space-y-6 animate-in zoom-in-95 duration-300">
             <h3 className="text-lg font-black uppercase tracking-tightest">Manual License Provision</h3>
             <input value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 font-black text-sm border-none text-slate-900 dark:text-white" placeholder="Company Name" />
             <input type="email" value={formData.adminEmail || ''} onChange={e => setFormData({...formData, adminEmail: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 font-black text-sm border-none text-slate-900 dark:text-white" placeholder="Admin Email" />
             <div className="grid grid-cols-2 gap-4">
               <input value={formData.adminName || ''} onChange={e => setFormData({...formData, adminName: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 font-black text-sm border-none text-slate-900 dark:text-white" placeholder="Admin Name" />
               <input maxLength={4} value={formData.adminPin || ''} onChange={e => setFormData({...formData, adminPin: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 font-black text-sm border-none text-center text-slate-900 dark:text-white" placeholder="PIN" />
             </div>
             <button onClick={handleAction} className="w-full py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest active-scale shadow-xl shadow-emerald-500/20">Deploy Provision</button>
          </div>
        )}

        <div className="space-y-4">
          {companies.filter(c => c.id !== 'SYSTEM').map(company => (
            <div key={company.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 premium-shadow border border-black/[0.02] flex items-center justify-between group">
              <div className="flex items-center gap-4">
                 <div className={`h-14 w-14 rounded-2xl flex items-center justify-center font-black text-xl ${company.status === 'SUSPENDED' ? 'bg-rose-50 text-rose-300' : 'bg-emerald-50 dark:bg-slate-800 text-emerald-600'}`}>
                   {company.name[0]}
                 </div>
                 <div>
                   <h4 className={`font-black text-sm ${company.status === 'SUSPENDED' ? 'text-slate-300 line-through' : 'text-slate-900 dark:text-white'}`}>{company.name}</h4>
                   <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[7px] font-black uppercase px-2 py-1 rounded ${company.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {company.status}
                      </span>
                   </div>
                 </div>
              </div>
              <div className="text-right">
                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Admin Reach</p>
                 <p className="text-[10px] font-black text-slate-900 dark:text-white truncate max-w-[120px]">
                   {users.find(u => u.companyId === company.id && u.role === UserRole.ADMIN)?.email || 'Unassigned'}
                 </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminPanel;
