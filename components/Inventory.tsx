
import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { Icons as UI } from '../constants';

interface CostFactor {
  id: string;
  label: string;
  value: number;
  type: 'flat' | 'percent';
}

interface InventoryProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  currencySymbol: string;
}

const Inventory: React.FC<InventoryProps> = ({ products, setProducts, currencySymbol }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [showSmartPricing, setShowSmartPricing] = useState(false);
  const [lastGeneratedCode, setLastGeneratedCode] = useState<string | null>(null);
  const [categoryInput, setCategoryInput] = useState('');
  
  // Advanced Dynamic Pricing State
  const [costFactors, setCostFactors] = useState<CostFactor[]>([
    { id: '1', label: 'Marketing/Ads', value: 0, type: 'flat' },
    { id: '2', label: 'Shipping & Pack', value: 0, type: 'flat' }
  ]);
  
  const [pricingConfig, setPricingConfig] = useState({
    platformFee: 0,
    desiredMargin: 20
  });

  const [newP, setNewP] = useState<Partial<Product>>({ 
    name: '', 
    sku: '', 
    purchasePrice: 0, 
    sellingPrice: 0, 
    stock: 0, 
    minStock: 5,
    categories: []
  });

  // Category Tag Handlers
  const handleCategoryAdd = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && categoryInput.trim()) {
      e.preventDefault();
      const tag = categoryInput.trim().replace(',', '');
      if (!newP.categories?.includes(tag)) {
        setNewP({ ...newP, categories: [...(newP.categories || []), tag] });
      }
      setCategoryInput('');
    }
  };

  const removeCategory = (tag: string) => {
    setNewP({ ...newP, categories: newP.categories?.filter(t => t !== tag) });
  };

  // Calculate Total Overheads applied to COST
  const totalCostOverheads = useMemo(() => {
    const landedCost = newP.purchasePrice || 0;
    return costFactors.reduce((sum, factor) => {
      if (factor.type === 'flat') return sum + factor.value;
      return sum + (landedCost * (factor.value / 100));
    }, 0);
  }, [newP.purchasePrice, costFactors]);

  // Smart Pricing Engine (The SaaS Logic)
  const suggestedPrice = useMemo(() => {
    const landedCost = newP.purchasePrice || 0;
    const totalBaseCost = landedCost + totalCostOverheads;
    
    const fees = (pricingConfig.platformFee || 0) / 100;
    const margin = (pricingConfig.desiredMargin || 0) / 100;

    const denominator = 1 - fees - margin;
    if (denominator <= 0) return 0;
    
    return Math.ceil(totalBaseCost / denominator);
  }, [newP.purchasePrice, totalCostOverheads, pricingConfig]);

  const profitMargin = useMemo(() => {
    if (!newP.purchasePrice || !newP.sellingPrice) return 0;
    const profit = newP.sellingPrice - newP.purchasePrice;
    return ((profit / newP.sellingPrice) * 100).toFixed(1);
  }, [newP.purchasePrice, newP.sellingPrice]);

  const totalInventoryValue = useMemo(() => {
    return products.reduce((sum, p) => sum + (p.stock * p.purchasePrice), 0);
  }, [products]);

  const addCostFactor = () => {
    const newFactor: CostFactor = {
      id: crypto.randomUUID(),
      label: 'New Fee',
      value: 0,
      type: 'flat'
    };
    setCostFactors([...costFactors, newFactor]);
  };

  const removeCostFactor = (id: string) => {
    setCostFactors(costFactors.filter(f => f.id !== id));
  };

  const updateFactor = (id: string, updates: Partial<CostFactor>) => {
    setCostFactors(costFactors.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const applySuggestedPrice = () => {
    setNewP(prev => ({ ...prev, sellingPrice: suggestedPrice }));
    setShowSmartPricing(false);
  };

  const generateSku = (name: string) => {
    const prefix = name.substring(0, 3).toUpperCase();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${random}`;
  };

  const addProduct = () => {
    if (!newP.name) return;
    
    const finalSku = newP.sku && newP.sku.trim() !== '' 
      ? newP.sku 
      : generateSku(newP.name);

    const productWithCode = { 
      ...newP, 
      id: crypto.randomUUID(), 
      sku: finalSku,
      categories: newP.categories || []
    } as Product;

    setProducts(prev => [...prev, productWithCode]);
    setLastGeneratedCode(finalSku);
    setIsAdding(false);
    setCategoryInput('');
    setNewP({ name: '', sku: '', purchasePrice: 0, sellingPrice: 0, stock: 0, minStock: 5, categories: [] });
    
    setTimeout(() => setLastGeneratedCode(null), 8000);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* SaaS Inventory Header */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 premium-shadow border border-black/[0.02] flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tightest">Inventory</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Asset: {currencySymbol}{totalInventoryValue.toLocaleString()}</p>
          </div>
        </div>
        <button 
          onClick={() => { setIsAdding(!isAdding); setLastGeneratedCode(null); }}
          className={`h-12 w-12 rounded-2xl shadow-xl active-scale transition-all flex items-center justify-center ${isAdding ? 'bg-rose-500 text-white' : 'bg-indigo-600 text-white'}`}
        >
          {isAdding ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg> : <UI.Plus className="w-6 h-6" />}
        </button>
      </div>

      {/* Success Notification for Generated Code */}
      {lastGeneratedCode && (
        <div className="bg-emerald-500 text-white rounded-[2rem] p-6 shadow-2xl shadow-emerald-500/20 flex items-center justify-between animate-in slide-in-from-top-4 duration-500">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">Product Saved Successfully</p>
            <h4 className="text-xl font-black tracking-tightest">Code: {lastGeneratedCode}</h4>
          </div>
          <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          </div>
        </div>
      )}

      {isAdding && (
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 premium-shadow border-2 border-indigo-500/20 space-y-6 animate-in zoom-in-95 duration-300">
          <div className="space-y-3">
             <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Product Name</label>
                <input 
                  placeholder="e.g., Premium Leather Wallet" 
                  className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl py-4 px-6 font-bold text-sm border-none focus:ring-2 focus:ring-indigo-500/20" 
                  value={newP.name} 
                  onChange={e => setNewP({...newP, name: e.target.value})} 
                />
             </div>

             {/* Multi-Tag Category System */}
             <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Categories / Tags</label>
                <div className="flex flex-wrap gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl min-h-[50px] items-center">
                  {newP.categories?.map(tag => (
                    <span key={tag} className="bg-indigo-600 text-white text-[9px] font-black px-3 py-1.5 rounded-full flex items-center gap-2">
                      {tag}
                      <button onClick={() => removeCategory(tag)} className="hover:text-rose-200">×</button>
                    </span>
                  ))}
                  <input 
                    placeholder={newP.categories?.length ? "Add more..." : "Type and press Enter..."}
                    value={categoryInput}
                    onChange={e => setCategoryInput(e.target.value)}
                    onKeyDown={handleCategoryAdd}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold min-w-[120px]"
                  />
                </div>
                <p className="text-[8px] text-slate-400 ml-3 italic">Use multiple tags for advanced filtering later.</p>
             </div>

             <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">SKU / Barcode (Optional)</label>
                <input 
                  placeholder="Leave blank for auto-generation" 
                  className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl py-4 px-6 font-bold text-sm border-none" 
                  value={newP.sku} 
                  onChange={e => setNewP({...newP, sku: e.target.value})} 
                />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Unit Cost</label>
              <input 
                type="number" 
                className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl py-4 px-6 font-black text-sm border-none" 
                value={newP.purchasePrice || ''} 
                onChange={e => setNewP({...newP, purchasePrice: parseFloat(e.target.value) || 0})} 
              />
            </div>
            <div className="space-y-1 relative">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Sale Price</label>
              <input 
                type="number" 
                className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl py-4 px-6 font-black text-sm border-none" 
                value={newP.sellingPrice || ''} 
                onChange={e => setNewP({...newP, sellingPrice: parseFloat(e.target.value) || 0})} 
              />
              <button 
                onClick={() => setShowSmartPricing(!showSmartPricing)}
                className="absolute right-3 top-9 p-2 bg-indigo-500 text-white rounded-lg active-scale shadow-lg shadow-indigo-500/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
              </button>
            </div>
          </div>

          {showSmartPricing && (
            <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-[2.5rem] p-6 space-y-4 border border-indigo-100 dark:border-indigo-500/10 animate-in slide-in-from-top-4 duration-500">
               <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Cost Multipliers</p>
                  <button onClick={addCostFactor} className="text-[8px] font-black bg-indigo-200 dark:bg-indigo-800 px-2 py-1 rounded-md uppercase">+ Add Factor</button>
               </div>
               
               <div className="space-y-2">
                 {costFactors.map(factor => (
                   <div key={factor.id} className="grid grid-cols-[1fr_80px_60px_30px] gap-2 items-center">
                      <input 
                        className="bg-white dark:bg-slate-900 rounded-lg p-2 text-[10px] font-bold border-none" 
                        value={factor.label} 
                        onChange={e => updateFactor(factor.id, { label: e.target.value })} 
                      />
                      <input 
                        type="number" 
                        className="bg-white dark:bg-slate-900 rounded-lg p-2 text-[10px] font-black border-none text-right" 
                        value={factor.value} 
                        onChange={e => updateFactor(factor.id, { value: parseFloat(e.target.value) || 0 })} 
                      />
                      <select 
                        className="bg-white dark:bg-slate-900 rounded-lg p-2 text-[8px] font-black border-none"
                        value={factor.type}
                        onChange={e => updateFactor(factor.id, { type: e.target.value as any })}
                      >
                        <option value="flat">{currencySymbol}</option>
                        <option value="percent">% of Cost</option>
                      </select>
                      <button onClick={() => removeCostFactor(factor.id)} className="text-rose-400 hover:text-rose-600 font-bold">×</button>
                   </div>
                 ))}
               </div>

               <div className="grid grid-cols-2 gap-3 border-t border-indigo-200/50 pt-4">
                  <div className="space-y-1">
                    <span className="text-[8px] font-black text-slate-400 uppercase ml-2">Platform Fee (on Price)</span>
                    <input type="number" className="w-full bg-white dark:bg-slate-900 rounded-xl p-2.5 text-xs font-black border-none" placeholder="e.g. 15%" value={pricingConfig.platformFee} onChange={e => setPricingConfig({...pricingConfig, platformFee: parseFloat(e.target.value) || 0})} />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[8px] font-black text-slate-400 uppercase ml-2">Target Net Margin</span>
                    <input type="number" className="w-full bg-white dark:bg-slate-900 rounded-xl p-2.5 text-xs font-black border-none" placeholder="e.g. 30%" value={pricingConfig.desiredMargin} onChange={e => setPricingConfig({...pricingConfig, desiredMargin: parseFloat(e.target.value) || 0})} />
                  </div>
               </div>

               <div className="pt-2 flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-[8px] font-black text-slate-400 uppercase">Strategic Selling Price</p>
                    <p className="text-xl font-black text-indigo-600">{currencySymbol}{suggestedPrice.toLocaleString()}</p>
                  </div>
                  <button onClick={applySuggestedPrice} className="bg-indigo-600 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/30 active-scale">Adopt Strategy</button>
               </div>
            </div>
          )}

          {/* Business Insights Banner */}
          <div className={`p-5 rounded-[1.8rem] flex items-center justify-between transition-colors ${parseFloat(profitMargin) > 0 ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600' : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400'}`}>
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">Gross Profit Margin</span>
              <p className="text-[8px] opacity-60">Based on Final Sales Price</p>
            </div>
            <span className="font-black text-2xl">{profitMargin}%</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Current Stock</label>
              <input 
                type="number" 
                className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl py-4 px-6 font-black text-sm border-none" 
                value={newP.stock || ''} 
                onChange={e => setNewP({...newP, stock: parseFloat(e.target.value) || 0})} 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Reorder Threshold</label>
              <input 
                type="number" 
                className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl py-4 px-6 font-black text-sm border-none" 
                value={newP.minStock || ''} 
                onChange={e => setNewP({...newP, minStock: parseFloat(e.target.value) || 0})} 
              />
            </div>
          </div>

          <button 
            onClick={addProduct} 
            className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-600/30 active-scale"
          >
            Deploy Product Entry
          </button>
        </div>
      )}

      {/* Catalog Display */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Active Catalog ({products.length})</p>
          <div className="h-1 w-12 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
        </div>
        
        {products.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-300">
             <UI.Inventory className="w-16 h-16 opacity-10 mb-4" />
             <p className="text-[10px] font-black uppercase tracking-widest">Warehouse Awaiting Initial Intake</p>
          </div>
        ) : (
          products.map(p => {
            const isLowStock = p.stock <= p.minStock;
            return (
              <div key={p.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 premium-shadow border border-black/[0.02] flex items-center justify-between group animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${isLowStock ? 'bg-rose-50 text-rose-500 border border-rose-100' : 'bg-slate-50 dark:bg-slate-800 text-indigo-500'}`}>
                    <UI.Inventory className="w-7 h-7" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="font-black text-base text-slate-900 dark:text-white leading-tight truncate">{p.name}</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {p.categories?.length > 0 ? p.categories.map(cat => (
                        <span key={cat} className="text-[7px] font-black bg-slate-100 dark:bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full uppercase">
                          {cat}
                        </span>
                      )) : (
                        <span className="text-[7px] font-black text-slate-300 italic">No Tags</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right flex items-center gap-6">
                  <div className="flex flex-col items-end">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-xl font-black ${isLowStock ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>{p.stock}</span>
                      <span className="text-[8px] font-black text-slate-400 uppercase">Unit</span>
                    </div>
                    <p className="text-[10px] font-black text-indigo-500 mt-1">{currencySymbol}{p.sellingPrice.toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={() => setProducts(prev => prev.filter(item => item.id !== p.id))} 
                    className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all active-scale flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Inventory;
