
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
  onNotifyApproval?: (user: User) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ companies, users, setUsers, setCompanies, onRegister, settings, isOnline, onTriggerBackup, onGlobalRefresh, isSyncing, onNotifyApproval }) => {
  const pendingApprovals = useMemo(() => users.filter(u => u.status === 'PENDING' && u.role !== UserRole.SUPER_ADMIN), [users]);

  const approveUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'ACTIVE' } : u));
    setCompanies(prev => prev.map(c => c.id === user.companyId ? { ...c, status: 'ACTIVE' } : c));
    if (onTriggerBackup) setTimeout(() => onTriggerBackup(), 300);
    if (onNotifyApproval) onNotifyApproval({ ...user, status: 'ACTIVE' });
  };

  return (
    <div className="space-y-10 animate-slide-up pb-20 max-w-2xl mx-auto px-2">
      <div className="flex justify-between items-center">
         <div>
            <h2 className="text-3xl font-black tracking-tightest text-slate-900 dark:text-white uppercase">Root Authority</h2>
            <div className="flex items-center gap-2 mt-1">
               <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest italic">Global Master Registry</p>
               {isSyncing && <span className="text-[8px] font-black text-amber-500 uppercase animate-pulse">Syncing...</span>}
            </div>
         </div>
         <button onClick={onGlobalRefresh} className="px-6 py-3 bg-emerald-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest active-scale">Refresh Global Hub</button>
      </div>

      <section className="space-y-4">
         <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] px-2">Activation Queue ({pendingApprovals.length})</h3>
         {pendingApprovals.length > 0 ? (
           <div className="space-y-4">
             {pendingApprovals.map(user => {
               const company = companies.find(c => c.id === user.companyId);
               return (
                 <div key={user.id} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] premium-shadow border border-rose-500/10 flex flex-col gap-6 animate-in zoom-in-95">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="h-14 w-14 rounded-2xl bg-rose-50 flex items-center justify-center font-black text-2xl text-rose-500 border border-rose-500/10">{company?.name?.[0] || 'N'}</div>
                          <div>
                             <h4 className="font-black text-lg">{company?.name || 'New Firm'}</h4>
                             <p className="text-[9px] font-black text-slate-400 uppercase">Verification Pending</p>
                          </div>
                       </div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-black/5">
                       <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Lead Email</p>
                       <p className="text-sm font-bold truncate">{user.email}</p>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => approveUser(user.id)} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest active-scale shadow-xl shadow-emerald-500/20 italic">Approve & Activate</button>
                    </div>
                 </div>
               );
             })}
           </div>
         ) : (
           <div className="py-16 text-center bg-slate-50 dark:bg-slate-900/30 rounded-[3rem] border-2 border-dashed border-slate-200 text-slate-400 text-[10px] font-black uppercase italic">No Pending Requests In Registry</div>
         )}
      </section>

      <section className="bg-emerald-950 rounded-[3rem] p-10 text-white shadow-2xl">
         <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
               <h3 className="text-2xl font-black">Force Propagation</h3>
               <p className="text-xs opacity-40 mt-1 uppercase font-bold">Flush all state changes to cloud ecosystem</p>
            </div>
            <button onClick={onTriggerBackup} disabled={!isOnline || isSyncing} className="px-10 py-5 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase shadow-xl active-scale disabled:opacity-30">Push All Changes</button>
         </div>
      </section>

      <section className="space-y-6">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Managed Enterprises</h3>
        <div className="space-y-4">
          {companies.filter(c => c.id !== 'SYSTEM').map(company => (
            <div key={company.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 premium-shadow border border-black/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className={`h-14 w-14 rounded-2xl flex items-center justify-center font-black text-xl bg-slate-50 dark:bg-slate-800 text-emerald-600`}>{company.name[0]}</div>
                 <div>
                   <h4 className="font-black text-sm">{company.name}</h4>
                   <span className={`text-[7px] font-black uppercase px-2 py-1 rounded inline-block mt-1 ${company.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>{company.status}</span>
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
