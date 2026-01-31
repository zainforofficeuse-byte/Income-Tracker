
import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, Account } from '../types';
import { Icons } from '../constants';

interface LedgerProps {
  transactions: Transaction[];
  accounts: Account[];
  currencySymbol: string;
  categories: Record<TransactionType, string[]>;
  onDelete: (id: string) => void;
  onUpdate: (tx: Transaction) => void;
}

type SortField = 'date' | 'amount' | 'category';
type SortOrder = 'asc' | 'desc';

const Ledger: React.FC<LedgerProps> = ({ transactions, accounts, currencySymbol, categories, onDelete, onUpdate }) => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Transaction>>({});

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

  const toggleExpand = (id: string) => {
    if (editingId) return; // Prevent expanding others while editing
    setExpandedId(expandedId === id ? null : id);
  };

  const startEdit = (tx: Transaction) => {
    setEditingId(tx.id);
    setEditForm({ ...tx });
  };

  const saveEdit = () => {
    if (editForm.id) {
      onUpdate(editForm as Transaction);
      setEditingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

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
        <div className="grid grid-cols-[80px_1fr_90px] gap-2 px-6 py-4 border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/20">
          <button 
            onClick={() => { setSortBy('date'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
            className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"
          >
            Date {sortBy === 'date' && (sortOrder === 'asc' ? '▲' : '▼')}
          </button>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Details</span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Value</span>
        </div>

        <div className="divide-y divide-slate-50 dark:divide-white/5">
          {filteredAndSortedTransactions.length > 0 ? (
            filteredAndSortedTransactions.map(tx => {
              const isExpanded = expandedId === tx.id;
              const isEditing = editingId === tx.id;

              return (
                <div 
                  key={tx.id}
                  onClick={() => !isEditing && toggleExpand(tx.id)}
                  className={`flex flex-col transition-all duration-300 ${isExpanded ? 'bg-slate-50/80 dark:bg-slate-800/40' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/20'} cursor-pointer`}
                >
                  {/* Row Summary */}
                  <div className="grid grid-cols-[80px_1fr_90px] gap-2 px-6 py-5 items-center">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black text-slate-400 leading-tight">
                        {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      <div className="flex items-center gap-1 mt-0.5">
                         <div className={`w-1 h-1 rounded-full ${tx.syncStatus === 'SYNCED' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                         <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">
                           {tx.syncStatus === 'SYNCED' ? 'Cloud' : 'Local'}
                         </span>
                      </div>
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
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                          {getAccountName(tx.accountId)}
                        </span>
                      </div>
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
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300">
                      <div className="bg-white dark:bg-slate-900/50 rounded-3xl p-5 border border-black/[0.03] dark:border-white/5 space-y-4">
                        {isEditing ? (
                          <div className="space-y-4" onClick={e => e.stopPropagation()}>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[8px] font-black text-slate-400 uppercase ml-1">Value</label>
                                <input 
                                  type="number" 
                                  value={editForm.amount}
                                  onChange={e => setEditForm({...editForm, amount: parseFloat(e.target.value)})}
                                  className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl p-2.5 font-black text-xs border-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[8px] font-black text-slate-400 uppercase ml-1">Label</label>
                                <select 
                                  value={editForm.category}
                                  onChange={e => setEditForm({...editForm, category: e.target.value})}
                                  className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl p-2.5 font-black text-xs border-none"
                                >
                                  {categories[tx.type].map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] font-black text-slate-400 uppercase ml-1">Memo</label>
                              <input 
                                type="text" 
                                value={editForm.note}
                                onChange={e => setEditForm({...editForm, note: e.target.value})}
                                placeholder="Details..."
                                className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl p-2.5 font-black text-xs border-none"
                              />
                            </div>
                            <div className="flex gap-2 pt-2">
                              <button onClick={saveEdit} className="flex-1 bg-indigo-600 text-white py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest active-scale">Save Update</button>
                              <button onClick={cancelEdit} className="px-5 bg-slate-100 dark:bg-slate-800 text-slate-500 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest active-scale">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Account Source</p>
                                <p className="text-xs font-bold">{getAccountName(tx.accountId)}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Sync Status</p>
                                <p className={`text-xs font-bold ${tx.syncStatus === 'SYNCED' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                  {tx.syncStatus === 'SYNCED' ? 'Data Pushed to Cloud' : 'Waiting for Internet...'}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Transaction Memo</p>
                              <p className="text-xs font-bold text-slate-600 dark:text-slate-300 italic">
                                {tx.note || 'No description provided.'}
                              </p>
                            </div>
                            <div className="flex gap-2 pt-2">
                              <button 
                                onClick={(e) => { e.stopPropagation(); startEdit(tx); }}
                                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active-scale"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                                Edit Record
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); onDelete(tx.id); }}
                                className="bg-rose-50 dark:bg-rose-900/10 text-rose-500 px-5 rounded-2xl flex items-center justify-center active-scale"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-slate-300">
              <Icons.Ledger className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">No records found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Ledger;
