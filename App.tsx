
import React, { useState, useEffect, useMemo, useCallback } from 'react';
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

const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLanding, setIsLanding] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
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

  // Fix: Derived state for company-specific data to resolve "Cannot find name" errors
  const companyTransactions = useMemo(() => isSuper ? transactions : transactions.filter(t => t.companyId === activeCompanyId), [transactions, isSuper, activeCompanyId]);
  const companyAccounts = useMemo(() => isSuper ? accounts : accounts.filter(a => a.companyId === activeCompanyId), [accounts, isSuper, activeCompanyId]);
  const companyProducts = useMemo(() => isSuper ? products : products.filter(p => p.companyId === activeCompanyId), [products, isSuper, activeCompanyId]);
  const companyEntities = useMemo(() => isSuper ? entities : entities.filter(e => e.companyId === activeCompanyId), [entities, isSuper, activeCompanyId]);
  const companyUsers = useMemo(() => isSuper ? users : users.filter(u => u.companyId === activeCompanyId), [users, isSuper, activeCompanyId]);

  // Fix: Derived state for cloudStatus to resolve component prop errors
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
        addLog(`Master Config Resolved: ${url.slice(0, 40)}...`, 'SUCCESS', 'CLOUD');
        return url;
      }
    } catch (err) { addLog(`Config Fetch Failed: ${err}`, 'ERROR', 'CLOUD'); }
    return null;
  }, [addLog]);

  const sendEmail = useCallback(async (to: string, subject: string, message: string, type: string) => {
    if (!settings.cloud.scriptUrl || !isOnline) return;
    try {
      await fetch(settings.cloud.scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'NOTIFY', payload: { to, subject, message, type, adminEmail: settings.email.adminEmail } })
      });
      addLog(`Notification Sent: ${type} to ${to}`, 'INFO', 'EMAIL');
    } catch (e) { addLog(`Email Failed: ${e}`, 'ERROR', 'EMAIL'); }
  }, [settings.cloud.scriptUrl, settings.email.adminEmail, isOnline, addLog]);

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
          data: { 
            transactions: isSuper ? transactions : transactions.filter(t => t.companyId === activeCompanyId), 
            accounts: isSuper ? accounts : accounts.filter(a => a.companyId === activeCompanyId), 
            products: isSuper ? products : products.filter(p => p.companyId === activeCompanyId), 
            entities: isSuper ? entities : entities.filter(e => e.companyId === activeCompanyId), 
            users, companies, settings, categories 
          }
        };
        await fetch(url, { method: 'POST', mode: 'no-cors', body: JSON.stringify(body) });
        setLastCloudResponse(true);
        addLog(`Cloud Push Successful [${queryId}]`, 'SUCCESS', 'SYNC');
      } else if (action === 'PULL') {
        const response = await fetch(`${url}?action=SYNC_PULL&companyId=${queryId}`);
        const result = await response.json();
        setLastCloudResponse(true);
        if (result.status === 'success' && result.data) {
          const d = result.data;
          if (isSuper) {
            if (d.transactions) setTransactions(d.transactions);
            if (d.accounts) setAccounts(d.accounts);
            if (d.products) setProducts(d.products);
            if (d.entities) setEntities(d.entities);
            if (d.companies) setCompanies(d.companies);
            if (d.users) setUsers(prev => {
              const sa = prev.find(u => u.id === 'system-sa')!;
              return Array.from(new Map([...(d.users || []), sa].map(u => [u.id, u])).values());
            });
          } else {
            if (d.transactions) setTransactions(prev => [...prev.filter(t => t.companyId !== activeCompanyId), ...d.transactions]);
            if (d.accounts) setAccounts(prev => [...prev.filter(a => a.companyId !== activeCompanyId), ...d.accounts]);
            if (d.users) setUsers(prev => [...prev.filter(u => u.companyId !== activeCompanyId && u.id !== 'system-sa'), ...d.users]);
          }
          addLog(`Cloud Pull Completed [${queryId}]`, 'SUCCESS', 'SYNC');
        }
      }
    } catch (err) {
      addLog(`Sync Failure: ${err}`, 'ERROR', 'SYNC');
      setLastCloudResponse(false);
    } finally { setIsSyncing(false); }
    return null;
  }, [settings, isOnline, isSuper, activeCompanyId, transactions, accounts, products, entities, users, companies, categories, fetchMasterConfig, addLog]);

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
          if (p.users) setUsers(p.users);
          addLog("Local State Decrypted Successfully", "SUCCESS", "STORAGE");
        }
        await fetchMasterConfig();
      } catch (err) { addLog("Initialization Failed", "ERROR", "STORAGE"); } 
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
    const compId = crypto.randomUUID();
    const userId = crypto.randomUUID();
    const accId = crypto.randomUUID();
    
    const newCompany: Company = { id: compId, name, registrationDate: new Date().toISOString(), status: 'SUSPENDED' };
    const newUser: User = { id: userId, companyId: compId, name: adminName, email: adminEmail, password: adminPass, pin: adminPass, role: UserRole.ADMIN, status: 'PENDING' };
    const newAccount: Account = { id: accId, companyId: compId, name: 'Main Liquidity', balance: 0, color: '#10b981', type: 'CASH' };

    setCompanies(prev => [...prev, newCompany]);
    setUsers(prev => [...prev, newUser]);
    setAccounts(prev => [...prev, newAccount]);

    addLog(`Initiating Provision for ${name}`, 'INFO', 'AUTH');

    const url = settings.cloud.scriptUrl || await fetchMasterConfig();
    if (url) {
      await fetch(url, {
        method: 'POST', mode: 'no-cors',
        body: JSON.stringify({
          action: 'SYNC_PUSH', companyId: compId,
          data: { transactions: [], accounts: [newAccount], products: [], entities: [], users: [newUser], companies: [newCompany], settings, categories }
        })
      });
      sendEmail(adminEmail, "Request Received | TRACKR.", `Hi ${adminName}, your enterprise provision request for ${name} is being audited.`, "REGISTRATION");
    }
    return userId;
  };

  const addTransaction = (txData: any) => {
    const newTx: Transaction = { ...txData, companyId: activeCompanyId, createdBy: currentUserId!, syncStatus: 'PENDING', version: 1, updatedAt: new Date().toISOString() };
    setTransactions(prev => [newTx, ...prev]);
    if (newTx.paymentStatus === 'PAID') {
      setAccounts(prev => prev.map(a => a.id === newTx.accountId ? { ...a, balance: a.balance + (newTx.type === TransactionType.INCOME ? newTx.amount : -newTx.amount) } : a));
    }
    setActiveTab('ledger');
    addLog(`Transaction Recorded: ${newTx.category}`, 'SUCCESS', 'LEDGER');
  };

  if (!isInitialized) return null;
  if (isLanding) return <LandingPage onGetStarted={() => setIsLanding(false)} onLogin={() => setIsLanding(false)} />;
  if (isLocked) return <AuthGuard users={users} onUnlock={(id) => { setCurrentUserId(id); setIsLocked(false); addLog("User Authorized", "SUCCESS", "AUTH"); }} onRegister={handleRegisterCompany} onRemoteLogin={async () => null} onBack={() => setIsLanding(true)} />;

  return (
    <div className="h-screen w-full text-slate-900 dark:text-white max-w-6xl mx-auto flex flex-col md:flex-row bg-white dark:bg-[#030712] overflow-hidden">
      <aside className="hidden md:flex flex-col w-64 border-r border-emerald-500/5 p-8">
          <div className="mb-10"><h1 className="text-2xl font-black tracking-tightest">TRACKR<span className="text-emerald-500">.</span></h1></div>
          <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
            {(isSuper ? ['admin', 'dashboard', 'ledger', 'add', 'inventory', 'reports', 'parties', 'users', 'settings', 'logs'] : ['dashboard', 'ledger', 'add', 'inventory', 'reports', 'parties', 'users', 'settings']).map((t: any) => (
               <button key={t} onClick={() => setActiveTab(t)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-emerald-600 text-white shadow-xl' : 'text-slate-400 hover:bg-emerald-50/50'}`}>
                  {t}
               </button>
            ))}
          </nav>
          <button onClick={() => setIsLocked(true)} className="w-full py-4 text-[9px] font-black uppercase text-rose-500 bg-rose-50 rounded-2xl mt-8">Lock</button>
      </aside>

      <main className="flex-1 overflow-y-auto no-scrollbar px-6 md:px-12 py-8 pb-32">
          {activeTab === 'dashboard' && <Dashboard transactions={companyTransactions} accounts={companyAccounts} products={companyProducts} currencySymbol={CURRENCIES.find(c => c.code === settings.currency)?.symbol || 'Rs.'} />}
          {activeTab === 'ledger' && <Ledger transactions={companyTransactions} accounts={companyAccounts} currencySymbol={CURRENCIES.find(c => c.code === settings.currency)?.symbol || 'Rs.'} categories={categories} onDelete={(id) => setTransactions(prev => prev.filter(t => t.id !== id))} onUpdate={(tx) => setTransactions(prev => prev.map(t => t.id === tx.id ? tx : t))} />}
          {activeTab === 'inventory' && <Inventory products={companyProducts} setProducts={setProducts} currencySymbol={CURRENCIES.find(c => c.code === settings.currency)?.symbol || 'Rs.'} globalSettings={settings} onNewTags={() => {}} activeCompanyId={activeCompanyId} />}
          {activeTab === 'add' && <TransactionForm accounts={companyAccounts} products={companyProducts} entities={companyEntities} onAdd={addTransaction} settings={settings} categories={categories} />}
          {activeTab === 'reports' && <Reports transactions={companyTransactions} products={companyProducts} entities={companyEntities} accounts={companyAccounts} currencySymbol={CURRENCIES.find(c => c.code === settings.currency)?.symbol || 'Rs.'} />}
          {activeTab === 'parties' && <Parties entities={companyEntities} setEntities={setEntities} currencySymbol={CURRENCIES.find(c => c.code === settings.currency)?.symbol || 'Rs.'} transactions={companyTransactions} activeCompanyId={activeCompanyId} />}
          {activeTab === 'users' && <UserManagement users={companyUsers} setUsers={setUsers} currentUserRole={currentUser?.role || UserRole.STAFF} />}
          {activeTab === 'settings' && <Settings settings={settings} updateSettings={(s) => setSettings(p => ({...p, ...s}))} accounts={companyAccounts} setAccounts={setAccounts} categories={categories} setCategories={setCategories} onRemoveInventoryTag={() => {}} onFetchCloud={() => syncToCloud('PULL')} cloudStatus={cloudStatus} />}
          {activeTab === 'admin' && isSuper && <AdminPanel companies={companies} users={users} setUsers={setUsers} setCompanies={setCompanies} onRegister={handleRegisterCompany} onUpdateCompany={() => {}} transactions={transactions} accounts={accounts} settings={settings} isOnline={isOnline} onTriggerBackup={() => syncToCloud('PUSH')} onGlobalRefresh={() => syncToCloud('PULL')} isSyncing={isSyncing} onNotifyApproval={(u) => sendEmail(u.email, "Access Authorized", "Your TRACKR account is now active.", "APPROVAL")} />}
          {activeTab === 'logs' && <SystemLogs logs={logs} onClear={() => setLogs([])} />}
      </main>

      {isProfileOpen && currentUser && <ProfileModal user={currentUser} onClose={() => setIsProfileOpen(false)} onSave={(u) => { setUsers(prev => prev.map(p => p.id === u.id ? u : p)); sendEmail(u.email, "Security Alert", "Your security profile was updated.", "SECURITY"); }} onLogout={() => setIsLocked(true)} />}
    </div>
  );
};

export default App;
