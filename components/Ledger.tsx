
import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, Account } from '../types';
import { Icons } from '../constants';

interface LedgerProps {
  transactions: Transaction[];
  accounts: Account[];
  currencySymbol: string;
  onDelete: (id: string) => void;
}

type SortField = 'date' | 'amount' | 'category';
type SortOrder = 'asc' | 'desc';

const Ledger: React.FC<LedgerProps> = ({ transactions, accounts, currencySymbol, onDelete }) => {
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

  const getAccountName = (id: string) => accounts.find(a => a.id === id)?.name || 'Wallet';

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="relative group">
        <Icons.Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-indigo-500" />
        <input 
          type="text"
          placeholder="Search transactions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white dark:bg-slate-900 border-none rounded-[2rem] py-5 pl-14 pr-6 premium-shadow focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm font-black"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden premium-shadow border border-black/[0.02] dark:border-white/5">
        <div className="grid grid-cols-[80px_1fr_80px_90px] gap-2 px-6 py-4 border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/20">
          <button 
            onClick={() => { setSortBy('date'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
            className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"
          >
            Date {sortBy === 'date' && (sortOrder === 'asc' ? '▲' : '▼')}
          </button>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Classification</span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Wallet</span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Value</span>
        </div>

        <div className="divide-y divide-slate-50 dark:divide-white/5">
          {filteredAndSortedTransactions.length > 0 ? (
            filteredAndSortedTransactions.map(tx => (
              <div 
                key={tx.id}
                className="grid grid-cols-[80px_1fr_80px_90px] gap-2 px-6 py-5 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group relative"
              >
                <div className="flex flex-col">
                  <span className="text-[11px] font-black text-slate-400 leading-tight">
                    {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-[11px] font-black text-slate-400 leading-tight">
                    {new Date(tx.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </span>
                </div>

                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`w-9 h-9 min-w-[36px] rounded-full flex items-center justify-center ${
                    tx.type === TransactionType.INCOME ? 'bg-emerald-500/10 text-emerald-500' : 
                    tx.type === TransactionType.TRANSFER ? 'bg-indigo-500/10 text-indigo-500' : 
                    'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}>
                    {tx.type === TransactionType.TRANSFER ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M7 21V3"/><path d="M17 3v18"/><path d="m3 7 4-4 4 4"/><path d="m21 17-4 4-4-4"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        {tx.type === TransactionType.INCOME ? <path d="M12 2v20M5 9l7-7 7 7"/> : <path d="M12 22V2M5 15l7 7 7-7"/>}
                      </svg>
                    )}
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="font-black text-[14px] text-slate-900 dark:text-white truncate">
                      {tx.category}
                    </span>
                    {tx.type === TransactionType.TRANSFER && (
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                        {getAccountName(tx.accountId)} → {getAccountName(tx.toAccountId || '')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-center">
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest truncate max-w-[70px]">
                    {getAccountName(tx.accountId)}
                  </span>
                </div>

                <div className="text-right">
                  <span className={`text-[14px] font-black ${
                    tx.type === TransactionType.INCOME ? 'text-emerald-500' : 
                    tx.type === TransactionType.TRANSFER ? 'text-indigo-500' :
                    'text-slate-900 dark:text-white'
                  }`}>
                    {tx.type === TransactionType.INCOME ? '+' : tx.type === TransactionType.TRANSFER ? '±' : '-'}{currencySymbol}{tx.amount.toLocaleString()}
                  </span>
                </div>

                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(tx.id); }}
                  className="absolute right-2 opacity-0 group-hover:opacity-100 p-2 text-rose-500 transition-opacity"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              </div>
            ))
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-slate-300">
              <Icons.Ledger className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">No records found</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2 px-2 opacity-30">
        <div className="h-1 w-2 bg-slate-400 rounded-full"></div>
        <div className="h-1 flex-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-slate-400 rounded-full"></div>
        </div>
        <div className="h-1 w-2 bg-slate-400 rounded-full"></div>
      </div>
    </div>
  );
};

export default Ledger;
