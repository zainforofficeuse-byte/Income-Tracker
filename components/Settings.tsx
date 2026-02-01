
import React, { useState } from 'react';
import { UserSettings, Account, CURRENCIES, TransactionType, Transaction, Product, Entity } from '../types';

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
}

const Settings: React.FC<SettingsProps> = ({ settings, updateSettings, accounts, setAccounts, onRemoveInventoryTag, onFetchCloud }) => {
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [newAcc, setNewAcc] = useState({ name: '', balance: 0 });
  const [newTag, setNewTag] = useState('');

  const addAccount = () => {
    if (!newAcc.name) return;
    const acc: Account = { id: crypto.randomUUID(), companyId: accounts[0]?.companyId || 'SYSTEM', name: newAcc.name, balance: newAcc.balance, color: '#10b981', type: 'BANK' };
    setAccounts([...accounts, acc]);
    setNewAcc({ name: '', balance: 0 });
    setIsAddingAccount(false);
  };

  const addGlobalTag = () => {
    if (!newTag.trim()) return;
    if (!settings.inventoryCategories.includes(newTag.trim())) {
      updateSettings({ inventoryCategories: [...settings.inventoryCategories, newTag.trim()] });
    }
    setNewTag('');
  };

  const updatePricing = (key: keyof typeof settings.pricingRules, value: any) => {
    updateSettings({
      pricingRules: {
        ...settings.pricingRules,
        [key]: value
      }
    });
  };

  return (
    <div className="space-y-10 animate-slide-up pb-40 max-w-2xl mx-auto px-2">
      <div className="flex justify-between items-center">
         <div>
            <h2 className="text-3xl font-black tracking-tightest text-slate-900 dark:text-white">Settings</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Enterprise Configuration</p>
         </div>
         <button onClick={() => updateSettings({ darkMode: !settings.darkMode })} className="p-4 bg-slate-100 dark:bg-slate-800 rounded-3xl active-scale transition-all text-slate-900 dark:text-white font-black text-[10px] uppercase">
            {settings.darkMode ? '☀️ Light' : '🌙 Dark'}
         </button>
      </div>

      {/* Advanced Pricing Engine */}
      <section className="space-y-4">
         <div className="flex items-center justify-between px-2">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">POS Pricing Architecture</p>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Auto-Apply</span>
              <button 
                onClick={() => updatePricing('autoApply', !settings.pricingRules.autoApply)}
                className={`w-12 h-6 rounded-full transition-all relative ${settings.pricingRules.autoApply ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.pricingRules.autoApply ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
         </div>
         <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 premium-shadow border border-emerald-500/5 space-y-6">
            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Fixed Overhead ({settings.currency})</label>
                  <input type="number" value={settings.pricingRules.fixedOverhead} onChange={e => updatePricing('fixedOverhead', parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 text-sm font-black border-none text-slate-900 dark:text-white" />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Target Profit Margin %</label>
                  <input type="number" value={settings.pricingRules.targetMarginPercent} onChange={e => updatePricing('targetMarginPercent', parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 text-sm font-black border-none text-slate-900 dark:text-white" />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Variable OH %</label>
                  <input type="number" value={settings.pricingRules.variableOverheadPercent} onChange={e => updatePricing('variableOverheadPercent', parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 text-sm font-black border-none text-slate-900 dark:text-white" />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Platform Fee %</label>
                  <input type="number" value={settings.pricingRules.platformFeePercent} onChange={e => updatePricing('platformFeePercent', parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 text-sm font-black border-none text-slate-900 dark:text-white" />
               </div>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-500/10">
               <p className="text-[8px] text-emerald-600 dark:text-emerald-400 font-black uppercase text-center tracking-widest leading-relaxed">
                  Formula: Retail = (Cost + OH) / (1 - Fees% - Margin%)
               </p>
            </div>
         </div>
      </section>

      {/* Global Inventory Tags */}
      <section className="space-y-4">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Global Stock Categories</p>
         <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 premium-shadow border border-emerald-500/5 space-y-6">
            <div className="flex gap-2">
               <input 
                 value={newTag} 
                 onChange={e => setNewTag(e.target.value)} 
                 placeholder="New tag (e.g. Imported)..." 
                 className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-2xl px-5 py-4 text-xs font-black border-none text-slate-900 dark:text-white"
               />
               <button onClick={addGlobalTag} className="px-8 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest active-scale">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
               {settings.inventoryCategories.map(tag => (
                 <div key={tag} className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/40 px-4 py-2 rounded-full border border-emerald-500/10">
                    <span className="text-[10px] font-black text-emerald-600 uppercase">{tag}</span>
                    <button onClick={() => onRemoveInventoryTag(tag)} className="text-emerald-400 hover:text-rose-500 font-black text-sm px-1">×</button>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Account Management */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Wallets & Accounts</p>
           <button onClick={() => setIsAddingAccount(!isAddingAccount)} className="text-emerald-600 text-[10px] font-black uppercase tracking-widest">+ New Account</button>
        </div>
        {isAddingAccount && (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] premium-shadow border border-emerald-500/10 space-y-4 animate-in slide-in-from-top-4">
             <input value={newAcc.name} onChange={e => setNewAcc({...newAcc, name: e.target.value})} placeholder="Account Title" className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl px-5 py-4 font-bold border-none text-slate-900 dark:text-white" />
             <input type="number" value={newAcc.balance} onChange={e => setNewAcc({...newAcc, balance: parseFloat(e.target.value) || 0})} placeholder="Opening Balance" className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl px-5 py-4 font-bold border-none text-slate-900 dark:text-white" />
             <div className="flex gap-2">
                <button onClick={addAccount} className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest active-scale">Authorize Account</button>
                <button onClick={() => setIsAddingAccount(false)} className="px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl text-[10px] font-black uppercase">Cancel</button>
             </div>
          </div>
        )}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden premium-shadow">
          {accounts.map((acc, idx) => (
            <div key={acc.id} className={`flex items-center justify-between p-6 ${idx !== accounts.length - 1 ? 'border-b border-slate-50 dark:border-white/5' : ''}`}>
               <div className="flex flex-col">
                  <span className="font-black text-sm text-slate-900 dark:text-white">{acc.name}</span>
                  <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest">{acc.type} Ledger</span>
               </div>
               <span className="font-black text-sm text-emerald-600">{settings.currency} {acc.balance.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Settings;
