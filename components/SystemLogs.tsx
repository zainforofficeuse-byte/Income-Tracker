
import React from 'react';
import { SystemLog } from '../types';

interface SystemLogsProps {
  logs: SystemLog[];
  onClear: () => void;
}

const SystemLogs: React.FC<SystemLogsProps> = ({ logs, onClear }) => {
  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex justify-between items-center px-2">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tightest">Diagnostic Logs</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">System Health Audit</p>
        </div>
        <button onClick={onClear} className="px-6 py-3 bg-rose-50 text-rose-500 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-rose-100 active-scale">Clear Log File</button>
      </div>

      <div className="bg-slate-900 rounded-[3rem] p-8 premium-shadow border border-white/5 font-mono">
        <div className="space-y-3 max-h-[60vh] overflow-y-auto no-scrollbar">
          {logs.length > 0 ? logs.map(log => (
            <div key={log.id} className="flex gap-4 border-b border-white/5 pb-3">
              <span className="text-[9px] text-slate-500 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
              <span className={`text-[9px] font-bold shrink-0 w-16 ${
                log.level === 'ERROR' ? 'text-rose-500' : 
                log.level === 'SUCCESS' ? 'text-emerald-500' : 
                log.level === 'WARN' ? 'text-amber-500' : 'text-indigo-400'
              }`}>[{log.level}]</span>
              <span className="text-[9px] text-slate-400 shrink-0 uppercase w-16">[{log.module}]</span>
              <span className="text-[10px] text-slate-300 leading-tight">{log.message}</span>
            </div>
          )) : (
            <div className="py-20 text-center text-slate-600">
               <p className="text-[10px] font-black uppercase tracking-widest italic">Ecosystem Status: Optimized. No active logs.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemLogs;
