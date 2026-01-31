
import React, { useState, useEffect, useMemo } from 'react';
import { Tab, Transaction, Account, UserSettings, TransactionType, CURRENCIES, Entity, DEFAULT_CATEGORIES, DEFAULT_PRODUCT_CATEGORIES, Product, User, UserRole, Company } from './types';
import { Icons } from './constants';
import Dashboard from './components/Dashboard';
import Ledger from './components/Ledger';
import Inventory from './components/Inventory';
import TransactionForm from './components/TransactionForm';
import Reports from './components/Reports';
import Settings from './components/Settings';
import AdminPanel from './components/AdminPanel';
import Parties from './components/Parties';
import AuthGuard from './components/AuthGuard';
import ProfileModal from './components/ProfileModal';
import LandingPage from './components/LandingPage';

const STORAGE_KEY = 'trackr_enterprise_v9';
const MASTER_CONFIG_URL = 'https://raw.githubusercontent.com/zainforofficeuse-byte/config-file-income-tracker/refs/heads/main/config.txt'; 

// Default Super Admin with Email/Password
const INITIAL_USERS: User[] = [
  { 
    id: 'system-sa', 
    companyId: 'SYSTEM', 
    name: 'Super Admin', 
    email: 'super@trackr.com', 
    password: 'admin123', 
    pin: '1234', // Added pin for super admin
    role: UserRole.SUPER_ADMIN 
  }
];

