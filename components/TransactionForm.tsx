
import React, { useState, useEffect } from 'react';
import { Account, TransactionType, UserSettings, CURRENCIES, Product, Entity } from '../types';

interface TransactionFormProps {
  accounts: Account[];
  products: Product[];
  entities: Entity[];
  settings: UserSettings;
  categories: Record<TransactionType, string[]>;
  onAdd: (tx: any) => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ accounts, products, entities, settings, categories, onAdd }) => {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [category, setCategory] = useState(categories[TransactionType.EXPENSE][0]);
  const [note, setNote] = useState('');
  const [accountId, setAccountId] = useState(settings.activeAccountId || (accounts[0]?.id || ''));
  const [paymentStatus, setPaymentStatus] = useState<'PAID' | 'CREDIT'>('PAID');
  const [entityId, setEntityId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [isInventoryMode, setIsInventoryMode] = useState(false);

  useEffect(() => {
    if (type !== TransactionType.TRANSFER && !isInventoryMode) {
      setCategory(categories[type][0] || '');
    }
  }, [type, categories, isInventoryMode]);

  useEffect(() => {
    if (isInventoryMode && productId) {
      const p = products.find(item => item.id === productId);
      if (p) {
        const unitPrice = type === TransactionType.INCOME ? p.sellingPrice : p.purchasePrice;
        setAmount((unitPrice * (parseFloat(quantity) || 0)).toString());
        setCategory(type === TransactionType.INCOME ? 'Product Sales' : 'Inventory Purchase');
      }
    }
  }, [productId, quantity, type, products, isInventoryMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalVal = parseFloat(amount);
    if (!finalVal || finalVal <= 0) return;
    
    onAdd({
      amount: finalVal,
      type,
      category,
      note,
      accountId: paymentStatus === 'PAID' ? accountId : '', 
      entityId,
      productId: isInventoryMode ? productId : undefined,
      quantity: isInventoryMode ? parseFloat(quantity) : undefined,
      paymentStatus,
      date: new Date(date).toISOString(),
    });

    setAmount('');
    setNote('');
    setProductId('');
    setEntityId('');
  };

  const symbol = CURRENCIES.find(c => c.code === settings.currency)?.symbol || 'Rs.';

  return (
    <div className="animate-slide-up w-full h-full flex flex-col pt-4">
      <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto w-full pb-10 px-1">
        <div className="flex justify-center shrink-0">
          <div className="bg-slate-100 dark:bg-slate-900/80 p-1 rounded-2xl flex gap-1 border border-black/[0.03]">
            <button type="button" onClick={() => setIsInventoryMode(false)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isInventoryMode ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600' : 'text-slate-400'}`}>Accounts</button>
            <button type="button" onClick={() => setIsInventoryMode(true)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isInventoryMode ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600' : 'text-slate-400'}`}>Inventory</button>
          </div>
        </div>

        <div className="text-center px-4 shrink-0 py-2">
          <div className="flex items-center justify-center gap-1 w-full relative">
             <span className="text-xl font-black text-indigo-600 opacity-20 absolute left-2 md:left-4">{symbol}</span>
             <input 
              type="number" 
              placeholder="0.00" 
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
              className="w-full bg-transparent border-none text-center text-4xl md:text-5xl font-black focus:ring-0 text-slate-900 dark:text-white" 
              autoFocus 
             />
          </div>
        </div>

        <div className="space-y-4 px-2">
          {/* Swapped: Expense Left, Income Right */}
          <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-full border border-black/5">
            <button type="button" onClick={() => setType(TransactionType.EXPENSE)} className={`flex-1 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${type === TransactionType.EXPENSE ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-slate-400'}`}>Payment Out</button>
            <button type="button" onClick={() => setType(TransactionType.INCOME)} className={`flex-1 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${type === TransactionType.INCOME ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400'}`}>Payment In</button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-5 md:p-6 premium-shadow border border-black/[0.03] space-y-4">
            <div className="flex gap-2">
               <button type="button" onClick={() => setPaymentStatus('PAID')} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${paymentStatus === 'PAID' ? 'bg-slate-900 border-slate-900 text-white dark:bg-indigo-600 dark:border-indigo-600' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}>Cash/Bank</button>
               <button type="button" onClick={() => setPaymentStatus('CREDIT')} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${paymentStatus === 'CREDIT' ? 'bg-rose-50 text-rose-500 border-rose-100 dark:bg-rose-900/10 dark:border-rose-900/20' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}>Udhaar/Credit</button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-transparent font-black text-[11px] border-none p-0 focus:ring-0" />
              </div>
              <div className="space-y-1.5 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} disabled={isInventoryMode} className="w-full bg-transparent font-black text-[11px] border-none p-0 focus:ring-0 uppercase truncate">
                  {categories[type].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1.5 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Party / Entity</label>
              <select value={entityId} onChange={e => setEntityId(e.target.value)} className="w-full bg-transparent font-black text-xs border-none p-0 focus:ring-0">
                <option value="">WALKING CUSTOMER</option>
                {entities.filter(e => type === TransactionType.INCOME ? e.type === 'CLIENT' : e.type === 'VENDOR').map(ent => <option key={ent.id} value={ent.id}>{ent.name}</option>)}
              </select>
            </div>

            {isInventoryMode && (
              <div className="grid grid-cols-[2fr_1fr] gap-3">
                <div className="space-y-1.5 p-3 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl">
                  <label className="text-[8px] font-black text-indigo-400 uppercase tracking-widest block">Item</label>
                  <select value={productId} onChange={e => setProductId(e.target.value)} className="w-full bg-transparent font-black text-[11px] border-none p-0 focus:ring-0">
                    <option value="">Select Product...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5 p-3 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl">
                  <label className="text-[8px] font-black text-indigo-400 uppercase tracking-widest block">Qty</label>
                  <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full bg-transparent font-black text-[11px] border-none p-0 focus:ring-0 text-center" />
                </div>
              </div>
            )}
            
            <div className="space-y-1.5 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
               <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Remarks</label>
               <input value={note} onChange={e => setNote(e.target.value)} className="w-full bg-transparent font-black text-xs border-none p-0 focus:ring-0" placeholder="Transaction details..." />
            </div>

            {paymentStatus === 'PAID' && (
              <div className="space-y-1.5 p-4 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl">
                <label className="text-[8px] font-black text-indigo-400 uppercase tracking-widest block">Account</label>
                <select value={accountId} onChange={e => setAccountId(e.target.value)} className="w-full bg-transparent font-black text-xs border-none p-0 focus:ring-0">
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            )}
          </div>

          <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-widest active-scale shadow-2xl shadow-indigo-500/20 mb-20">Sync Data to Ledger</button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
