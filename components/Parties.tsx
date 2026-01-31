
import React, { useState, useMemo } from 'react';
import { Entity, Transaction, TransactionType } from '../types';
import { Icons } from '../constants';

interface PartiesProps {
  entities: Entity[];
  setEntities: React.Dispatch<React.SetStateAction<Entity[]>>;
  currencySymbol: string;
  transactions: Transaction[];
}

const Parties: React.FC<PartiesProps> = ({ entities, setEntities, currencySymbol, transactions }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newEnt, setNewEnt] = useState<Partial<Entity>>({ name: '', type: 'CLIENT', balance: 0 });
  const [filterType, setFilterType] = useState<'CLIENT' | 'VENDOR'>('CLIENT');

  const addEntity = () => {
    if (!newEnt.name) return;
    setEntities(prev => [...prev, { ...newEnt, id: crypto.randomUUID(), balance: 0 } as Entity]);
    setNewEnt({ name: '', type: filterType, balance: 0 });
    setIsAdding(false);
  };

  const totalReceivable = useMemo(() => entities.filter(e => e.type === 'CLIENT').reduce((sum, e) => sum + e.balance, 0), [entities]);
  const totalPayable = useMemo(() => entities.filter(e => e.type === 'VENDOR').reduce((sum, e) => sum + Math.abs(e.balance), 0), [entities]);

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Debt Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-[2.5rem] border border-emerald-100 flex flex-col items-center">
          <p className="text-[8px] font-black text-emerald-600 uppercase mb-1">Receivables</p>
          <p className="text-xl font-black text-emerald-600">{currencySymbol}{totalReceivable.toLocaleString()}</p>
        </div>
        <div className="bg-rose-50 dark:bg-rose-900/10 p-6 rounded-[2.5rem] border border-rose-100 flex flex-col items-center">
          <p className="text-[8px] font-black text-rose-600 uppercase mb-1">Payables</p>
          <p className="text-xl font-black text-rose-600">{currencySymbol}{totalPayable.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl">
         <button onClick={() => setFilterType('CLIENT')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterType === 'CLIENT' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Customers</button>
         <button onClick={() => setFilterType('VENDOR')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterType === 'VENDOR' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Vendors</button>
      </div>

      <div className="flex items-center justify-between px-2">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">{filterType} Ledger</h3>
          <button onClick={() => setIsAdding(!isAdding)} className="h-10 w-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg active-scale">
            {isAdding ? '×' : '+'}
          </button>
      </div>

      {isAdding && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] premium-shadow border-2 border-indigo-500/10 space-y-4 animate-in zoom-in-95 duration-300">
           <div className="space-y-1">
             <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Full Name</label>
             <input value={newEnt.name} onChange={e => setNewEnt({...newEnt, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 font-black text-sm border-none" placeholder="e.g. Azeem Traders" />
           </div>
           <div className="grid grid-cols-2 gap-3">
             <div className="space-y-1">
               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Contact</label>
               <input value={newEnt.phone} onChange={e => setNewEnt({...newEnt, phone: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 font-black text-sm border-none" placeholder="03xx-xxxxxxx" />
             </div>
             <div className="space-y-1">
               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Initial Bal</label>
               <input type="number" value={newEnt.balance} onChange={e => setNewEnt({...newEnt, balance: parseFloat(e.target.value) || 0})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 font-black text-sm border-none" placeholder="0" />
             </div>
           </div>
           <button onClick={addEntity} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest active-scale shadow-xl">Create Account</button>
        </div>
      )}

      <div className="space-y-3">
        {entities.filter(e => e.type === filterType).map(ent => (
          <div key={ent.id} className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 premium-shadow border border-black/[0.02] flex items-center justify-between group">
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-indigo-500 font-black text-lg uppercase">{ent.name[0]}</div>
               <div>
                 <h4 className="font-black text-sm">{ent.name}</h4>
                 <p className="text-[9px] text-slate-400 font-bold uppercase">{ent.phone || 'No Contact'}</p>
               </div>
            </div>
            <div className="text-right">
              <p className={`font-black text-base ${ent.balance > 0 ? 'text-emerald-500' : ent.balance < 0 ? 'text-rose-500' : 'text-slate-300'}`}>
                {currencySymbol}{Math.abs(ent.balance).toLocaleString()}
              </p>
              <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">
                {ent.balance > 0 ? 'Receivable' : ent.balance < 0 ? 'Payable' : 'Clear'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Parties;
