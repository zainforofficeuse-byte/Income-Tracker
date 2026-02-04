
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Tab, Transaction, Account, UserSettings, TransactionType, CURRENCIES, Entity, DEFAULT_CATEGORIES, DEFAULT_PRODUCT_CATEGORIES, Product, User, UserRole, Company, SystemLog } from './types';
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
import SystemLogs from './components/SystemLogs';

const STORAGE_KEY = 'trackr_enterprise_v26_final';
const MASTER_CONFIG_URL = 'https://raw.githubusercontent.com/zainforofficeuse-byte/config-file-income-tracker/refs/heads/main/config.txt'; 

const INITIAL_USERS: User[] = [
  { 
    id: 'system-sa', 
    companyId: 'SYSTEM', 
    name: 'Master Admin', 
    email: 'super@trackr.com', 
    password: 'admin123',
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
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [categories, setCategories] = useState<Record<TransactionType, string[]>>(DEFAULT_CATEGORIES);
  
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isLocked, setIsLocked] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastCloudResponse, setLastCloudResponse] = useState<boolean>(false);
  
  const autoSyncTimerRef = useRef<number | null>(null);

  const [settings, setSettings] = useState<UserSettings>({
    currency: 'PKR', darkMode: false, activeAccountId: '', companyName: 'TRACKR.', 
    inventoryCategories: DEFAULT_PRODUCT_CATEGORIES, remoteDbConnected: false,
    pricingRules: { fixedOverhead: 0, variableOverheadPercent: 0, platformFeePercent: 0, targetMarginPercent: 20, autoApply: true, customAdjustments: [] },
    cloud: { scriptUrl: '', remoteConfigUrl: MASTER_CONFIG_URL, autoSync: true, isConnected: false },
    email: { adminEmail: 'super@trackr.com', notifyAdminOnNewReg: true, notifyUserOnStatusChange: true, notifySecurityAlerts: true }
  });

  const addLog = useCallback((message: string, level: SystemLog['level'] = 'INFO', module: string = 'SYSTEM') => {
    const newLog: SystemLog = { id: crypto.randomUUID(), timestamp: new Date().toISOString(), message, level, module };
    setLogs(prev => [newLog, ...prev].slice(0, 100));
  }, []);

  const currentUser = useMemo(() => users.find(u => u.id === currentUserId) || null, [users, currentUserId]);
  const activeCompanyId = useMemo(() => currentUser?.companyId || 'SYSTEM', [currentUser]);
  const isSuper = currentUser?.role === UserRole.SUPER_ADMIN;

  const companyTransactions = useMemo(() => isSuper ? transactions : transactions.filter(t => t.companyId === activeCompanyId), [transactions, isSuper, activeCompanyId]);
  const companyAccounts = useMemo(() => isSuper ? accounts : accounts.filter(a => a.companyId === activeCompanyId), [accounts, isSuper, activeCompanyId]);
  const companyProducts = useMemo(() => isSuper ? products : products.filter(p => p.companyId === activeCompanyId), [products, isSuper, activeCompanyId]);
  const companyEntities = useMemo(() => isSuper ? entities : entities.filter(e => e.companyId === activeCompanyId), [entities, isSuper, activeCompanyId]);
  const companyUsers = useMemo(() => isSuper ? users : users.filter(u => u.companyId === activeCompanyId || u.role === UserRole.SUPER_ADMIN), [users, isSuper, activeCompanyId]);

  const cloudStatus = useMemo(() => ({
    isConfigured: !!settings.cloud.scriptUrl,
    isNetworkUp: isOnline,
    isServerResponding: lastCloudResponse
  }), [settings.cloud.scriptUrl, isOnline, lastCloudResponse]);

  const fetchMasterConfig = useCallback(async () => {
    try {
      const response = await fetch(MASTER_CONFIG_URL);
      const text = await response.text();
      const scriptUrlMatch = text.match(/https:\/\/script\.google\.com\/macros\/s\/[a-zA-Z0-9_-]+\/exec/);
      if (scriptUrlMatch) {
        const url = scriptUrlMatch[0];
        setSettings(prev => ({ ...prev, cloud: { ...prev.cloud, scriptUrl: url, isConnected: true } }));
        addLog(`Cloud Protocol Active: ${url.slice(0, 40)}...`, 'SUCCESS', 'CLOUD');
        return url;
      }
    } catch (err) { addLog(`Connection Failed: ${err}`, 'ERROR', 'CLOUD'); }
    return null;
  }, [addLog]);

  const syncToCloud = useCallback(async (action: 'PUSH' | 'PULL' | 'REMOTE_LOGIN', payload?: any) => {
    let url = settings.cloud.scriptUrl;
    if (!url) url = await fetchMasterConfig() || '';
    if (!url || !isOnline) return null;
    
    setIsSyncing(true);
    try {
      const queryId = isSuper ? 'GLOBAL' : activeCompanyId;
      if (action === 'PUSH') {
        const body = {
          action: 'SYNC_PUSH', companyId: queryId,
          data: { transactions, accounts, products, entities, users, companies, settings, categories }
        };
        await fetch(url, { method: 'POST', mode: 'no-cors', body: JSON.stringify(body) });
        setLastCloudResponse(true);
        addLog(`Cloud Persist Successful [${queryId}]`, 'SUCCESS', 'SYNC');
        return true;
      } else if (action === 'PULL') {
        const response = await fetch(`${url}?action=SYNC_PULL&companyId=${queryId}`);
        const result = await response.json();
        setLastCloudResponse(true);
        if (result.status === 'success' && result.data) {
          const d = result.data;
          if (d.transactions) setTransactions(d.transactions);
          if (d.accounts) setAccounts(d.accounts);
          if (d.products) setProducts(d.products);
          if (d.entities) setEntities(d.entities);
          if (d.companies) setCompanies(d.companies);
          if (d.users) setUsers(prev => {
             const sa = INITIAL_USERS[0];
             const merged = Array.from(new Map([...(d.users || []), sa].map(u => [u.id, u])).values());
             return merged;
          });
          addLog(`Cloud Data Merged [${queryId}]`, 'SUCCESS', 'SYNC');
        }
        return true;
      }
    } catch (err) {
      addLog(`Sync Protocol Failed: ${err}`, 'ERROR', 'SYNC');
      setLastCloudResponse(false);
    } finally { setIsSyncing(false); }
    return null;
  }, [settings, isOnline, isSuper, activeCompanyId, transactions, accounts, products, entities, users, companies, categories, fetchMasterConfig, addLog]);

  useEffect(() => {
    if (!isInitialized || !isOnline || !settings.cloud.scriptUrl) return;
    if (autoSyncTimerRef.current) clearTimeout(autoSyncTimerRef.current);
    autoSyncTimerRef.current = window.setTimeout(() => {
      syncToCloud('PUSH');
    }, 3000); 
    return () => { if (autoSyncTimerRef.current) clearTimeout(autoSyncTimerRef.current); };
  }, [users, companies, transactions, isInitialized, isOnline, settings.cloud.scriptUrl, syncToCloud]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

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
          if (p.settings) setSettings(prev => ({ ...prev, ...p.settings }));
          const savedUsers = p.users || [];
          setUsers(Array.from(new Map([...INITIAL_USERS, ...savedUsers].map(u => [u.id, u])).values()));
          addLog("Bootstrap Sequence Finished", "SUCCESS", "STORAGE");
        }
        await fetchMasterConfig();
      } catch (err) { addLog("Critical Boot Failure", "ERROR", "STORAGE"); } 
      finally { setIsInitialized(true); }
    };
    init();
  }, [fetchMasterConfig, addLog]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ companies, users, transactions, accounts, products, entities, categories, settings, currentUserId, isLocked, isLanding }));
    }
  }, [companies, users, transactions, accounts, products, entities, categories, isInitialized, settings, isLanding, isLocked, currentUserId]);

  const handleRegisterCompany = async (name: string, adminName: string, adminEmail: string, adminPass: string) => {
    const emailLower = adminEmail.toLowerCase().trim();
    
    // CRITICAL: Duplicate Check Logic
    const exists = users.some(u => u.email.toLowerCase() === emailLower);
    if (exists) {
      throw new Error("ALREADY_REGISTERED");
    }

    const compId = crypto.randomUUID();
    const userId = crypto.randomUUID();
    const accId = crypto.randomUUID();
    
    const newCompany: Company = { id: compId, name, registrationDate: new Date().toISOString(), status: 'SUSPENDED' };
    const newUser: User = { id: userId, companyId: compId, name: adminName, email: adminEmail, password: adminPass, pin: adminPass, role: UserRole.ADMIN, status: 'PENDING' };
    const newAccount: Account = { id: accId, companyId: compId, name: 'Liquidity Wallet', balance: 0, color: '#10b981', type: 'CASH' };

    setCompanies(prev => [...prev, newCompany]);
    setUsers(prev => [...prev, newUser]);
    setAccounts(prev => [...prev, newAccount]);

    addLog(`Enterprise Enrollment Created: ${name}`, 'INFO', 'AUTH');
    return userId;
  };

  const handleClearLocalData = () => {
    if (window.confirm("CRITICAL ACTION: This will purge all local data on this device. Your session and all locally cached information will be destroyed. Cloud data will remain safe. Proceed?")) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  };

  const addTransaction = (txData: any) => {
    const newTx: Transaction = { ...txData, companyId: activeCompanyId, createdBy: currentUserId!, syncStatus: 'PENDING', version: 1, updatedAt: new Date().toISOString() };
    setTransactions(prev => [newTx, ...prev]);
    if (newTx.paymentStatus === 'PAID') {
      setAccounts(prev => prev.map(a => a.id === newTx.accountId ? { ...a, balance: a.balance + (newTx.type === TransactionType.INCOME ? newTx.amount : -newTx.amount) } : a));
    }
    setActiveTab('ledger');
    addLog(`Asset Movement Logged: ${newTx.category}`, 'SUCCESS', 'LEDGER');
  };

  if (!isInitialized) return null;
  if (isLanding) return <LandingPage onGetStarted={() => setIsLanding(false)} onLogin={() => setIsLanding(false)} />;
  if (isLocked) return <AuthGuard users={users} onUnlock={(id) => { setCurrentUserId(id); setIsLocked(false); addLog(`Authorization Issued`, "SUCCESS", "AUTH"); }} onRegister={handleRegisterCompany} onRemoteLogin={async () => null} onBack={() => setIsLanding(true)} />;

  return (
    <div className="h-screen w-full text-slate-900 dark:text-white max-w-6xl mx-auto flex flex-col md:flex-row bg-white dark:bg-[#030712] overflow-hidden">
      <aside className="hidden md:flex flex-col w-64 border-r border-emerald-500/5 p-8 bg-slate-50/30 dark:bg-black/20">
          <div className="mb-10"><h1 className="text-2xl font-black tracking-tightest">TRACKR<span className="text-emerald-500">.</span></h1></div>
          <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
            {(isSuper ? ['admin', 'dashboard', 'ledger', 'add', 'inventory', 'reports', 'parties', 'users', 'settings', 'logs'] : ['dashboard', 'ledger', 'add', 'inventory', 'reports', 'parties', 'users', 'settings']).map((t: any) => (
               <button key={t} onClick={() => setActiveTab(t as Tab)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-emerald-600 text-white shadow-xl' : 'text-slate-400 hover:bg-emerald-50/50'}`}>
                  {t}
               </button>
            ))}
          </nav>
          <div className="mt-8 space-y-2">
             <div className="flex items-center justify-between px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <span className="text-[8px] font-black uppercase text-slate-400">Sync Status</span>
                <div className={`h-1.5 w-1.5 rounded-full ${isSyncing ? 'bg-amber-500 animate-pulse' : (isOnline ? 'bg-emerald-500' : 'bg-rose-500')}`} />
             </div>
             <button onClick={() => { setIsLocked(true); addLog("Session Locked", "WARN", "AUTH"); }} className="w-full py-4 text-[9px] font-black uppercase text-rose-500 bg-rose-50 rounded-2xl active-scale">Lock System</button>
          </div>
      </aside>

      <main className="flex-1 overflow-y-auto no-scrollbar px-6 md:px-12 py-8 pb-32">
          {activeTab === 'dashboard' && <Dashboard transactions={companyTransactions} accounts={companyAccounts} products={companyProducts} currencySymbol={CURRENCIES.find(c => c.code === settings.currency)?.symbol || 'Rs.'} />}
          {activeTab === 'ledger' && <Ledger transactions={companyTransactions} accounts={companyAccounts} currencySymbol={CURRENCIES.find(c => c.code === settings.currency)?.symbol || 'Rs.'} categories={categories} onDelete={(id) => setTransactions(prev => prev.filter(t => t.id !== id))} onUpdate={(tx) => setTransactions(prev => prev.map(t => t.id === tx.id ? tx : t))} />}
          {activeTab === 'inventory' && <Inventory products={companyProducts} setProducts={setProducts} currencySymbol={CURRENCIES.find(c => c.code === settings.currency)?.symbol || 'Rs.'} globalSettings={settings} onNewTags={() => {}} activeCompanyId={activeCompanyId} />}
          {activeTab === 'add' && <TransactionForm accounts={companyAccounts} products={companyProducts} entities={companyEntities} onAdd={addTransaction} settings={settings} categories={categories} />}
          {activeTab === 'reports' && <Reports transactions={companyTransactions} products={companyProducts} entities={companyEntities} accounts={companyAccounts} currencySymbol={CURRENCIES.find(c => c.code === settings.currency)?.symbol || 'Rs.'} />}
          {activeTab === 'parties' && <Parties entities={companyEntities} setEntities={setEntities} currencySymbol={CURRENCIES.find(c => c.code === settings.currency)?.symbol || 'Rs.'} transactions={companyTransactions} activeCompanyId={activeCompanyId} />}
          {activeTab === 'users' && <UserManagement users={companyUsers} setUsers={setUsers} currentUserRole={currentUser?.role || UserRole.STAFF} />}
          {activeTab === 'settings' && <Settings settings={settings} updateSettings={(s) => setSettings(p => ({...p, ...s}))} accounts={companyAccounts} setAccounts={setAccounts} categories={categories} setCategories={setCategories} onRemoveInventoryTag={(tag) => setSettings(prev => ({...prev, inventoryCategories: prev.inventoryCategories.filter(c => c !== tag)}))} onFetchCloud={() => syncToCloud('PULL')} cloudStatus={cloudStatus} onClearLocalData={handleClearLocalData} />}
          {activeTab === 'admin' && isSuper && <AdminPanel companies={companies} users={users} setUsers={setUsers} setCompanies={setCompanies} onRegister={handleRegisterCompany} onUpdateCompany={() => {}} transactions={transactions} accounts={accounts} settings={settings} isOnline={isOnline} onTriggerBackup={async () => await syncToCloud('PUSH')} onGlobalRefresh={() => syncToCloud('PULL')} isSyncing={isSyncing} onNotifyApproval={(u) => addLog(`User ${u.name} Authorized`, 'SUCCESS', 'ADMIN')} />}
          {activeTab === 'logs' && <SystemLogs logs={logs} onClear={() => setLogs([])} />}
      </main>

      {isProfileOpen && currentUser && <ProfileModal user={currentUser} onClose={() => setIsProfileOpen(false)} onSave={(u) => { setUsers(prev => prev.map(p => p.id === u.id ? u : p)); addLog("Profile Updated", "SUCCESS", "AUTH"); }} onLogout={() => setIsLocked(true)} />}
    </div>
  );
};

export default App;
