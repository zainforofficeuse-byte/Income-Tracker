
import React, { useState } from 'react';
import { UserSettings, Account, CURRENCIES, TransactionType, Transaction } from '../types';

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
  onFetchCloud: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, updateSettings, accounts, setAccounts, categories, setCategories, onRemoveInventoryTag, onFetchCloud }) => {
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [newAcc, setNewAcc] = useState({ name: '', balance: 0 });
  const [newCat, setNewCat] = useState({ name: '', type: TransactionType.EXPENSE });
  const [newInvTag, setNewInvTag] = useState('');

  const addAccount = () => {
    if (!newAcc.name) return;
    const acc: Account = { id: crypto.randomUUID(), companyId: accounts[0]?.companyId || 'SYSTEM', name: newAcc.name, balance: newAcc.balance, color: '#6366f1', type: 'BANK' };
    setAccounts([...accounts, acc]);
    setNewAcc({ name: '', balance: 0 });
    setIsAddingAccount(false);
  };

  const addCategory = () => {
    if (!newCat.name) return;
    setCategories({ ...categories, [newCat.type]: [...categories[newCat.type], newCat.name] });
    setNewCat({ ...newCat, name: '' });
  };

  const addInvTag = () => {
    if (!newInvTag) return;
    updateSettings({ inventoryCategories: [...settings.inventoryCategories, newInvTag] });
    setNewInvTag('');
  };

  return (
    <div className="space-y-10 animate-slide-up pb-32 max-w-2xl mx-auto">
      <div className="px-2 flex justify-between items-center">
         <div>
            <h2 className="text-3xl font-black tracking-tightest">Settings</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Enterprise Configuration</p>
         </div>
         <div className="flex gap-2">
            <button onClick={() => updateSettings({ darkMode: !settings.darkMode })} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl active-scale">
               {settings.darkMode ? '☀️' : '🌙'}
            </button>
         </div>
      </div>

      {/* Cloud Status Section */}
      <section className="space-y-4 px-2">
         <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 blur-3xl rounded-full"></div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div>
                  <div className="flex items-center gap-2 mb-1">
                     <div className={`h-1.5 w-1.5 rounded-full ${settings.cloud.isConnected ? 'bg-emerald-400' : 'bg-rose-400'} animate-pulse`}></div>
                     <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">
                        {settings.cloud.isConnected ? 'Google Cloud Linked' : 'Cloud Disconnected'}
                     </p>
                  </div>
                  <h3 className="text-xl font-black">Sheets Real-time Sync</h3>
               </div>
               <button onClick={onFetchCloud} className="px-6 py-3 bg-white text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active-scale">
                  Force Sync Now
               </button>
            </div>
         </div>
      </section>

      {/* Account Balances Section */}
      <section className="space-y-4 px-2">
        <div className="flex items-center justify-between">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accounts & Openings</p>
           <button onClick={() => setIsAddingAccount(!isAddingAccount)} className="text-indigo-600 text-[9px] font-black uppercase tracking-widest">+ Add New Account</button>
        </div>
        {isAddingAccount && (
          <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-[2rem] space-y-3 animate-in zoom-in-95">
             <input value={newAcc.name} onChange={e => setNewAcc({...newAcc, name: e.target.value})} placeholder="Account Name (e.g. Bank Alfalah)" className="w-full bg-white dark:bg-slate-800 rounded-xl px-4 py-3 text-xs font-bold border-none" />
             <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold opacity-30">{settings.currency}</span>
                <input type="number" value={newAcc.balance} onChange={e => setNewAcc({...newAcc, balance: parseFloat(e.target.value) || 0})} placeholder="Opening Balance" className="w-full bg-white dark:bg-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs font-bold border-none" />
             </div>
             <button onClick={addAccount} className="w-full bg-indigo-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active-scale">Save Account</button>
          </div>
        )}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden premium-shadow border border-black/[0.01]">
          {accounts.map((acc, idx) => (
            <div key={acc.id} className={`flex items-center justify-between p-6 ${idx !== accounts.length - 1 ? 'border-b border-slate-50 dark:border-white/5' : ''}`}>
               <span className="font-black text-sm">{acc.name}</span>
               <span className="font-black text-xs text-indigo-500">{settings.currency} {acc.balance.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="pt-8 px-2">
         <button onClick={() => { if(confirm('Factory Reset?')) { localStorage.clear(); window.location.reload(); }}} className="w-full py-6 bg-rose-50 dark:bg-rose-900/10 rounded-[2.5rem] text-[9px] font-black text-rose-500 uppercase tracking-[0.4em]">Erase All System Data</button>
      </section>
    </div>
  );
};

export default Settings;
