
import React, { useState, useEffect } from 'react';
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
    <div className="space-y-8 animate-slide-up pb-20 relative">
      <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[60] transition-all duration-500 pointer-events-none ${saveStatus !== 'idle' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 px-6 py-2 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-3 border border-white/10">
          <div className={`w-2 h-2 rounded-full ${saveStatus === 'saving' ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500'}`}></div>
          <span className="text-[10px] font-black uppercase tracking-widest">{saveStatus === 'saving' ? 'Syncing...' : 'Changes Saved'}</span>
        </div>
      </div>

      <section>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 px-2">Pricing Master (Global Rules)</p>
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 premium-shadow border border-black/[0.02] space-y-6">
          <div className="flex items-center justify-between mb-4">
             <span className="text-xs font-black uppercase tracking-widest text-indigo-600">Auto-Apply Rules</span>
             <button onClick={() => updatePricingRule('autoApply', !settings.pricingRules.autoApply)} className={`w-11 h-6 rounded-full p-0.5 transition-colors ${settings.pricingRules.autoApply ? 'bg-indigo-500' : 'bg-slate-200'}`}><div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.pricingRules.autoApply ? 'translate-x-5' : 'translate-x-0'}`} /></button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Profit Margin %</label>
                <input type="number" value={settings.pricingRules.targetMarginPercent} onChange={e => updatePricingRule('targetMarginPercent', parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl p-3 font-black text-xs border-none" />
             </div>
             <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Platform Fee %</label>
                <input type="number" value={settings.pricingRules.platformFeePercent} onChange={e => updatePricingRule('platformFeePercent', parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl p-3 font-black text-xs border-none" />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Fixed Overhead ({symbol})</label>
                <input type="number" value={settings.pricingRules.fixedOverhead} onChange={e => updatePricingRule('fixedOverhead', parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl p-3 font-black text-xs border-none" />
             </div>
             <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Variable Overhead %</label>
                <input type="number" value={settings.pricingRules.variableOverheadPercent} onChange={e => updatePricingRule('variableOverheadPercent', parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl p-3 font-black text-xs border-none" />
             </div>
          </div>
          
          <p className="text-[8px] font-bold text-slate-400 italic text-center leading-relaxed">System will auto-calculate Selling Price when user enters Purchase Price using these global weights.</p>
        </div>
      </section>

      <section>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 px-2">Appearance</p>
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden premium-shadow border border-black/[0.02]">
          <div className="flex items-center justify-between p-5 border-b border-slate-50 dark:border-white/5">
            <span className="font-bold text-[13px]">Dark Mode</span>
            <button onClick={() => { updateSettings({ darkMode: !settings.darkMode }); setSaveStatus('saving'); setTimeout(showSavedFeedback, 500); }} className={`w-11 h-6 rounded-full p-0.5 transition-colors ${settings.darkMode ? 'bg-indigo-500' : 'bg-slate-200'}`}><div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.darkMode ? 'translate-x-5' : 'translate-x-0'}`} /></button>
          </div>
          <div className="flex items-center justify-between p-5">
            <span className="font-bold text-[13px]">Base Currency</span>
            <select value={settings.currency} onChange={(e) => { updateSettings({ currency: e.target.value }); setSaveStatus('saving'); setTimeout(showSavedFeedback, 500); }} className="bg-transparent border-none font-black text-indigo-600 text-right uppercase text-[11px]">
              {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
            </select>
          </div>
        </div>
      </section>

      <section className="pt-4">
        <button onClick={() => { if(confirm('Reset all data?')) { localStorage.clear(); window.location.reload(); }}} className="w-full py-4 bg-rose-50 dark:bg-rose-900/10 rounded-2xl text-[8px] font-black text-rose-500 uppercase tracking-[0.3em]">Factory Reset Portfolio</button>
      </section>
    </div>
  );
};

export default Settings;
