
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
import UserManagement from './components/UserManagement';
import AuthGuard from './components/AuthGuard';
import ProfileModal from './components/ProfileModal';

const STORAGE_KEY = 'trackr_enterprise_v2';

const INITIAL_COMPANIES: Company[] = [
  { id: 'company-azeem', name: 'Azeem Solutions', registrationDate: new Date().toISOString(), status: 'ACTIVE' }
];

const INITIAL_USERS: User[] = [
  { id: 'sa-1', companyId: 'SYSTEM', name: 'Super Admin', pin: '0000', role: UserRole.SUPER_ADMIN },
  { id: 'admin-1', companyId: 'company-azeem', name: 'Azeem Admin', pin: '1234', role: UserRole.ADMIN }
];

const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [companies, setCompanies] = useState<Company[]>(INITIAL_COMPANIES);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isLocked, setIsLocked] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const currentUser = useMemo(() => users.find(u => u.id === currentUserId) || null, [users, currentUserId]);
  
  const activeCompanyId = useMemo(() => {
    if (currentUser?.role === UserRole.SUPER_ADMIN) {
      return companies[0]?.id || 'SYSTEM';
    }
    return currentUser?.companyId || 'SYSTEM';
  }, [currentUser, companies]);

  const isSuper = currentUser?.role === UserRole.SUPER_ADMIN;
  const isAdmin = currentUser?.role === UserRole.ADMIN;

  const companyTransactions = useMemo(() => transactions.filter(t => t.companyId === activeCompanyId), [transactions, activeCompanyId]);
  const companyAccounts = useMemo(() => accounts.filter(a => a.companyId === activeCompanyId), [accounts, activeCompanyId]);
  const companyProducts = useMemo(() => products.filter(p => p.companyId === activeCompanyId), [products, activeCompanyId]);
  const companyEntities = useMemo(() => entities.filter(e => e.companyId === activeCompanyId), [entities, activeCompanyId]);
  const companyUsers = useMemo(() => users.filter(u => u.companyId === activeCompanyId), [users, activeCompanyId]);

  const [settings, setSettings] = useState<UserSettings>({
    currency: 'PKR', 
    darkMode: true, 
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
    }
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const p = JSON.parse(saved);
      setCompanies(p.companies || INITIAL_COMPANIES);
      setUsers(p.users || INITIAL_USERS);
      setTransactions(p.transactions || []);
      setAccounts(p.accounts || []);
      setProducts(p.products || []);
      setEntities(p.entities || []);
      if (p.settings) setSettings(prev => ({
        ...prev, 
        ...p.settings,
        pricingRules: {
          ...prev.pricingRules,
          ...(p.settings.pricingRules || {}),
          customAdjustments: p.settings.pricingRules?.customAdjustments || []
        }
      }));
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ companies, users, transactions, accounts, products, entities, settings }));
    }
    if (settings.darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [companies, users, transactions, accounts, products, entities, isInitialized, settings]);

  const handleRegisterCompany = (name: string, adminName: string, adminPin: string) => {
    const newCompanyId = `company-${crypto.randomUUID()}`;
    const newCompany: Company = { id: newCompanyId, name, registrationDate: new Date().toISOString(), status: 'ACTIVE' };
    const newAdmin: User = { id: `user-${crypto.randomUUID()}`, companyId: newCompanyId, name: adminName, pin: adminPin, role: UserRole.ADMIN };
    setCompanies(prev => [...prev, newCompany]);
    setUsers(prev => [...prev, newAdmin]);
    setAccounts(prev => [...prev, { id: `acc-${crypto.randomUUID()}`, companyId: newCompanyId, name: 'Store Cash', balance: 0, color: 'emerald', type: 'CASH' }]);
  };

  const handleUpdateProfile = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    setIsProfileOpen(false);
  };

  const addTransaction = (tx: any) => {
    if (!currentUser) return;
    const companyIdToUse = isSuper ? activeCompanyId : currentUser.companyId;
    const newTx = { ...tx, id: crypto.randomUUID(), companyId: companyIdToUse, createdBy: currentUser.id };
    
    setTransactions(prev => [newTx, ...prev]);
    if (tx.paymentStatus === 'PAID') {
      setAccounts(prev => prev.map(a => a.id === tx.accountId ? { ...a, balance: a.balance + (tx.type === TransactionType.INCOME ? tx.amount : -tx.amount) } : a));
    }
    if (tx.entityId) {
       setEntities(prev => prev.map(e => e.id === tx.entityId ? { ...e, balance: e.balance + (tx.type === TransactionType.INCOME ? tx.amount : -tx.amount) } : e));
    }
    if (tx.productId && tx.quantity) {
      setProducts(prev => prev.map(p => p.id === tx.productId ? { ...p, stock: p.stock + (tx.type === TransactionType.INCOME ? -tx.quantity : tx.quantity) } : p));
    }
    setActiveTab('ledger');
  };

  const currencySymbol = useMemo(() => CURRENCIES.find(c => c.code === settings.currency)?.symbol || 'Rs.', [settings.currency]);

  if (!isInitialized) return null;
  if (isLocked) return <AuthGuard companies={companies} users={users} onUnlock={(userId) => { setCurrentUserId(userId); setIsLocked(false); }} />;

  const navItems = isSuper ? [
    { id: 'admin', icon: Icons.Admin, label: 'System' },
    { id: 'dashboard', icon: Icons.Dashboard, label: 'Hub' },
    { id: 'ledger', icon: Icons.Ledger, label: 'Books' },
    { id: 'add', icon: Icons.Plus, label: 'New' },
    { id: 'inventory', icon: Icons.Inventory, label: 'Stock' },
    { id: 'settings', icon: Icons.Settings, label: 'Setup' },
  ] : [
    { id: 'dashboard', icon: Icons.Dashboard, label: 'Hub' },
    { id: 'ledger', icon: Icons.Ledger, label: 'Books' },
    { id: 'add', icon: Icons.Plus, label: 'New' },
    { id: 'inventory', icon: Icons.Inventory, label: 'Stock' },
    { id: 'settings', icon: Icons.Settings, label: 'Setup' },
  ];

  return (
    <div className="h-screen w-full text-slate-900 dark:text-slate-100 max-w-md mx-auto relative overflow-hidden flex flex-col bg-[#fcfcfd] dark:bg-[#030712]">
      <header className="px-8 pt-10 pb-4 flex justify-between items-center z-40">
        <div className="flex items-center gap-4">
          <button onClick={() => setActiveTab('dashboard')} className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-xl active-scale">
             <Icons.Dashboard className="w-5 h-5 text-white" />
          </button>
          <div className="flex flex-col">
            <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest truncate max-w-[120px]">
              {isSuper ? `System Mode (${companies.find(c => c.id === activeCompanyId)?.name || 'Global'})` : companies.find(c => c.id === currentUser?.companyId)?.name}
            </p>
            <h1 className="text-xl font-black tracking-tightest">TRACKR<span className="text-slate-400">.</span></h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isSuper && isAdmin && (
            <button onClick={() => setActiveTab('users')} className="p-2 text-slate-400 hover:text-indigo-500 transition-colors">
              <Icons.Admin className="w-5 h-5" />
            </button>
          )}
          <button onClick={() => setIsProfileOpen(true)} className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center active-scale transition-transform overflow-hidden border-2 border-indigo-500/10">
            {currentUser?.avatar ? <img src={currentUser.avatar} className="w-full h-full object-cover" /> : <span className="font-black text-indigo-500">{currentUser?.name[0]}</span>}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar px-6 pb-40">
          {activeTab === 'dashboard' && <Dashboard transactions={companyTransactions} accounts={companyAccounts} products={companyProducts} currencySymbol={currencySymbol} />}
          {activeTab === 'ledger' && (
             <div className="space-y-6">
               <Ledger 
                 transactions={companyTransactions} 
                 accounts={companyAccounts} 
                 products={companyProducts} 
                 currencySymbol={currencySymbol} 
                 categories={DEFAULT_CATEGORIES} 
                 onDelete={() => {}} 
                 onUpdate={() => {}} 
               />
               <div className="mt-8 border-t border-slate-100 dark:border-white/5 pt-8">
                  <Parties entities={companyEntities} setEntities={setEntities} currencySymbol={currencySymbol} transactions={companyTransactions} />
               </div>
             </div>
          )}
          {activeTab === 'inventory' && (
            <Inventory 
              products={companyProducts} 
              setProducts={setProducts} 
              currencySymbol={currencySymbol} 
              globalSettings={settings} 
              onNewTags={() => {}}
              activeCompanyId={activeCompanyId}
            />
          )}
          {activeTab === 'add' && <TransactionForm accounts={companyAccounts} products={companyProducts} entities={companyEntities} onAdd={addTransaction} settings={settings} categories={DEFAULT_CATEGORIES} />}
          {activeTab === 'admin' && isSuper && <AdminPanel companies={companies} users={users} onRegister={handleRegisterCompany} transactions={transactions} accounts={accounts} settings={settings} onUpdateConfig={() => {}} onConnect={() => {}} />}
          {activeTab === 'users' && !isSuper && <UserManagement users={companyUsers} setUsers={setUsers} currentUserRole={currentUser!.role} />}
          {activeTab === 'settings' && <Settings settings={settings} updateSettings={(s) => setSettings(p => ({...p, ...s}))} accounts={companyAccounts} setAccounts={setAccounts} categories={DEFAULT_CATEGORIES} setCategories={() => {}} transactions={companyTransactions} logoUrl={null} setLogoUrl={() => {}} onRemoveInventoryTag={() => {}} />}
      </main>

      {/* Profile Modal */}
      {isProfileOpen && currentUser && (
        <ProfileModal 
          user={currentUser} 
          onClose={() => setIsProfileOpen(false)} 
          onSave={handleUpdateProfile}
          onLogout={() => { setIsProfileOpen(false); setIsLocked(true); }}
        />
      )}

      <div className="absolute bottom-10 left-0 right-0 px-6 z-50 pointer-events-none">
        <nav className="glass rounded-[2.5rem] p-1.5 flex justify-between items-center premium-shadow pointer-events-auto overflow-x-auto no-scrollbar">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id as Tab)} className={`flex-1 min-w-[50px] flex flex-col items-center gap-1 p-3 rounded-3xl transition-all duration-300 ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
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
