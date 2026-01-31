
import React, { useState, useEffect, useMemo } from 'react';
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
  
  const [isInventoryMode, setIsInventoryMode] = useState(true);
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
    
    const cartDetails = cart.map(i => `${i.name} (${i.quantity}x${i.price})`).join(', ');
    const finalNote = cart.length > 0 ? `${note ? note + ' | ' : ''}Cart: ${cartDetails}` : note;

    onAdd({
      amount: finalVal,
      type,
      category: isInventoryMode ? (type === TransactionType.INCOME ? 'Product Sales' : 'Inventory Purchase') : category,
      note: finalNote,
      accountId: paymentStatus === 'PAID' ? accountId : '', 
      entityId,
      productId: cart.length === 1 ? cart[0].productId : undefined, 
      quantity: cart.length === 1 ? cart[0].quantity : undefined,
      cart: cart.length > 1 ? cart : undefined,
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
        
        <div className="flex justify-center shrink-0">
          <div className="bg-emerald-50 dark:bg-emerald-950 p-1 rounded-2xl flex gap-1 border border-emerald-500/10">
            <button type="button" onClick={() => { setIsInventoryMode(false); setCart([]); }} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isInventoryMode ? 'bg-white dark:bg-emerald-800 shadow-sm text-emerald-600' : 'text-slate-400'}`}>Direct Entry</button>
            <button type="button" onClick={() => setIsInventoryMode(true)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isInventoryMode ? 'bg-white dark:bg-emerald-800 shadow-sm text-emerald-600' : 'text-slate-400'}`}>POS Sales</button>
          </div>
        </div>

        <div className="text-center px-4 shrink-0 py-10 bg-white dark:bg-slate-900 rounded-[3rem] border border-emerald-500/5 mx-2 relative overflow-hidden shadow-sm">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">Calculated Total</label>
          <div className="flex items-center justify-center gap-1 w-full relative">
             <span className="text-3xl font-black text-emerald-100 dark:text-emerald-900">{symbol}</span>
             <input 
              type="number" 
              placeholder="0.00" 
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
              className="w-full bg-transparent border-none text-center text-6xl md:text-7xl font-black focus:ring-0 text-emerald-600 dark:text-emerald-500 tracking-tightest" 
              readOnly={isInventoryMode && cart.length > 0}
             />
          </div>
        </div>

        <div className="space-y-4 px-2">
          <div className="flex bg-emerald-50/50 dark:bg-emerald-950/50 p-1.5 rounded-full border border-emerald-500/10">
            <button type="button" onClick={() => setType(TransactionType.INCOME)} className={`flex-1 py-4 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${type === TransactionType.INCOME ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/20' : 'text-slate-400'}`}>Inbound</button>
            <button type="button" onClick={() => setType(TransactionType.EXPENSE)} className={`flex-1 py-4 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${type === TransactionType.EXPENSE ? 'bg-emerald-100 text-emerald-800' : 'text-slate-400'}`}>Outbound</button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 md:p-10 border border-emerald-500/5 space-y-6">
            
            <div className="flex gap-3">
               <button type="button" onClick={() => setPaymentStatus('PAID')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${paymentStatus === 'PAID' ? 'bg-emerald-950 border-emerald-950 text-white' : 'border-slate-100 text-slate-400'}`}>Settled</button>
               <button type="button" onClick={() => setPaymentStatus('CREDIT')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${paymentStatus === 'CREDIT' ? 'bg-emerald-50 border-emerald-950 text-emerald-900' : 'border-slate-100 text-slate-400'}`}>Accrued</button>
            </div>

            {isInventoryMode && (
              <div className="space-y-4">
                 <div className="grid grid-cols-[2fr_1fr_45px] gap-2">
                    <select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-[11px] font-black border-none uppercase text-emerald-900 dark:text-emerald-100">
                       <option value="">Search Unit...</option>
                       {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <input type="number" value={qtyInput} onChange={e => setQtyInput(e.target.value)} placeholder="Qty" className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-[11px] font-black border-none text-center" />
                    <button type="button" onClick={addToCart} className="bg-emerald-600 text-white rounded-xl flex items-center justify-center font-black active-scale">+</button>
                 </div>

                 {cart.length > 0 && (
                   <div className="bg-emerald-50/30 dark:bg-emerald-900/10 rounded-3xl p-5 space-y-3 border border-emerald-500/10">
                      {cart.map(item => (
                        <div key={item.id} className="flex items-center justify-between py-2 border-b border-emerald-500/5 last:border-0">
                           <div className="flex flex-col">
                              <span className="text-[10px] font-black uppercase text-emerald-900 dark:text-emerald-100">{item.name}</span>
                              <span className="text-[8px] text-emerald-600 font-bold">{item.quantity} units</span>
                           </div>
                           <div className="flex items-center gap-3">
                              <span className="text-[11px] font-black text-emerald-900 dark:text-emerald-100">{symbol}{(item.quantity * item.price).toLocaleString()}</span>
                              <button type="button" onClick={() => removeFromCart(item.id)} className="text-emerald-900 opacity-30 font-black text-lg">×</button>
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
                  <div className="space-y-1.5 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                    <label className="text-[8px] font-black text-emerald-600 uppercase tracking-widest block">Ledger Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-transparent font-black text-[12px] border-none p-0" />
                  </div>
                  <div className="space-y-1.5 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                    <label className="text-[8px] font-black text-emerald-600 uppercase tracking-widest block">Header</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-transparent font-black text-[12px] border-none p-0 uppercase">
                      {categories[type].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-1.5 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
              <label className="text-[8px] font-black text-emerald-600 uppercase tracking-widest block">Counterparty</label>
              <select value={entityId} onChange={e => setEntityId(e.target.value)} className="w-full bg-transparent font-black text-sm border-none p-0">
                <option value="">GENERIC COUNTERPARTY</option>
                {entities.filter(e => type === TransactionType.INCOME ? e.type === 'CLIENT' : e.type === 'VENDOR').map(ent => <option key={ent.id} value={ent.id}>{ent.name}</option>)}
              </select>
            </div>
            
            <div className="space-y-1.5 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
               <label className="text-[8px] font-black text-emerald-600 uppercase tracking-widest block">Metadata</label>
               <input value={note} onChange={e => setNote(e.target.value)} className="w-full bg-transparent font-black text-sm border-none p-0" placeholder="Transaction context..." />
            </div>
          </div>

          <button type="submit" className="w-full py-7 bg-emerald-600 text-white rounded-full font-black text-xs uppercase tracking-[0.4em] active-scale shadow-2xl shadow-emerald-500/20 transition-all hover:bg-emerald-700">
            {cart.length > 0 ? `Finalize Bill (${cart.length})` : 'Authorize Flow'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
