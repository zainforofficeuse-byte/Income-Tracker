

import React, { useState, useEffect, useMemo } from 'react';
// Fixed: Imported CartItem from types.ts instead of defining it locally
import { Account, TransactionType, UserSettings, CURRENCIES, Product, Entity, CartItem } from '../types';

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
  const [type, setType] = useState<TransactionType>(TransactionType.INCOME);
  const [category, setCategory] = useState(categories[TransactionType.INCOME][0]);
  const [note, setNote] = useState('');
  const [accountId, setAccountId] = useState(settings.activeAccountId || (accounts[0]?.id || ''));
  const [paymentStatus, setPaymentStatus] = useState<'PAID' | 'CREDIT'>('PAID');
  const [entityId, setEntityId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // POS Cart State
  const [isInventoryMode, setIsInventoryMode] = useState(true); // Default to POS Inventory
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [qtyInput, setQtyInput] = useState('1');

  useEffect(() => {
    if (type !== TransactionType.TRANSFER && !isInventoryMode) {
      setCategory(categories[type][0] || '');
    }
  }, [type, categories, isInventoryMode]);

  const totalCartValue = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);

  // Sync amount with cart total if in inventory mode
  useEffect(() => {
    if (isInventoryMode && cart.length > 0) {
      setAmount(totalCartValue.toString());
    }
  }, [cart, isInventoryMode, totalCartValue]);

  const addToCart = () => {
    if (!selectedProductId) return;
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    const existingIdx = cart.findIndex(item => item.productId === selectedProductId);
    const quantity = parseFloat(qtyInput) || 1;
    const price = type === TransactionType.INCOME ? product.sellingPrice : product.purchasePrice;

    if (existingIdx > -1) {
      const updated = [...cart];
      updated[existingIdx].quantity += quantity;
      setCart(updated);
    } else {
      setCart([...cart, {
        id: crypto.randomUUID(),
        productId: selectedProductId,
        name: product.name,
        quantity,
        price
      }]);
    }
    setSelectedProductId('');
    setQtyInput('1');
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(i => i.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalVal = parseFloat(amount);
    if (!finalVal || finalVal <= 0) return;
    
    // If cart is used, we might need to handle stock for multiple items.
    // For now, we save one master transaction and a special note.
    const cartDetails = cart.map(i => `${i.name} (${i.quantity}x${i.price})`).join(', ');
    const finalNote = cart.length > 0 ? `${note ? note + ' | ' : ''}Cart: ${cartDetails}` : note;

    onAdd({
      amount: finalVal,
      type,
      category: isInventoryMode ? (type === TransactionType.INCOME ? 'Product Sales' : 'Inventory Purchase') : category,
      note: finalNote,
      accountId: paymentStatus === 'PAID' ? accountId : '', 
      entityId,
      // If multiple products, we attach the primary one or just handle via separate logic in App.tsx if required.
      // For this build, we support 1 master entry per bill for simplicity in ledger.
      productId: cart.length === 1 ? cart[0].productId : undefined, 
      quantity: cart.length === 1 ? cart[0].quantity : undefined,
      cart: cart.length > 1 ? cart : undefined, // Passing cart to App.tsx for stock logic
      paymentStatus,
      date: new Date(date).toISOString(),
    });

    setAmount('');
    setNote('');
    setSelectedProductId('');
    setCart([]);
  };

  const symbol = CURRENCIES.find(c => c.code === settings.currency)?.symbol || 'Rs.';

  return (
    <div className="animate-slide-up w-full h-full flex flex-col pt-4 pb-40">
      <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto w-full px-1">
        
        {/* Toggle Mode */}
        <div className="flex justify-center shrink-0">
          <div className="bg-slate-100 dark:bg-slate-900/80 p-1 rounded-2xl flex gap-1 border border-black/[0.03]">
            <button type="button" onClick={() => { setIsInventoryMode(false); setCart([]); }} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isInventoryMode ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600' : 'text-slate-400'}`}>Direct Entry</button>
            <button type="button" onClick={() => setIsInventoryMode(true)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isInventoryMode ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600' : 'text-slate-400'}`}>POS Sales</button>
          </div>
        </div>

        {/* POS Amount Area */}
        <div className="text-center px-4 shrink-0 py-6 bg-white dark:bg-slate-900 rounded-[3rem] premium-shadow border border-black/[0.03] mx-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
             <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h19.4L18 17H6.1L2 3z"/><circle cx="10" cy="21" r="1"/><circle cx="16" cy="21" r="1"/></svg>
          </div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Bill Total</label>
          <div className="flex items-center justify-center gap-1 w-full relative">
             <span className="text-2xl font-black text-indigo-600 opacity-30">{symbol}</span>
             <input 
              type="number" 
              placeholder="0.00" 
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
              className="w-full bg-transparent border-none text-center text-5xl md:text-6xl font-black focus:ring-0 text-slate-900 dark:text-white" 
              readOnly={isInventoryMode && cart.length > 0}
             />
          </div>
        </div>

        <div className="space-y-4 px-2">
          {/* POS Style Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-full border border-black/5">
            <button type="button" onClick={() => setType(TransactionType.INCOME)} className={`flex-1 py-4 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${type === TransactionType.INCOME ? 'bg-emerald-500 text-white shadow-xl' : 'text-slate-400'}`}>Payment In</button>
            <button type="button" onClick={() => setType(TransactionType.EXPENSE)} className={`flex-1 py-4 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${type === TransactionType.EXPENSE ? 'bg-rose-500 text-white shadow-xl' : 'text-slate-400'}`}>Payment Out</button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-5 md:p-8 premium-shadow border border-black/[0.03] space-y-5">
            
            {/* Payment Method */}
            <div className="flex gap-3">
               <button type="button" onClick={() => setPaymentStatus('PAID')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${paymentStatus === 'PAID' ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-100 text-slate-400'}`}>CASH / BANK</button>
               <button type="button" onClick={() => setPaymentStatus('CREDIT')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${paymentStatus === 'CREDIT' ? 'bg-rose-50 text-rose-500 border-rose-200' : 'border-slate-100 text-slate-400'}`}>UDHAAR / CREDIT</button>
            </div>

            {/* Inventory / Cart Area */}
            {isInventoryMode && (
              <div className="space-y-4">
                 <div className="grid grid-cols-[2fr_1fr_40px] gap-2">
                    <select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-[11px] font-black border-none uppercase">
                       <option value="">Select Product...</option>
                       {products.map(p => <option key={p.id} value={p.id}>{p.name} ({symbol}{type === TransactionType.INCOME ? p.sellingPrice : p.purchasePrice})</option>)}
                    </select>
                    <input type="number" value={qtyInput} onChange={e => setQtyInput(e.target.value)} placeholder="Qty" className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-[11px] font-black border-none text-center" />
                    <button type="button" onClick={addToCart} className="bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black active-scale">+</button>
                 </div>

                 {/* Cart List */}
                 {cart.length > 0 && (
                   <div className="bg-slate-50 dark:bg-slate-800/30 rounded-3xl p-4 space-y-2 border border-black/5">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Current Bill Items</p>
                      {cart.map(item => (
                        <div key={item.id} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                           <div className="flex flex-col">
                              <span className="text-[10px] font-black uppercase">{item.name}</span>
                              <span className="text-[8px] text-slate-400 font-bold">{item.quantity} x {symbol}{item.price}</span>
                           </div>
                           <div className="flex items-center gap-3">
                              <span className="text-[11px] font-black text-indigo-500">{symbol}{(item.quantity * item.price).toLocaleString()}</span>
                              <button type="button" onClick={() => removeFromCart(item.id)} className="text-rose-500 opacity-40 hover:opacity-100 font-black text-sm">×</button>
                           </div>
                        </div>
                      ))}
                   </div>
                 )}
              </div>
            )}

            {!isInventoryMode && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-[1.5rem]">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Entry Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-transparent font-black text-[12px] border-none p-0" />
                  </div>
                  <div className="space-y-1.5 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-[1.5rem]">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-transparent font-black text-[12px] border-none p-0 uppercase">
                      {categories[type].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-1.5 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-[1.5rem]">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Customer / Vendor</label>
              <select value={entityId} onChange={e => setEntityId(e.target.value)} className="w-full bg-transparent font-black text-sm border-none p-0">
                <option value="">WALKING CUSTOMER (CASH)</option>
                {entities.filter(e => type === TransactionType.INCOME ? e.type === 'CLIENT' : e.type === 'VENDOR').map(ent => <option key={ent.id} value={ent.id}>{ent.name}</option>)}
              </select>
            </div>
            
            <div className="space-y-1.5 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-[1.5rem]">
               <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Remarks</label>
               <input value={note} onChange={e => setNote(e.target.value)} className="w-full bg-transparent font-black text-sm border-none p-0" placeholder="Optional notes..." />
            </div>

            {paymentStatus === 'PAID' && (
              <div className="space-y-1.5 p-4 border-2 border-indigo-100 dark:border-indigo-900/30 rounded-[1.5rem] bg-indigo-50/20">
                <label className="text-[8px] font-black text-indigo-400 uppercase tracking-widest block">Payment Account</label>
                <select value={accountId} onChange={e => setAccountId(e.target.value)} className="w-full bg-transparent font-black text-xs border-none p-0">
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            )}
          </div>

          <button type="submit" className="w-full py-6 bg-indigo-600 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] active-scale shadow-2xl transition-all hover:bg-indigo-700">
            {cart.length > 0 ? `Finalize Bill (${cart.length} Items)` : 'Submit Transaction'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;