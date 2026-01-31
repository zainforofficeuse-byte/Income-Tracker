
import React, { useState } from 'react';
import { UserSettings, Account, CURRENCIES, TransactionType, Transaction, PricingRules, PricingAdjustment } from '../types';
import { Icons } from '../constants';

interface SettingsProps {
  settings: UserSettings;
  updateSettings: (s: Partial<UserSettings>) => void;
  accounts: Account[];
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
  categories: Record<TransactionType, string[]>;
  setCategories: React.Dispatch<React.SetStateAction<Record<TransactionType, string[]>>>;
  transactions: Transaction[];
  logoUrl: string | null;
  setLogoUrl: (url: string | null) => void;
  onRemoveInventoryTag: (tag: string) => void;
  onFetchCloud?: (customUrl?: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, updateSettings, accounts, setAccounts }) => {
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  
  // Custom Adjustment State
  const [isAddingAdj, setIsAddingAdj] = useState(false);
  const [newAdj, setNewAdj] = useState<Partial<PricingAdjustment>>({ label: '', type: 'PERCENT', value: 0, isEnabled: true });

  const addAccount = () => {
    if (!newAccName) return;
    const newAcc: Account = {
      id: crypto.randomUUID(),
      companyId: accounts[0]?.companyId || 'company-azeem',
      name: newAccName,
      balance: 0,
      color: '#6366f1',
      type: 'BANK'
    };
    setAccounts([...accounts, newAcc]);
    setNewAccName('');
    setIsAddingAccount(false);
  };

  const deleteAccount = (id: string) => {
    if (accounts.length <= 1) return alert("At least one account is required.");
    if (confirm("Delete this account?")) {
      setAccounts(accounts.filter(a => a.id !== id));
    }
  };

  const updatePricing = (field: keyof PricingRules, value: any) => {
    updateSettings({ pricingRules: { ...settings.pricingRules, [field]: value } });
  };

  const addAdjustment = () => {
    if (!newAdj.label || !newAdj.value) return;
    const adjustment: PricingAdjustment = {
      id: crypto.randomUUID(),
      label: newAdj.label,
      type: newAdj.type as 'FIXED' | 'PERCENT',
      value: newAdj.value,
      isEnabled: true
    };
    const updatedAdjustments = [...settings.pricingRules.customAdjustments, adjustment];
    updatePricing('customAdjustments', updatedAdjustments);
    setNewAdj({ label: '', type: 'PERCENT', value: 0, isEnabled: true });
    setIsAddingAdj(false);
  };

  const removeAdjustment = (id: string) => {
    const updated = settings.pricingRules.customAdjustments.filter(a => a.id !== id);
    updatePricing('customAdjustments', updated);
  };

  return (
    <div className="space-y-10 animate-slide-up pb-32">
      <div className="px-2">
         <h2 className="text-3xl font-black tracking-tightest">Settings</h2>
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">Enterprise Configuration</p>
      </div>

      {/* Account Management */}
      <section className="space-y-4 px-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Sources</p>
          <button onClick={() => setIsAddingAccount(!isAddingAccount)} className="text-indigo-600 text-[9px] font-black uppercase tracking-widest">+ New Account</button>
        </div>
        
        {isAddingAccount && (
          <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-[1.5rem] flex gap-2 animate-in zoom-in-95">
             <input value={newAccName} onChange={e => setNewAccName(e.target.value)} placeholder="e.g. Meezan Bank" className="flex-1 bg-white dark:bg-slate-800 rounded-xl px-4 py-2 text-xs font-bold border-none" />
             <button onClick={addAccount} className="bg-indigo-600 text-white px-4 rounded-xl text-[9px] font-black uppercase tracking-widest">Add</button>
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden premium-shadow border border-black/[0.01]">
          {accounts.map((acc, idx) => (
            <div key={acc.id} className={`flex items-center justify-between p-6 ${idx !== accounts.length - 1 ? 'border-b border-slate-50 dark:border-white/5' : ''}`}>
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-black text-[10px]">
                   {acc.name[0]}
                 </div>
                 <span className="font-black text-sm">{acc.name}</span>
               </div>
               <button onClick={() => deleteAccount(acc.id)} className="text-rose-500 opacity-30 hover:opacity-100 transition-opacity p-2">
                 <Icons.ArrowUp className="w-4 h-4 rotate-45" />
               </button>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Rules & Persistence Fix */}
      <section className="space-y-4 px-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Advanced Price Engine</p>
          <button onClick={() => setIsAddingAdj(!isAddingAdj)} className="text-indigo-600 text-[9px] font-black uppercase tracking-widest">+ Price Rule</button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 premium-shadow border border-black/[0.01] space-y-6">
           <div className="flex items-center justify-between">
              <span className="font-black text-xs uppercase">Auto Apply Rules</span>
              <button onClick={() => updatePricing('autoApply', !settings.pricingRules.autoApply)} className={`w-12 h-6 rounded-full p-1 transition-all ${settings.pricingRules.autoApply ? 'bg-indigo-500' : 'bg-slate-200'}`}>
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.pricingRules.autoApply ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase ml-1">Default Margin %</label>
                <input type="number" value={settings.pricingRules.targetMarginPercent} onChange={e => updatePricing('targetMarginPercent', parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl p-3 font-black text-xs border-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase ml-1">Platform Fee %</label>
                <input type="number" value={settings.pricingRules.platformFeePercent} onChange={e => updatePricing('platformFeePercent', parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl p-3 font-black text-xs border-none" />
              </div>
           </div>

           {/* Custom Adjustments List */}
           <div className="space-y-3 pt-4 border-t border-slate-50 dark:border-white/5">
              {settings.pricingRules.customAdjustments.map(adj => (
                <div key={adj.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                   <div>
                      <p className="text-[10px] font-black uppercase">{adj.label}</p>
                      <p className="text-[8px] font-bold text-indigo-500">{adj.type === 'PERCENT' ? `${adj.value}%` : `Fixed: ${adj.value}`}</p>
                   </div>
                   <button onClick={() => removeAdjustment(adj.id)} className="text-rose-500 p-2">×</button>
                </div>
              ))}
           </div>

           {isAddingAdj && (
             <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl space-y-3 animate-in zoom-in-95">
                <input value={newAdj.label} onChange={e => setNewAdj({...newAdj, label: e.target.value})} placeholder="e.g. Delivery Charge" className="w-full bg-white dark:bg-slate-800 rounded-xl px-4 py-2 text-xs font-bold" />
                <div className="flex gap-2">
                   <select value={newAdj.type} onChange={e => setNewAdj({...newAdj, type: e.target.value as any})} className="flex-1 bg-white dark:bg-slate-800 rounded-xl px-4 py-2 text-[10px] font-black uppercase">
                      <option value="PERCENT">% Percentage</option>
                      <option value="FIXED">Fixed Amount</option>
                   </select>
                   <input type="number" value={newAdj.value} onChange={e => setNewAdj({...newAdj, value: parseFloat(e.target.value) || 0})} className="w-20 bg-white dark:bg-slate-800 rounded-xl px-4 py-2 text-xs font-bold" />
                </div>
                <button onClick={addAdjustment} className="w-full bg-indigo-600 text-white py-2 rounded-xl text-[9px] font-black uppercase tracking-widest">Add Rule</button>
             </div>
           )}
        </div>
      </section>

      {/* Environment Settings */}
      <section className="space-y-4 px-2">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Business Environment</p>
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden premium-shadow border border-black/[0.01]">
          <div className="flex items-center justify-between p-7 border-b border-slate-50 dark:border-white/5">
            <span className="font-black text-sm uppercase">Company Logo/Name</span>
            <input value={settings.companyName} onChange={e => updateSettings({ companyName: e.target.value })} className="bg-transparent border-none font-black text-indigo-600 text-right uppercase text-xs focus:ring-0" />
          </div>
          <div className="flex items-center justify-between p-7 border-b border-slate-50 dark:border-white/5">
            <span className="font-black text-sm uppercase">Dark Mode</span>
            <button onClick={() => updateSettings({ darkMode: !settings.darkMode })} className={`w-14 h-7 rounded-full p-1 transition-all ${settings.darkMode ? 'bg-indigo-500' : 'bg-slate-200'}`}><div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.darkMode ? 'translate-x-7' : 'translate-x-0'}`} /></button>
          </div>
          <div className="flex items-center justify-between p-7">
            <span className="font-black text-sm uppercase">Default Currency</span>
            <select value={settings.currency} onChange={(e) => updateSettings({ currency: e.target.value })} className="bg-transparent border-none font-black text-indigo-600 text-right uppercase text-xs focus:ring-0">
              {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
            </select>
          </div>
        </div>
      </section>

      <section className="pt-8">
        <button onClick={() => { if(confirm('Factory Reset?')) { localStorage.clear(); window.location.reload(); }}} className="w-full py-6 bg-rose-50 dark:bg-rose-900/10 rounded-[2.5rem] text-[9px] font-black text-rose-500 uppercase tracking-[0.4em] active-scale">Erase Application Data</button>
      </section>
    </div>
  );
};

export default Settings;
