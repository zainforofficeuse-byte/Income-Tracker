
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
  onFetchCloud?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  settings, 
  updateSettings,
  onFetchCloud
}) => {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'testing'>('idle');
  const [testResult, setTestResult] = useState<string | null>(null);

  const updateCloudConfig = (field: keyof DbCloudConfig, value: any) => {
    updateSettings({ cloud: { ...settings.cloud, [field]: value } });
    setTestResult(null);
  };

  const testConnection = async () => {
    if (!settings.cloud.scriptUrl) {
      alert("Please provide the Google Apps Script URL.");
      return;
    }

    setSaveStatus('testing');
    setTestResult("Connecting to Google Cloud...");

    try {
      await fetch(settings.cloud.scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ping' })
      });

      updateCloudConfig('isConnected', true);
      setSaveStatus('saved');
      setTestResult("✅ Cloud Linked Successfully!");
    } catch (e: any) {
      console.error(e);
      updateCloudConfig('isConnected', false);
      setSaveStatus('idle');
      setTestResult(`❌ Connection Failed: ${e.message}`);
    }
  };

  return (
    <div className="space-y-10 animate-slide-up pb-32">
      <div className="px-2">
         <h2 className="text-3xl font-black tracking-tightest">System Config</h2>
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">Enterprise Management Console</p>
      </div>

      {/* GOOGLE CLOUD CONFIGURATION */}
      <section className="bg-white dark:bg-slate-950 rounded-[3rem] p-8 premium-shadow border border-slate-100 dark:border-white/5 space-y-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[80px] rounded-full -mr-20 -mt-20"></div>
        
        <div className="relative z-10 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48"><path fill="#FFC107" d="M30 4H18l-8 14l8 14h12l8-14z"/><path fill="#FF3D00" d="m11.22 34.6l-5.32-9.21l8.1-14.01h10.65z"/><path fill="#4CAF50" d="m11.22 34.6l5.33 9.22h16.21l5.32-9.22z"/><path fill="#1976D2" d="m37.35 11.38l-8.1 14.01h10.65l5.32-9.21z"/></svg>
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Cloud Ecosystem</h3>
              <p className="text-[10px] font-bold text-slate-500 mt-1">Multi-Company Sheet Sync</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full border ${settings.cloud.isConnected ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-slate-200 dark:border-white/10'}`}>
            <span className={`text-[8px] font-black uppercase tracking-widest ${settings.cloud.isConnected ? 'text-emerald-500' : 'text-slate-400'}`}>
              {settings.cloud.isConnected ? 'Synchronized' : 'Offline'}
            </span>
          </div>
        </div>

        <div className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Google Apps Script URL</label>
            <input 
              type="text" 
              placeholder="https://script.google.com/macros/s/.../exec" 
              value={settings.cloud.scriptUrl}
              onChange={e => updateCloudConfig('scriptUrl', e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl py-5 px-6 font-bold text-xs border border-slate-100 dark:border-white/5 focus:ring-2 focus:ring-blue-500/40"
            />
          </div>

          <div className="flex gap-4">
             <div className="flex-1 p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-900/20">
                <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Auto-Sync</p>
                <button onClick={() => updateCloudConfig('autoSync', !settings.cloud.autoSync)} className={`w-12 h-6 rounded-full p-1 transition-all ${settings.cloud.autoSync ? 'bg-blue-500' : 'bg-slate-300'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.cloud.autoSync ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
             </div>
             <button 
                onClick={onFetchCloud}
                className="flex-1 p-5 bg-slate-900 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest active-scale border border-white/10 flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Restore Data
             </button>
          </div>

          <div className="pt-2">
            <button 
              onClick={testConnection}
              disabled={saveStatus === 'testing'}
              className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest active-scale shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3"
            >
              <svg className={saveStatus === 'testing' ? 'animate-spin' : ''} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a10 10 0 1 0-10-10"/></svg>
              {saveStatus === 'testing' ? 'Verifying...' : 'Link Google Spreadsheet'}
            </button>
            {testResult && (
              <p className={`text-[10px] font-bold uppercase tracking-widest text-center mt-4 ${testResult.includes('❌') ? 'text-rose-500' : 'text-emerald-500'}`}>
                {testResult}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Interface Settings */}
      <section className="space-y-4 px-2">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Environment</p>
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden premium-shadow border border-black/[0.01] dark:border-white/5">
          <div className="flex items-center justify-between p-7 border-b border-slate-50 dark:border-white/5">
            <span className="font-black text-sm uppercase tracking-tight">Dark Mode</span>
            <button onClick={() => updateSettings({ darkMode: !settings.darkMode })} className={`w-14 h-7 rounded-full p-1 transition-all ${settings.darkMode ? 'bg-indigo-500' : 'bg-slate-200'}`}><div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.darkMode ? 'translate-x-7' : 'translate-x-0'}`} /></button>
          </div>
          <div className="flex items-center justify-between p-7">
            <span className="font-black text-sm uppercase tracking-tight">Currency Display</span>
            <select value={settings.currency} onChange={(e) => updateSettings({ currency: e.target.value })} className="bg-transparent border-none font-black text-indigo-600 text-right uppercase text-xs focus:ring-0 cursor-pointer">
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
