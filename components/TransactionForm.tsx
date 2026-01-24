
import React, { useState, useEffect, useRef } from 'react';
import { Account, TransactionType, UserSettings, CURRENCIES } from '../types';
import { Icons } from '../constants';

interface TransactionFormProps {
  accounts: Account[];
  settings: UserSettings;
  categories: Record<TransactionType, string[]>;
  onAdd: (tx: any) => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ accounts, settings, categories, onAdd }) => {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [category, setCategory] = useState(categories[TransactionType.EXPENSE][0]);
  const [note, setNote] = useState('');
  const [accountId, setAccountId] = useState(settings.activeAccountId);
  const [toAccountId, setToAccountId] = useState(accounts.find(a => a.id !== settings.activeAccountId)?.id || '');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCalc = (op: string) => {
    // Append operator and refocus
    setAmount(prev => prev + op);
    if (inputRef.current) {
      inputRef.current.focus();
      // Use a slight timeout to ensure cursor is at the end
      setTimeout(() => {
        if (inputRef.current) {
          const len = inputRef.current.value.length;
          inputRef.current.setSelectionRange(len, len);
        }
      }, 0);
    }
  };

  const evaluateAmount = () => {
    try {
      const cleanExpr = amount.replace(/[^-+*/.0-9]/g, '');
      if (!cleanExpr) return;
      // Use a safer evaluation method if possible, but eval is standard for simple calc strings here
      const result = eval(cleanExpr);
      if (!isNaN(result) && isFinite(result)) {
        setAmount(Number(result.toFixed(2)).toString());
      }
      inputRef.current?.focus();
    } catch (e) {
      console.error("Calculator Error");
    }
  };

  useEffect(() => {
    if (type !== TransactionType.TRANSFER) {
      if (!categories[type].includes(category)) {
        setCategory(categories[type][0] || '');
      }
    } else {
      setCategory('Internal Transfer');
    }
  }, [type, categories]);

  const isExpanded = amount !== '' && !isNaN(parseFloat(amount.replace(/[^-+*/.0-9]/g, '')));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    evaluateAmount(); 
    
    setTimeout(() => {
      const finalVal = parseFloat(amount.replace(/[^-+*/.0-9]/g, ''));
      if (!finalVal || finalVal <= 0) return;
      if (type !== TransactionType.TRANSFER && !category) return;
      
      onAdd({
        amount: finalVal,
        type,
        category: type === TransactionType.TRANSFER ? 'Transfer' : category,
        note: type === TransactionType.TRANSFER ? (note || 'Internal movement') : note,
        accountId,
        toAccountId: type === TransactionType.TRANSFER ? toAccountId : undefined,
        date: new Date().toISOString(),
      });
    }, 100);
  };

  const symbol = CURRENCIES.find(c => c.code === settings.currency)?.symbol || '$';

  return (
    <div className="animate-slide-up h-full flex flex-col justify-center py-1">
      <form onSubmit={handleSubmit} className="space-y-3 max-w-sm mx-auto w-full">
        {/* Minimalist Amount Input */}
        <div className="text-center pt-2">
          {/* Pro Calculator Pill - Extra Slim */}
          <div className="inline-flex items-center gap-0 bg-white dark:bg-slate-900 px-1.5 py-1 rounded-full shadow-md border border-black/[0.03] dark:border-white/5 mb-3 transition-transform hover:scale-105">
            {['+', '-', '*', '/'].map(op => (
              <button
                key={op}
                type="button"
                onClick={() => handleCalc(op)}
                className="w-6 h-6 rounded-full flex items-center justify-center font-black text-[9px] text-slate-400 hover:text-indigo-600 transition-all"
              >
                {op === '*' ? '×' : op === '/' ? '÷' : op}
              </button>
            ))}
            <div className="w-[1px] h-2.5 bg-slate-100 dark:bg-slate-800 mx-1"></div>
            <button
              type="button"
              onClick={evaluateAmount}
              className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center active-scale"
            >
              <span className="text-[9px] font-black">=</span>
            </button>
          </div>

          <div className="relative group flex flex-col items-center">
             <div className="flex items-center justify-center gap-1 w-full">
                <span className="text-lg font-black text-indigo-600 opacity-20">{symbol}</span>
                <input 
                  ref={inputRef}
                  type="text"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-transparent border-none text-center text-4xl font-black tracking-tightest focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-100 dark:placeholder:text-slate-900/10"
                  autoFocus
                />
             </div>
          </div>
        </div>

        {/* Dynamic Details - High Efficiency Layout */}
        <div className={`space-y-4 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
          
          {/* Type Segmented Control */}
          <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-full border border-black/[0.02] dark:border-white/5">
            {[
              { id: TransactionType.EXPENSE, label: 'EXP', color: 'text-rose-500' },
              { id: TransactionType.TRANSFER, label: 'MOV', color: 'text-indigo-600' },
              { id: TransactionType.INCOME, label: 'INC', color: 'text-emerald-500' }
            ].map((t) => (
              <button 
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className={`flex-1 py-2 rounded-full text-[8px] font-black uppercase tracking-widest transition-all duration-300 ${type === t.id ? 'bg-white dark:bg-slate-800 shadow-md ' + t.color : 'text-slate-400'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {type === TransactionType.TRANSFER ? (
            <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] p-3 premium-shadow border border-black/[0.02] dark:border-white/5 space-y-2">
              <div className="grid grid-cols-[1fr_24px_1fr] items-center gap-1">
                <div className="space-y-0.5">
                  <label className="text-[6px] font-black text-slate-400 uppercase tracking-widest ml-1">Source</label>
                  <select 
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg p-1.5 font-black text-[9px] border-none text-center"
                  >
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <div className="flex justify-center mt-2.5 text-indigo-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </div>
                <div className="space-y-0.5">
                  <label className="text-[6px] font-black text-slate-400 uppercase tracking-widest ml-1">Dest</label>
                  <select 
                    value={toAccountId}
                    onChange={(e) => setToAccountId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg p-1.5 font-black text-[9px] border-none text-center"
                  >
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {categories[type].map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-[9px] font-black transition-all duration-300 ${category === cat ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-500 border border-black/[0.03] dark:border-white/5'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-2.5 px-4 premium-shadow border border-black/[0.02] dark:border-white/5">
            <input 
              type="text"
              placeholder={type === TransactionType.TRANSFER ? "Transfer memo..." : "Add a brief note..."}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-transparent border-none focus:ring-0 text-[11px] font-bold text-slate-700 dark:text-white placeholder:text-slate-200 dark:placeholder:text-slate-800"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-3.5 rounded-full font-black text-[9px] uppercase tracking-widest shadow-xl active-scale transition-all duration-300 flex items-center justify-center gap-2 bg-slate-950 dark:bg-white text-white dark:text-slate-950"
          >
            Confirm Transaction
            <Icons.Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
