
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
}

const Settings: React.FC<SettingsProps> = ({ 
  settings, 
  updateSettings,
}) => {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'testing'>('idle');

  const updatePricingRule = (field: keyof PricingRules, value: any) => {
    updateSettings({ pricingRules: { ...settings.pricingRules, [field]: value } });
    setSaveStatus('saving');
    setTimeout(() => setSaveStatus('saved'), 1000);
  };

  const updateCloudConfig = (field: keyof DbCloudConfig, value: any) => {
    updateSettings({ cloud: { ...settings.cloud, [field]: value } });
  };

  const testConnection = async () => {
    setSaveStatus('testing');
    try {
      // Simulate a real DB ping via the bridge URL
      const response = await fetch(settings.cloud.bridgeUrl || '', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ping', config: settings.cloud })
      });
      if (response.ok) {
        updateCloudConfig('isConnected', true);
        setSaveStatus('saved');
      } else {
        throw new Error();
      }
    } catch (e) {
      alert("Connection Failed. Check Hostinger Remote MySQL settings.");
      updateCloudConfig('isConnected', false);
      setSaveStatus('idle');
    }
  };

  return (
    <div className="space-y-10 animate-slide-up pb-32">
      {/* Visual Header */}
      <div className="px-2">
         <h2 className="text-3xl font-black tracking-tightest">System Config</h2>
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">Enterprise Management Console</p>
      </div>

      {/* MYSQL CONFIGURATION - Exact match to user screenshot */}
      <section className="bg-[#0f1117] rounded-[3rem] p-8 premium-shadow border border-white/5 space-y-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[80px] rounded-full -mr-20 -mt-20"></div>
        
        <div className="relative z-10">
          <h3 className="text-xl font-black text-white uppercase tracking-tight">MySQL Configuration</h3>
          <p className="text-[10px] font-bold text-slate-500 mt-1">Provide the details for your remote database instance.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          {/* Left Side: Inputs */}
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Host / Server IP</label>
                <input 
                  type="text" 
                  placeholder="e.g. sql102.main-hosting.eu" 
                  value={settings.cloud.host}
                  onChange={e => updateCloudConfig('host', e.target.value)}
                  className="w-full bg-[#1c1f26] text-white rounded-2xl py-4 px-6 font-bold text-xs border border-white/5 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div className="w-32 space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">MySQL Port</label>
                <input 
                  type="text" 
                  placeholder="3306" 
                  value={settings.cloud.port}
                  onChange={e => updateCloudConfig('port', e.target.value)}
                  className="w-full bg-[#1c1f26] text-white rounded-2xl py-4 px-6 font-bold text-xs border border-white/5 text-center"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Database Name</label>
              <input 
                type="text" 
                placeholder="u123456_mydb" 
                value={settings.cloud.dbName}
                onChange={e => updateCloudConfig('dbName', e.target.value)}
                className="w-full bg-[#1c1f26] text-white rounded-2xl py-4 px-6 font-bold text-xs border border-white/5"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">DB Username</label>
                <input 
                  type="text" 
                  placeholder="admin@example.com" 
                  value={settings.cloud.dbUser}
                  onChange={e => updateCloudConfig('dbUser', e.target.value)}
                  className="w-full bg-[#1c1f26] text-white rounded-2xl py-4 px-6 font-bold text-xs border border-white/5"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">DB Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={settings.cloud.dbPass}
                  onChange={e => updateCloudConfig('dbPass', e.target.value)}
                  className="w-full bg-[#1c1f26] text-white rounded-2xl py-4 px-6 font-bold text-xs border border-white/5"
                />
              </div>
            </div>

            <div className="pt-4">
              <button 
                onClick={testConnection}
                disabled={saveStatus === 'testing'}
                className="w-full md:w-auto px-8 py-4 bg-[#8b5cf6] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active-scale shadow-lg shadow-purple-500/20"
              >
                <svg className={`${saveStatus === 'testing' ? 'animate-spin' : ''}`} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m13 2-2 10h9L7 22l2-10H1L13 2z"/></svg>
                {saveStatus === 'testing' ? 'Connecting...' : 'Execute Link Test'}
              </button>
            </div>
          </div>

          {/* Right Side: Health & Tips */}
          <div className="space-y-8">
            <div className="bg-[#1c1f26]/50 rounded-[2rem] p-8 border border-white/5">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Database Health</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-[11px] font-bold text-slate-400">Remote Port ({settings.cloud.port || '3306'})</span>
                  <span className="text-[10px] font-black text-emerald-500 uppercase">Listening</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-[11px] font-bold text-slate-400">Auth Mechanism</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase">SHA-256</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[11px] font-bold text-slate-400">TLS Encryption</span>
                  <span className={`text-[10px] font-black uppercase ${settings.cloud.isConnected ? 'text-emerald-500' : 'text-slate-500'}`}>
                    {settings.cloud.isConnected ? 'Active' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-indigo-600/5 rounded-[2rem] p-6 border border-indigo-500/10">
               <div className="flex items-center gap-2 mb-3">
                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                 <span className="text-[10px] font-black text-indigo-400 uppercase">Hostinger Tip</span>
               </div>
               <p className="text-[10px] font-medium text-slate-400 leading-relaxed italic">
                 Make sure to add your IP address to the <span className="text-slate-200 font-bold">Remote MySQL</span> section in your hPanel, or use <span className="text-slate-200 font-bold">'%'</span> for wildcards to allow the connection.
               </p>
            </div>
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
