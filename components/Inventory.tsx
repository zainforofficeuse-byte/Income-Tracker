
import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  isReadOnly?: boolean;
}

const Inventory: React.FC<InventoryProps> = ({ products, setProducts, currencySymbol, globalSettings, activeCompanyId, isReadOnly }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [tagSearch, setTagSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newP, setNewP] = useState<Partial<Product>>({ 
    name: '', sku: '', purchasePrice: 0, sellingPrice: 0, stock: 0, minStock: 5, categories: [], imageUrl: undefined
  });

  // POS Engine Auto-Calculation (RESTORED & ENHANCED)
  useEffect(() => {
    if (globalSettings.pricingRules.autoApply && newP.purchasePrice && newP.purchasePrice > 0) {
      const rules = globalSettings.pricingRules;
      
      // 1. Calculate base cost with fixed/variable overhead
      let calculatedPrice = newP.purchasePrice + (newP.purchasePrice * (rules.variableOverheadPercent / 100)) + rules.fixedOverhead;
      
      // 2. Factor in Custom Adjustments
      rules.customAdjustments.filter(adj => adj.isEnabled).forEach(adj => {
        if (adj.type === 'FIXED') calculatedPrice += adj.value;
        else calculatedPrice += (newP.purchasePrice * (adj.value / 100));
      });

      // 3. Apply Margin and Fees
      const denominator = 1 - (rules.platformFeePercent / 100) - (rules.targetMarginPercent / 100);
      if (denominator > 0) calculatedPrice = calculatedPrice / denominator;
      
      setNewP(prev => ({ ...prev, sellingPrice: Math.ceil(calculatedPrice) }));
    }
  }, [newP.purchasePrice, globalSettings.pricingRules]);

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) return;
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
          contents: { parts: [{ inlineData: { data: base64Data, mimeType: file.type } }, { text: "Identify this product name accurately. Return ONLY the title." }] }
        });
        if (response.text) setNewP(prev => ({ ...prev, name: response.text.trim() }));
      } catch (err) { console.error(err); } finally { setIsScanning(false); }
    };
    reader.readAsDataURL(file);
  };

  const saveProduct = () => {
    if (isReadOnly || !newP.name) return;
    if (editingId) {
      setProducts(prev => prev.map(p => p.id === editingId ? { ...p, ...newP } as Product : p));
      setEditingId(null);
    } else {
      const finalProduct: Product = { 
        ...newP, 
        id: crypto.randomUUID(), 
        companyId: activeCompanyId, 
        sku: newP.sku || `SKU-${Date.now().toString(36).toUpperCase()}`, 
        categories: newP.categories || [], 
        purchasePrice: newP.purchasePrice || 0, 
        sellingPrice: newP.sellingPrice || 0, 
        stock: newP.stock || 0, 
        minStock: newP.minStock || 5, 
        name: newP.name || 'Unnamed Product', 
        imageUrl: newP.imageUrl 
      } as Product;
      setProducts(prev => [...prev, finalProduct]);
    }
    setIsAdding(false);
    setNewP({ name: '', sku: '', purchasePrice: 0, sellingPrice: 0, stock: 0, minStock: 5, categories: [], imageUrl: undefined });
  };

  const toggleCategory = (tag: string) => {
    if (isReadOnly) return;
    const current = newP.categories || [];
    if (current.includes(tag)) setNewP({ ...newP, categories: current.filter(t => t !== tag) });
    else setNewP({ ...newP, categories: [...current, tag] });
  };

  const filteredTags = useMemo(() => {
    return globalSettings.inventoryCategories.filter(t => t.toLowerCase().includes(tagSearch.toLowerCase()));
  }, [globalSettings.inventoryCategories, tagSearch]);

  return (
    <div className="space-y-6 animate-slide-up pb-32">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 premium-shadow border border-black/[0.02] flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tightest text-slate-900 dark:text-white">Inventory</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Stock Portfolio Management</p>
        </div>
        {!isReadOnly && (
            <button onClick={() => { setIsAdding(!isAdding); setEditingId(null); setNewP({ name: '', sku: '', purchasePrice: 0, sellingPrice: 0, stock: 0, minStock: 5, categories: [], imageUrl: undefined }); }} className={`h-12 w-12 rounded-2xl shadow-xl active-scale flex items-center justify-center transition-all ${isAdding ? 'bg-rose-500 text-white rotate-45' : 'bg-emerald-600 text-white'}`}>
              <UI.Plus className="w-6 h-6" />
            </button>
        )}
      </div>

      {isAdding && !isReadOnly && (
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 premium-shadow border-2 border-emerald-500/10 space-y-8 animate-in zoom-in-95">
          <div className="flex flex-col items-center gap-4">
             <div className="relative w-32 h-32 bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] overflow-hidden flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-xl">
                {newP.imageUrl ? <img src={newP.imageUrl} className="w-full h-full object-cover" /> : <UI.Inventory className="w-10 h-10 text-slate-300" />}
             </div>
             <button type="button" onClick={() => fileInputRef.current?.click()} className="px-6 py-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest active-scale">
               {isScanning ? 'Vision Scanning...' : 'Scan Product Metadata'}
             </button>
             <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleCapture} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Product Name</label>
              <input placeholder="Item Label" className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl py-4 px-6 font-bold text-sm border-none text-slate-900 dark:text-white" value={newP.name} onChange={e => setNewP({...newP, name: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Asset Code (SKU)</label>
              <input placeholder="Serial / Code" className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl py-4 px-6 font-bold text-sm border-none text-slate-900 dark:text-white" value={newP.sku} onChange={e => setNewP({...newP, sku: e.target.value})} />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Business Categories</label>
            <input 
              type="text" 
              placeholder="Filter tags..." 
              value={tagSearch} 
              onChange={e => setTagSearch(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 rounded-2xl p-3 text-xs font-black border-none"
            />
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto no-scrollbar p-1">
               {filteredTags.map(tag => (
                 <button key={tag} onClick={() => toggleCategory(tag)} className={`px-5 py-2.5 rounded-full text-[9px] font-black uppercase border-2 transition-all ${newP.categories?.includes(tag) ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-transparent text-slate-400 border-slate-100 dark:border-slate-800'}`}>
                   {tag}
                 </button>
               ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 ml-3 uppercase">Stock On Hand</label>
                <input type="number" className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl py-4 px-6 font-black text-sm border-none text-slate-900 dark:text-white" value={newP.stock || ''} onChange={e => setNewP({...newP, stock: parseFloat(e.target.value) || 0})} />
             </div>
             <div className="space-y-1.5">
                <label className="text-[9px] font-black text-rose-500 ml-3 uppercase tracking-tighter">Low Stock Alert Level</label>
                <input type="number" className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl py-4 px-6 font-black text-sm border-none text-slate-900 dark:text-white" value={newP.minStock || ''} onChange={e => setNewP({...newP, minStock: parseFloat(e.target.value) || 0})} />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 ml-3 uppercase">Purchase Unit Cost</label>
                <input type="number" className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl py-4 px-6 font-black text-sm border-none text-rose-500" value={newP.purchasePrice || ''} onChange={e => setNewP({...newP, purchasePrice: parseFloat(e.target.value) || 0})} />
             </div>
             <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 ml-3 uppercase">Retail Price (Calculated)</label>
                <input type="number" className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl py-4 px-6 font-black text-sm text-emerald-500 border-none" value={newP.sellingPrice || ''} onChange={e => setNewP({...newP, sellingPrice: parseFloat(e.target.value) || 0})} />
             </div>
          </div>

          <div className="flex gap-2">
            <button onClick={saveProduct} className="flex-1 py-6 bg-emerald-600 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-widest shadow-xl active-scale">
              {editingId ? 'Save Record' : 'Enroll Asset'}
            </button>
            {editingId && (
              <button onClick={() => { if(confirm('Purge from inventory?')) { setProducts(prev => prev.filter(p => p.id !== editingId)); setIsAdding(false); setEditingId(null); } }} className="px-8 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-[2.5rem] font-black text-[9px] uppercase active-scale">Delete</button>
            )}
          </div>
        </div>
      )}

      {/* Product List */}
      <div className="grid grid-cols-1 gap-4">
        {products.map(p => (
          <div key={p.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 premium-shadow border border-black/[0.01] flex items-center justify-between group cursor-pointer active-scale transition-all" onClick={() => { if(!isReadOnly) { setNewP(p); setEditingId(p.id); setIsAdding(true); } }}>
            <div className="flex items-center gap-5">
               <div className="h-16 w-16 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 overflow-hidden flex items-center justify-center border border-black/5">
                 {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover" /> : <UI.Inventory className="w-7 h-7 text-emerald-600" />}
               </div>
               <div>
                 <h4 className="font-black text-sm text-slate-900 dark:text-white">{p.name}</h4>
                 <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{p.sku}</span>
                    <div className="flex gap-1">
                      {p.categories.slice(0, 2).map(c => <span key={c} className="text-[7px] font-black bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded text-emerald-600 uppercase tracking-tighter">{c}</span>)}
                      {p.categories.length > 2 && <span className="text-[7px] font-black bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-400 uppercase tracking-tighter">+{p.categories.length - 2}</span>}
                    </div>
                 </div>
               </div>
            </div>
            <div className="text-right">
               <div className="flex flex-col items-end">
                  <span className={`text-xl font-black leading-none ${p.stock <= p.minStock ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>{p.stock}</span>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Available</span>
               </div>
               <p className="text-[11px] font-black text-emerald-600 mt-2">{currencySymbol}{p.sellingPrice.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Inventory;
