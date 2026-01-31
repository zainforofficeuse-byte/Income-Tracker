
import React, { useState, useMemo, useEffect } from 'react';
import { Product, UserSettings } from '../types';
import { Icons as UI } from '../constants';

interface InventoryProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  currencySymbol: string;
  globalSettings: UserSettings;
  onNewTags: (tags: string[]) => void;
}

const Inventory: React.FC<InventoryProps> = ({ products, setProducts, currencySymbol, globalSettings, onNewTags }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [showSmartPricing, setShowSmartPricing] = useState(false);

  const [newP, setNewP] = useState<Partial<Product>>({ 
    name: '', 
    sku: '', 
    purchasePrice: 0, 
    sellingPrice: 0, 
    stock: 0, 
    minStock: 5,
    categories: []
  });

  // AUTO-PILOT LOGIC: Whenever purchase price changes, calculate selling price if autoApply is on
  useEffect(() => {
    if (globalSettings.pricingRules.autoApply && newP.purchasePrice && newP.purchasePrice > 0) {
      const rules = globalSettings.pricingRules;
      const landedCost = newP.purchasePrice + (newP.purchasePrice * (rules.variableOverheadPercent / 100)) + rules.fixedOverhead;
      const fees = rules.platformFeePercent / 100;
      const margin = rules.targetMarginPercent / 100;
      const denominator = 1 - fees - margin;
      
      if (denominator > 0) {
        const suggested = Math.ceil(landedCost / denominator);
        setNewP(prev => ({ ...prev, sellingPrice: suggested }));
      }
    }
  }, [newP.purchasePrice, globalSettings.pricingRules]);

  const profitMargin = useMemo(() => {
    if (!newP.purchasePrice || !newP.sellingPrice) return 0;
    const profit = newP.sellingPrice - newP.purchasePrice;
    return ((profit / newP.sellingPrice) * 100).toFixed(1);
  }, [newP.purchasePrice, newP.sellingPrice]);

  const addProduct = () => {
    if (!newP.name) return;
    const finalSku = newP.sku && newP.sku.trim() !== '' ? newP.sku : `SKU-${Math.random().toString(36).substring(7).toUpperCase()}`;
    setProducts(prev => [...prev, { ...newP, id: crypto.randomUUID(), sku: finalSku, categories: newP.categories || [] } as Product]);
    onNewTags(newP.categories || []);
    setIsAdding(false);
    setNewP({ name: '', sku: '', purchasePrice: 0, sellingPrice: 0, stock: 0, minStock: 5, categories: [] });
  };

  return (
    <div className="space-y-6 animate-slide-up pb-32">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 premium-shadow border border-black/[0.02] flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tightest">Inventory</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Catalog & Stock Control</p>
        </div>
        <button onClick={() => setIsAdding(!isAdding)} className={`h-12 w-12 rounded-2xl shadow-xl active-scale transition-all flex items-center justify-center ${isAdding ? 'bg-rose-500 text-white' : 'bg-indigo-600 text-white'}`}>
          {isAdding ? '×' : <UI.Plus className="w-6 h-6" />}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 premium-shadow border-2 border-indigo-500/10 space-y-6 animate-in zoom-in-95 duration-300">
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Product Name</label>
            <input placeholder="Item Name" className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl py-4 px-6 font-bold text-sm border-none" value={newP.name} onChange={e => setNewP({...newP, name: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Purchase Price (Cost)</label>
              <input type="number" className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl py-4 px-6 font-black text-sm border-none border-2 border-indigo-500/10" value={newP.purchasePrice || ''} onChange={e => setNewP({...newP, purchasePrice: parseFloat(e.target.value) || 0})} />
            </div>
            <div className="space-y-1 relative">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Selling Price</label>
              <div className="relative">
                <input type="number" className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl py-4 px-6 font-black text-sm border-none pr-12" value={newP.sellingPrice || ''} onChange={e => setNewP({...newP, sellingPrice: parseFloat(e.target.value) || 0})} />
                <div className={`absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${globalSettings.pricingRules.autoApply ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  <UI.Admin className="w-4 h-4" />
                </div>
              </div>
              <p className={`text-[8px] font-black uppercase tracking-widest mt-1 ml-2 ${parseFloat(profitMargin.toString()) > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {profitMargin}% Profit Margin
              </p>
            </div>
          </div>

          {globalSettings.pricingRules.autoApply && (
             <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest text-center py-2 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl">
               ★ Global Pricing Master Rules Active
             </p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Current Stock</label>
              <input type="number" className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl py-4 px-6 font-black text-sm border-none" value={newP.stock || ''} onChange={e => setNewP({...newP, stock: parseFloat(e.target.value) || 0})} />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Min Alert</label>
              <input type="number" className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl py-4 px-6 font-black text-sm border-none" value={newP.minStock || ''} onChange={e => setNewP({...newP, minStock: parseFloat(e.target.value) || 0})} />
            </div>
          </div>

          <button onClick={addProduct} className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest active-scale">Save Product</button>
        </div>
      )}

      <div className="space-y-4">
        {products.map(p => (
          <div key={p.id} className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 premium-shadow border border-black/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${p.stock <= p.minStock ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-indigo-500'}`}>
                <UI.Inventory className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-sm">{p.name}</h4>
                <p className="text-[9px] font-bold text-slate-400 uppercase">{p.sku}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-black text-base ${p.stock <= p.minStock ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>{p.stock} Units</p>
              <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest">{currencySymbol}{p.sellingPrice.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Inventory;
