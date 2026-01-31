
import React, { useState } from 'react';
import { UserSettings, Account, CURRENCIES, TransactionType, Transaction, PricingRules } from '../types';
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
}

const Settings: React.FC<SettingsProps> = ({ 
  settings, 
  updateSettings, 
  accounts, 
  setAccounts, 
  categories, 
  setCategories,
  logoUrl,
  setLogoUrl,
  onRemoveInventoryTag
}) => {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const showSavedFeedback = () => {
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const updatePricingRule = (field: keyof PricingRules, value: any) => {
    updateSettings({
      pricingRules: {
        ...settings.pricingRules,
        [field]: value
      }
    });
    setSaveStatus('saving');
    setTimeout(showSavedFeedback, 500);
  };

  const symbol = CURRENCIES.find(c => c.code === settings.currency)?.symbol || '$';

  return (
    <div className="space-y-8 animate-slide-up pb-32 relative">
      {/* PROFESSIONAL FEEDBACK TOAST */}
      <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[60] transition-all duration-500 pointer-events-none ${saveStatus !== 'idle' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 px-6 py-2.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-3 border border-white/10">
          <div className={`w-2.5 h-2.5 rounded-full ${saveStatus === 'saving' ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`}></div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">{saveStatus === 'saving' ? 'Applying Logic...' : 'Rules Synced'}</span>
        </div>
      </div>

      <header className="px-2">
         <h2 className="text-2xl font-black tracking-tightest">Settings</h2>
         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">Enterprise Configurations</p>
      </header>

      {/* PROFIT MASTER HUB */}
      <section>
        <div className="flex items-center gap-2 mb-4 px-2">
           <div className="h-6 w-1 bg-indigo-500 rounded-full"></div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Profit Control Hub</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 premium-shadow border border-black/[0.02] dark:border-white/5 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <Icons.Admin className="w-24 h-24" />
          </div>

          <div className="flex items-center justify-between">
             <div>
                <span className="text-xs font-black uppercase tracking-widest text-indigo-600 block">Auto-Pilot Pricing</span>
                <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">Automated margin calculations</p>
             </div>
             <button onClick={() => updatePricingRule('autoApply', !settings.pricingRules.autoApply)} className={`w-14 h-7 rounded-full p-1 transition-all duration-500 shadow-inner ${settings.pricingRules.autoApply ? 'bg-indigo-500' : 'bg-slate-100 dark:bg-slate-800'}`}><div className={`w-5 h-5 bg-white rounded-full shadow-lg transition-transform duration-500 ${settings.pricingRules.autoApply ? 'translate-x-7' : 'translate-x-0'}`} /></button>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Profit Margin</label>
                <div className="relative">
                  <input type="number" value={settings.pricingRules.targetMarginPercent} onChange={e => updatePricingRule('targetMarginPercent', parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl py-4 px-6 font-black text-sm border-none shadow-inner" />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300">%</span>
                </div>
             </div>
             <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Marketplace Fee</label>
                <div className="relative">
                  <input type="number" value={settings.pricingRules.platformFeePercent} onChange={e => updatePricingRule('platformFeePercent', parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl py-4 px-6 font-black text-sm border-none shadow-inner" />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300">%</span>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Fixed Overhead</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300">{symbol}</span>
                  <input type="number" value={settings.pricingRules.fixedOverhead} onChange={e => updatePricingRule('fixedOverhead', parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl py-4 pl-10 pr-4 font-black text-sm border-none shadow-inner" />
                </div>
             </div>
             <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Variable Cost</label>
                <div className="relative">
                  <input type="number" value={settings.pricingRules.variableOverheadPercent} onChange={e => updatePricingRule('variableOverheadPercent', parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl py-4 px-6 font-black text-sm border-none shadow-inner" />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300">%</span>
                </div>
             </div>
          </div>
          
          <div className="p-4 bg-indigo-600/5 rounded-2xl border border-indigo-500/10">
             <p className="text-[8px] font-black text-indigo-500 uppercase tracking-[0.2em] leading-relaxed text-center">
               Rules engine will automatically dictate retail prices based on these master weights.
             </p>
          </div>
        </div>
      </section>

      <section>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 px-2">System Aesthetics</p>
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden premium-shadow border border-black/[0.01] dark:border-white/5">
          <div className="flex items-center justify-between p-6 border-b border-slate-50 dark:border-white/5">
            <div className="flex items-center gap-3">
               <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
               </div>
               <span className="font-bold text-[14px]">Dark Interface</span>
            </div>
            <button onClick={() => { updateSettings({ darkMode: !settings.darkMode }); setSaveStatus('saving'); setTimeout(showSavedFeedback, 500); }} className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.darkMode ? 'bg-indigo-500' : 'bg-slate-200'}`}><div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.darkMode ? 'translate-x-6' : 'translate-x-0'}`} /></button>
          </div>
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
               <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
               </div>
               <span className="font-bold text-[14px]">System Currency</span>
            </div>
            <select value={settings.currency} onChange={(e) => { updateSettings({ currency: e.target.value }); setSaveStatus('saving'); setTimeout(showSavedFeedback, 500); }} className="bg-transparent border-none font-black text-indigo-600 text-right uppercase text-[12px] focus:ring-0">
              {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
            </select>
          </div>
        </div>
      </section>

      <section className="pt-8">
        <button onClick={() => { if(confirm('Factory Reset? This cannot be undone.')) { localStorage.clear(); window.location.reload(); }}} className="w-full py-5 bg-rose-50 dark:bg-rose-900/10 rounded-3xl text-[9px] font-black text-rose-500 uppercase tracking-[0.4em] active-scale">Wipe Local Database</button>
      </section>
    </div>
  );
};

export default Settings;
