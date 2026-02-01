
import React, { useState, useMemo } from 'react';
import { Entity, Transaction, TransactionType } from '../types';
import { Icons } from '../constants';

interface PartiesProps {
  entities: Entity[];
  setEntities: React.Dispatch<React.SetStateAction<Entity[]>>;
  currencySymbol: string;
  transactions: Transaction[];
  activeCompanyId: string;
  isReadOnly?: boolean;
}

const Parties: React.FC<PartiesProps> = ({ entities, setEntities, currencySymbol, transactions, activeCompanyId, isReadOnly }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newEnt, setNewEnt] = useState<Partial<Entity>>({ name: '', phone: '', balance: 0, type: 'CLIENT' });
  const [filterType, setFilterType] = useState<'CLIENT' | 'VENDOR'>('CLIENT');
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  const addEntity = () => {
    if (isReadOnly || !newEnt.name) return;
    const finalEntity: Entity = {
      ...newEnt,
      id: crypto.randomUUID(),
      companyId: activeCompanyId,
      balance: parseFloat(newEnt.balance?.toString() || '0'),
      type: filterType,
      phone: newEnt.phone || '',
      name: newEnt.name || ''
    } as Entity;
    
    setEntities(prev => [...prev, finalEntity]);
    setNewEnt({ name: '', phone: '', balance: 0, type: filterType });
    setIsAdding(false);
  };

  const totalReceivable = useMemo(() => entities.filter(e => e.type === 'CLIENT').reduce((sum, e) => sum + e.balance, 0), [entities]);
  const totalPayable = useMemo(() => entities.filter(e => e.type === 'VENDOR').reduce((sum, e) => sum + Math.abs(e.balance), 0), [entities]);

  const selectedEntity = useMemo(() => entities.find(e => e.id === selectedEntityId), [entities, selectedEntityId]);
  const entityTransactions = useMemo(() => transactions.filter(t => t.entityId === selectedEntityId), [transactions, selectedEntityId]);

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Summary Analytics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-500/20 flex flex-col items-center">
          <p className="text-[8px] font-black text-emerald-600 uppercase mb-1 tracking-widest">Total Receivables</p>
          <p className="text-xl font-black text-emerald-600">{currencySymbol}{totalReceivable.toLocaleString()}</p>
        </div>
        <div className="bg-rose-50 dark:bg-rose-900/10 p-6 rounded-[2.5rem] border border-rose-100 dark:border-rose-500/20 flex flex-col items-center">
          <p className="text-[8px] font-black text-rose-600 uppercase mb-1 tracking-widest">Total Payables</p>
          <p className="text-xl font-black text-rose-600">{currencySymbol}{totalPayable.toLocaleString()}</p>
        </div>
      </div>

      {/* Toggle View */}
      <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl">
         <button onClick={() => setFilterType('CLIENT')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterType === 'CLIENT' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Customers</button>
         <button onClick={() => setFilterType('VENDOR')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterType === 'VENDOR' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Vendors</button>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-2">
          <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{filterType} Ledger</h3>
          {!isReadOnly && (
              <button onClick={() => setIsAdding(!isAdding)} className={`h-10 w-10 text-white rounded-xl flex items-center justify-center shadow-lg active-scale transition-all ${isAdding ? 'bg-rose-500 rotate-45' : 'bg-indigo-600'}`}>
                <Icons.Add className="w-5 h-5" />
              </button>
          )}
      </div>

      {/* Restored Fields in Addition Form */}
      {isAdding && !isReadOnly && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] premium-shadow border-2 border-indigo-500/10 space-y-6 animate-in zoom-in-95 duration-300">
           <div className="space-y-4">
             <div className="space-y-1.5">
               <label className="text-[9px] font-black text-indigo-600 uppercase tracking-widest ml-3">Full Legal Name</label>
               <input 
                value={newEnt.name} 
                onChange={e => setNewEnt({...newEnt, name: e.target.value})} 
                className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 font-black text-sm border-none text-slate-900 dark:text-white" 
                placeholder="e.g. Azeem Traders Ltd" 
               />
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                 <label className="text-[9px] font-black text-indigo-600 uppercase tracking-widest ml-3">Contact Number</label>
                 <input 
                  value={newEnt.phone} 
                  onChange={e => setNewEnt({...newEnt, phone: e.target.value})} 
                  className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 font-black text-sm border-none text-slate-900 dark:text-white" 
                  placeholder="+92 XXX XXXXXXX" 
                 />
               </div>
               <div className="space-y-1.5">
                 <label className="text-[9px] font-black text-indigo-600 uppercase tracking-widest ml-3">Opening Balance</label>
                 <input 
                  type="number" 
                  value={newEnt.balance} 
                  onChange={e => setNewEnt({...newEnt, balance: parseFloat(e.target.value) || 0})} 
                  className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 font-black text-sm border-none text-slate-900 dark:text-white" 
                  placeholder="0.00" 
                 />
               </div>
             </div>
           </div>
           <div className="flex gap-2">
             <button onClick={addEntity} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest active-scale shadow-xl">Authorize Account</button>
             <button onClick={() => setIsAdding(false)} className="px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl text-[10px] font-black uppercase">Cancel</button>
           </div>
        </div>
      )}

      {/* List Feed */}
      <div className="space-y-3">
        {entities.filter(e => e.type === filterType).map(ent => (
          <button 
            key={ent.id} 
            onClick={() => setSelectedEntityId(ent.id)}
            className="w-full bg-white dark:bg-slate-900 rounded-[2rem] p-5 premium-shadow border border-black/[0.02] dark:border-white/5 flex items-center justify-between group active-scale text-left transition-all"
          >
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-indigo-500 dark:text-indigo-400 font-black text-lg uppercase border border-black/5 dark:border-white/5">
                 {ent.name[0]}
               </div>
               <div>
                 <h4 className="font-black text-sm text-slate-900 dark:text-white">{ent.name}</h4>
                 <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{ent.phone || 'No Contact Record'}</p>
               </div>
            </div>
            <div className="text-right">
              <p className={`font-black text-base ${ent.balance > 0 ? 'text-emerald-500' : ent.balance < 0 ? 'text-rose-500' : 'text-slate-300 dark:text-slate-700'}`}>
                {currencySymbol}{Math.abs(ent.balance).toLocaleString()}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Statement Modal */}
      {selectedEntityId && selectedEntity && (
        <div className="fixed inset-0 z-[100] flex flex-col p-6 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xl" onClick={() => setSelectedEntityId(null)} />
           <div className="relative flex-1 bg-white dark:bg-slate-900 rounded-[3rem] p-8 premium-shadow border border-white/20 dark:border-white/5 overflow-hidden flex flex-col animate-in slide-in-from-bottom-10">
              <div className="flex justify-between items-start mb-8">
                 <div>
                    <h3 className="text-2xl font-black tracking-tightest text-slate-900 dark:text-white">{selectedEntity.name}</h3>
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{selectedEntity.type} STATEMENT</p>
                 </div>
                 <button onClick={() => setSelectedEntityId(null)} className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white flex items-center justify-center font-black active-scale shadow-sm">×</button>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
                 {entityTransactions.length > 0 ? entityTransactions.map(tx => (
                   <div key={tx.id} className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl flex items-center justify-between border border-black/5 dark:border-white/5">
                      <div>
                        <p className="text-[11px] font-black uppercase text-slate-900 dark:text-white">{tx.category}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase">{new Date(tx.date).toLocaleDateString()}</p>
                      </div>
                      <p className={`font-black text-sm ${tx.type === TransactionType.INCOME ? 'text-emerald-500' : 'text-rose-500'}`}>
                         {tx.type === TransactionType.INCOME ? '+' : '-'}{currencySymbol}{tx.amount.toLocaleString()}
                      </p>
                   </div>
                 )) : (
                   <div className="py-20 text-center opacity-20">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No transaction history recorded</p>
                   </div>
                 )}
              </div>
              <button onClick={() => setSelectedEntityId(null)} className="w-full py-5 mt-6 bg-slate-900 dark:bg-indigo-600 text-white rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest active-scale">Close Ledger Statement</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default Parties;
