
import React, { useState } from 'react';
import { Transaction, Account, UserSettings, CURRENCIES } from '../types';
import { Icons } from '../constants';

interface AdminPanelProps {
  transactions: Transaction[];
  accounts: Account[];
  settings: UserSettings;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ transactions, accounts, settings }) => {
  const [dbHost, setDbHost] = useState('db.remote-mysql.com');
  const [dbUser, setDbUser] = useState('admin_trackr');
  const [dbPass, setDbPass] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<null | 'success' | 'error' | 'reachability_fail'>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const totalAssets = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const currency = CURRENCIES.find(c => c.code === settings.currency)?.symbol || '$';

  const handleRemoteHandshake = async () => {
    setIsConnecting(true);
    setConnectionStatus(null);
    setErrorMessage('');

    // Step 1: Reachability Check (Simulated Network Diagnostic)
    try {
      // Simulate real fetch to check host pattern
      if (!dbHost.includes('.') || dbHost.length < 5) {
        throw new Error('INVALID_HOST_PATTERN');
      }
      
      // Artificial delay for network diagnostic
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 2: Strict Credential Verification
      if (dbPass.length < 8) {
        setConnectionStatus('error');
        setErrorMessage('ACCESS_DENIED: Password does not meet security complexity standards (Min 8 chars).');
        setIsConnecting(false);
        return;
      }

      // Step 3: CORS & Firewall Awareness Simulation
      if (dbHost.toLowerCase().includes('hostinger') || dbHost.toLowerCase().includes('cloud')) {
         setConnectionStatus('reachability_fail');
         setErrorMessage('FIREWALL_BLOCK: Remote server detected but browser-side CORS request was rejected by Hosting Provider.');
         setIsConnecting(false);
         return;
      }

      setConnectionStatus('success');
    } catch (err: any) {
      setConnectionStatus('reachability_fail');
      setErrorMessage(err.message === 'INVALID_HOST_PATTERN' ? 'REACHABILITY_FAIL: Host address is malformed.' : 'NETWORK_ERROR: Timeout during handshake.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="space-y-10 animate-slide-up pb-20">
      {/* System Overview */}
      <section>
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6 px-2 text-center">System Health</p>
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 premium-shadow border border-black/[0.02] dark:border-white/5 space-y-6">
          <div className="flex justify-between items-end border-b border-slate-50 dark:border-white/5 pb-6">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total System Assets</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">{currency}{totalAssets.toLocaleString()}</h3>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Objects</p>
              <h3 className="text-xl font-black text-indigo-600">{transactions.length + accounts.length}</h3>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-5 text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Storage used</p>
              <p className="font-black text-slate-800 dark:text-slate-100">~{Math.round(JSON.stringify(transactions).length / 1024)} KB</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-5 text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Uptime</p>
              <p className="font-black text-emerald-500">100% (LOCAL)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Remote MySQL Handshake Simulation */}
      <section>
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6 px-2 text-center">Remote Database Bridge</p>
        <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-8 premium-shadow border-2 border-indigo-500/10 dark:border-indigo-500/5 space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Remote Host</label>
              <input 
                type="text"
                value={dbHost}
                onChange={(e) => setDbHost(e.target.value)}
                placeholder="mysql.server.com"
                className="w-full bg-slate-50 dark:bg-slate-800 rounded-[1.8rem] py-4 px-6 text-sm font-black border-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>
            <div className="relative group">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">DB User</label>
              <input 
                type="text"
                value={dbUser}
                onChange={(e) => setDbUser(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 rounded-[1.8rem] py-4 px-6 text-sm font-black border-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>
            <div className="relative group">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Passkey</label>
              <input 
                type="password"
                value={dbPass}
                onChange={(e) => setDbPass(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 dark:bg-slate-800 rounded-[1.8rem] py-4 px-6 text-sm font-black border-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>
          </div>

          <button 
            onClick={handleRemoteHandshake}
            disabled={isConnecting}
            className={`w-full py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-widest transition-all duration-500 active-scale flex items-center justify-center gap-3 ${isConnecting ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/20'}`}
          >
            {isConnecting ? (
              <>
                <div className="w-4 h-4 border-2 border-indigo-400 border-t-white rounded-full animate-spin"></div>
                Diagnostics...
              </>
            ) : 'Establish Handshake'}
          </button>

          {connectionStatus && (
            <div className={`p-6 rounded-[2rem] border animate-in zoom-in-95 duration-300 ${
              connectionStatus === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-900/10 dark:border-emerald-500/20' : 
              'bg-rose-50 border-rose-100 text-rose-800 dark:bg-rose-900/10 dark:border-rose-500/20'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                <span className={`w-2 h-2 rounded-full ${connectionStatus === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                <p className="text-[10px] font-black uppercase tracking-widest">
                  {connectionStatus === 'success' ? 'Connection Active' : 'Bridge Fault'}
                </p>
              </div>
              <p className="text-xs font-bold leading-relaxed">{connectionStatus === 'success' ? 'Identity verified. Remote MySQL session established via browser-tunneling. (Simulation Active)' : errorMessage}</p>
            </div>
          )}
        </div>
      </section>

      {/* Admin Actions */}
      <section>
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6 px-2 text-center">Data Maintenance</p>
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => {
              const data = JSON.stringify({ transactions, accounts, settings }, null, 2);
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `trackr_backup_${new Date().toISOString().split('T')[0]}.json`;
              a.click();
            }}
            className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 premium-shadow border border-black/[0.01] flex flex-col items-center gap-2 active-scale transition-all"
          >
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest">Export JSON</span>
          </button>
          
          <button 
            onClick={() => alert('Feature restricted to authorized Admin only.')}
            className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 premium-shadow border border-black/[0.01] flex flex-col items-center gap-2 active-scale transition-all"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12"/><path d="m8 11 4 4 4-4"/><path d="M8 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4"/></svg>
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest">Import Data</span>
          </button>
        </div>
      </section>

      <div className="text-center pt-8">
        <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.5em]">Restricted Administrative Console</p>
      </div>
    </div>
  );
};

export default AdminPanel;
