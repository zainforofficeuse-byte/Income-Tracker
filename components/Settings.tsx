
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
  onFetchCloud?: (customUrl?: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, updateSettings, accounts, setAccounts, categories, setCategories, onRemoveInventoryTag }) => {
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
            <button onClick={() => updateSettings({ darkMode: !settings.darkMode })} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl">
               {settings.darkMode ? '☀️' : '🌙'}
            </button>
         </div>
      </div>

      {/* Account Balances Section */}
      <section className="space-y-4 px-2">
        <div className="flex items-center justify-between">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accounts & Openings</p>
           <button onClick={() => setIsAddingAccount(!isAddingAccount)} className="text-indigo-600 text-[9px] font-black uppercase tracking-widest">+ Add New Account</button>
        </div>
        {isAddingAccount && (
          <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-[2rem] space-y-3 animate-in zoom-in-95">
             <input value={newAcc.name} onChange={e => setNewAcc({...newAcc, name: e.target.value})} placeholder="Account Name (e.g. HBL Bank)" className="w-full bg-white dark:bg-slate-800 rounded-xl px-4 py-3 text-xs font-bold border-none" />
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

      {/* Finance Category Manager */}
      <section className="space-y-4 px-2">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Finance Ledger Categories</p>
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 premium-shadow space-y-6">
           <div className="flex gap-2">
              <input value={newCat.name} onChange={e => setNewCat({...newCat, name: e.target.value})} placeholder="Add Label..." className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-xs font-bold border-none" />
              <select value={newCat.type} onChange={e => setNewCat({...newCat, type: e.target.value as TransactionType})} className="bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-[10px] font-black uppercase border-none">
                 <option value={TransactionType.INCOME}>Income</option>
                 <option value={TransactionType.EXPENSE}>Expense</option>
              </select>
              <button onClick={addCategory} className="bg-indigo-600 text-white px-6 rounded-xl text-xl font-black active-scale">+</button>
           </div>
           <div className="grid grid-cols-2 gap-8">
              <div>
                 <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-4">Incomes</p>
                 <div className="space-y-2">{categories[TransactionType.INCOME].map(c => <div key={c} className="flex justify-between items-center group"><span className="text-[11px] font-bold">{c}</span><button onClick={() => setCategories({...categories, [TransactionType.INCOME]: categories[TransactionType.INCOME].filter(cat => cat !== c)})} className="text-rose-500 opacity-0 group-hover:opacity-100">×</button></div>)}</div>
              </div>
              <div>
                 <p className="text-[8px] font-black text-rose-500 uppercase tracking-widest mb-4">Expenses</p>
                 <div className="space-y-2">{categories[TransactionType.EXPENSE].map(c => <div key={c} className="flex justify-between items-center group"><span className="text-[11px] font-bold">{c}</span><button onClick={() => setCategories({...categories, [TransactionType.EXPENSE]: categories[TransactionType.EXPENSE].filter(cat => cat !== c)})} className="text-rose-500 opacity-0 group-hover:opacity-100">×</button></div>)}</div>
              </div>
           </div>
        </div>
      </section>

      {/* Inventory Category Manager (Global Tags) */}
      <section className="space-y-4 px-2">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inventory Global Tags</p>
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 premium-shadow space-y-6">
           <div className="flex gap-2">
              <input value={newInvTag} onChange={e => setNewInvTag(e.target.value)} placeholder="New Stock Tag (e.g. Shoes)..." className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-xs font-bold border-none" />
              <button onClick={addInvTag} className="bg-indigo-600 text-white px-6 rounded-xl text-xl font-black active-scale">+</button>
           </div>
           <div className="flex flex-wrap gap-2">
              {settings.inventoryCategories.map(tag => (
                <div key={tag} className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-full border border-indigo-100 dark:border-indigo-800">
                   <span className="text-[10px] font-black uppercase text-indigo-600">{tag}</span>
                   <button onClick={() => onRemoveInventoryTag(tag)} className="text-rose-500 font-black">×</button>
                </div>
              ))}
           </div>
        </div>
      </section>

      <section className="pt-8 px-2">
         <button onClick={() => { if(confirm('Factory Reset?')) { localStorage.clear(); window.location.reload(); }}} className="w-full py-6 bg-rose-50 dark:bg-rose-900/10 rounded-[2.5rem] text-[9px] font-black text-rose-500 uppercase tracking-[0.4em]">Erase All System Data</button>
      </section>
    </div>
  );
};

export default Settings;
