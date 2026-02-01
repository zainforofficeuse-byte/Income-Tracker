
import React, { useState } from 'react';
import { UserSettings, Account, CURRENCIES, TransactionType, Transaction, Product, Entity, PricingAdjustment } from '../types';

interface SettingsProps {
  settings: UserSettings;
  updateSettings: (s: Partial<UserSettings>) => void;
  accounts: Account[];
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
  categories: Record<TransactionType, string[]>;
  setCategories: React.Dispatch<React.SetStateAction<Record<TransactionType, string[]>>>;
  transactions: Transaction[];
  products: Product[];
  entities: Entity[];
  logoUrl: string | null;
  setLogoUrl: (url: string | null) => void;
  onRemoveInventoryTag: (tag: string) => void;
  onFetchCloud: () => void;
  cloudStatus: { isConfigured: boolean; isNetworkUp: boolean; isServerResponding: boolean };
}

const Settings: React.FC<SettingsProps> = ({ settings, updateSettings, accounts, setAccounts, categories, setCategories, onRemoveInventoryTag, onFetchCloud, cloudStatus }) => {
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [newAcc, setNewAcc] = useState({ name: '', balance: 0 });
  const [newTag, setNewTag] = useState('');
  
  const [isAddingAdjustment, setIsAddingAdjustment] = useState(false);
  const [newAdj, setNewAdj] = useState<Partial<PricingAdjustment>>({ label: '', type: 'FIXED', value: 0, isEnabled: true });

  const [activeTaxonomyTab, setActiveTaxonomyTab] = useState<TransactionType>(TransactionType.INCOME);
  const [newCategory, setNewCategory] = useState('');

  const addAccount = () => {
    if (!newAcc.name) return;
    const acc: Account = { id: crypto.randomUUID(), companyId: accounts[0]?.companyId || 'SYSTEM', name: newAcc.name, balance: newAcc.balance, color: '#10b981', type: 'BANK' };
    setAccounts([...accounts, acc]);
    setNewAcc({ name: '', balance: 0 });
    setIsAddingAccount(false);
  };

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

  const toggleAdjustment = (id: string) => {
    updatePricing('customAdjustments', settings.pricingRules.customAdjustments.map(a => a.id === id ? { ...a, isEnabled: !a.isEnabled } : a));
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

  const removeCategory = (type: TransactionType, cat: string) => {
    setCategories({ ...categories, [type]: categories[type].filter(c => c !== cat) });
  };

  return (
    <div className="space-y-10 animate-slide-up pb-40 max-w-2xl mx-auto">
      <div className="flex justify-between items-center px-2">
         <div>
            <h2 className="text-3xl font-black tracking-tightest">Settings</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Enterprise Configuration</p>
         </div>
         <button onClick={() => updateSettings({ darkMode: !settings.darkMode })} className="p-4 bg-slate-100 dark:bg-slate-800 rounded-3xl active-scale transition-all text-slate-900 dark:text-white font-black text-[10px] uppercase">
            {settings.darkMode ? '☀️ Light' : '🌙 Dark'}
         </button>
      </div>

      {/* Cloud Connectivity Protocol (3 Conditions) */}
      <section className="space-y-4">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Cloud Connectivity Protocol</p>
         <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 premium-shadow border border-black/5 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className={`p-4 rounded-2xl flex flex-col items-center gap-2 border-2 ${cloudStatus.isConfigured ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-100' : 'bg-rose-50 dark:bg-rose-950 border-rose-100'}`}>
                  <div className={`h-2 w-2 rounded-full ${cloudStatus.isConfigured ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span className="text-[8px] font-black uppercase tracking-widest">Config Found</span>
               </div>
               <div className={`p-4 rounded-2xl flex flex-col items-center gap-2 border-2 ${cloudStatus.isNetworkUp ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-100' : 'bg-rose-50 dark:bg-rose-950 border-rose-100'}`}>
                  <div className={`h-2 w-2 rounded-full ${cloudStatus.isNetworkUp ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span className="text-[8px] font-black uppercase tracking-widest">Network Live</span>
               </div>
               <div className={`p-4 rounded-2xl flex flex-col items-center gap-2 border-2 ${cloudStatus.isServerResponding ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-100' : 'bg-rose-50 dark:bg-rose-950 border-rose-100'}`}>
                  <div className={`h-2 w-2 rounded-full ${cloudStatus.isServerResponding ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span className="text-[8px] font-black uppercase tracking-widest">DB Response</span>
               </div>
            </div>
            <button onClick={onFetchCloud} className="w-full py-4 bg-slate-900 dark:bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] active-scale shadow-xl">Manual Force Sync (Pull)</button>
         </div>
      </section>

      {/* Pricing Engine Architecture */}
      <section className="space-y-4">
         <div className="flex items-center justify-between px-2">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Pricing Architecture</p>
            <button onClick={() => setIsAddingAdjustment(true)} className="text-indigo-600 text-[10px] font-black uppercase tracking-widest">+ Custom Logic</button>
         </div>
         {isAddingAdjustment && (
           <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] premium-shadow border border-indigo-500/10 space-y-4 animate-in slide-in-from-top-4">
              <input value={newAdj.label} onChange={e => setNewAdj({...newAdj, label: e.target.value})} placeholder="Rule Label" className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl px-5 py-4 font-bold border-none text-slate-900 dark:text-white" />
              <div className="grid grid-cols-2 gap-4">
                 <select value={newAdj.type} onChange={e => setNewAdj({...newAdj, type: e.target.value as any})} className="bg-slate-50 dark:bg-slate-800 rounded-2xl px-5 py-4 font-bold border-none text-[10px] uppercase">
                    <option value="FIXED">Fixed Amount</option>
                    <option value="PERCENT">Percentage %</option>
                 </select>
                 <input type="number" value={newAdj.value} onChange={e => setNewAdj({...newAdj, value: parseFloat(e.target.value) || 0})} placeholder="Value" className="bg-slate-50 dark:bg-slate-800 rounded-2xl px-5 py-4 font-bold border-none" />
              </div>
              <div className="flex gap-2">
                 <button onClick={addAdjustment} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest active-scale">Deploy Rule</button>
                 <button onClick={() => setIsAddingAdjustment(false)} className="px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl text-[10px] font-black uppercase">Cancel</button>
              </div>
           </div>
         )}
         <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden premium-shadow">
            {settings.pricingRules.customAdjustments.map((adj, idx) => (
              <div key={adj.id} className={`flex items-center justify-between p-6 ${idx !== settings.pricingRules.customAdjustments.length - 1 ? 'border-b border-slate-50 dark:border-white/5' : ''}`}>
                 <div className="flex items-center gap-4">
                    <button onClick={() => toggleAdjustment(adj.id)} className={`w-4 h-4 rounded border-2 transition-colors ${adj.isEnabled ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`} />
                    <span className={`font-black text-sm ${!adj.isEnabled ? 'text-slate-300 line-through' : 'text-slate-900 dark:text-white'}`}>{adj.label}</span>
                 </div>
                 <span className="font-black text-sm text-indigo-600">{adj.type === 'PERCENT' ? `${adj.value}%` : `${settings.currency} ${adj.value}`}</span>
              </div>
            ))}
         </div>
      </section>

      {/* Business Taxonomy Management */}
      <section className="space-y-4">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Business Taxonomy Management</p>
         <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 premium-shadow border border-emerald-500/5 space-y-6">
            <div className="flex bg-slate-50 dark:bg-slate-800/50 p-1 rounded-2xl border border-black/5">
               <button onClick={() => setActiveTaxonomyTab(TransactionType.INCOME)} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTaxonomyTab === TransactionType.INCOME ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-400'}`}>Income</button>
               <button onClick={() => setActiveTaxonomyTab(TransactionType.EXPENSE)} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTaxonomyTab === TransactionType.EXPENSE ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-sm' : 'text-slate-400'}`}>Expense</button>
               <button onClick={() => setActiveTaxonomyTab(TransactionType.TRANSFER)} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTaxonomyTab === TransactionType.TRANSFER ? 'bg-white dark:bg-slate-700 text-indigo-500 shadow-sm' : 'text-slate-400'}`}>Inventory</button>
            </div>
            <div className="flex gap-2">
               <input value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder={`New ${activeTaxonomyTab} Tag...`} className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-2xl px-5 py-4 text-xs font-black border-none text-slate-900 dark:text-white" />
               <button onClick={addCategory} className="px-8 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest active-scale">Register</button>
            </div>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto no-scrollbar">
               {(activeTaxonomyTab === TransactionType.TRANSFER ? settings.inventoryCategories : categories[activeTaxonomyTab]).map(cat => (
                 <div key={cat} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 rounded-full border border-black/5">
                    <span className="text-[10px] font-black uppercase tracking-tight text-slate-700 dark:text-slate-300">{cat}</span>
                    <button onClick={() => activeTaxonomyTab === TransactionType.TRANSFER ? onRemoveInventoryTag(cat) : removeCategory(activeTaxonomyTab, cat)} className="text-slate-300 hover:text-rose-500 font-black text-sm">×</button>
                 </div>
               ))}
            </div>
         </div>
      </section>
    </div>
  );
};

export default Settings;
