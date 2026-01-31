
import React, { useState, useMemo } from 'react';
import { Transaction, Account, UserSettings, Company, User, UserRole } from '../types';
import { Icons } from '../constants';

interface AdminPanelProps {
  companies: Company[];
  setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;
  users: User[];
  onRegister: (name: string, adminName: string, adminEmail: string, adminPass: string) => any;
  transactions: Transaction[];
  accounts: Account[];
  settings: UserSettings;
  onUpdateConfig: (config: any) => void;
  onConnect: () => void;
  isOnline: boolean;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ companies, setCompanies, users, onRegister, transactions, accounts, settings, isOnline }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Company & { adminName: string, adminEmail: string, adminPin: string }>>({});

  const syncStats = useMemo(() => {
    const pending = transactions.filter(t => t.syncStatus === 'PENDING').length;
    return { pending };
  }, [transactions]);

  const handleAction = () => {
    if (editingId) {
      // Edit Company
      setCompanies(prev => prev.map(c => c.id === editingId ? { 
        ...c, 
        name: formData.name || c.name,
        status: formData.status || c.status
      } : c));
      resetForm();
    } else {
      // Register New
      if (!formData.name || !formData.adminName || !formData.adminEmail || formData.adminPin?.length !== 4) return;
      onRegister(formData.name, formData.adminName, formData.adminEmail, formData.adminPin);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({});
    setIsAdding(false);
    setEditingId(null);
  };

  const startEdit = (company: Company) => {
    setEditingId(company.id);
    setFormData({ name: company.name, status: company.status });
    setIsAdding(true);
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
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 premium-shadow border border-black/[0.02] dark:border-white/5 flex flex-col items-center">
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

      <section className="bg-slate-950 rounded-[3rem] p-8 text-white space-y-4">
         <div className="flex items-center justify-between">
           <h3 className="text-[10px] font-black uppercase tracking-widest opacity-50">Enterprise Vault</h3>
           <Icons.Admin className="w-5 h-5 text-indigo-500" />
         </div>
         <p className="text-xs font-bold opacity-80 leading-relaxed">Download a complete snapshot of your local database. Use this as a failsafe for manual migrations.</p>
         <button onClick={handleManualBackup} className="w-full py-4 bg-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] active-scale shadow-lg shadow-indigo-500/20">Export Offline Data</button>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Client Registry</h3>
            <button onClick={() => { isAdding ? resetForm() : setIsAdding(true); }} className={`h-10 w-10 text-white rounded-xl flex items-center justify-center shadow-lg active-scale ${isAdding ? 'bg-rose-500 rotate-45' : 'bg-indigo-600'}`}>
               <UI.Plus className="w-5 h-5" />
            </button>
        </div>

        {isAdding && (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] premium-shadow border-2 border-indigo-500/10 space-y-6 animate-in zoom-in-95 duration-300">
             <h3 className="text-lg font-black uppercase tracking-tightest">{editingId ? 'Modify Subscription' : 'Provision License'}</h3>
             
             <div className="space-y-1">
               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Company Name</label>
               <input value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 font-black text-sm border-none" placeholder="e.g. Azeem Solutions" />
             </div>

             {editingId && (
               <div className="space-y-1">
                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">License Status</label>
                 <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 font-black text-[10px] border-none uppercase">
                   <option value="ACTIVE">ACTIVE (Full Access)</option>
                   <option value="SUSPENDED">SUSPENDED (ReadOnly)</option>
                 </select>
               </div>
             )}

             {!editingId && (
               <>
                 <div className="space-y-1">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Admin Email</label>
                   <input value={formData.adminEmail || ''} onChange={e => setFormData({...formData, adminEmail: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 font-black text-sm border-none" placeholder="admin@company.com" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Admin Name</label>
                     <input value={formData.adminName || ''} onChange={e => setFormData({...formData, adminName: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 font-black text-sm border-none" />
                   </div>
                   <div className="space-y-1">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Initial PIN</label>
                     <input maxLength={4} value={formData.adminPin || ''} onChange={e => setFormData({...formData, adminPin: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 font-black text-sm border-none text-center" />
                   </div>
                 </div>
               </>
             )}

             <div className="flex gap-2">
                <button onClick={handleAction} className="flex-1 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest active-scale">
                  {editingId ? 'Save Changes' : 'Authorize Provision'}
                </button>
                <button onClick={resetForm} className="px-6 py-5 bg-slate-100 dark:bg-slate-800 rounded-[2rem] font-black text-[10px] uppercase">Cancel</button>
             </div>
          </div>
        )}

        <div className="space-y-4">
          {companies.map(company => (
            <div key={company.id} className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 premium-shadow border border-black/[0.02] dark:border-white/5 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                 <div className={`h-14 w-14 rounded-2xl flex items-center justify-center font-black text-xl ${company.status === 'SUSPENDED' ? 'bg-rose-50 text-rose-300' : 'bg-indigo-50 dark:bg-slate-800 text-indigo-500'}`}>
                   {company.name[0]}
                 </div>
                 <div>
                   <h4 className={`font-black text-sm ${company.status === 'SUSPENDED' ? 'text-slate-300 line-through' : ''}`}>{company.name}</h4>
                   <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded ${company.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {company.status}
                      </span>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                        Admin: {users.find(u => u.companyId === company.id && u.role === UserRole.ADMIN)?.name || 'Unassigned'}
                      </p>
                   </div>
                 </div>
              </div>
              <button onClick={() => startEdit(company)} className="h-10 w-10 text-slate-400 hover:text-black dark:hover:text-white rounded-xl flex items-center justify-center transition-colors active-scale">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const UI = {
  Plus: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="M12 5v14"/></svg>
  )
};

export default AdminPanel;
