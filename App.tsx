
import React, { useState, useEffect, useMemo } from 'react';
import { Tab, Transaction, Account, UserSettings, TransactionType, CURRENCIES, Entity, DEFAULT_CATEGORIES, Product } from './types';
import { Icons } from './constants';
import Dashboard from './components/Dashboard';
import Ledger from './components/Ledger';
import Inventory from './components/Inventory';
import TransactionForm from './components/TransactionForm';
import Reports from './components/Reports';
import Settings from './components/Settings';
import AdminPanel from './components/AdminPanel';

const STORAGE_KEY = 'trackr_pro_accounting_v1';

const INITIAL_ACCOUNTS: Account[] = [
  { id: '1', name: 'Business Bank', balance: 500000, color: 'indigo', type: 'BANK' },
  { id: '2', name: 'Store Cash', balance: 25000, color: 'emerald', type: 'CASH' }
];

const INITIAL_SETTINGS: UserSettings = {
  currency: 'PKR',
  darkMode: true,
  activeAccountId: '1',
  companyName: 'Azeem Solutions'
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [products, setProducts] = useState<Product[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [settings, setSettings] = useState<UserSettings>(INITIAL_SETTINGS);
  const [categories, setCategories] = useState<Record<TransactionType, string[]>>(DEFAULT_CATEGORIES);
  const [isInitialized, setIsInitialized] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setTransactions(parsed.transactions || []);
      setAccounts(parsed.accounts || INITIAL_ACCOUNTS);
      setProducts(parsed.products || []);
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
        products,
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
  }, [transactions, accounts, products, entities, settings, isInitialized, logoUrl, categories]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: crypto.randomUUID() };
    setTransactions(prev => [newTransaction, ...prev]);
    
    // Update Accounts
    setAccounts(prev => prev.map(acc => {
      if (transaction.type === TransactionType.TRANSFER) {
        if (acc.id === transaction.accountId) return { ...acc, balance: acc.balance - transaction.amount };
        if (acc.id === transaction.toAccountId) return { ...acc, balance: acc.balance + transaction.amount };
      } else {
        if (acc.id === transaction.accountId) {
          const diff = transaction.type === TransactionType.INCOME ? transaction.amount : -transaction.amount;
          return { ...acc, balance: acc.balance + diff };
        }
      }
      return acc;
    }));

    // Update Product Stock if linked
    if (transaction.productId && transaction.quantity) {
      setProducts(prev => prev.map(p => {
        if (p.id === transaction.productId) {
          const stockChange = transaction.type === TransactionType.INCOME ? -transaction.quantity! : transaction.quantity!;
          return { ...p, stock: p.stock + stockChange };
        }
        return p;
      }));
    }

    setActiveTab('ledger');
  };

  const updateTransaction = (updatedTx: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedTx.id ? updatedTx : t));
  };

  const deleteTransaction = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    setTransactions(prev => prev.filter(t => t.id !== id));
    setAccounts(prev => prev.map(acc => {
      if (tx.type === TransactionType.TRANSFER) {
        if (acc.id === tx.accountId) return { ...acc, balance: acc.balance + tx.amount };
        if (acc.id === tx.toAccountId) return { ...acc, balance: acc.balance - tx.amount };
      } else {
        if (acc.id === tx.accountId) {
          const diff = tx.type === TransactionType.INCOME ? -tx.amount : tx.amount;
          return { ...acc, balance: acc.balance + diff };
        }
      }
      return acc;
    }));
  };

  const currencySymbol = useMemo(() => {
    return CURRENCIES.find(c => c.code === settings.currency)?.symbol || 'Rs.';
  }, [settings.currency]);

  if (!isInitialized) return null;

  return (
    <div className="h-screen w-full text-slate-900 dark:text-slate-100 max-w-md mx-auto relative overflow-hidden flex flex-col bg-[#fcfcfd] dark:bg-[#030712]">
      {activeTab !== 'add' && (
        <header className="px-8 pt-10 pb-4 flex justify-between items-center z-40 animate-slide-up">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-black/[0.03] dark:border-white/5 p-1 flex items-center justify-center overflow-hidden">
               {logoUrl ? (
                 <img src={logoUrl} className="w-full h-full object-contain" alt="Logo" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500">
                   <Icons.Dashboard className="w-6 h-6" />
                 </div>
               )}
            </div>
            <div className="flex flex-col">
              <p className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.4em]">{settings.companyName}</p>
              <h1 className="text-2xl font-black tracking-tightest">TRACKR<span className="text-slate-400">.</span>ERP</h1>
            </div>
          </div>
          <button onClick={() => setActiveTab('admin')} className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-black/[0.03] dark:border-white/5 overflow-hidden active-scale">
             <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${settings.companyName}`} className="w-full h-full object-cover" alt="Profile" />
          </button>
        </header>
      )}

      <main className={`flex-1 overflow-y-auto no-scrollbar px-6 ${activeTab === 'add' ? 'py-0 flex flex-col justify-center' : 'py-2'}`}>
        <div className={activeTab === 'add' ? '' : 'pb-40'}>
          {activeTab === 'dashboard' && <Dashboard transactions={transactions} accounts={accounts} products={products} currencySymbol={currencySymbol} />}
          {activeTab === 'ledger' && <Ledger transactions={transactions} accounts={accounts} products={products} currencySymbol={currencySymbol} onDelete={deleteTransaction} onUpdate={updateTransaction} categories={categories} />}
          {activeTab === 'inventory' && <Inventory products={products} setProducts={setProducts} currencySymbol={currencySymbol} />}
          {activeTab === 'reports' && <Reports transactions={transactions} currencySymbol={currencySymbol} />}
          {activeTab === 'add' && <TransactionForm accounts={accounts} products={products} onAdd={addTransaction} settings={settings} categories={categories} />}
          {activeTab === 'settings' && <Settings settings={settings} updateSettings={(s) => setSettings(p => ({...p, ...s}))} accounts={accounts} setAccounts={setAccounts} categories={categories} setCategories={setCategories} transactions={transactions} logoUrl={logoUrl} setLogoUrl={setLogoUrl} />}
          {activeTab === 'admin' && <AdminPanel transactions={transactions} accounts={accounts} settings={settings} />}
        </div>
      </main>

      <div className="absolute bottom-10 left-0 right-0 px-6 z-50 pointer-events-none">
        <nav className="glass rounded-[2.5rem] p-1.5 flex justify-between items-center premium-shadow pointer-events-auto">
          {[
            { id: 'dashboard', icon: Icons.Dashboard, label: 'Hub' },
            { id: 'ledger', icon: Icons.Ledger, label: 'Books' },
            { id: 'add', icon: Icons.Plus, label: 'New' },
            { id: 'inventory', icon: Icons.Inventory, label: 'Stock' },
            { id: 'settings', icon: Icons.Settings, label: 'Admin' }
          ].map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id as Tab)} className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-3xl transition-all duration-300 ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>
              <item.icon className="w-5 h-5" />
              {activeTab === item.id && <span className="text-[7px] font-black uppercase tracking-widest">{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default App;
