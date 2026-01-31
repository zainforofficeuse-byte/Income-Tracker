
import React, { useMemo } from 'react';
import { Transaction, Account, Product, TransactionType } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface DashboardProps {
  transactions: Transaction[];
  accounts: Account[];
  products: Product[];
  currencySymbol: string;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, accounts, products, currencySymbol }) => {
  const cashBalance = useMemo(() => accounts.reduce((sum, a) => sum + a.balance, 0), [accounts]);
  const inventoryValue = useMemo(() => products.reduce((sum, p) => sum + (p.stock * p.purchasePrice), 0), [products]);

  // Professional SaaS Trend Analytics (Last 7 Days)
  const chartData = useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayTxs = transactions.filter(t => t.date.split('T')[0] === date);
      const income = dayTxs.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0);
      const expense = dayTxs.filter(t => t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.amount, 0);
      return {
        name: new Date(date).toLocaleDateString(undefined, { weekday: 'short' }),
        income,
        expense,
        net: income - expense
      };
    });
  }, [transactions]);

  return (
    <div className="space-y-8 animate-slide-up pb-10">
      <div className="flex flex-col items-center justify-center pt-8">
        <div className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-full mb-3">
           <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Total Capital</span>
        </div>
        <div className="flex items-start justify-center gap-1">
          <span className="text-2xl font-black text-slate-300 dark:text-slate-700 mt-2">{currencySymbol}</span>
          <h2 className="text-6xl font-black tracking-tightest leading-none">
            {(cashBalance + inventoryValue).toLocaleString()}
          </h2>
        </div>
      </div>

      {/* Visual Trend Chart - The SaaS Professional Touch */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-6 premium-shadow border border-black/[0.02] dark:border-white/5">
        <div className="flex justify-between items-center mb-6 px-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Growth Analytics</p>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
              <span className="text-[8px] font-bold text-slate-400 uppercase">Cash Flow</span>
            </div>
          </div>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip 
                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: '900' }}
                cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '5 5' }}
              />
              <Area type="monotone" dataKey="net" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorNet)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 premium-shadow flex flex-col items-center border border-black/[0.01]">
          <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Liquid Cash</p>
          <p className="text-xl font-black text-indigo-500">{currencySymbol}{cashBalance.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 premium-shadow flex flex-col items-center border border-black/[0.01]">
          <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Stock Value</p>
          <p className="text-xl font-black text-emerald-500">{currencySymbol}{inventoryValue.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-slate-950 rounded-[3rem] p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full"></div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-widest opacity-50">Critical Alerts</h3>
            <span className="px-2 py-0.5 bg-rose-500 rounded-full text-[8px] font-black uppercase">Live</span>
          </div>
          {products.filter(p => p.stock <= p.minStock).map(p => (
            <div key={p.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
              <div className="flex flex-col">
                <span className="text-xs font-bold">{p.name}</span>
                <span className="text-[8px] text-slate-400 uppercase tracking-widest">SKU: {p.sku}</span>
              </div>
              <span className="text-[10px] text-rose-400 font-black">Stock: {p.stock}</span>
            </div>
          ))}
          {products.filter(p => p.stock <= p.minStock).length === 0 && (
            <div className="py-4 flex flex-col items-center text-center opacity-40">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
              <p className="text-[10px] font-black uppercase tracking-widest">All Operations Healthy</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
