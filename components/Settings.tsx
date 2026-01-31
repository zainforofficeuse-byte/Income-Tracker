
import React, { useState, useEffect, useCallback } from 'react';
import { UserSettings, Account, CURRENCIES, TransactionType, Transaction } from '../types';
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
}

const Settings: React.FC<SettingsProps> = ({ 
  settings, 
  updateSettings, 
  accounts, 
  setAccounts, 
  categories, 
  setCategories,
  transactions,
  logoUrl,
  setLogoUrl
}) => {
  const [activeCategoryType, setActiveCategoryType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCatIndex, setEditingCatIndex] = useState<number | null>(null);
  const [editingCatName, setEditingCatName] = useState('');

  // New Account State
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState<Account['type']>('BANK');
  const [newAccBalance, setNewAccBalance] = useState('');

  // Editing Account State
  const [editingAccId, setEditingAccId] = useState<string | null>(null);
  const [editAccName, setEditAccName] = useState('');
  const [editAccBalance, setEditAccBalance] = useState('');

  // Auto-save feedback
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const showSavedFeedback = () => {
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
        setSaveStatus('saving');
        setTimeout(showSavedFeedback, 500);
      };
      reader.readAsDataURL(file);
    }
  };

  // Debounced Auto-save for Account Edits
  useEffect(() => {
    if (!editingAccId) return;

    const timer = setTimeout(() => {
      setAccounts(prev => prev.map(acc => {
        if (acc.id === editingAccId) {
          const updated = {
            ...acc,
            name: editAccName,
            balance: parseFloat(editAccBalance) || 0
          };
          if (acc.name !== editAccName || acc.balance !== parseFloat(editAccBalance)) {
            setSaveStatus('saving');
            setTimeout(showSavedFeedback, 500);
          }
          return updated;
        }
        return acc;
      }));
    }, 1500);

    return () => clearTimeout(timer);
  }, [editAccName, editAccBalance, editingAccId, setAccounts]);

  // Debounced Auto-save for Category Edits
  useEffect(() => {
    if (editingCatIndex === null) return;

    const timer = setTimeout(() => {
      setCategories(prev => {
        const updatedList = [...prev[activeCategoryType]];
        if (updatedList[editingCatIndex] !== editingCatName.trim()) {
           updatedList[editingCatIndex] = editingCatName.trim();
           setSaveStatus('saving');
           setTimeout(showSavedFeedback, 500);
           return { ...prev, [activeCategoryType]: updatedList };
        }
        return prev;
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, [editingCatName, editingCatIndex, activeCategoryType, setCategories]);

  const handleAddAccount = () => {
    if (!newAccName || !newAccBalance) return;
    const newAccount: Account = {
      id: crypto.randomUUID(),
      name: newAccName,
      type: newAccType,
      balance: parseFloat(newAccBalance) || 0,
      color: 'indigo'
    };
    setAccounts(prev => [...prev, newAccount]);
    setIsAddingAccount(false);
    setNewAccName('');
    setNewAccBalance('');
    setSaveStatus('saving');
    setTimeout(showSavedFeedback, 500);
  };

  const startEditingAccount = (acc: Account, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAccId(acc.id);
    setEditAccName(acc.name);
    setEditAccBalance(acc.balance.toString());
  };

  const handleDeleteAccount = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (accounts.length <= 1) {
      alert("At least one active wallet is required for system integrity.");
      return;
    }
    const isConfirmed = window.confirm(`Remove this account from your portfolio? This action is permanent.`);
    if (isConfirmed) {
      const remainingAccounts = accounts.filter(acc => acc.id !== id);
      setAccounts(remainingAccounts);
      if (settings.activeAccountId === id) {
        updateSettings({ activeAccountId: remainingAccounts[0].id });
      }
      setSaveStatus('saving');
      setTimeout(showSavedFeedback, 500);
    }
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    if (categories[activeCategoryType].includes(newCategoryName.trim())) {
      alert("Classification already exists.");
      return;
    }
    setCategories(prev => ({
      ...prev,
      [activeCategoryType]: [...prev[activeCategoryType], newCategoryName.trim()]
    }));
    setNewCategoryName('');
    setSaveStatus('saving');
    setTimeout(showSavedFeedback, 500);
  };

  const startEditingCategory = (index: number, name: string) => {
    setEditingCatIndex(index);
    setEditingCatName(name);
  };

  const symbol = CURRENCIES.find(c => c.code === settings.currency)?.symbol || '$';

  return (
    <div className="space-y-8 animate-slide-up pb-20 relative">
      {/* Global Saving Indicator */}
      <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[60] transition-all duration-500 pointer-events-none ${saveStatus !== 'idle' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 px-6 py-2 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-3 border border-white/10">
          <div className={`w-2 h-2 rounded-full ${saveStatus === 'saving' ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500'}`}></div>
          <span className="text-[10px] font-black uppercase tracking-widest">
            {saveStatus === 'saving' ? 'Syncing...' : 'Changes Saved'}
          </span>
        </div>
      </div>

      {/* Brand Section */}
      <section>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 px-2">Branding</p>
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 premium-shadow border border-black/[0.02] dark:border-white/5 flex flex-col items-center gap-6">
          <div className="relative group">
            <div className="h-24 w-24 rounded-3xl bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden transition-all group-hover:border-indigo-500">
              {logoUrl ? (
                <img src={logoUrl} className="w-full h-full object-contain" alt="Current Logo" />
              ) : (
                <Icons.Plus className="w-8 h-8 text-slate-300" />
              )}
            </div>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleLogoUpload}
              className="absolute inset-0 opacity-0 cursor-pointer" 
            />
          </div>
          <div className="text-center">
            <h4 className="font-black text-sm mb-1">Company Logo</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Click to upload brand identity</p>
          </div>
          <input 
            type="text"
            value={settings.companyName}
            onChange={(e) => {
              updateSettings({ companyName: e.target.value });
              setSaveStatus('saving');
              setTimeout(showSavedFeedback, 500);
            }}
            placeholder="Organization Name"
            className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl py-4 px-6 font-black text-center text-sm border-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </section>

      <section>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 px-2">Appearance</p>
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden premium-shadow border border-black/[0.02] dark:border-white/5">
          <div className="flex items-center justify-between p-5 border-b border-slate-50 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v2"/><circle cx="12" cy="12" r="8"/></svg>
              </div>
              <span className="font-bold text-[13px]">Dark Mode</span>
            </div>
            <button 
              onClick={() => {
                updateSettings({ darkMode: !settings.darkMode });
                setSaveStatus('saving');
                setTimeout(showSavedFeedback, 500);
              }}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-500 active-scale ${settings.darkMode ? 'bg-indigo-500' : 'bg-slate-200'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-500 shadow-sm ${settings.darkMode ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-500">
                <span className="font-black text-md">$</span>
              </div>
              <span className="font-bold text-[13px]">Base Currency</span>
            </div>
            <select 
              value={settings.currency}
              onChange={(e) => {
                updateSettings({ currency: e.target.value });
                setSaveStatus('saving');
                setTimeout(showSavedFeedback, 500);
              }}
              className="bg-transparent border-none focus:ring-0 font-black text-indigo-600 text-right uppercase text-[11px]"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.code}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Account Management */}
      <section>
        <div className="flex items-center justify-between mb-4 px-2">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Portfolio Wallets</p>
          <button 
            onClick={() => setIsAddingAccount(!isAddingAccount)}
            className="text-[8px] font-black text-indigo-600 uppercase tracking-widest px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-full active-scale"
          >
            {isAddingAccount ? 'Cancel' : 'New Wallet'}
          </button>
        </div>

        {isAddingAccount && (
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 premium-shadow border-2 border-indigo-500/20 mb-6 space-y-3 animate-slide-up">
            <input 
              type="text"
              placeholder="Wallet Name"
              value={newAccName}
              onChange={(e) => setNewAccName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl p-3 font-black text-[11px] border-none"
            />
            <div className="grid grid-cols-2 gap-2">
               <select 
                value={newAccType}
                onChange={(e) => setNewAccType(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl p-3 font-black text-[11px] border-none"
              >
                <option value="BANK">Bank</option>
                <option value="CASH">Physical Cash</option>
                <option value="CREDIT">Credit Line</option>
              </select>
              <input 
                type="number"
                placeholder="Opening Balance"
                value={newAccBalance}
                onChange={(e) => setNewAccBalance(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl p-3 font-black text-[11px] border-none"
              />
            </div>
            <button 
              onClick={handleAddAccount}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl active-scale"
            >
              Initialize Wallet
            </button>
          </div>
        )}

        <div className="space-y-3">
          {accounts.map(acc => (
            <div 
              key={acc.id}
              onClick={() => {
                updateSettings({ activeAccountId: acc.id });
                if (settings.activeAccountId !== acc.id) {
                   setSaveStatus('saving');
                   setTimeout(showSavedFeedback, 500);
                }
              }}
              className={`bg-white dark:bg-slate-900 rounded-[1.8rem] p-4 flex flex-col transition-all duration-500 cursor-pointer premium-shadow border-2 ${settings.activeAccountId === acc.id ? 'border-indigo-500' : 'border-transparent opacity-80'}`}
            >
              {editingAccId === acc.id ? (
                <div className="space-y-3 p-1 animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-1">
                      <label className="text-[7px] font-black text-slate-400 uppercase ml-1">Wallet Name</label>
                      <input 
                        value={editAccName}
                        onChange={(e) => setEditAccName(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg p-2.5 font-black text-[11px] border-none"
                        placeholder="Name"
                      />
                    </div>
                    <div className="w-24 space-y-1">
                      <label className="text-[7px] font-black text-slate-400 uppercase ml-1">Balance</label>
                      <input 
                        type="number"
                        value={editAccBalance}
                        onChange={(e) => setEditAccBalance(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg p-2.5 font-black text-[11px] border-none"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-1">
                    <p className="text-[8px] font-black text-slate-400 italic">Autosaving updates...</p>
                    <button onClick={() => setEditingAccId(null)} className="text-[8px] font-black uppercase text-indigo-500 tracking-widest">Done</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white bg-indigo-600 shadow-lg">
                      <Icons.Dashboard className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-black text-[13px]">{acc.name}</h4>
                      <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">{acc.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="font-black text-[14px]">{symbol}{acc.balance.toLocaleString()}</p>
                      {settings.activeAccountId === acc.id && <span className="text-[7px] font-black text-indigo-500 uppercase tracking-[0.2em] bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">Primary</span>}
                    </div>
                    <div className="flex flex-col">
                      <button 
                        onClick={(e) => startEditingAccount(acc, e)}
                        className="p-1.5 text-slate-300 hover:text-indigo-500 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                      </button>
                      <button 
                        onClick={(e) => handleDeleteAccount(acc.id, e)}
                        className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Category Management */}
      <section>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 px-2">Classification Logic</p>
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-4 premium-shadow border border-black/[0.02] dark:border-white/5 space-y-3">
          <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-full shadow-inner">
            <button 
              onClick={() => setActiveCategoryType(TransactionType.EXPENSE)}
              className={`flex-1 py-2 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${activeCategoryType === TransactionType.EXPENSE ? 'bg-white dark:bg-slate-700 text-rose-500' : 'text-slate-400'}`}
            >
              Expense
            </button>
            <button 
              onClick={() => setActiveCategoryType(TransactionType.INCOME)}
              className={`flex-1 py-2 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${activeCategoryType === TransactionType.INCOME ? 'bg-white dark:bg-slate-700 text-emerald-500' : 'text-slate-400'}`}
            >
              Income
            </button>
          </div>
          <div className="space-y-1.5 max-h-[160px] overflow-y-auto no-scrollbar px-1">
            {categories[activeCategoryType].map((cat, idx) => (
              <div key={cat} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/20 p-2.5 px-3 rounded-xl">
                {editingCatIndex === idx ? (
                  <input 
                    value={editingCatName}
                    onChange={(e) => setEditingCatName(e.target.value)}
                    onBlur={() => setEditingCatIndex(null)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingCatIndex(null)}
                    className="bg-transparent border-none focus:ring-0 font-black text-[11px] text-indigo-600 w-full"
                    autoFocus
                  />
                ) : (
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{cat}</span>
                )}
                <button onClick={() => startEditingCategory(idx, cat)} className="p-1 text-slate-300 hover:text-indigo-500"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg></button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input 
              type="text"
              placeholder="New label..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2.5 text-[11px] font-black border-none"
            />
            <button onClick={handleAddCategory} className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center active-scale transition-transform shadow-lg">
              <Icons.Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="pt-4">
        <button 
          onClick={() => { if(confirm('Reset all data?')) { localStorage.clear(); window.location.reload(); }}}
          className="w-full py-4 bg-rose-50 dark:bg-rose-900/10 rounded-2xl text-[8px] font-black text-rose-500 uppercase tracking-[0.3em] active-scale"
        >
          Factory Reset Portfolio
        </button>
      </section>
    </div>
  );
};

export default Settings;
