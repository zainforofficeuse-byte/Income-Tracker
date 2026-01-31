
import React, { useState } from 'react';
import { UserSettings, Account, CURRENCIES, TransactionType, Transaction, PricingRules, PricingAdjustment, DbCloudConfig } from '../types';
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

const Settings: React.FC<SettingsProps> = ({ settings, updateSettings, accounts, setAccounts, onFetchCloud }) => {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'testing'>('idle');
  const [githubUrl, setGithubUrl] = useState(settings.cloud.remoteConfigUrl || '');
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [newAccName, setNewAccName] = useState('');

  const updateCloudConfig = (field: keyof DbCloudConfig, value: any) => {
    updateSettings({ cloud: { ...settings.cloud, [field]: value } });
  };

  const loadFromGithub = async () => {
    if (!githubUrl) return;
    setSaveStatus('testing');
    try {
      const res = await fetch(githubUrl);
      const url = (await res.text()).trim();
      if (url.startsWith('http')) {
        updateCloudConfig('scriptUrl', url);
        updateCloudConfig('remoteConfigUrl', githubUrl);
        setSaveStatus('saved');
        if (onFetchCloud) onFetchCloud(url);
      } else {
        alert("File content is not a valid URL.");
      }
    } catch (e) {
      alert("Failed to load from GitHub.");
      setSaveStatus('idle');
    }
  };

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
    if (confirm("Delete this account? All associated balances will be lost.")) {
      setAccounts(accounts.filter(a => a.id !== id));
    }
  };

  const updatePricing = (field: keyof PricingRules, value: any) => {
    updateSettings({ pricingRules: { ...settings.pricingRules, [field]: value } });
  };

  return (
    <div className="space-y-10 animate-slide-up pb-32">
      <div className="px-2">
         <h2 className="text-3xl font-black tracking-tightest">Settings</h2>
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">Enterprise Configuration</p>
      </div>

      {/* Cloud & GitHub - Master Link */}
      <section className="bg-white dark:bg-slate-950 rounded-[3rem] p-8 premium-shadow border border-slate-100 dark:border-white/5 space-y-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[80px] rounded-full -mr-20 -mt-20"></div>
        <div className="relative z-10 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl">
               <Icons.Admin className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Cloud Link</h3>
              <p className="text-[10px] font-bold text-slate-500 mt-1">Universal Registry Key</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full border ${settings.cloud.isConnected ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-slate-200 dark:border-white/10'}`}>
            <span className={`text-[8px] font-black uppercase tracking-widest ${settings.cloud.isConnected ? 'text-emerald-500' : 'text-slate-400'}`}>
              {settings.cloud.isConnected ? 'Linked' : 'Local'}
            </span>
          </div>
        </div>

        <div className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">GitHub Master URL</label>
            <div className="flex gap-2">
               <input 
                type="text" 
                placeholder="https://raw.githubusercontent.com/..." 
                value={githubUrl}
                onChange={e => setGithubUrl(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl py-4 px-6 font-bold text-xs border border-slate-100 dark:border-white/5"
               />
               <button 
                onClick={loadFromGithub}
                className="px-6 bg-indigo-600 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest active-scale"
               >
                 Connect
               </button>
            </div>
          </div>

          <div className="bg-indigo-600/5 rounded-3xl p-6 border border-indigo-500/10 flex items-center justify-between">
              <div>
                 <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Restore Data</p>
                 <p className="text-[7px] font-bold text-slate-400 uppercase mt-0.5">Fetch from Cloud Registry</p>
              </div>
              <button 
                onClick={() => onFetchCloud && onFetchCloud()}
                className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest active-scale"
              >
                Sync Now
              </button>
          </div>
        </div>
      </section>

      {/* Account Management */}
      <section className="space-y-4 px-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cash & Bank Accounts</p>
          <button onClick={() => setIsAddingAccount(!isAddingAccount)} className="text-indigo-600 text-[9px] font-black uppercase tracking-widest">+ New</button>
        </div>
        
        {isAddingAccount && (
          <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-[1.5rem] flex gap-2 animate-in zoom-in-95">
             <input value={newAccName} onChange={e => setNewAccName(e.target.value)} placeholder="Bank Name..." className="flex-1 bg-white dark:bg-slate-800 rounded-xl px-4 py-2 text-xs font-bold border-none" />
             <button onClick={addAccount} className="bg-indigo-600 text-white px-4 rounded-xl text-[9px] font-black uppercase tracking-widest">Add</button>
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden premium-shadow border border-black/[0.01]">
          {accounts.map((acc, idx) => (
            <div key={acc.id} className={`flex items-center justify-between p-6 ${idx !== accounts.length - 1 ? 'border-b border-slate-50 dark:border-white/5' : ''}`}>
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-[10px]">
                   {acc.name[0]}
                 </div>
                 <span className="font-black text-sm">{acc.name}</span>
               </div>
               <button onClick={() => deleteAccount(acc.id)} className="text-rose-500 opacity-30 hover:opacity-100 transition-opacity">
                 <Icons.ArrowUp className="w-4 h-4 rotate-45" />
               </button>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Rules (Auto-Inventory) */}
      <section className="space-y-4 px-2">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auto Pricing Rules</p>
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 premium-shadow border border-black/[0.01] space-y-6">
           <div className="flex items-center justify-between">
              <span className="font-black text-xs uppercase">Auto Apply Margin</span>
              <button onClick={() => updatePricing('autoApply', !settings.pricingRules.autoApply)} className={`w-12 h-6 rounded-full p-1 transition-all ${settings.pricingRules.autoApply ? 'bg-indigo-500' : 'bg-slate-200'}`}>
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.pricingRules.autoApply ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase ml-1">Profit Margin %</label>
                <input type="number" value={settings.pricingRules.targetMarginPercent} onChange={e => updatePricing('targetMarginPercent', parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl p-3 font-black text-xs border-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase ml-1">Platform Fee %</label>
                <input type="number" value={settings.pricingRules.platformFeePercent} onChange={e => updatePricing('platformFeePercent', parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl p-3 font-black text-xs border-none" />
              </div>
           </div>
        </div>
      </section>

      {/* Environment Settings */}
      <section className="space-y-4 px-2">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Environment</p>
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden premium-shadow border border-black/[0.01]">
          <div className="flex items-center justify-between p-7 border-b border-slate-50 dark:border-white/5">
            <span className="font-black text-sm uppercase">Business Name</span>
            <input value={settings.companyName} onChange={e => updateSettings({ companyName: e.target.value })} className="bg-transparent border-none font-black text-indigo-600 text-right uppercase text-xs focus:ring-0" />
          </div>
          <div className="flex items-center justify-between p-7 border-b border-slate-50 dark:border-white/5">
            <span className="font-black text-sm uppercase">Dark Mode</span>
            <button onClick={() => updateSettings({ darkMode: !settings.darkMode })} className={`w-14 h-7 rounded-full p-1 transition-all ${settings.darkMode ? 'bg-indigo-500' : 'bg-slate-200'}`}><div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.darkMode ? 'translate-x-7' : 'translate-x-0'}`} /></button>
          </div>
          <div className="flex items-center justify-between p-7">
            <span className="font-black text-sm uppercase">Currency</span>
            <select value={settings.currency} onChange={(e) => updateSettings({ currency: e.target.value })} className="bg-transparent border-none font-black text-indigo-600 text-right uppercase text-xs focus:ring-0">
              {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
            </select>
          </div>
        </div>
      </section>

      <section className="pt-8">
        <button onClick={() => { if(confirm('Factory Reset?')) { localStorage.clear(); window.location.reload(); }}} className="w-full py-6 bg-rose-50 dark:bg-rose-900/10 rounded-[2.5rem] text-[9px] font-black text-rose-500 uppercase tracking-[0.4em] active-scale">Wipe System Memory</button>
      </section>
    </div>
  );
};

export default Settings;
