
import React, { useMemo, useState } from 'react';
import { Transaction, TransactionType, Product, Entity, Account, CartItem } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

interface ReportsProps {
  transactions: Transaction[];
  products: Product[];
  entities: Entity[];
  accounts: Account[];
  currencySymbol: string;
}

type ReportTab = 'finance' | 'sales' | 'inventory' | 'parties';
type DateRange = 'today' | 'month' | 'year' | 'all';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Reports: React.FC<ReportsProps> = ({ transactions, products, entities, accounts, currencySymbol }) => {
  const [activeTab, setActiveTab] = useState<ReportTab>('finance');
  const [dateRange, setDateRange] = useState<DateRange>('month');

  // Filter transactions by date
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    return transactions.filter(tx => {
      const txDate = new Date(tx.date);
      if (dateRange === 'today') return txDate >= startOfToday;
      if (dateRange === 'month') return txDate >= startOfMonth;
      if (dateRange === 'year') return txDate >= startOfYear;
      return true;
    });
  }, [transactions, dateRange]);

  // Financial Analytics
  const financeData = useMemo(() => {
    let totalIncome = 0, totalExpense = 0;
    const expenseByCategory: Record<string, number> = {};
    filteredTransactions.forEach(tx => {
      if (tx.type === TransactionType.INCOME) totalIncome += tx.amount;
      if (tx.type === TransactionType.EXPENSE) {
        totalExpense += tx.amount;
        expenseByCategory[tx.category] = (expenseByCategory[tx.category] || 0) + tx.amount;
      }
    });
    return { totalIncome, totalExpense, netProfit: totalIncome - totalExpense, expensePieData: Object.entries(expenseByCategory).map(([name, value]) => ({ name, value })) };
  }, [filteredTransactions]);

  // Sales Analytics
  const salesData = useMemo(() => {
    const salesByItem: Record<string, number> = {};
    const salesByCategory: Record<string, number> = {};
    filteredTransactions.filter(t => t.type === TransactionType.INCOME).forEach(tx => {
      salesByCategory[tx.category] = (salesByCategory[tx.category] || 0) + tx.amount;
      if (tx.productId) {
        const prod = products.find(p => p.id === tx.productId);
        if (prod) salesByItem[prod.name] = (salesByItem[prod.name] || 0) + tx.amount;
      }
      if (tx.cart) tx.cart.forEach((item: CartItem) => { salesByItem[item.name] = (salesByItem[item.name] || 0) + (item.price * item.quantity); });
    });
    return { 
      topItemsData: Object.entries(salesByItem).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5),
      categoryPieData: Object.entries(salesByCategory).map(([name, value]) => ({ name, value }))
    };
  }, [filteredTransactions, products]);

  const inventoryStats = useMemo(() => {
    const totalValuation = products.reduce((sum, p) => sum + (p.stock * p.purchasePrice), 0);
    const lowStockCount = products.filter(p => p.stock <= p.minStock).length;
    return { totalValuation, lowStockCount, stockDistribution: products.slice(0, 6).map(p => ({ name: p.name, value: p.stock * p.purchasePrice })) };
  }, [products]);

  const partyStats = useMemo(() => {
    const receivables = entities.filter(e => e.type === 'CLIENT' && e.balance > 0).reduce((s, e) => s + e.balance, 0);
    const payables = entities.filter(e => e.type === 'VENDOR' && e.balance < 0).reduce((s, e) => s + Math.abs(e.balance), 0);
    return { receivables, payables, topDebtors: entities.filter(e => e.type === 'CLIENT' && e.balance > 0).sort((a, b) => b.balance - a.balance).slice(0, 5) };
  }, [entities]);

  return (
    <div className="space-y-8 animate-slide-up pb-32 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div>
           <h2 className="text-3xl font-black tracking-tightest">Report Center</h2>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Analytics Dashboard</p>
        </div>
        <div className="bg-slate-100 dark:bg-slate-900/50 p-1 rounded-2xl flex gap-1">
          {(['today', 'month', 'year', 'all'] as DateRange[]).map(r => (
            <button key={r} onClick={() => setDateRange(r)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${dateRange === r ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-400'}`}>{r}</button>
          ))}
        </div>
      </div>

      <nav className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-2xl border border-black/5 overflow-x-auto no-scrollbar gap-1">
        {(['finance', 'sales', 'inventory', 'parties'] as ReportTab[]).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-400'}`}>{tab}</button>
        ))}
      </nav>

      {activeTab === 'finance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="md:col-span-2 bg-slate-950 rounded-[3rem] p-10 text-center shadow-2xl relative overflow-hidden">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-4">Net Result ({dateRange})</p>
            <h4 className={`text-5xl font-black tracking-tightest ${financeData.netProfit >= 0 ? 'text-white' : 'text-rose-500'}`}>
              {currencySymbol}{financeData.netProfit.toLocaleString()}
            </h4>
            <div className="flex justify-center gap-12 mt-8">
               <div className="text-center"><p className="text-[9px] font-black text-emerald-400 uppercase mb-1">Income</p><p className="text-xl font-black text-white">{currencySymbol}{financeData.totalIncome.toLocaleString()}</p></div>
               <div className="text-center"><p className="text-[9px] font-black text-rose-400 uppercase mb-1">Expense</p><p className="text-xl font-black text-white">{currencySymbol}{financeData.totalExpense.toLocaleString()}</p></div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 premium-shadow border border-black/[0.02]">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 text-center">Expense Breakdown</p>
            <div className="h-64"><ResponsiveContainer><PieChart><Pie data={financeData.expensePieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value">{financeData.expensePieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /><Legend iconType="circle" /></PieChart></ResponsiveContainer></div>
          </div>
        </div>
      )}

      {activeTab === 'sales' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 premium-shadow border border-black/[0.02] h-80">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Top Selling Items</p>
              <ResponsiveContainer><BarChart data={salesData.topItemsData} layout="vertical"><XAxis type="number" hide /><YAxis dataKey="name" type="category" axisLine={false} tickLine={false} style={{ fontSize: '10px' }} width={80} /><Tooltip cursor={{fill: 'transparent'}} /><Bar dataKey="value" fill="#6366f1" radius={[0, 10, 10, 0]} /></BarChart></ResponsiveContainer>
           </div>
           <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 premium-shadow border border-black/[0.02] h-80">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Sales Category Distribution</p>
              <ResponsiveContainer><PieChart><Pie data={salesData.categoryPieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label>{salesData.categoryPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /><Legend iconType="circle" /></PieChart></ResponsiveContainer>
           </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white"><p className="text-[9px] font-black uppercase opacity-60 mb-2">Total Stock Assets</p><p className="text-4xl font-black">{currencySymbol}{inventoryStats.totalValuation.toLocaleString()}</p></div>
           <div className={`bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 premium-shadow ${inventoryStats.lowStockCount > 0 ? 'border-2 border-rose-500/20' : ''}`}><p className="text-[9px] font-black text-slate-400 uppercase mb-2">Refill Alerts</p><p className="text-4xl font-black text-rose-500">{inventoryStats.lowStockCount} Items</p></div>
        </div>
      )}

      {activeTab === 'parties' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border-2 border-emerald-500/10"><p className="text-[10px] font-black text-slate-400 uppercase mb-2">Receivables</p><p className="text-3xl font-black text-emerald-500">{currencySymbol}{partyStats.receivables.toLocaleString()}</p></div>
           <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border-2 border-rose-500/10"><p className="text-[10px] font-black text-slate-400 uppercase mb-2">Payables</p><p className="text-3xl font-black text-rose-500">{currencySymbol}{partyStats.payables.toLocaleString()}</p></div>
        </div>
      )}
    </div>
  );
};

export default Reports;
