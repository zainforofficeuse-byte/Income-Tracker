
import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { Icons } from '../constants';

interface PlannerProps {
  transactions: Transaction[];
  currencySymbol: string;
  onDelete: (id: string) => void;
}

type SortField = 'date' | 'amount' | 'category';
type SortOrder = 'asc' | 'desc';

const Planner: React.FC<PlannerProps> = ({ transactions, currencySymbol, onDelete }) => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const filteredAndSortedTransactions = useMemo(() => {
    let result = transactions.filter(t => 
      t.category.toLowerCase().includes(search.toLowerCase()) ||
      t.note.toLowerCase().includes(search.toLowerCase()) ||
      t.amount.toString().includes(search)
    );

    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sortBy === 'category') {
        comparison = a.category.localeCompare(b.category);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [transactions, search, sortBy, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Search & Sort Section */}
      <div className="space-y-4">
        <div className="relative">
          <Icons.Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
          <input 
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border-none rounded-[2rem] py-5 pl-14 pr-6 premium-shadow focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm font-black"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 flex bg-slate-200/50 dark:bg-slate-900/50 p-1 rounded-[1.5rem] border border-black/5 dark:border-white/5 overflow-hidden">
            {(['date', 'amount', 'category'] as SortField[]).map((field) => (
              <button
                key={field}
                onClick={() => setSortBy(field)}
                className={`flex-1 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${
                  sortBy === field 
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {field}
              </button>
            ))}
          </div>
          <button 
            onClick={toggleSortOrder}
            className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-900 rounded-[1.5rem] premium-shadow border border-black/5 dark:border-white/5 transition-all active:scale-90"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className={`transition-transform duration-500 text-indigo-600 ${sortOrder === 'desc' ? 'rotate-180' : ''}`}
            >
              <path d="M7 21V3"/><path d="m3 7 4-4 4 4"/><path d="M17 3v18"/><path d="m21 17-4 4-4-4"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Transaction Log</h3>
          <div className="h-1.5 w-1.5 rounded-full bg-slate-200"></div>
        </div>

        {filteredAndSortedTransactions.length > 0 ? (
          <div className="space-y-4">
            {filteredAndSortedTransactions.map(tx => (
              <div 
                key={tx.id}
                className="group bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 flex items-center justify-between premium-shadow border border-white/50 dark:border-white/5 hover:border-indigo-500/30 transition-all duration-300"
              >
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-[1.4rem] flex items-center justify-center ${tx.type === TransactionType.INCOME ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {tx.type === TransactionType.INCOME ? <Icons.ArrowUp className="w-7 h-7" /> : <Icons.ArrowDown className="w-7 h-7" />}
                  </div>
                  <div>
                    <h4 className="font-black text-base text-slate-900 dark:text-white">{tx.category}</h4>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight truncate max-w-[140px]">
                      {tx.note || new Date(tx.date).toLocaleDateString(undefined, { weekday: 'long' })}
                    </p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <p className={`text-xl font-black ${tx.type === TransactionType.INCOME ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                      {tx.type === TransactionType.INCOME ? '+' : '-'}{currencySymbol}{tx.amount.toLocaleString()}
                    </p>
                    <p className="text-[10px] font-bold text-slate-300 uppercase">{new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                  </div>
                  <button 
                    onClick={() => onDelete(tx.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-[1rem] transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 flex flex-col items-center justify-center gap-6 glass rounded-[3rem] border-dashed border-2 border-slate-200 dark:border-slate-800">
            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
              <Icons.Search className="w-10 h-10 text-slate-300" />
            </div>
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No matching history</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Planner;
