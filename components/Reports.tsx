
import React, { useMemo } from 'react';
// Fix: Removed CATEGORIES as it is not exported from types.ts and not used in this component
import { Transaction, TransactionType } from '../types';

interface ReportsProps {
  transactions: Transaction[];
  currencySymbol: string;
}

const Reports: React.FC<ReportsProps> = ({ transactions, currencySymbol }) => {
  // Use pnlData to calculate summary statistics from transactions
  const pnlData = useMemo(() => {
    const categories = {
      income: {} as Record<string, number>,
      expense: {} as Record<string, number>,
      totalIncome: 0,
      totalExpense: 0
    };

    transactions.forEach(tx => {
      if (tx.type === TransactionType.INCOME) {
        categories.income[tx.category] = (categories.income[tx.category] || 0) + tx.amount;
        categories.totalIncome += tx.amount;
      } else {
        categories.expense[tx.category] = (categories.expense[tx.category] || 0) + tx.amount;
        categories.totalExpense += tx.amount;
      }
    });

    return categories;
  }, [transactions]);

  return (
    <div className="space-y-10 animate-slide-up">
      <div className="text-center py-4">
        <h2 className="text-2xl font-black tracking-tightest">PROFIT & LOSS</h2>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Year to Date Summary</p>
      </div>

      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.4em]">Revenue</h3>
          <span className="font-black text-emerald-500">{currencySymbol}{pnlData.totalIncome.toLocaleString()}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 premium-shadow border border-black/[0.02] dark:border-white/5 space-y-4">
          {Object.entries(pnlData.income).map(([cat, val]) => (
            <div key={cat} className="flex justify-between items-center text-sm">
              <span className="font-bold text-slate-500">{cat}</span>
              <span className="font-black text-slate-900 dark:text-white">{currencySymbol}{val.toLocaleString()}</span>
            </div>
          ))}
          {Object.keys(pnlData.income).length === 0 && <p className="text-xs text-slate-300 text-center py-4">No income records</p>}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[11px] font-black text-rose-500 uppercase tracking-[0.4em]">Expenditures</h3>
          <span className="font-black text-rose-500">{currencySymbol}{pnlData.totalExpense.toLocaleString()}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 premium-shadow border border-black/[0.02] dark:border-white/5 space-y-4">
          {Object.entries(pnlData.expense).map(([cat, val]) => (
            <div key={cat} className="flex justify-between items-center text-sm">
              <span className="font-bold text-slate-500">{cat}</span>
              <span className="font-black text-slate-900 dark:text-white">{currencySymbol}{val.toLocaleString()}</span>
            </div>
          ))}
          {Object.keys(pnlData.expense).length === 0 && <p className="text-xs text-slate-300 text-center py-4">No expense records</p>}
        </div>
      </section>

      <div className="bg-slate-950 rounded-[3rem] p-10 text-center shadow-2xl">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-4">Bottom Line</p>
        <h4 className={`text-4xl font-black tracking-tightest ${pnlData.totalIncome - pnlData.totalExpense >= 0 ? 'text-white' : 'text-rose-500'}`}>
          {currencySymbol}{(pnlData.totalIncome - pnlData.totalExpense).toLocaleString()}
        </h4>
        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-4">Net Operating Income</p>
      </div>
    </div>
  );
};

export default Reports;
