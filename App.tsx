
import React, { useState, useEffect, useMemo } from 'react';
import { Tab, Transaction, Account, UserSettings, TransactionType, CURRENCIES, Entity, DEFAULT_CATEGORIES } from './types';
import { Icons } from './constants';
import Dashboard from './components/Dashboard';
import Ledger from './components/Ledger';
import TransactionForm from './components/TransactionForm';
import Reports from './components/Reports';
import Settings from './components/Settings';
import AdminPanel from './components/AdminPanel';
import { GoogleGenAI } from "@google/genai";

const STORAGE_KEY = 'trackr_pro_accounting_v1';

const INITIAL_ACCOUNTS: Account[] = [
  { id: '1', name: 'Business Checking', balance: 25400.00, color: 'indigo', type: 'BANK' },
  { id: '2', name: 'Petty Cash', balance: 450.00, color: 'emerald', type: 'CASH' }
];

const INITIAL_SETTINGS: UserSettings = {
  currency: 'USD',
  darkMode: true, // Default to dark mode as requested
  activeAccountId: '1',
  companyName: 'Azeem Corp'
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [settings, setSettings] = useState<UserSettings>(INITIAL_SETTINGS);
  const [categories, setCategories] = useState<Record<TransactionType, string[]>>(DEFAULT_CATEGORIES);
  const [isInitialized, setIsInitialized] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setTransactions(parsed.transactions || []);
      setAccounts(parsed.accounts || INITIAL_ACCOUNTS);
      setEntities(parsed.entities || []);
      setSettings(parsed.settings || INITIAL_SETTINGS);
      setCategories(parsed.categories || DEFAULT_CATEGORIES);
      setLogoUrl(parsed.logoUrl || null);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
        transactions, 
        accounts, 
        entities, 
        settings, 
        logoUrl,
        categories 
      }));
    }
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [transactions, accounts, entities, settings, isInitialized, logoUrl, categories]);

  const generateLogo = async () => {
    if (isGeneratingLogo) return;
    setIsGeneratingLogo(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: `A professional, minimalist, high-end corporate logo for a company named "${settings.companyName}". The design should be clean, modern, suitable for an accounting app, featuring geometric shapes and elegant typography. White background.`,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
          },
        },
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64Data = part.inlineData.data;
            setLogoUrl(`data:image/png;base64,${base64Data}`);
            break;
          }
        }
      }
    } catch (error) {
      console.error("Logo generation failed:", error);
    } finally {
      setIsGeneratingLogo(false);
    }
  };

  useEffect(() => {
    if (isInitialized && !logoUrl && settings.companyName) {
      generateLogo();
    }
  }, [isInitialized, logoUrl, settings.companyName]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: crypto.randomUUID() };
    setTransactions(prev => [newTransaction, ...prev]);
    
    setAccounts(prev => prev.map(acc => {
      if (transaction.type === TransactionType.TRANSFER) {
        if (acc.id === transaction.accountId) {
          return { ...acc, balance: acc.balance - transaction.amount };
        }
        if (acc.id === transaction.toAccountId) {
          return { ...acc, balance: acc.balance + transaction.amount };
        }
      } else {
        if (acc.id === transaction.accountId) {
          const diff = transaction.type === TransactionType.INCOME ? transaction.amount : -transaction.amount;
          return { ...acc, balance: acc.balance + diff };
        }
      }
      return acc;
    }));

    setActiveTab('dashboard');
  };

  const deleteTransaction = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    setTransactions(prev => prev.filter(t => t.id !== id));
    setAccounts(prev => prev.map(acc => {
      if (tx.type === TransactionType.TRANSFER) {
        if (acc.id === tx.accountId) {
          return { ...acc, balance: tx.amount + acc.balance };
        }
        if (acc.id === tx.toAccountId) {
          return { ...acc, balance: acc.balance - tx.amount };
        }
      } else {
        if (acc.id === tx.accountId) {
          const diff = tx.type === TransactionType.INCOME ? -tx.amount : tx.amount;
          return { ...acc, balance: acc.balance + diff };
        }
      }
      return acc;
    }));
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const currencySymbol = useMemo(() => {
    return CURRENCIES.find(c => c.code === settings.currency)?.symbol || '$';
  }, [settings.currency]);

  if (!isInitialized) return null;

  return (
    <div className="h-screen w-full text-slate-900 dark:text-slate-100 max-w-md mx-auto relative overflow-hidden flex flex-col bg-[#fcfcfd] dark:bg-[#030712]">
      {/* Shortened Dynamic Header */}
      {activeTab !== 'add' && (
        <header className="px-8 pt-10 pb-4 flex justify-between items-center z-40 animate-slide-up">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className={`h-12 w-12 rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-black/[0.03] dark:border-white/5 p-1 flex items-center justify-center overflow-hidden transition-all duration-500 ${isGeneratingLogo ? 'animate-pulse' : ''}`}>
                 {logoUrl ? (
                   <img src={logoUrl} alt="Company Logo" className="w-full h-full object-contain rounded-lg" />
                 ) : (
                   <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                 )}
              </div>
              <button 
                onClick={generateLogo}
                className="absolute -bottom-1 -right-1 h-5 w-5 bg-indigo-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                title="Regenerate Logo"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
              </button>
            </div>
            <div className="flex flex-col">
              <p className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-0.5">{settings.companyName}</p>
              <h1 className="text-2xl font-black tracking-tightest">TRACKR<span className="text-slate-400">.</span>PRO</h1>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('admin')}
            className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-black/[0.03] dark:border-white/5 p-0.5 active-scale transition-transform overflow-hidden"
          >
             <img 
              src={`https://api.dicebear.com/7.x/notionists/svg?seed=${settings.companyName}`} 
              alt="Admin Profile" 
              className="w-full h-full object-cover rounded-lg" 
             />
          </button>
        </header>
      )}

      {/* Main Viewport */}
      <main className={`flex-1 overflow-y-auto no-scrollbar px-6 ${activeTab === 'add' ? 'py-0 flex flex-col justify-center' : 'py-2'}`}>
        <div className={activeTab === 'add' ? '' : 'pb-40'}>
          {activeTab === 'dashboard' && (
            <Dashboard 
              transactions={transactions} 
              accounts={accounts} 
              settings={settings}
              currencySymbol={currencySymbol} 
            />
          )}
          {activeTab === 'ledger' && (
            <Ledger 
              transactions={transactions} 
              accounts={accounts}
              currencySymbol={currencySymbol} 
              onDelete={deleteTransaction} 
            />
          )}
          {activeTab === 'reports' && (
            <Reports 
              transactions={transactions}
              currencySymbol={currencySymbol}
            />
          )}
          {activeTab === 'add' && (
            <TransactionForm 
              accounts={accounts} 
              onAdd={addTransaction} 
              settings={settings}
              categories={categories}
            />
          )}
          {activeTab === 'settings' && (
            <Settings 
              settings={settings} 
              updateSettings={updateSettings} 
              accounts={accounts}
              setAccounts={setAccounts}
              categories={categories}
              setCategories={setCategories}
              transactions={transactions}
            />
          )}
          {activeTab === 'admin' && (
            <AdminPanel 
              transactions={transactions}
              accounts={accounts}
              settings={settings}
            />
          )}
        </div>
      </main>

      {/* Professional Bottom Menu */}
      <div className="absolute bottom-12 left-0 right-0 px-8 z-50 pointer-events-none">
        <nav className="glass rounded-[3rem] p-2 flex justify-between items-center premium-shadow ring-1 ring-black/[0.02] dark:ring-white/[0.04] pointer-events-auto overflow-hidden">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 flex flex-col items-center gap-1.5 p-3.5 rounded-[2.2rem] transition-all duration-500 active-scale ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-400'}`}
          >
            <Icons.Dashboard className={`w-5 h-5`} />
            <span className={`text-[7px] font-black uppercase tracking-widest ${activeTab === 'dashboard' ? 'block' : 'hidden'}`}>Hub</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('ledger')}
            className={`flex-1 flex flex-col items-center gap-1.5 p-3.5 rounded-[2.2rem] transition-all duration-500 active-scale ${activeTab === 'ledger' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-400'}`}
          >
            <Icons.Ledger className={`w-5 h-5`} />
            <span className={`text-[7px] font-black uppercase tracking-widest ${activeTab === 'ledger' ? 'block' : 'hidden'}`}>Books</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('add')}
            className={`flex-1 flex flex-col items-center gap-1.5 p-3.5 rounded-[2.2rem] transition-all duration-500 active-scale ${activeTab === 'add' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-400'}`}
          >
            <Icons.Plus className={`w-5 h-5`} />
            <span className={`text-[7px] font-black uppercase tracking-widest ${activeTab === 'add' ? 'block' : 'hidden'}`}>New</span>
          </button>

          <button 
            onClick={() => setActiveTab('reports')}
            className={`flex-1 flex flex-col items-center gap-1.5 p-3.5 rounded-[2.2rem] transition-all duration-500 active-scale ${activeTab === 'reports' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-400'}`}
          >
            <Icons.Reports className={`w-5 h-5`} />
            <span className={`text-[7px] font-black uppercase tracking-widest ${activeTab === 'reports' ? 'block' : 'hidden'}`}>P&L</span>
          </button>

          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex-1 flex flex-col items-center gap-1.5 p-3.5 rounded-[2.2rem] transition-all duration-500 active-scale ${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-400'}`}
          >
            <Icons.Settings className={`w-5 h-5`} />
            <span className={`text-[7px] font-black uppercase tracking-widest ${activeTab === 'settings' ? 'block' : 'hidden'}`}>Setup</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default App;
