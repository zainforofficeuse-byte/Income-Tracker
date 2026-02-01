
import React, { useState, useMemo } from 'react';
import { Transaction, Account, UserSettings, Company, User, UserRole } from '../types';
import { Icons } from '../constants';

interface AdminPanelProps {
  companies: Company[];
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  onRegister: (name: string, adminName: string, adminEmail: string, adminPass: string) => any;
  onUpdateCompany: (compId: string, updates: Partial<Company>, adminUpdates: Partial<User>) => void;
  transactions: Transaction[];
  accounts: Account[];
  settings: UserSettings;
  isOnline: boolean;
  onTriggerBackup?: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ companies, users, setUsers, onRegister, onUpdateCompany, transactions, accounts, settings, isOnline, onTriggerBackup }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  const syncStats = useMemo(() => {
    const pending = transactions.filter(t => t.syncStatus === 'PENDING').length;
    return { pending };
  }, [transactions]);

  const pendingApprovals = useMemo(() => users.filter(u => u.status === 'PENDING'), [users]);

  const handleAction = () => {
    if (editingId) {
      onUpdateCompany(
        editingId, 
        { name: formData.name, status: formData.status }, 
        { 
          name: formData.adminName, 
          email: formData.adminEmail, 
          pin: formData.adminPin 
        }
      );
      resetForm();
    } else {
      if (!formData.name || !formData.adminName || !formData.adminEmail || formData.adminPin?.length !== 4) return;
      onRegister(formData.name, formData.adminName, formData.adminEmail, formData.adminPin);
      resetForm();
    }
  };

  const approveUser = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'ACTIVE' } : u));
  };

  const rejectUser = (userId: string) => {
    if (confirm("Permanently reject this access request?")) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'REJECTED' } : u));
    }
  };

  const resetForm = () => {
    setFormData({});
    setIsAdding(false);
    setEditingId(null);
  };

  const startEdit = (company: Company) => {
    const primaryAdmin = users.find(u => u.companyId === company.id && u.role === UserRole.ADMIN);
    setEditingId(company.id);
    setFormData({ 
      name: company.name, 
      status: company.status,
      adminName: primaryAdmin?.name || '',
      adminEmail: primaryAdmin?.email || '',
      adminPin: primaryAdmin?.pin || ''
    });
    setIsAdding(true);
  };

  return (
    <div className="space-y-10 animate-slide-up pb-20">
      <div className="text-center">
         <h2 className="text-2xl font-black tracking-tightest uppercase text-slate-900 dark:text-white">System Control</h2>
         <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1 italic">Enterprise Provider Authority</p>
      </div>

      {/* User Access Requests (New Module) */}
      <section className="space-y-4">
         <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em]">Pending Access Requests ({pendingApprovals.length})</h3>
         </div>
         {pendingApprovals.length > 0 ? (
           <div className="space-y-3">
             {pendingApprovals.map(user => (
               <div key={user.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] premium-shadow border-2 border-rose-500/10 flex items-center justify-between group animate-pulse hover:animate-none">
                  <div className="flex items-center gap-4">
                     <div className="h-12 w-12 rounded-xl bg-rose-50 dark:bg-rose-950 flex items-center justify-center font-black text-rose-500">
                        {user.name[0]}
                     </div>
                     <div>
                        <h4 className="font-black text-sm text-slate-900 dark:text-white">{user.name}</h4>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{user.email}</p>
                     </div>
                  </div>
                  <div className="flex gap-2">
                     <button onClick={() => approveUser(user.id)} className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest active-scale shadow-lg">Approve</button>
                     <button onClick={() => rejectUser(user.id)} className="px-5 py-2.5 bg-rose-50 dark:bg-rose-900/10 text-rose-500 rounded-xl text-[9px] font-black uppercase tracking-widest active-scale border border-rose-100 dark:border-rose-500/20">Reject</button>
                  </div>
               </div>
             ))}
           </div>
         ) : (
           <div className="py-10 text-center opacity-30">
              <p className="text-[9px] font-black uppercase tracking-widest">No pending verifications</p>
           </div>
         )}
      </section>

      <section className="bg-emerald-950 rounded-[3rem] p-8 text-white relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full"></div>
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
               <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-50 mb-1">Data Integrity</p>
               <h3 className="text-xl font-black">Sheet-to-Drive Backup</h3>
               <p className="text-[10px] opacity-40 mt-1 uppercase font-bold">Safeguard all companies' data as Excel Copy</p>
            </div>
            <button 
              onClick={onTriggerBackup}
              disabled={!isOnline}
              className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active-scale disabled:opacity-30 disabled:pointer-events-none"
            >
               Trigger Remote Backup
            </button>
         </div>
      </section>

      <section className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 premium-shadow border border-emerald-500/5 flex flex-col items-center">
           <p className="text-[8px] font-black text-slate-400 uppercase mb-2 text-center">Cloud Health</p>
           <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <p className={`text-sm font-black uppercase ${isOnline ? 'text-emerald-500' : 'text-rose-500'}`}>{isOnline ? 'Online' : 'Offline'}</p>
           </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 premium-shadow flex flex-col items-center border border-emerald-500/5">
           <p className="text-[8px] font-black text-slate-400 uppercase mb-2 text-center">Sync Queue</p>
           <p className={`text-sm font-black ${syncStats.pending > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
             {syncStats.pending} Pending
           </p>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Client Registry</h3>
            <button onClick={() => { isAdding ? resetForm() : setIsAdding(true); }} className={`h-10 w-10 text-white rounded-xl flex items-center justify-center shadow-lg active-scale transition-all ${isAdding ? 'bg-rose-500 rotate-45' : 'bg-emerald-600'}`}>
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            </button>
        </div>

        {isAdding && (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] premium-shadow border-2 border-emerald-500/10 space-y-6 animate-in zoom-in-95 duration-300">
             <h3 className="text-lg font-black uppercase tracking-tightest">{editingId ? 'Modify Subscription' : 'Provision License'}</h3>
             
             <div className="space-y-1">
               <label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest ml-3">Company Name</label>
               <input value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-emerald-50/50 dark:bg-slate-800 rounded-2xl p-4 font-black text-sm border-none focus:ring-1 focus:ring-emerald-500/20" placeholder="e.g. Azeem Traders" />
             </div>

             <div className="space-y-1">
               <label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest ml-3">Admin Login Email (Username)</label>
               <input type="email" value={formData.adminEmail || ''} onChange={e => setFormData({...formData, adminEmail: e.target.value})} className="w-full bg-emerald-50/50 dark:bg-slate-800 rounded-2xl p-4 font-black text-sm border-none focus:ring-1 focus:ring-emerald-500/20" placeholder="admin@company.com" />
             </div>

             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest ml-3">Admin Name</label>
                 <input value={formData.adminName || ''} onChange={e => setFormData({...formData, adminName: e.target.value})} className="w-full bg-emerald-50/50 dark:bg-slate-800 rounded-2xl p-4 font-black text-sm border-none focus:ring-1 focus:ring-emerald-500/20" />
               </div>
               <div className="space-y-1">
                 <label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest ml-3">Login PIN</label>
                 <input maxLength={4} value={formData.adminPin || ''} onChange={e => setFormData({...formData, adminPin: e.target.value})} className="w-full bg-emerald-50/50 dark:bg-slate-800 rounded-2xl p-4 font-black text-sm border-none text-center focus:ring-1 focus:ring-emerald-500/20" />
               </div>
             </div>

             {editingId && (
               <div className="space-y-1">
                 <label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest ml-3">License Status</label>
                 <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-emerald-50/50 dark:bg-slate-800 rounded-2xl p-4 font-black text-[10px] border-none uppercase appearance-none">
                   <option value="ACTIVE">ACTIVE (Full Access)</option>
                   <option value="SUSPENDED">SUSPENDED (ReadOnly)</option>
                 </select>
               </div>
             )}

             <div className="flex gap-2">
                <button onClick={handleAction} className="flex-1 py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest active-scale shadow-xl shadow-emerald-500/20">
                  {editingId ? 'Save Changes' : 'Authorize Provision'}
                </button>
                <button onClick={resetForm} className="px-6 py-5 bg-slate-100 dark:bg-slate-800 rounded-[2rem] font-black text-[10px] uppercase text-slate-400">Cancel</button>
             </div>
          </div>
        )}

        <div className="space-y-4">
          {companies.map(company => (
            <div key={company.id} className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 premium-shadow border border-emerald-500/5 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                 <div className={`h-14 w-14 rounded-2xl flex items-center justify-center font-black text-xl ${company.status === 'SUSPENDED' ? 'bg-rose-50 text-rose-300' : 'bg-emerald-50 dark:bg-slate-800 text-emerald-600'}`}>
                   {company.name[0]}
                 </div>
                 <div>
                   <h4 className={`font-black text-sm ${company.status === 'SUSPENDED' ? 'text-slate-300 line-through' : 'text-slate-900 dark:text-white'}`}>{company.name}</h4>
                   <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded ${company.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {company.status}
                      </span>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                        Admin: {users.find(u => u.companyId === company.id && u.role === UserRole.ADMIN)?.email || 'Unassigned'}
                      </p>
                   </div>
                 </div>
              </div>
              <button onClick={() => startEdit(company)} className="h-12 w-12 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl flex items-center justify-center transition-all active-scale">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminPanel;
