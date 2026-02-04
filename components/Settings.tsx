
import React, { useState } from 'react';
import { UserSettings, Account, TransactionType, CURRENCIES } from '../types';

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
    if (activeTaxonomyTab === TransactionType.TRANSFER as any) {
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

  const removeCategory = (cat: string) => {
    if (activeTaxonomyTab === TransactionType.TRANSFER as any) {
      onRemoveInventoryTag(cat);
    } else {
      setCategories({
        ...categories,
        [activeTaxonomyTab]: categories[activeTaxonomyTab].filter(c => c !== cat)
      });
    }
  };

  return (
    <div className="space-y-10 animate-slide-up pb-40 max-w-2xl mx-auto px-2 relative">
      <div className="flex justify-between items-center">
         <div>
            <h2 className="text-3xl font-black tracking-tightest text-slate-900 dark:text-white uppercase">Architecture</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">Enterprise Logic & Control</p>
         </div>
         <button onClick={() => updateSettings({ darkMode: !settings.darkMode })} className="p-4 bg-slate-100 dark:bg-slate-800 rounded-3xl active-scale transition-all text-slate-900 dark:text-white font-black text-[10px] uppercase">
            {settings.darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
         </button>
      </div>

      <section className="space-y-4">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Data Ecosystem</p>
         <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 premium-shadow border border-black/5 space-y-6">
            <div className="space-y-4">
               <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-black/[0.02]">
                  <span className="text-[10px] font-black uppercase tracking-widest">Ecosystem Status</span>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[8px] font-black uppercase ${cloudStatus.isServerResponding ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    <div className={`h-1.5 w-1.5 rounded-full ${cloudStatus.isServerResponding ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                    {cloudStatus.isServerResponding ? 'Propagating' : 'Offline'}
                  </div>
               </div>
               <div className="space-y-1">
                  <label className="text-[8px] font-black text-emerald-600 uppercase ml-3 tracking-widest">Lead Communication Email</label>
                  <input value={settings.email.adminEmail} onChange={e => updateSettings({ email: { ...settings.email, adminEmail: e.target.value } })} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 font-bold text-xs border-none text-slate-900 dark:text-white" />
               </div>
            </div>
            <button onClick={onFetchCloud} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest active-scale shadow-xl shadow-emerald-500/20">Force Hub Pull</button>
         </div>
      </section>

      <section className="space-y-4">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Business Taxonomy</p>
         <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 premium-shadow border border-black/[0.02] space-y-6">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[1.5rem] border border-black/5">
               <button onClick={() => setActiveTaxonomyTab(TransactionType.INCOME)} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTaxonomyTab === TransactionType.INCOME ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-md' : 'text-slate-400'}`}>Revenue</button>
               <button onClick={() => setActiveTaxonomyTab(TransactionType.EXPENSE)} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTaxonomyTab === TransactionType.EXPENSE ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-md' : 'text-slate-400'}`}>Expense</button>
               <button onClick={() => setActiveTaxonomyTab(TransactionType.TRANSFER as any)} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTaxonomyTab === (TransactionType.TRANSFER as any) ? 'bg-white dark:bg-slate-700 text-indigo-500 shadow-md' : 'text-slate-400'}`}>Tags</button>
            </div>
            
            <div className="flex gap-2">
               <input 
                value={newCategory} 
                onChange={e => setNewCategory(e.target.value)} 
                placeholder={`New Entry...`} 
                className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 py-4 text-xs font-black border-none text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/10" 
               />
               <button onClick={addCategory} className="px-8 bg-slate-900 dark:bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest active-scale">Add</button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
               {(activeTaxonomyTab === (TransactionType.TRANSFER as any) ? settings.inventoryCategories : categories[activeTaxonomyTab] || []).map(cat => (
                 <div key={cat} className="group flex items-center gap-3 bg-slate-50 dark:bg-slate-800 px-5 py-3 rounded-2xl border border-black/[0.03] transition-all hover:border-emerald-500/20">
                    <span className="text-[10px] font-black uppercase tracking-tight text-slate-700 dark:text-slate-300">{cat}</span>
                    <button 
                      onClick={() => removeCategory(cat)} 
                      className="text-rose-500 font-black text-lg h-6 w-6 flex items-center justify-center rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    >
                      ×
                    </button>
                 </div>
               ))}
            </div>
         </div>
      </section>
    </div>
  );
};

export default Settings;
