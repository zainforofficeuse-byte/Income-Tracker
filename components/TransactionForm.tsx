
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

  // Searchable Category Dropdown Logic
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const [catSearch, setCatSearch] = useState('');

  const filteredCategories = useMemo(() => {
    return (categories[type] || []).filter(c => c.toLowerCase().includes(catSearch.toLowerCase()));
  }, [categories, type, catSearch]);

  useEffect(() => {
    if (type !== TransactionType.TRANSFER && !isInventoryMode) {
      setCategory(categories[type][0] || '');
      setCatSearch('');
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
    <div className="animate-slide-up w-full max-w-2xl mx-auto h-full flex flex-col pt-4 pb-40">
      <form onSubmit={handleSubmit} className="space-y-6 w-full px-4">
        
        {/* Toggle POS / Direct */}
        <div className="flex justify-center shrink-0">
          <div className="bg-emerald-50 dark:bg-emerald-950/30 p-1.5 rounded-[1.8rem] flex gap-1 border border-emerald-500/10 backdrop-blur-sm">
            <button type="button" onClick={() => { setIsInventoryMode(false); setCart([]); }} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${!isInventoryMode ? 'bg-white dark:bg-emerald-600 shadow-xl text-emerald-600 dark:text-white' : 'text-slate-400'}`}>Direct Entry</button>
            <button type="button" onClick={() => setIsInventoryMode(true)} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isInventoryMode ? 'bg-white dark:bg-emerald-600 shadow-xl text-emerald-600 dark:text-white' : 'text-slate-400'}`}>POS Terminal</button>
          </div>
        </div>

        {/* Master Total Display */}
        <div className="text-center px-6 shrink-0 py-12 bg-white dark:bg-slate-900 rounded-[3.5rem] border border-black/5 dark:border-white/5 relative overflow-hidden premium-shadow">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 block">Calculated Master Total</label>
          <div className="flex items-center justify-center gap-2 w-full relative">
             <span className="text-3xl font-black text-emerald-600 dark:text-emerald-500 opacity-30">{symbol}</span>
             <input 
              type="number" 
              placeholder="0.00" 
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
              className="w-full bg-transparent border-none text-center text-7xl md:text-8xl font-black focus:ring-0 text-slate-900 dark:text-white tracking-tightest" 
              readOnly={isInventoryMode && cart.length > 0}
             />
          </div>
        </div>

        {/* Form Controls */}
        <div className="space-y-6">
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-3xl border border-black/5 dark:border-white/5">
            <button type="button" onClick={() => setType(TransactionType.INCOME)} className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${type === TransactionType.INCOME ? 'bg-emerald-600 text-white shadow-xl' : 'text-slate-400'}`}>Inbound Revenue</button>
            <button type="button" onClick={() => setType(TransactionType.EXPENSE)} className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${type === TransactionType.EXPENSE ? 'bg-rose-500 text-white shadow-xl' : 'text-slate-400'}`}>Outbound Costs</button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-12 border border-black/5 dark:border-white/5 space-y-8 premium-shadow relative">
            
            {/* Terminology Restored */}
            <div className="flex gap-4">
               <button type="button" onClick={() => setPaymentStatus('PAID')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${paymentStatus === 'PAID' ? 'bg-slate-900 dark:bg-emerald-600 border-slate-900 dark:border-emerald-600 text-white' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}>Paid</button>
               <button type="button" onClick={() => setPaymentStatus('CREDIT')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${paymentStatus === 'CREDIT' ? 'bg-slate-50 dark:bg-rose-900/10 border-slate-900 dark:border-rose-500/20 text-slate-900 dark:text-rose-500' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}>Credit</button>
            </div>

            {isInventoryMode && (
              <div className="space-y-4">
                 <div className="grid grid-cols-[2fr_1fr_60px] gap-3">
                    <select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 text-xs font-black border-none uppercase text-slate-900 dark:text-white appearance-none">
                       <option value="">Search Product...</option>
                       {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.stock})</option>)}
                    </select>
                    <input type="number" value={qtyInput} onChange={e => setQtyInput(e.target.value)} placeholder="Qty" className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 text-xs font-black border-none text-center text-slate-900 dark:text-white" />
                    <button type="button" onClick={addToCart} className="bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-black active-scale shadow-lg">+</button>
                 </div>

                 {cart.length > 0 && (
                   <div className="bg-emerald-50/20 dark:bg-emerald-950/10 rounded-[2rem] p-6 space-y-4 border border-emerald-500/10">
                      {cart.map(item => (
                        <div key={item.id} className="flex items-center justify-between py-2 border-b border-emerald-500/5 last:border-0">
                           <div className="flex flex-col">
                              <span className="text-[10px] font-black uppercase text-slate-900 dark:text-white">{item.name}</span>
                              <span className="text-[9px] text-emerald-600 font-bold uppercase">{item.quantity} Units × {symbol}{item.price.toLocaleString()}</span>
                           </div>
                           <div className="flex items-center gap-4">
                              <span className="text-[12px] font-black text-slate-900 dark:text-white">{symbol}{(item.quantity * item.price).toLocaleString()}</span>
                              <button type="button" onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-rose-500 font-black text-2xl px-2">×</button>
                           </div>
                        </div>
                      ))}
                   </div>
                 )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-black/5 dark:border-white/5">
                <label className="text-[8px] font-black text-emerald-600 uppercase tracking-widest block mb-1">Authorization Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-transparent font-black text-sm border-none p-0 text-slate-900 dark:text-white" />
              </div>

              {!isInventoryMode && (
                <div className="space-y-1.5 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-black/5 dark:border-white/5 relative">
                  <label className="text-[8px] font-black text-emerald-600 uppercase tracking-widest block mb-1">Searchable Category</label>
                  <div 
                    onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)} 
                    className="w-full font-black text-sm uppercase text-slate-900 dark:text-white cursor-pointer flex justify-between items-center"
                  >
                    {category || 'Select...'}
                    <span className="text-[8px] opacity-30">▼</span>
                  </div>
                  
                  {isCatDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 z-[60] bg-white dark:bg-slate-900 rounded-3xl premium-shadow border border-black/5 p-4 mt-2 max-h-60 overflow-y-auto no-scrollbar animate-in slide-in-from-top-2">
                       <input 
                        value={catSearch} 
                        onChange={e => setCatSearch(e.target.value)} 
                        onClick={e => e.stopPropagation()} 
                        className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-[10px] font-black border-none uppercase mb-2 sticky top-0" 
                        placeholder="Search Categories..." 
                       />
                       {filteredCategories.map(cat => (
                         <button 
                          key={cat} 
                          type="button" 
                          onClick={() => { setCategory(cat); setIsCatDropdownOpen(false); }}
                          className="w-full text-left py-3 px-4 rounded-xl text-[10px] font-black uppercase hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-slate-700 dark:text-slate-300 transition-colors"
                         >
                           {cat}
                         </button>
                       ))}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-1.5 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-black/5 dark:border-white/5 md:col-span-2">
                <label className="text-[8px] font-black text-emerald-600 uppercase tracking-widest block mb-1">Registered Counterparty</label>
                <select value={entityId} onChange={e => setEntityId(e.target.value)} className="w-full bg-transparent font-black text-sm border-none p-0 text-slate-900 dark:text-white appearance-none">
                  <option value="">GENERAL MARKET COUNTERPARTY</option>
                  {entities.filter(e => type === TransactionType.INCOME ? e.type === 'CLIENT' : e.type === 'VENDOR').map(ent => <option key={ent.id} value={ent.id}>{ent.name}</option>)}
                </select>
              </div>

              {paymentStatus === 'PAID' && (
                <div className="space-y-1.5 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-black/5 dark:border-white/5 md:col-span-2">
                  <label className="text-[8px] font-black text-emerald-600 uppercase tracking-widest block mb-1">Source Account</label>
                  <select value={accountId} onChange={e => setAccountId(e.target.value)} className="w-full bg-transparent font-black text-sm border-none p-0 text-slate-900 dark:text-white appearance-none">
                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({symbol}{acc.balance.toLocaleString()})</option>)}
                  </select>
                </div>
              )}
              
              <div className="space-y-1.5 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-black/5 dark:border-white/5 md:col-span-2">
                 <label className="text-[8px] font-black text-emerald-600 uppercase tracking-widest block mb-1">Transaction Metadata / Context</label>
                 <input value={note} onChange={e => setNote(e.target.value)} className="w-full bg-transparent font-black text-sm border-none p-0 text-slate-900 dark:text-white" placeholder="Specific notes or remarks..." />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full py-8 bg-emerald-600 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] active-scale shadow-2xl shadow-emerald-500/20 transition-all hover:bg-emerald-700">
            {cart.length > 0 ? `Finalize Batch (${cart.length} Units)` : 'Authorize Ledger Flow'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
