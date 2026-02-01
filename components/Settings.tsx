
import React, { useState } from 'react';
import { UserSettings, Account, TransactionType, PricingAdjustment } from '../types';

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
  const [isAddingAdjustment, setIsAddingAdjustment] = useState(false);
  const [newAdj, setNewAdj] = useState<Partial<PricingAdjustment>>({ label: '', type: 'FIXED', value: 0, isEnabled: true });
  const [activeTaxonomyTab, setActiveTaxonomyTab] = useState<TransactionType>(TransactionType.INCOME);
  const [newCategory, setNewCategory] = useState('');
  
  // Renaming State
  const [renamingTag, setRenamingTag] = useState<{ old: string; type: TransactionType | 'INV' } | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const updatePricing = (key: keyof typeof settings.pricingRules, value: any) => {
    updateSettings({ pricingRules: { ...settings.pricingRules, [key]: value } });
  };

  const addAdjustment = () => {
    if (!newAdj.label || !newAdj.value) return;
    const adj: PricingAdjustment = { ...newAdj, id: crypto.randomUUID(), isEnabled: true } as PricingAdjustment;
    updatePricing('customAdjustments', [...settings.pricingRules.customAdjustments, adj]);
    setNewAdj({ label: '', type: 'FIXED', value: 0, isEnabled: true });
    setIsAddingAdjustment(false);
  };

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

  const handleRename = () => {
    if (!renamingTag || !renameValue.trim()) return;
    const newVal = renameValue.trim();

    if (renamingTag.type === 'INV') {
      updateSettings({
        inventoryCategories: settings.inventoryCategories.map(t => t === renamingTag.old ? newVal : t)
      });
    } else {
      const type = renamingTag.type as TransactionType;
      setCategories({
        ...categories,
        [type]: categories[type].map(t => t === renamingTag.old ? newVal : t)
      });
    }
    setRenamingTag(null);
    setRenameValue('');
  };

  return (
    <div className="space-y-10 animate-slide-up pb-40 max-w-2xl mx-auto px-2 relative">
      <div className="flex justify-between items-center">
         <div>
            <h2 className="text-3xl font-black tracking-tightest">Settings</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">Enterprise Architecture</p>
         </div>
         <button onClick={() => updateSettings({ darkMode: !settings.darkMode })} className="p-4 bg-slate-100 dark:bg-slate-800 rounded-3xl active-scale transition-all text-slate-900 dark:text-white font-black text-[10px] uppercase">
            {settings.darkMode ? '☀️ Light' : '🌙 Dark'}
         </button>
      </div>

      {/* Cloud Connectivity Protocol */}
      <section className="space-y-4">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Sync Status Monitor</p>
         <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 premium-shadow border border-black/5 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className={`p-4 rounded-2xl flex flex-col items-center gap-2 border-2 ${cloudStatus.isConfigured ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                  <div className={`h-2 w-2 rounded-full ${cloudStatus.isConfigured ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span className="text-[8px] font-black uppercase tracking-widest">Config</span>
               </div>
               <div className={`p-4 rounded-2xl flex flex-col items-center gap-2 border-2 ${cloudStatus.isNetworkUp ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                  <div className={`h-2 w-2 rounded-full ${cloudStatus.isNetworkUp ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span className="text-[8px] font-black uppercase tracking-widest">Network</span>
               </div>
               <div className={`p-4 rounded-2xl flex flex-col items-center gap-2 border-2 ${cloudStatus.isServerResponding ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                  <div className={`h-2 w-2 rounded-full ${cloudStatus.isServerResponding ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span className="text-[8px] font-black uppercase tracking-widest">Server</span>
               </div>
            </div>
            <button onClick={onFetchCloud} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest active-scale">Force Cloud Pull</button>
         </div>
      </section>

      {/* Pricing Logic Section */}
      <section className="space-y-4">
         <div className="flex items-center justify-between px-2">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Pricing Logic</p>
            <button onClick={() => setIsAddingAdjustment(!isAddingAdjustment)} className="text-indigo-600 text-[10px] font-black uppercase">+ New Adjustment</button>
         </div>
         {isAddingAdjustment && (
           <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-indigo-500/10 space-y-4 animate-in zoom-in-95 duration-300">
              <input value={newAdj.label} onChange={e => setNewAdj({...newAdj, label: e.target.value})} placeholder="Rule Name" className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl px-5 py-4 font-bold border-none" />
              <div className="grid grid-cols-2 gap-4">
                 <select value={newAdj.type} onChange={e => setNewAdj({...newAdj, type: e.target.value as any})} className="bg-slate-50 rounded-2xl px-5 py-4 font-bold border-none text-[10px] uppercase">
                    <option value="FIXED">Amount</option>
                    <option value="PERCENT">Percentage %</option>
                 </select>
                 <input type="number" value={newAdj.value} onChange={e => setNewAdj({...newAdj, value: parseFloat(e.target.value) || 0})} placeholder="Value" className="bg-slate-50 rounded-2xl px-5 py-4 font-bold border-none" />
              </div>
              <button onClick={addAdjustment} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase">Apply Rule</button>
           </div>
         )}
         <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden premium-shadow">
            {settings.pricingRules.customAdjustments.map((adj) => (
              <div key={adj.id} className="flex items-center justify-between p-6 border-b border-slate-50 dark:border-white/5">
                 <span className="font-black text-sm">{adj.label}</span>
                 <span className="font-black text-sm text-indigo-600">{adj.type === 'PERCENT' ? `${adj.value}%` : `${settings.currency} ${adj.value}`}</span>
              </div>
            ))}
         </div>
      </section>

      {/* Business Taxonomy Section (CRUD Restored & Finished) */}
      <section className="space-y-4">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Business Taxonomy</p>
         <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 premium-shadow space-y-6">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
               <button onClick={() => setActiveTaxonomyTab(TransactionType.INCOME)} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase ${activeTaxonomyTab === TransactionType.INCOME ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-400'}`}>Income</button>
               <button onClick={() => setActiveTaxonomyTab(TransactionType.EXPENSE)} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase ${activeTaxonomyTab === TransactionType.EXPENSE ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-sm' : 'text-slate-400'}`}>Expense</button>
               <button onClick={() => setActiveTaxonomyTab(TransactionType.TRANSFER)} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase ${activeTaxonomyTab === TransactionType.TRANSFER ? 'bg-white dark:bg-slate-700 text-indigo-500 shadow-sm' : 'text-slate-400'}`}>Inventory</button>
            </div>
            <div className="flex gap-2">
               <input value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder={`New ${activeTaxonomyTab} Tag...`} className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-2xl px-5 py-4 text-xs font-black border-none" />
               <button onClick={addCategory} className="px-8 bg-slate-900 dark:bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest active-scale">Register</button>
            </div>
            <div className="flex flex-wrap gap-2">
               {(activeTaxonomyTab === TransactionType.TRANSFER ? settings.inventoryCategories : categories[activeTaxonomyTab] || []).map(cat => (
                 <div key={cat} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 rounded-full border border-black/5 group">
                    <span className="text-[10px] font-black uppercase tracking-tight text-slate-700 dark:text-slate-300">{cat}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       {/* EDIT BUTTON (PENCIL) */}
                       <button onClick={() => { setRenamingTag({ old: cat, type: activeTaxonomyTab === TransactionType.TRANSFER ? 'INV' : activeTaxonomyTab }); setRenameValue(cat); }} className="text-slate-300 hover:text-indigo-500">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                       </button>
                       {/* DELETE BUTTON */}
                       <button onClick={() => activeTaxonomyTab === TransactionType.TRANSFER ? onRemoveInventoryTag(cat) : setCategories({...categories, [activeTaxonomyTab]: categories[activeTaxonomyTab].filter(c => c !== cat)})} className="text-slate-300 hover:text-rose-500">×</button>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Rename Modal (CRUD Finished) */}
      {renamingTag && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xl" onClick={() => setRenamingTag(null)} />
          <div className="relative w-full max-w-xs bg-white dark:bg-slate-900 rounded-[3rem] p-8 shadow-2xl border border-white/10 animate-in zoom-in-95 duration-300">
             <h3 className="text-lg font-black uppercase mb-4 tracking-tightest">Rename Taxonomy</h3>
             <input value={renameValue} onChange={e => setRenameValue(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 font-bold text-sm border-none mb-6" />
             <div className="flex gap-2">
                <button onClick={handleRename} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase">Update</button>
                <button onClick={() => setRenamingTag(null)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl font-black text-[10px] uppercase">Cancel</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
