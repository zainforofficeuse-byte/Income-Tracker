

import React, { useMemo, useState } from 'react';
// Fixed: Imported CartItem from types.ts
import { Transaction, TransactionType, Product, Entity, Account, CURRENCIES, CartItem } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area 
} from 'recharts';

interface ReportsProps {
  transactions: Transaction[];
  products: Product[];
  entities: Entity[];
  accounts: Account[];
  currencySymbol: string;
}

type ReportTab = 'finance' | 'sales' | 'inventory' | 'parties';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Reports: React.FC<ReportsProps> = ({ transactions, products, entities, accounts, currencySymbol }) => {
  const [activeTab, setActiveTab] = useState<ReportTab>('finance');

  // 1. Financial Analytics (P&L + Cash Flow)
  const financeData = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    const expenseByCategory: Record<string, number> = {};

    transactions.forEach(tx => {
      if (tx.type === TransactionType.INCOME) totalIncome += tx.amount;
      if (tx.type === TransactionType.EXPENSE) {
        totalExpense += tx.amount;
        expenseByCategory[tx.category] = (expenseByCategory[tx.category] || 0) + tx.amount;
      }
    });

    const expensePieData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));
    return { totalIncome, totalExpense, netProfit: totalIncome - totalExpense, expensePieData };
  }, [transactions]);

  // 2. Sales Analytics (Top Items & Categories)
  const salesData = useMemo(() => {
    const salesByItem: Record<string, number> = {};
    const salesByCategory: Record<string, number> = {};

    transactions.filter(t => t.type === TransactionType.INCOME).forEach(tx => {
      salesByCategory[tx.category] = (salesByCategory[tx.category] || 0) + tx.amount;
      if (tx.productId) {
        const prod = products.find(p => p.id === tx.productId);
        if (prod) salesByItem[prod.name] = (salesByItem[prod.name] || 0) + tx.amount;
      }
      // Fixed: Property 'cart' now exists on 'Transaction' type after updating types.ts
      if (tx.cart) {
        tx.cart.forEach((item: CartItem) => {
          salesByItem[item.name] = (salesByItem[item.name] || 0) + (item.price * item.quantity);
        });
      }
    });

    const topItemsData = Object.entries(salesByItem)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const categoryPieData = Object.entries(salesByCategory).map(([name, value]) => ({ name, value }));
    return { topItemsData, categoryPieData };
  }, [transactions, products]);

  // 3. Inventory Valuation
  const inventoryStats = useMemo(() => {
    const totalValuation = products.reduce((sum, p) => sum + (p.stock * p.purchasePrice), 0);
    const potentialRevenue = products.reduce((sum, p) => sum + (p.stock * p.sellingPrice), 0);
    const lowStockCount = products.filter(p => p.stock <= p.minStock).length;
    
    const stockDistribution = products.slice(0, 6).map(p => ({
      name: p.name,
      value: p.stock * p.purchasePrice
    }));

    return { totalValuation, potentialRevenue, lowStockCount, stockDistribution };
  }, [products]);

  // 4. Party Aging & Credit
  const partyStats = useMemo(() => {
    const receivables = entities.filter(e => e.type === 'CLIENT' && e.balance > 0).reduce((s, e) => s + e.balance, 0);
    const payables = entities.filter(e => e.type === 'VENDOR' && e.balance < 0).reduce((s, e) => s + Math.abs(e.balance), 0);
    
    const topDebtors = entities
      .filter(e => e.type === 'CLIENT' && e.balance > 0)
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 5)
      .map(e => ({ name: e.name, balance: e.balance }));

    return { receivables, payables, topDebtors };
  }, [entities]);

  return (
    <div className="space-y-8 animate-slide-up pb-32">
      {/* Header & Navigation */}
      <div className="text-center pt-4">
        <h2 className="text-3xl font-black tracking-tightest">Report Center</h2>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Enterprise Insights</p>
      </div>

      <nav className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-2xl border border-black/5 overflow-x-auto no-scrollbar gap-1">
        {(['finance', 'sales', 'inventory', 'parties'] as ReportTab[]).map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-400'}`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* 1. Financial Report */}
      {activeTab === 'finance' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-slate-950 rounded-[3rem] p-10 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 opacity-50"></div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-4">Net Profit (YTD)</p>
            <h4 className={`text-5xl font-black tracking-tightest ${financeData.netProfit >= 0 ? 'text-white' : 'text-rose-500'}`}>
              {currencySymbol}{financeData.netProfit.toLocaleString()}
            </h4>
            <div className="flex justify-center gap-8 mt-6">
               <div className="text-center">
                  <p className="text-[8px] font-black text-emerald-400 uppercase">Revenue</p>
                  <p className="text-xs font-bold text-white opacity-80">{currencySymbol}{financeData.totalIncome.toLocaleString()}</p>
               </div>
               <div className="text-center">
                  <p className="text-[8px] font-black text-rose-400 uppercase">Expenses</p>
                  <p className="text-xs font-bold text-white opacity-80">{currencySymbol}{financeData.totalExpense.toLocaleString()}</p>
               </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 premium-shadow border border-black/[0.02]">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 text-center">Expense Distribution</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={financeData.expensePieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {financeData.expensePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 2. Sales Report */}
      {activeTab === 'sales' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
           <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 premium-shadow border border-black/[0.02]">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Top Selling Items</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData.topItemsData} layout="vertical" margin={{ left: -20, right: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} style={{ fontSize: '10px', fontWeight: 'bold' }} width={80} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="value" fill="#6366f1" radius={[0, 10, 10, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </div>

           <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 premium-shadow border border-black/[0.02]">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Revenue by Category</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={salesData.categoryPieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" labelLine={false}>
                      {salesData.categoryPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
           </div>
        </div>
      )}

      {/* 3. Inventory Report */}
      {activeTab === 'inventory' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-indigo-600 rounded-[2.5rem] p-6 text-white shadow-xl">
                 <p className="text-[8px] font-black uppercase opacity-60 mb-1">Total Assets (Stock)</p>
                 <p className="text-xl font-black">{currencySymbol}{inventoryStats.totalValuation.toLocaleString()}</p>
              </div>
              <div className={`rounded-[2.5rem] p-6 shadow-xl ${inventoryStats.lowStockCount > 0 ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>
                 <p className="text-[8px] font-black uppercase opacity-60 mb-1">Restock Required</p>
                 <p className="text-xl font-black">{inventoryStats.lowStockCount} Items</p>
              </div>
           </div>

           <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 premium-shadow border border-black/[0.02]">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Inventory Value Breakdown</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={inventoryStats.stockDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value">
                      {inventoryStats.stockDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
           </div>
        </div>
      )}

      {/* 4. Party Report */}
      {activeTab === 'parties' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
           <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 premium-shadow border border-black/[0.02] flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">Total Receivables</p>
                <p className="text-2xl font-black text-emerald-500">{currencySymbol}{partyStats.receivables.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase">Total Payables</p>
                <p className="text-2xl font-black text-rose-500">{currencySymbol}{partyStats.payables.toLocaleString()}</p>
              </div>
           </div>

           <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 premium-shadow border border-black/[0.02]">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Major Outstanding (Customers)</p>
              <div className="space-y-4">
                {partyStats.topDebtors.map((debtor, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-xs text-indigo-600">{idx+1}</div>
                      <span className="font-bold text-sm">{debtor.name}</span>
                    </div>
                    <span className="font-black text-sm text-emerald-500">{currencySymbol}{debtor.balance.toLocaleString()}</span>
                  </div>
                ))}
                {partyStats.topDebtors.length === 0 && <p className="text-xs text-slate-300 text-center py-4">No outstanding receivables</p>}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Reports;