const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLanding, setIsLanding] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [categories, setCategories] = useState<Record<TransactionType, string[]>>(DEFAULT_CATEGORIES);
  
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isLocked, setIsLocked] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  const [settings, setSettings] = useState<UserSettings>({
    currency: 'PKR', 
    darkMode: false, 
    activeAccountId: '', 
    companyName: 'TRACKR.', 
    inventoryCategories: DEFAULT_PRODUCT_CATEGORIES, 
    remoteDbConnected: false,
    pricingRules: {
      fixedOverhead: 0,
      variableOverheadPercent: 0,
      platformFeePercent: 0,
      targetMarginPercent: 20,
      autoApply: true,
      customAdjustments: []
    },
    cloud: {
      scriptUrl: '',
      remoteConfigUrl: MASTER_CONFIG_URL,
      autoSync: true,
      isConnected: false
    }
  });

  const currentUser = useMemo(() => users.find(u => u.id === currentUserId) || null, [users, currentUserId]);
  const activeCompanyId = useMemo(() => currentUser?.companyId || 'SYSTEM', [currentUser]);
  const isSuper = currentUser?.role === UserRole.SUPER_ADMIN;

  const companyTransactions = useMemo(() => isSuper ? transactions : transactions.filter(t => t.companyId === activeCompanyId), [transactions, activeCompanyId, isSuper]);
  const companyAccounts = useMemo(() => isSuper ? accounts : accounts.filter(a => a.companyId === activeCompanyId), [accounts, activeCompanyId, isSuper]);
  const companyProducts = useMemo(() => isSuper ? products : products.filter(p => p.companyId === activeCompanyId), [products, activeCompanyId, isSuper]);
  const companyEntities = useMemo(() => isSuper ? entities : entities.filter(e => e.companyId === activeCompanyId), [entities, activeCompanyId, isSuper]);

  useEffect(() => {
    const fetchMasterConfig = async () => {
      try {
        const response = await fetch(MASTER_CONFIG_URL);
        const text = await response.text();
        const scriptUrlMatch = text.match(/https:\/\/script\.google\.com\/macros\/s\/[a-zA-Z0-9_-]+\/exec/);
        if (scriptUrlMatch) {
          setSettings(prev => ({
            ...prev,
            cloud: { ...prev.cloud, scriptUrl: scriptUrlMatch[0], isConnected: true }
          }));
        }
      } catch (err) { console.error("Config fetch error:", err); }
    };
    fetchMasterConfig();
  }, []);

  useEffect(() => {
    const init = async () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const p = JSON.parse(saved);
        if (p.companies) setCompanies(p.companies);
        if (p.users && p.users.length > 0) setUsers(p.users);
        if (p.transactions) setTransactions(p.transactions);
        if (p.accounts) setAccounts(p.accounts);
        if (p.products) setProducts(p.products);
        if (p.entities) setEntities(p.entities);
        if (p.categories) setCategories(p.categories);
        if (p.settings) {
          setSettings(prev => ({
            ...prev,
            ...p.settings,
            pricingRules: { ...prev.pricingRules, ...(p.settings.pricingRules || {}) },
            cloud: { ...prev.cloud, ...(p.settings.cloud || prev.cloud) }
          }));
        }
      }
      setIsInitialized(true);
    };
    init();
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ companies, users, transactions, accounts, products, entities, categories, settings }));
    }
    if (settings.darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [companies, users, transactions, accounts, products, entities, categories, isInitialized, settings]);

  const addTransaction = (tx: any) => {
    if (!currentUser) return;
    const newTx = { ...tx, id: crypto.randomUUID(), companyId: activeCompanyId, createdBy: currentUser.id, syncStatus: 'PENDING', version: 1, updatedAt: new Date().toISOString() };
    setTransactions(prev => [newTx, ...prev]);
    if (tx.paymentStatus === 'PAID') {
      setAccounts(prev => prev.map(a => a.id === tx.accountId ? { ...a, balance: a.balance + (tx.type === TransactionType.INCOME ? tx.amount : -tx.amount) } : a));
    }
    if (tx.entityId) {
       setEntities(prev => prev.map(e => e.id === tx.entityId ? { ...e, balance: e.balance + (tx.type === TransactionType.INCOME ? tx.amount : -tx.amount) } : e));
    }
    if (tx.cart) {
      tx.cart.forEach((item: any) => {
        setProducts(prev => prev.map(p => p.id === item.productId ? { ...p, stock: p.stock + (tx.type === TransactionType.INCOME ? -item.quantity : item.quantity) } : p));
      });
    } else if (tx.productId) {
      setProducts(prev => prev.map(p => p.id === tx.productId ? { ...p, stock: p.stock + (tx.type === TransactionType.INCOME ? -tx.quantity : tx.quantity) } : p));
    }
    setActiveTab('ledger');
  };

  const handleRegisterCompany = (name: string, adminName: string, adminEmail: string, adminPass: string) => {
    const compId = crypto.randomUUID();
    const userId = crypto.randomUUID();
    const accId = crypto.randomUUID();
    setCompanies(prev => [...prev, { id: compId, name, registrationDate: new Date().toISOString(), status: 'ACTIVE' }]);
    // Populating pin field with adminPass during registration
    setUsers(prev => [...prev, { id: userId, companyId: compId, name: adminName, email: adminEmail, password: adminPass, pin: adminPass, role: UserRole.ADMIN }]);
    setAccounts(prev => [...prev, { id: accId, companyId: compId, name: 'Cash Account', balance: 0, color: '#6366f1', type: 'CASH' }]);
    return userId;
  };

  const currencySymbol = useMemo(() => CURRENCIES.find(c => c.code === settings.currency)?.symbol || 'Rs.', [settings.currency]);

  if (!isInitialized) return null;
  if (isLanding) return <LandingPage onGetStarted={() => { setIsLanding(false); }} onLogin={() => { setIsLanding(false); }} />;
  if (isLocked) return <AuthGuard companies={companies} users={users} onUnlock={(userId) => { setCurrentUserId(userId); setIsLocked(false); }} onRegister={handleRegisterCompany} />;

  return (
    <div className="h-screen w-full text-slate-900 dark:text-slate-100 max-w-6xl mx-auto relative overflow-hidden flex flex-col md:flex-row bg-[#fcfcfd] dark:bg-[#030712]">
      {/* Responsive Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-black/5 p-8 z-50">
          <div className="mb-12">
            <h1 className="text-2xl font-black tracking-tightest">TRACKR<span className="text-indigo-600">.</span></h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 truncate">{currentUser?.name}</p>
          </div>
          <nav className="flex-1 space-y-2">
            {(isSuper ? ['admin', 'dashboard', 'ledger', 'add', 'inventory', 'reports', 'settings'] : ['dashboard', 'ledger', 'add', 'inventory', 'reports', 'settings']).map(t => (
               <button key={t} onClick={() => setActiveTab(t as Tab)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                  {React.createElement((Icons as any)[t.charAt(0).toUpperCase() + t.slice(1)] || Icons.Dashboard, { className: 'w-4 h-4' })}
                  {t}
               </button>
            ))}
          </nav>
          <div className="pt-8 border-t border-black/5">
             <button onClick={() => setIsLocked(true)} className="w-full py-4 text-[9px] font-black uppercase text-rose-500 bg-rose-50 dark:bg-rose-900/10 rounded-2xl">Lock Session</button>
             <button onClick={() => setIsLanding(true)} className="w-full py-4 text-[9px] font-black uppercase text-slate-400 mt-2">Exit to Landing</button>
          </div>
      </aside>

      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        <header className="px-8 pt-10 pb-4 flex justify-between items-center z-40 md:hidden">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-xl"><Icons.Dashboard className="w-5 h-5 text-white" /></div>
            <h1 className="text-xl font-black tracking-tightest">TRACKR.</h1>
          </div>
          <button onClick={() => setIsProfileOpen(true)} className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-indigo-500 border-2 border-indigo-500/10">{currentUser?.name[0]}</button>
        </header>

        <main className="flex-1 overflow-y-auto no-scrollbar px-6 md:px-12 py-8 pb-40">
            {activeTab === 'dashboard' && <Dashboard transactions={companyTransactions} accounts={companyAccounts} products={companyProducts} currencySymbol={currencySymbol} />}
            {activeTab === 'ledger' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <Ledger transactions={companyTransactions} accounts={companyAccounts} currencySymbol={currencySymbol} categories={categories} onDelete={(id) => setTransactions(prev => prev.filter(t => t.id !== id))} onUpdate={(tx) => setTransactions(prev => prev.map(t => t.id === tx.id ? tx : t))} />
                <Parties entities={companyEntities} setEntities={setEntities} currencySymbol={currencySymbol} transactions={companyTransactions} activeCompanyId={activeCompanyId} />
              </div>
            )}
            {activeTab === 'inventory' && <Inventory products={companyProducts} setProducts={setProducts} currencySymbol={currencySymbol} globalSettings={settings} onNewTags={(tags) => setSettings(prev => ({...prev, inventoryCategories: Array.from(new Set([...prev.inventoryCategories, ...tags]))}))} activeCompanyId={activeCompanyId} />}
            {activeTab === 'add' && <TransactionForm accounts={companyAccounts} products={companyProducts} entities={companyEntities} onAdd={addTransaction} settings={settings} categories={categories} />}
            {activeTab === 'reports' && <Reports transactions={companyTransactions} products={companyProducts} entities={companyEntities} accounts={companyAccounts} currencySymbol={currencySymbol} />}
            {activeTab === 'settings' && <Settings settings={settings} updateSettings={(s) => setSettings(p => ({...p, ...s}))} accounts={companyAccounts} setAccounts={setAccounts} categories={categories} setCategories={setCategories} transactions={companyTransactions} logoUrl={null} setLogoUrl={() => {}} onRemoveInventoryTag={(tag) => setSettings(p => ({...p, inventoryCategories: p.inventoryCategories.filter(t => t !== tag)}))} onFetchCloud={() => {}} />}
            {activeTab === 'admin' && isSuper && <AdminPanel companies={companies} users={users} onRegister={handleRegisterCompany} transactions={transactions} accounts={accounts} settings={settings} onUpdateConfig={() => {}} onConnect={() => {}} isOnline={isOnline} />}
        </main>
      </div>

      {isProfileOpen && currentUser && (
        <ProfileModal user={currentUser} onClose={() => setIsProfileOpen(false)} onSave={(u) => setUsers(prev => prev.map(p => p.id === u.id ? u : p))} onLogout={() => { setIsProfileOpen(false); setIsLocked(true); }} />
      )}

      {/* Mobile Bottom Bar */}
      <div className="md:hidden absolute bottom-10 left-0 right-0 px-6 z-50 pointer-events-none">
        <nav className="glass rounded-[2.5rem] p-1.5 flex justify-between items-center premium-shadow pointer-events-auto overflow-x-auto no-scrollbar">
          {(isSuper ? ['admin', 'dashboard', 'ledger', 'add', 'inventory', 'reports', 'settings'] : ['dashboard', 'ledger', 'add', 'inventory', 'reports', 'settings']).map((id) => (
            <button key={id} onClick={() => setActiveTab(id as Tab)} className={`flex-1 min-w-[50px] flex flex-col items-center gap-1 p-3 rounded-3xl transition-all ${activeTab === id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>
              {React.createElement((Icons as any)[id.charAt(0).toUpperCase() + id.slice(1)] || Icons.Dashboard, { className: 'w-4 h-4' })}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default App;