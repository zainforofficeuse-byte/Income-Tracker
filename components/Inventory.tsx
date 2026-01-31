
import React, { useState, useEffect, useRef } from 'react';
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

const Inventory: React.FC<InventoryProps> = ({ products, setProducts, currencySymbol, globalSettings, activeCompanyId }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newP, setNewP] = useState<Partial<Product>>({ 
    name: '', sku: '', purchasePrice: 0, sellingPrice: 0, stock: 0, minStock: 5, categories: [], imageUrl: undefined
  });

  useEffect(() => {
    if (globalSettings.pricingRules.autoApply && newP.purchasePrice && newP.purchasePrice > 0) {
      const rules = globalSettings.pricingRules;
      let calculatedPrice = newP.purchasePrice + (newP.purchasePrice * (rules.variableOverheadPercent / 100)) + rules.fixedOverhead;
      const denominator = 1 - (rules.platformFeePercent / 100) - (rules.targetMarginPercent / 100);
      if (denominator > 0) calculatedPrice = calculatedPrice / denominator;
      setNewP(prev => ({ ...prev, sellingPrice: Math.ceil(calculatedPrice) }));
    }
  }, [newP.purchasePrice, globalSettings.pricingRules]);

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
          contents: { parts: [{ inlineData: { data: base64Data, mimeType: file.type } }, { text: "Identify this product name accurately. Return ONLY the product title." }] }
        });
        if (response.text) setNewP(prev => ({ ...prev, name: response.text.trim() }));
      } catch (err) { console.error(err); } finally { setIsScanning(false); }
    };
    reader.readAsDataURL(file);
  };

  const saveProduct = () => {
    if (!newP.name) return;
    if (editingId) {
      setProducts(prev => prev.map(p => p.id === editingId ? { ...p, ...newP } as Product : p));
      setEditingId(null);
    } else {
      const finalProduct: Product = { ...newP, id: crypto.randomUUID(), companyId: activeCompanyId, sku: newP.sku || `SKU-${Date.now().toString(36).toUpperCase()}`, categories: newP.categories || [], purchasePrice: newP.purchasePrice || 0, sellingPrice: newP.sellingPrice || 0, stock: newP.stock || 0, minStock: newP.minStock || 5, name: newP.name || 'Unnamed Product', imageUrl: newP.imageUrl } as Product;
      setProducts(prev => [...prev, finalProduct]);
    }
    setIsAdding(false);
    setNewP({ name: '', sku: '', purchasePrice: 0, sellingPrice: 0, stock: 0, minStock: 5, categories: [], imageUrl: undefined });
  };

  const toggleCategory = (tag: string) => {
    const current = newP.categories || [];
    if (current.includes(tag)) setNewP({ ...newP, categories: current.filter(t => t !== tag) });
    else setNewP({ ...newP, categories: [...current, tag] });
  };

  return (
    <div className="space-y-6 animate-slide-up pb-32">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 premium-shadow border border-black/[0.02] flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tightest">Inventory</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Stock Management</p>
        </div>
        <button onClick={() => { setIsAdding(!isAdding); setEditingId(null); }} className={`h-12 w-12 rounded-2xl shadow-xl active-scale flex items-center justify-center ${isAdding ? 'bg-rose-500 text-white' : 'bg-indigo-600 text-white'}`}>
          {isAdding ? '×' : <UI.Plus className="w-6 h-6" />}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 premium-shadow border-2 border-indigo-500/10 space-y-6 animate-in zoom-in-95">
          <div className="flex flex-col items-center gap-4">
             <div className="relative w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-[1.5rem] overflow-hidden">
                {newP.imageUrl ? <img src={newP.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><UI.Inventory className="w-8 h-8" /></div>}
             </div>
             <button type="button" onClick={() => fileInputRef.current?.click()} className="px-5 py-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl text-[9px] font-black uppercase active-scale">
               {isScanning ? 'Scanning...' : 'AI Photo Scan'}
             </button>
             <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleCapture} />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Product Name</label>
            <input placeholder="Item title..." className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl py-4 px-6 font-bold text-sm border-none" value={newP.name} onChange={e => setNewP({...newP, name: e.target.value})} />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Inventory Tags (Global)</label>
            <div className="flex flex-wrap gap-2 p-2">
               {globalSettings.inventoryCategories.map(tag => (
                 <button key={tag} onClick={() => toggleCategory(tag)} className={`px-4 py-2 rounded-full text-[9px] font-black uppercase border transition-all ${newP.categories?.includes(tag) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-100'}`}>
                   {tag}
                 </button>
               ))}
               {globalSettings.inventoryCategories.length === 0 && <p className="text-[8px] italic text-slate-300">Add tags in Settings first</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 ml-3">Cost</label><input type="number" className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl py-4 px-6 font-black text-sm border-none" value={newP.purchasePrice || ''} onChange={e => setNewP({...newP, purchasePrice: parseFloat(e.target.value) || 0})} /></div>
             <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 ml-3">Retail</label><input type="number" className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl py-4 px-6 font-black text-sm border-none" value={newP.sellingPrice || ''} onChange={e => setNewP({...newP, sellingPrice: parseFloat(e.target.value) || 0})} /></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 ml-3">Stock</label><input type="number" className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl py-4 px-6 font-black text-sm border-none" value={newP.stock || ''} onChange={e => setNewP({...newP, stock: parseFloat(e.target.value) || 0})} /></div>
             <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 ml-3">Alert</label><input type="number" className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl py-4 px-6 font-black text-sm border-none" value={newP.minStock || ''} onChange={e => setNewP({...newP, minStock: parseFloat(e.target.value) || 0})} /></div>
          </div>

          <button onClick={saveProduct} className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase shadow-xl active-scale">{editingId ? 'Update' : 'Add Item'}</button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {products.map(p => (
          <div key={p.id} className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 premium-shadow border border-black/[0.01] flex items-center justify-between group active-scale" onClick={() => { setNewP(p); setEditingId(p.id); setIsAdding(true); }}>
            <div className="flex items-center gap-4">
               <div className="h-14 w-14 rounded-2xl bg-slate-50 dark:bg-slate-800 overflow-hidden flex items-center justify-center">
                 {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover" /> : <UI.Inventory className="w-7 h-7 text-indigo-500" />}
               </div>
               <div>
                 <h4 className="font-black text-sm">{p.name}</h4>
                 <div className="flex gap-1 mt-1">
                   {p.categories.map(c => <span key={c} className="text-[7px] font-black bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 uppercase">{c}</span>)}
                 </div>
               </div>
            </div>
            <div className="text-right">
               <p className={`font-black text-base ${p.stock <= p.minStock ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>{p.stock} Units</p>
               <p className="text-[9px] font-black text-indigo-500">{currencySymbol}{p.sellingPrice.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Inventory;
