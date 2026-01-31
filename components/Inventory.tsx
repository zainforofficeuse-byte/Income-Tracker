
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Product, UserSettings } from '../types';
import { Icons as UI } from '../constants';
import { GoogleGenAI } from "@google/genai";

interface InventoryProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  currencySymbol: string;
  globalSettings: UserSettings;
  onNewTags: (tags: string[]) => void;
  activeCompanyId: string;
}

const Inventory: React.FC<InventoryProps> = ({ products, setProducts, currencySymbol, globalSettings, onNewTags, activeCompanyId }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newP, setNewP] = useState<Partial<Product>>({ 
    name: '', 
    sku: '', 
    purchasePrice: 0, 
    sellingPrice: 0, 
    stock: 0, 
    minStock: 5,
    categories: [],
    imageUrl: undefined
  });

  useEffect(() => {
    if (globalSettings.pricingRules.autoApply && newP.purchasePrice && newP.purchasePrice > 0) {
      const rules = globalSettings.pricingRules;
      let calculatedPrice = newP.purchasePrice + 
                          (newP.purchasePrice * (rules.variableOverheadPercent / 100)) + 
                          rules.fixedOverhead;
      
      const fees = rules.platformFeePercent / 100;
      const margin = rules.targetMarginPercent / 100;
      const denominator = 1 - fees - margin;
      
      if (denominator > 0) {
        calculatedPrice = calculatedPrice / denominator;
      }

      rules.customAdjustments.forEach(adj => {
        if (!adj.isEnabled) return;
        if (adj.type === 'FIXED') {
          calculatedPrice += adj.value;
        } else {
          calculatedPrice += (calculatedPrice * (adj.value / 100));
        }
      });

      setNewP(prev => ({ ...prev, sellingPrice: Math.ceil(calculatedPrice) }));
    }
  }, [newP.purchasePrice, globalSettings.pricingRules]);

  const profitMargin = useMemo(() => {
    if (!newP.purchasePrice || !newP.sellingPrice) return 0;
    const profit = newP.sellingPrice - newP.purchasePrice;
    return ((profit / newP.sellingPrice) * 100).toFixed(1);
  }, [newP.purchasePrice, newP.sellingPrice]);

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = (reader.result as string).split(',')[1];
      setNewP(prev => ({ ...prev, imageUrl: reader.result as string }));

      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: {
            parts: [
              { inlineData: { data: base64Data, mimeType: file.type } },
              { text: "Look at this product. Identify its brand and product name accurately. Return ONLY the name of the product, no other text." }
            ]
          }
        });

        if (response.text) {
          setNewP(prev => ({ ...prev, name: response.text.trim() }));
        }
      } catch (err) {
        console.error("AI Scan Error:", err);
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const addProduct = () => {
    if (!newP.name) return;
    const finalSku = newP.sku && newP.sku.trim() !== '' ? newP.sku : `SKU-${Math.random().toString(36).substring(7).toUpperCase()}`;
    
    const finalProduct: Product = {
      ...newP,
      id: crypto.randomUUID(),
      companyId: activeCompanyId,
      sku: finalSku,
      categories: newP.categories || [],
      purchasePrice: newP.purchasePrice || 0,
      sellingPrice: newP.sellingPrice || 0,
      stock: newP.stock || 0,
      minStock: newP.minStock || 5,
      name: newP.name || 'Unnamed Product',
      imageUrl: newP.imageUrl
    } as Product;

    setProducts(prev => [...prev, finalProduct]);
    onNewTags(newP.categories || []);
    setIsAdding(false);
    setNewP({ name: '', sku: '', purchasePrice: 0, sellingPrice: 0, stock: 0, minStock: 5, categories: [], imageUrl: undefined });
  };

  return (
    <div className="space-y-6 animate-slide-up pb-32">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 premium-shadow border border-black/[0.02] flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tightest">Inventory</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">Company Stock Control</p>
        </div>
        <button onClick={() => setIsAdding(!isAdding)} className={`h-12 w-12 rounded-2xl shadow-xl active-scale transition-all flex items-center justify-center ${isAdding ? 'bg-rose-500 text-white' : 'bg-indigo-600 text-white'}`}>
          {isAdding ? '×' : <UI.Plus className="w-6 h-6" />}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 premium-shadow border-2 border-indigo-500/10 space-y-6 animate-in zoom-in-95 duration-300">
          
          <div className="flex flex-col items-center gap-4">
             <div className="relative w-32 h-32 bg-slate-100 dark:bg-slate-800 rounded-[2rem] overflow-hidden group">
                {newP.imageUrl ? (
                  <img src={newP.imageUrl} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                  </div>
                )}
                {isScanning && (
                  <div className="absolute inset-0 bg-indigo-600/40 backdrop-blur-sm flex items-center justify-center">
                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
             </div>
             
             <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleCapture} />
             
             <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl text-[9px] font-black uppercase tracking-widest active-scale border border-indigo-100 dark:border-indigo-900/30"
             >
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
               {isScanning ? 'AI Scanning...' : 'AI Photo Scan'}
             </button>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Product Title</label>
            <input placeholder="e.g. Premium Cotton Shirt" className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl py-4 px-6 font-bold text-sm border-none focus:ring-2 focus:ring-indigo-500/20" value={newP.name} onChange={e => setNewP({...newP, name: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Purchase Cost</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300">{currencySymbol}</span>
                <input type="number" className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl py-4 pl-10 pr-4 font-black text-sm border-none border-2 border-indigo-500/5 focus:ring-2 focus:ring-indigo-500/20" value={newP.purchasePrice || ''} onChange={e => setNewP({...newP, purchasePrice: parseFloat(e.target.value) || 0})} />
              </div>
            </div>
            <div className="space-y-1 relative">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Retail Price</label>
              <div className="relative">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300">{currencySymbol}</span>
                <input type="number" className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl py-4 pl-10 pr-12 font-black text-sm border-none focus:ring-2 focus:ring-indigo-500/20" value={newP.sellingPrice || ''} onChange={e => setNewP({...newP, sellingPrice: parseFloat(e.target.value) || 0})} />
              </div>
              <p className={`text-[8px] font-black uppercase tracking-widest mt-1 ml-2 ${parseFloat(profitMargin.toString()) > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {profitMargin}% Estimated Margin
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Open Stock</label>
              <input type="number" className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl py-4 px-6 font-black text-sm border-none" value={newP.stock || ''} onChange={e => setNewP({...newP, stock: parseFloat(e.target.value) || 0})} />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Alert Threshold</label>
              <input type="number" className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl py-4 px-6 font-black text-sm border-none" value={newP.minStock || ''} onChange={e => setNewP({...newP, minStock: parseFloat(e.target.value) || 0})} />
            </div>
          </div>

          <button onClick={addProduct} className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest active-scale shadow-xl shadow-indigo-500/20">Add to Catalog</button>
        </div>
      )}

      <div className="space-y-4">
        {products.length > 0 ? (
          products.map(p => (
            <div key={p.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 premium-shadow border border-black/[0.01] dark:border-white/5 flex items-center justify-between group hover:border-indigo-500/20 transition-all duration-500">
              <div className="flex items-center gap-5">
                <div className={`h-14 w-14 rounded-[1.5rem] flex items-center justify-center shadow-inner transition-all duration-500 overflow-hidden ${p.stock <= p.minStock ? 'bg-rose-50 text-rose-500 rotate-12' : 'bg-slate-50 dark:bg-slate-800 text-indigo-500 group-hover:rotate-6'}`}>
                  {p.imageUrl ? (
                    <img src={p.imageUrl} className="w-full h-full object-cover" />
                  ) : (
                    <UI.Inventory className="w-7 h-7" />
                  )}
                </div>
                <div>
                  <h4 className="font-black text-[15px] tracking-tight">{p.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{p.sku}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-200"></span>
                    <span className="text-[9px] font-black text-indigo-400 uppercase">Cost: {currencySymbol}{p.purchasePrice}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-black text-lg leading-tight ${p.stock <= p.minStock ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>{p.stock} Units</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-[8px] font-black text-slate-400 uppercase">MRP</span>
                  <span className="text-[11px] font-black text-indigo-500 tracking-tight">{currencySymbol}{p.sellingPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-24 flex flex-col items-center justify-center gap-4 opacity-30 grayscale">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-400 flex items-center justify-center">
               <UI.Inventory className="w-8 h-8" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Inventory Empty</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;
