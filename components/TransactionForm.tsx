
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

    // Reset Form
    setAmount('');
    setNote('');
    setProductId('');
    setEntityId('');
  };

  const symbol = CURRENCIES.find(c => c.code === settings.currency)?.symbol || 'Rs.';

  return (
    <div className="animate-slide-up h-full flex flex-col justify-center py-4 px-2">
      <form onSubmit={handleSubmit} className="space-y-6 max-w-sm mx-auto w-full">
        <div className="flex justify-center">
          <div className="bg-slate-100 dark:bg-slate-900/80 p-1 rounded-2xl flex gap-1">
            <button type="button" onClick={() => setIsInventoryMode(false)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isInventoryMode ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600' : 'text-slate-400'}`}>Accounting</button>
            <button type="button" onClick={() => setIsInventoryMode(true)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isInventoryMode ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600' : 'text-slate-400'}`}>Inventory</button>
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 w-full relative">
             <span className="text-xl font-black text-indigo-600 opacity-20 absolute left-4">{symbol}</span>
             <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-transparent border-none text-center text-5xl font-black focus:ring-0 text-slate-900 dark:text-white" autoFocus />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-full">
            <button type="button" onClick={() => setType(TransactionType.EXPENSE)} className={`flex-1 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${type === TransactionType.EXPENSE ? 'bg-white dark:bg-slate-800 text-rose-500' : 'text-slate-400'}`}>Payment Out</button>
            <button type="button" onClick={() => setType(TransactionType.INCOME)} className={`flex-1 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${type === TransactionType.INCOME ? 'bg-white dark:bg-slate-800 text-emerald-500' : 'text-slate-400'}`}>Payment In</button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 premium-shadow border border-black/[0.03] space-y-4">
            <div className="flex gap-2">
               <button type="button" onClick={() => setPaymentStatus('PAID')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 transition-all ${paymentStatus === 'PAID' ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}>Cash/Paid</button>
               <button type="button" onClick={() => setPaymentStatus('CREDIT')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 transition-all ${paymentStatus === 'CREDIT' ? 'bg-rose-500 border-rose-500 text-white' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}>Udhaar/Credit</button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-2">Entry Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl p-3 font-black text-[10px] border-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-2">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} disabled={isInventoryMode} className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl p-3 font-black text-[10px] border-none">
                  {categories[type].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-2">Party (Customer/Vendor)</label>
              <select value={entityId} onChange={e => setEntityId(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl p-3 font-black text-xs border-none">
                <option value="">Walking Customer / Misc</option>
                {entities.filter(e => type === TransactionType.INCOME ? e.type === 'CLIENT' : e.type === 'VENDOR').map(ent => <option key={ent.id} value={ent.id}>{ent.name} (Bal: {ent.balance})</option>)}
              </select>
            </div>

            {isInventoryMode && (
              <div className="grid grid-cols-[2fr_1fr] gap-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-2">Product</label>
                  <select value={productId} onChange={e => setProductId(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl p-3 font-black text-xs border-none">
                    <option value="">Select Item...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-2">Qty</label>
                  <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl p-3 font-black text-xs border-none text-center" />
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              {paymentStatus === 'PAID' && (
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-2">Wallet</label>
                  <select value={accountId} onChange={e => setAccountId(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl p-3 font-black text-[10px] border-none">
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              )}
              <div className={`${paymentStatus !== 'PAID' ? 'col-span-2' : ''} space-y-1`}>
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-2">Remarks/Note</label>
                <input value={note} onChange={e => setNote(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl p-3 font-black text-[10px] border-none" placeholder="Add extra details..." />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full py-5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-[2rem] font-black text-xs uppercase tracking-widest active-scale shadow-2xl">Record Entry</button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
