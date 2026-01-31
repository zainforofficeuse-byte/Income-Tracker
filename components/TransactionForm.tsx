
import React, { useState, useEffect, useRef } from 'react';
import { Account, TransactionType, UserSettings, CURRENCIES, Product } from '../types';
import { Icons } from '../constants';

interface TransactionFormProps {
  accounts: Account[];
  products: Product[];
  settings: UserSettings;
  categories: Record<TransactionType, string[]>;
  onAdd: (tx: any) => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ accounts, products, settings, categories, onAdd }) => {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [category, setCategory] = useState(categories[TransactionType.EXPENSE][0]);
  const [note, setNote] = useState('');
  const [accountId, setAccountId] = useState(settings.activeAccountId);
  const [toAccountId, setToAccountId] = useState(accounts.find(a => a.id !== settings.activeAccountId)?.id || '');
  
  // Inventory Specific State
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [isInventoryMode, setIsInventoryMode] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Professional Cursor Management
  const moveCursorToEnd = () => {
    setTimeout(() => {
      if (inputRef.current) {
        const len = inputRef.current.value.length;
        inputRef.current.focus();
        inputRef.current.setSelectionRange(len, len);
      }
    }, 0);
  };

  const handleCalc = (op: string) => {
    setAmount(prev => prev + op);
    moveCursorToEnd();
  };

  const handleBackspace = () => {
    setAmount(prev => prev.slice(0, -1));
    moveCursorToEnd();
  };

  const handleClear = () => {
    setAmount('');
    moveCursorToEnd();
  };

  const evaluateAmount = () => {
    try {
      const cleanExpr = amount.replace(/[^-+*/.0-9]/g, '');
      if (!cleanExpr) return;
      // Using Function constructor instead of eval for slightly better safety/perf in some envs
      const result = new Function(`return ${cleanExpr}`)();
      if (!isNaN(result) && isFinite(result)) {
        setAmount(Number(result.toFixed(2)).toString());
        moveCursorToEnd();
      }
    } catch (e) {
      // If error (incomplete expression), we just leave it as is
    }
  };

  // Switch categories when type changes
  useEffect(() => {
    if (type !== TransactionType.TRANSFER && !isInventoryMode) {
      setCategory(categories[type][0] || '');
    }
  }, [type, categories, isInventoryMode]);

  // Handle Inventory Calculation
  useEffect(() => {
    if (isInventoryMode && productId) {
      const p = products.find(item => item.id === productId);
      if (p) {
        const unitPrice = type === TransactionType.INCOME ? p.sellingPrice : p.purchasePrice;
        const total = unitPrice * (parseFloat(quantity) || 0);
        setAmount(total.toString());
        setCategory(type === TransactionType.INCOME ? 'Product Sales' : 'Inventory Purchase');
      }
    }
  }, [productId, quantity, type, products, isInventoryMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    evaluateAmount();
    setTimeout(() => {
      const finalVal = parseFloat(amount.replace(/[^-+*/.0-9]/g, ''));
      if (!finalVal || finalVal <= 0) return;
      
      onAdd({
        amount: finalVal,
        type,
        category: type === TransactionType.TRANSFER ? 'Transfer' : category,
        note: note || (isInventoryMode ? `Stock transaction for ${products.find(p => p.id === productId)?.name}` : ''),
        accountId,
        toAccountId: type === TransactionType.TRANSFER ? toAccountId : undefined,
        productId: isInventoryMode ? productId : undefined,
        quantity: isInventoryMode ? parseFloat(quantity) : undefined,
        date: new Date().toISOString(),
      });
    }, 100);
  };

  const selectedProduct = products.find(p => p.id === productId);
  const symbol = CURRENCIES.find(c => c.code === settings.currency)?.symbol || 'Rs.';

  return (
    <div className="animate-slide-up h-full flex flex-col justify-center py-4 px-2">
      <form onSubmit={handleSubmit} className="space-y-6 max-w-sm mx-auto w-full">
        {/* Mode Toggle */}
        <div className="flex justify-center">
          <div className="bg-slate-100 dark:bg-slate-900/80 p-1 rounded-2xl flex gap-1 border border-black/5">
            <button 
              type="button"
              onClick={() => setIsInventoryMode(false)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isInventoryMode ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600' : 'text-slate-400'}`}
            >
              Accounting
            </button>
            <button 
              type="button"
              onClick={() => setIsInventoryMode(true)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isInventoryMode ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600' : 'text-slate-400'}`}
            >
              Inventory
            </button>
          </div>
        </div>

        {/* Amount Section */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 w-full relative group">
             <span className="text-xl font-black text-indigo-600 opacity-20 absolute left-4 group-focus-within:opacity-100 transition-opacity">{symbol}</span>
             <input 
              ref={inputRef} 
              type="text" 
              placeholder="0.00" 
              value={amount} 
              readOnly={isInventoryMode}
              onChange={e => setAmount(e.target.value)} 
              className={`w-full bg-transparent border-none text-center text-5xl font-black focus:ring-0 text-slate-900 dark:text-white transition-all ${isInventoryMode ? 'opacity-80 scale-95' : 'scale-100'}`}
              autoFocus 
             />
          </div>
          {isInventoryMode && selectedProduct && (
            <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">
              {quantity || 0} units × {symbol}{type === TransactionType.INCOME ? selectedProduct.sellingPrice : selectedProduct.purchasePrice}
            </p>
          )}
        </div>

        <div className={`space-y-4 transition-all duration-500`}>
          {/* Type Selector */}
          <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-full border border-black/[0.02]">
            {[
              { id: TransactionType.EXPENSE, label: isInventoryMode ? 'Stock In' : 'Payment Out' },
              { id: TransactionType.INCOME, label: isInventoryMode ? 'Sale (Out)' : 'Payment In' }
            ].map(t => (
              <button 
                key={t.id} 
                type="button" 
                onClick={() => setType(t.id)} 
                className={`flex-1 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${type === t.id ? 'bg-white dark:bg-slate-800 shadow-md text-indigo-600' : 'text-slate-400'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Dynamic Fields based on Mode */}
          {isInventoryMode ? (
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 premium-shadow border border-black/[0.03] space-y-4">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-2">Product Catalog</label>
                <select 
                  value={productId} 
                  onChange={e => setProductId(e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl p-3 font-black text-xs border-none"
                  required
                >
                  <option value="">Select Item...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-2">Quantity</label>
                  <input 
                    type="number" 
                    value={quantity} 
                    onChange={e => setQuantity(e.target.value)} 
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl p-3 font-black text-xs border-none"
                    placeholder="1"
                    min="1"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-2">Stock Impact</label>
                  <div className={`w-full bg-slate-50 dark:bg-slate-800 rounded-xl p-3 font-black text-xs flex items-center justify-center ${type === TransactionType.INCOME ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {type === TransactionType.INCOME ? '-' : '+'}{quantity || 0} Units
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 premium-shadow border border-black/[0.03] space-y-4">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-2">Classification</label>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl p-3 font-black text-xs border-none"
                >
                  {categories[type].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-2">Calculator</label>
                <div className="grid grid-cols-6 gap-1">
                  {['+', '-', '*', '/'].map(op => (
                    <button key={op} type="button" onClick={() => handleCalc(op)} className="bg-slate-50 dark:bg-slate-800 py-2 rounded-lg font-black text-xs text-slate-400 active-scale hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">{op}</button>
                  ))}
                  <button type="button" onClick={handleBackspace} className="bg-slate-50 dark:bg-slate-800 py-2 rounded-lg font-black text-[10px] text-rose-400 active-scale">⌫</button>
                  <button type="button" onClick={handleClear} className="bg-slate-50 dark:bg-slate-800 py-2 rounded-lg font-black text-[10px] text-rose-400 active-scale uppercase">C</button>
                </div>
                <button type="button" onClick={evaluateAmount} className="w-full mt-1 bg-indigo-50 dark:bg-indigo-900/20 py-2 rounded-lg font-black text-xs text-indigo-600 active-scale">Calculate Total (=)</button>
              </div>
            </div>
          )}

          {/* Account & Memo */}
          <div className="grid grid-cols-[1fr_2fr] gap-2">
            <select 
              value={accountId} 
              onChange={e => setAccountId(e.target.value)} 
              className="bg-white dark:bg-slate-900 rounded-2xl p-3 font-black text-[10px] border border-black/[0.03] focus:ring-0"
            >
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <input 
              type="text" 
              placeholder="Memo / Reference..." 
              value={note} 
              onChange={e => setNote(e.target.value)} 
              className="bg-white dark:bg-slate-900 rounded-2xl p-3 font-bold text-[10px] border border-black/[0.03] focus:ring-0" 
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-[2rem] font-black text-xs uppercase tracking-widest active-scale shadow-2xl"
          >
            {isInventoryMode ? 'Record Sale/Purchase' : 'Post Ledger Entry'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
