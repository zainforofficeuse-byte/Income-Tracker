
import React from 'react';
import { SystemLog } from '../types';

interface SystemLogsProps {
  logs: SystemLog[];
  onClear: () => void;
}

const SystemLogs: React.FC<SystemLogsProps> = ({ logs, onClear }) => {
  const exportLogs = () => {
    const logText = logs.map(l => `[${l.timestamp}] [${l.level}] [${l.module}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(logText);
    alert('System Diagnostic Logs copied to clipboard! You can now paste and send them to the developer.');
  };

  return (
    <div className="space-y-6 animate-slide-up pb-20">
      <div className="flex justify-between items-center px-2">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tightest">Diagnostic Center</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Ecosystem Audit Logs</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportLogs} className="px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-emerald-100 active-scale">Copy Log Data</button>
          <button onClick={onClear} className="px-6 py-3 bg-rose-50 text-rose-500 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-rose-100 active-scale">Flush Logs</button>
        </div>
      </div>

      <div className="bg-slate-900 rounded-[3rem] p-8 premium-shadow border border-white/5 font-mono">
        <div className="space-y-3 max-h-[65vh] overflow-y-auto no-scrollbar scroll-smooth">
          {logs.length > 0 ? logs.map(log => (
            <div key={log.id} className="flex gap-4 border-b border-white/5 pb-3 hover:bg-white/5 transition-colors p-2 rounded-lg">
              <span className="text-[9px] text-slate-500 shrink-0 font-bold">{new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}</span>
              <span className={`text-[9px] font-black shrink-0 w-16 text-center rounded px-1 ${
                log.level === 'ERROR' ? 'bg-rose-500/20 text-rose-500' : 
                log.level === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-500' : 
                log.level === 'WARN' ? 'bg-amber-500/20 text-amber-500' : 'bg-indigo-500/20 text-indigo-400'
              }`}>[{log.level}]</span>
              <span className="text-[9px] text-slate-500 shrink-0 uppercase w-16 border-l border-white/10 pl-2">[{log.module}]</span>
              <span className="text-[10px] text-slate-300 leading-tight flex-1">{log.message}</span>
            </div>
          )) : (
            <div className="py-24 text-center text-slate-600">
               <p className="text-[11px] font-black uppercase tracking-[0.4em] italic opacity-40">System Healthy. No current diagnostic interrupts.</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-6 rounded-[2rem] border border-emerald-500/10">
         <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-2 text-center">Troubleshooting Guide</p>
         <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center leading-relaxed">
           Agar system sync nahi kar raha, to "Copy Log Data" par click karein aur diagnostic data mujhe provide karein. Humara communication gap logs ke zariye khatam hoga.
         </p>
      </div>
    </div>
  );
};

export default SystemLogs;
