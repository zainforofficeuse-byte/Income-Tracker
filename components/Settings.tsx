
import React, { useState } from 'react';
import { UserSettings, Account, TransactionType } from '../types';

interface SettingsProps {
  settings: UserSettings;
  updateSettings: (s: Partial<UserSettings>) => void;
  accounts: Account[];
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
  categories: Record<TransactionType, string[]>;
  setCategories: React.Dispatch<React.SetStateAction<Record<TransactionType, string[]>>>;
  onRemoveInventoryTag: (tag: string) => void;
  onFetchCloud: () => void;
  cloudStatus: { isConfigured: boolean; isNetworkUp: boolean; isServerResponding: boolean };
}

const Settings: React.FC<SettingsProps> = ({ settings, updateSettings, accounts, setAccounts, categories, setCategories, onRemoveInventoryTag, onFetchCloud, cloudStatus }) => {
  const [activeTaxonomyTab, setActiveTaxonomyTab] = useState<TransactionType>(TransactionType.INCOME);
  const [newCategory, setNewCategory] = useState('');

  const addCategory = () => {
    if (!newCategory.trim()) return;
    if (activeTaxonomyTab === TransactionType.TRANSFER) {
      if (!settings.inventoryCategories.includes(newCategory.trim())) {
        updateSettings({ inventoryCategories: [...settings.inventoryCategories, newCategory.trim()] });
      }
    } else {
      const current = categories[activeTaxonomyTab] || [];
      if (!current.includes(newCategory.trim())) {
        setCategories({ ...categories, [activeTaxonomyTab]: [...current, newCategory.trim()] });
      }
    }
    setNewCategory('');
  };

  return (
    <div className="space-y-10 animate-slide-up pb-40 max-w-2xl mx-auto px-2 relative">
      <div className="flex justify-between items-center">
         <div>
            <h2 className="text-3xl font-black tracking-tightest text-slate-900 dark:text-white">Settings</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">Enterprise Architecture</p>
         </div>
         <button onClick={() => updateSettings({ darkMode: !settings.darkMode })} className="p-4 bg-slate-100 dark:bg-slate-800 rounded-3xl active-scale transition-all text-slate-900 dark:text-white font-black text-[10px] uppercase">
            {settings.darkMode ? '☀️ Light' : '🌙 Dark'}
         </button>
      </div>

      {/* Cloud & Email Section */}
      <section className="space-y-4">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">System Integrations</p>
         <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 premium-shadow border border-black/5 space-y-6">
            <div className="space-y-4">
               <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                  <span className="text-[10px] font-black uppercase">Cloud Sync</span>
                  <div className={`h-2 w-2 rounded-full ${cloudStatus.isServerResponding ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
               </div>
               <div className="space-y-1">
                  <label className="text-[8px] font-black text-emerald-600 uppercase ml-3">Master Notification Email</label>
                  <input value={settings.email.adminEmail} onChange={e => updateSettings({ email: { ...settings.email, adminEmail: e.target.value } })} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 font-bold text-xs border-none" />
               </div>
               <div className="grid grid-cols-2 gap-2">
                  {/* Fix: Using notifyAdminOnNewReg instead of notifyAdmin to match type interface */}
                  <button onClick={() => updateSettings({ email: { ...settings.email, notifyAdminOnNewReg: !settings.email.notifyAdminOnNewReg } })} className={`p-4 rounded-2xl text-[8px] font-black uppercase border-2 transition-all ${settings.email.notifyAdminOnNewReg ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-100 text-slate-400'}`}>Admin Alerts</button>
                  {/* Fix: Using notifyUserOnStatusChange instead of notifyUserOnApproval to match type interface */}
                  <button onClick={() => updateSettings({ email: { ...settings.email, notifyUserOnStatusChange: !settings.email.notifyUserOnStatusChange } })} className={`p-4 rounded-2xl text-[8px] font-black uppercase border-2 transition-all ${settings.email.notifyUserOnStatusChange ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-100 text-slate-400'}`}>User Alerts</button>
               </div>
            </div>
            <button onClick={onFetchCloud} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest active-scale shadow-lg shadow-emerald-500/20">Force Ecosystem Refresh</button>
         </div>
      </section>

      {/* Business Taxonomy Section */}
      <section className="space-y-4">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Business Taxonomy</p>
         <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 premium-shadow space-y-6">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
               <button onClick={() => setActiveTaxonomyTab(TransactionType.INCOME)} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase ${activeTaxonomyTab === TransactionType.INCOME ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-400'}`}>Income</button>
               <button onClick={() => setActiveTaxonomyTab(TransactionType.EXPENSE)} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase ${activeTaxonomyTab === TransactionType.EXPENSE ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-sm' : 'text-slate-400'}`}>Expense</button>
               <button onClick={() => setActiveTaxonomyTab(TransactionType.TRANSFER)} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase ${activeTaxonomyTab === TransactionType.TRANSFER ? 'bg-white dark:bg-slate-700 text-indigo-500 shadow-sm' : 'text-slate-400'}`}>Inventory</button>
            </div>
            <div className="flex gap-2">
               <input value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder={`Label...`} className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-2xl px-5 py-4 text-xs font-black border-none" />
               <button onClick={addCategory} className="px-8 bg-slate-900 dark:bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase active-scale">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
               {(activeTaxonomyTab === TransactionType.TRANSFER ? settings.inventoryCategories : categories[activeTaxonomyTab] || []).map(cat => (
                 <div key={cat} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl border border-black/5">
                    <span className="text-[9px] font-black uppercase tracking-tight">{cat}</span>
                    <button onClick={() => activeTaxonomyTab === TransactionType.TRANSFER ? onRemoveInventoryTag(cat) : setCategories({...categories, [activeTaxonomyTab]: categories[activeTaxonomyTab].filter(c => c !== cat)})} className="text-rose-400 font-black text-sm">×</button>
                 </div>
               ))}
            </div>
         </div>
      </section>
    </div>
  );
};

export default Settings;
