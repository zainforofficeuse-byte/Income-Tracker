
import React, { useMemo } from 'react';
import { Transaction, Account, Product } from '../types';

interface DashboardProps {
  transactions: Transaction[];
  accounts: Account[];
  products: Product[];
  currencySymbol: string;
}

const Dashboard: React.FC<DashboardProps> = ({ accounts, products, currencySymbol }) => {
  const cashBalance = useMemo(() => accounts.reduce((sum, a) => sum + a.balance, 0), [accounts]);
  const inventoryValue = useMemo(() => products.reduce((sum, p) => sum + (p.stock * p.purchasePrice), 0), [products]);

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex flex-col items-center justify-center pt-8">
        <div className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-full mb-3">
           <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Net Worth</span>
        </div>
        <div className="flex items-start justify-center gap-1">
          <span className="text-2xl font-black text-slate-300 dark:text-slate-700 mt-2">{currencySymbol}</span>
          <h2 className="text-6xl font-black tracking-tightest leading-none">
            {(cashBalance + inventoryValue).toLocaleString()}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 premium-shadow flex flex-col items-center">
          <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Cash Assets</p>
          <p className="text-xl font-black text-indigo-500">{currencySymbol}{cashBalance.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 premium-shadow flex flex-col items-center">
          <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Stock Value</p>
          <p className="text-xl font-black text-emerald-500">{currencySymbol}{inventoryValue.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-slate-950 rounded-[3rem] p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest opacity-50">Quick Alerts</h3>
          {products.filter(p => p.stock <= p.minStock).map(p => (
            <div key={p.id} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
              <span className="text-xs font-bold">{p.name}</span>
              <span className="text-[10px] bg-rose-500 px-2 py-0.5 rounded-full font-black">Refill: {p.stock} left</span>
            </div>
          ))}
          {products.filter(p => p.stock <= p.minStock).length === 0 && <p className="text-xs opacity-40">All stock levels are healthy.</p>}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
