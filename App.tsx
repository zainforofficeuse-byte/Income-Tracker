
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
import UserManagement from './components/UserManagement';

const STORAGE_KEY = 'trackr_enterprise_v23_stable';
const MASTER_CONFIG_URL = 'https://raw.githubusercontent.com/zainforofficeuse-byte/config-file-income-tracker/refs/heads/main/config.txt'; 

const hashPassword = async (password: string) => {
  if (!password) return '';
  if (password.length === 64) return password;
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const INITIAL_USERS: User[] = [
  { 
    id: 'system-sa', 
    companyId: 'SYSTEM', 
    name: 'Super Admin', 
    email: 'super@trackr.com', 
    password: 'ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f', // admin123
    pin: '1234', 
    role: UserRole.SUPER_ADMIN,
    status: 'ACTIVE'
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
  const [lastCloudResponse, setLastCloudResponse] = useState<boolean>(false);

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

  // Visual 3-Condition Indicator Status
  const cloudStatus = useMemo(() => ({
    isConfigured: !!settings.cloud.scriptUrl,
    isNetworkUp: isOnline,
    isServerResponding: lastCloudResponse
  }), [settings.cloud.scriptUrl, isOnline, lastCloudResponse]);

  const companyTransactions = useMemo(() => isSuper ? transactions : transactions.filter(t => t.companyId === activeCompanyId), [transactions, activeCompanyId, isSuper]);
  const companyAccounts = useMemo(() => isSuper ? accounts : accounts.filter(a => a.companyId === activeCompanyId), [accounts, activeCompanyId, isSuper]);
  const companyProducts = useMemo(() => isSuper ? products : products.filter(p => p.companyId === activeCompanyId), [products, activeCompanyId, isSuper]);
  const companyEntities = useMemo(() => isSuper ? entities : entities.filter(e => e.companyId === activeCompanyId), [entities, activeCompanyId, isSuper]);
  const companyUsers = useMemo(() => isSuper ? users : users.filter(u => u.companyId === activeCompanyId), [users, activeCompanyId, isSuper]);

  const fetchMasterConfig = async () => {
    try {
      const response = await fetch(MASTER_CONFIG_URL);
      const text = await response.text();
      const scriptUrlMatch = text.match(/https:\/\/script\.google\.com\/macros\/s\/[a-zA-Z0-9_-]+\/exec/);
      if (scriptUrlMatch) {
        const url = scriptUrlMatch[0];
        setSettings(prev => ({ ...prev, cloud: { ...prev.cloud, scriptUrl: url, isConnected: true } }));
        // Try a handshake to set server status
        fetch(url + '?action=PING').then(r => setLastCloudResponse(r.ok)).catch(() => setLastCloudResponse(false));
        return url;
      }
    } catch (err) { console.error("Config fetch error:", err); }
    return null;
  };

  const syncToCloud = async (action: 'PUSH' | 'PULL' | 'REMOTE_LOGIN', payload?: any) => {
    let url = settings.cloud.scriptUrl;
    if (!url) url = await fetchMasterConfig() || '';
    if (!url || !isOnline) return null;
    
    setIsSyncing(true);
    try {
      if (action === 'PUSH') {
        await fetch(url, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'SYNC_PUSH',
            companyId: activeCompanyId,
            data: { transactions, accounts, products, entities, users, companies, settings, categories }
          })
        });
        setLastCloudResponse(true);
      } else if (action === 'PULL') {
        const response = await fetch(`${url}?action=SYNC_PULL&companyId=${activeCompanyId}`);
        const result = await response.json();
        setLastCloudResponse(true);
        if (result.status === 'success' && result.data) {
          const d = result.data;
          if (d.transactions) setTransactions(prev => [...prev.filter(t => t.companyId !== activeCompanyId), ...d.transactions]);
          if (d.accounts) setAccounts(prev => [...prev.filter(a => a.companyId !== activeCompanyId), ...d.accounts]);
          if (d.products) setProducts(prev => [...prev.filter(p => p.companyId !== activeCompanyId), ...d.products]);
          if (d.entities) setEntities(prev => [...prev.filter(e => e.companyId !== activeCompanyId), ...d.entities]);
          if (d.companies) setCompanies(prev => [...prev.filter(c => c.id !== activeCompanyId), ...d.companies]);
          if (d.users) setUsers(prev => [...prev.filter(u => u.companyId !== activeCompanyId && u.id !== 'system-sa'), ...d.users]);
          if (d.categories) setCategories(d.categories);
        }
      } else if (action === 'REMOTE_LOGIN') {
        const response = await fetch(`${url}?action=FIND_USER&email=${payload.email}`);
        const result = await response.json();
        setLastCloudResponse(true);
        return result.status === 'success' ? result.user : null;
      }
    } catch (err) {
      console.error("Cloud Error:", err);
      setLastCloudResponse(false);
    } finally {
      setTimeout(() => setIsSyncing(false), 800);
    }
    return null;
  };

  useEffect(() => {
    const init = async () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const p = JSON.parse(saved);
          if (p.companies) setCompanies(p.companies);
          if (p.transactions) setTransactions(p.transactions);
          if (p.accounts) setAccounts(p.accounts);
          if (p.products) setProducts(p.products);
          if (p.entities) setEntities(p.entities);
          if (p.categories) setCategories(p.categories);
          if (p.currentUserId) setCurrentUserId(p.currentUserId);
          if (p.isLocked !== undefined) setIsLocked(p.isLocked);
          if (p.isLanding !== undefined) setIsLanding(p.isLanding);
          if (p.settings) setSettings(prev => ({ ...prev, ...p.settings }));
          
          const mergedUsers = [...INITIAL_USERS];
          (p.users || []).forEach((u: User) => {
             if (!mergedUsers.find(mu => mu.id === u.id)) mergedUsers.push(u);
          });
          setUsers(mergedUsers);
        }
        await fetchMasterConfig();
      } catch (err) { console.error("Init failure:", err); } 
      finally { setIsInitialized(true); }
    };
    init();
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isInitialized) {
      try {
        const payload = JSON.stringify({ 
          companies, users, transactions, accounts, products, entities, categories, settings, 
          currentUserId, isLocked, isLanding 
        });
        localStorage.setItem(STORAGE_KEY, payload);
        if (settings.cloud.autoSync && !isLanding && !isLocked) {
          syncToCloud('PUSH');
        }
      } catch (err) { console.warn("Quota full:", err); }
    }
    if (settings.darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [companies, users, transactions, accounts, products, entities, categories, isInitialized, settings, isLanding, isLocked, currentUserId]);

  const addTransaction = (tx: any) => {
    const newTx = { ...tx, id: crypto.randomUUID(), companyId: activeCompanyId, createdBy: currentUser?.id, syncStatus: 'PENDING', version: 1, updatedAt: new Date().toISOString() };
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
    }
    setActiveTab('ledger');
  };

  const handleRegisterCompany = async (name: string, adminName: string, adminEmail: string, adminPass: string) => {
    const compId = crypto.randomUUID();
    const userId = crypto.randomUUID();
    const accId = crypto.randomUUID();
    const hashedPass = await hashPassword(adminPass);
    setCompanies(prev => [...prev, { id: compId, name, registrationDate: new Date().toISOString(), status: 'ACTIVE' }]);
    setUsers(prev => [...prev, { id: userId, companyId: compId, name: adminName, email: adminEmail, password: hashedPass, pin: adminPass, role: UserRole.ADMIN, status: 'PENDING' }]);
    setAccounts(prev => [...prev, { id: accId, companyId: compId, name: 'Main Liquidity', balance: 0, color: '#10b981', type: 'CASH' }]);
    return userId;
  };

  const currencySymbol = useMemo(() => CURRENCIES.find(c => c.code === settings.currency)?.symbol || 'Rs.', [settings.currency]);

  if (!isInitialized) return null;
  if (isLanding) return <LandingPage onGetStarted={() => setIsLanding(false)} onLogin={() => setIsLanding(false)} />;
  if (isLocked) return (
    <AuthGuard 
      users={users} 
      onUnlock={(userId) => { setCurrentUserId(userId); setIsLocked(false); }} 
      onRegister={handleRegisterCompany} 
      onRemoteLogin={async (e, p) => syncToCloud('REMOTE_LOGIN', { email: e, password: p })}
      onBack={() => setIsLanding(true)} 
    />
  );

  const menuTabs: Tab[] = isSuper 
    ? ['admin', 'dashboard', 'ledger', 'add', 'inventory', 'reports', 'users', 'settings'] 
    : ['dashboard', 'ledger', 'add', 'inventory', 'reports', 'users', 'settings'];

  const getIcon = (id: string) => {
    const key = id.charAt(0).toUpperCase() + id.slice(1);
    const IconComp = (Icons as any)[key] || Icons.Dashboard;
    return <IconComp className="w-5 h-5" />;
  };

  return (
    <div className="h-screen w-full text-slate-900 dark:text-white max-w-6xl mx-auto relative overflow-hidden flex flex-col md:flex-row bg-white dark:bg-[#030712]">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-black border-r border-emerald-500/5 p-8 z-50">
          <div className="mb-10 flex flex-col gap-4">
            <h1 className="text-2xl font-black tracking-tightest">TRACKR<span className="text-emerald-500">.</span></h1>
            
            {/* 3-Condition Detailed Monitor */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-3xl border border-black/5 flex flex-col gap-2">
               <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Architecture Status</p>
               <div className="flex items-center gap-2">
                  <div className={`h-1.5 w-1.5 rounded-full ${cloudStatus.isConfigured ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span className="text-[8px] font-black uppercase text-slate-500">Config</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className={`h-1.5 w-1.5 rounded-full ${cloudStatus.isNetworkUp ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span className="text-[8px] font-black uppercase text-slate-500">Network</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className={`h-1.5 w-1.5 rounded-full ${cloudStatus.isServerResponding ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                  <span className="text-[8px] font-black uppercase text-slate-500">Server</span>
               </div>
            </div>

            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate ml-1">{currentUser?.name}</p>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
            {menuTabs.map(t => (
               <button key={t} onClick={() => setActiveTab(t as Tab)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/20' : 'text-slate-400 hover:bg-emerald-50/50'}`}>
                  {getIcon(t)}
                  {t}
               </button>
            ))}
          </nav>
          <div className="pt-8 border-t border-emerald-500/10">
             <button onClick={() => setIsLocked(true)} className="w-full py-4 text-[9px] font-black uppercase text-rose-500 bg-rose-50 dark:bg-rose-900/10 rounded-2xl active-scale">Lock</button>
             <button onClick={() => { setIsLanding(true); setIsLocked(true); setCurrentUserId(null); }} className="w-full py-4 text-[9px] font-black uppercase text-slate-400 mt-2">Exit</button>
          </div>
      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="px-6 pt-10 pb-4 flex justify-between items-center md:hidden z-40 bg-white/90 dark:bg-black/90 backdrop-blur-xl border-b border-emerald-500/5">
           <h1 className="text-xl font-black tracking-tightest">TRACKR<span className="text-emerald-500">.</span></h1>
           <button onClick={() => setIsProfileOpen(true)} className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-slate-800 flex items-center justify-center font-black text-emerald-600 border border-emerald-500/10">{currentUser?.name[0]}</button>
        </header>

        <main className="flex-1 overflow-y-auto no-scrollbar px-6 md:px-12 py-8 pb-32">
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
            {activeTab === 'users' && <UserManagement users={companyUsers} setUsers={setUsers} currentUserRole={currentUser?.role || UserRole.STAFF} />}
            {activeTab === 'settings' && <Settings settings={settings} updateSettings={(s) => setSettings(p => ({...p, ...s}))} accounts={companyAccounts} setAccounts={setAccounts} categories={categories} setCategories={setCategories} transactions={companyTransactions} products={companyProducts} entities={companyEntities} logoUrl={null} setLogoUrl={() => {}} onRemoveInventoryTag={(tag) => setSettings(p => ({...p, inventoryCategories: p.inventoryCategories.filter(t => t !== tag)}))} onFetchCloud={() => syncToCloud('PULL')} cloudStatus={cloudStatus} />}
            {activeTab === 'admin' && isSuper && <AdminPanel companies={companies} users={users} setUsers={setUsers} onRegister={handleRegisterCompany} onUpdateCompany={() => {}} transactions={transactions} accounts={accounts} settings={settings} isOnline={isOnline} onTriggerBackup={() => syncToCloud('PUSH')} />}
        </main>
      </div>

      <div className="md:hidden fixed bottom-6 left-0 right-0 px-4 z-[99]">
        <nav className="glass rounded-[2.8rem] p-2 flex items-center premium-shadow overflow-x-auto no-scrollbar scroll-smooth gap-1">
          {menuTabs.map((id) => (
            <button key={id} onClick={() => setActiveTab(id as Tab)} className={`flex-shrink-0 min-w-[70px] h-[70px] flex flex-col items-center justify-center gap-1 p-2 rounded-[1.8rem] transition-all ${activeTab === id ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>
              {getIcon(id)}
              <span className="text-[7px] font-black uppercase">{id}</span>
            </button>
          ))}
        </nav>
      </div>

      {isProfileOpen && currentUser && (
        <ProfileModal user={currentUser} onClose={() => setIsProfileOpen(false)} onSave={(u) => setUsers(prev => prev.map(p => p.id === u.id ? u : p))} onLogout={() => { setIsProfileOpen(false); setIsLocked(true); setCurrentUserId(null); }} />
      )}
    </div>
  );
};

export default App;
