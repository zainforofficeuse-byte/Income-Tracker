
import React, { useMemo, useState } from 'react';
import { Transaction, Account, UserSettings, TransactionType } from '../types';
import { Icons } from '../constants';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

interface DashboardProps {
  transactions: Transaction[];
  accounts: Account[];
  settings: UserSettings;
  currencySymbol: string;
}

type TimeRange = '7d' | '1m' | '1y';

const colorMap: Record<string, { text: string, bg: string, icon: string }> = {
  indigo: { text: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-600', icon: 'bg-indigo-50 dark:bg-indigo-900/20' },
  emerald: { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-600', icon: 'bg-emerald-50 dark:bg-emerald-900/20' },
  rose: { text: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-600', icon: 'bg-rose-50 dark:bg-rose-900/20' },
  amber: { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-600', icon: 'bg-amber-50 dark:bg-amber-900/20' },
  blue: { text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-600', icon: 'bg-blue-50 dark:bg-blue-900/20' },
};

const Dashboard: React.FC<DashboardProps> = ({ transactions, accounts, settings, currencySymbol }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  
  const totalBalance = useMemo(() => accounts.reduce((sum, a) => sum + a.balance, 0), [accounts]);
  
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthTxs = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const revenue = monthTxs
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = monthTxs
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);

    const margin = revenue > 0 ? ((revenue - expense) / revenue) * 100 : 0;

    return { revenue, expense, margin };
  }, [transactions]);

  const historyData = useMemo(() => {
    const now = new Date();
    const data = [];
    let points = timeRange === '7d' ? 7 : timeRange === '1m' ? 30 : 12;
    let step = timeRange === '1y' ? 'month' : 'day';

    for (let i = points - 1; i >= 0; i--) {
      const pointDate = new Date(now);
      if (step === 'day') {
        pointDate.setDate(now.getDate() - i);
      } else {
        pointDate.setMonth(now.getMonth() - i);
      }
      
      const futureTransactions = transactions.filter(t => new Date(t.date) > pointDate);
      const diff = futureTransactions.reduce((acc, t) => {
        return acc + (t.type === TransactionType.INCOME ? -t.amount : t.amount);
      }, 0);

      data.push({
        index: i,
        balance: totalBalance + diff
      });
    }
    return data;
  }, [transactions, totalBalance, timeRange]);

  return (
    <div className="space-y-12 animate-slide-up">
      {/* Operating Cash Display */}
      <div className="flex flex-col items-center justify-center pt-8">
        <div className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-full mb-5 flex items-center gap-2">
           <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
           <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Total Operating Liquidity</span>
        </div>
        <div className="flex items-start justify-center gap-1">
          <span className="text-3xl font-black text-slate-300 dark:text-slate-700 mt-2 tracking-tighter">{currencySymbol}</span>
          <h2 className="text-7xl font-black tracking-tightest text-slate-900 dark:text-white leading-none">
            {totalBalance.toLocaleString(undefined, { minimumFractionDigits: 0 })}
          </h2>
        </div>
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mt-6">Financial Position</p>
      </div>

      {/* P&L Snapshot Matrix */}
      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 premium-shadow border border-black/[0.02] dark:border-white/5 flex flex-col items-center text-center">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Gross Revenue</p>
          <p className="text-2xl font-black text-emerald-500">
            {currencySymbol}{stats.revenue.toLocaleString()}
          </p>
          <div className="mt-4 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-full text-[9px] font-black text-emerald-600 uppercase tracking-widest">Current Month</div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 premium-shadow border border-black/[0.02] dark:border-white/5 flex flex-col items-center text-center">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Net Margin</p>
          <p className={`text-2xl font-black ${stats.margin >= 0 ? 'text-indigo-600' : 'text-rose-500'}`}>
            {stats.margin.toFixed(1)}%
          </p>
          <div className="mt-4 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 rounded-full text-[9px] font-black text-indigo-600 uppercase tracking-widest">Efficiency</div>
        </div>
      </div>

      {/* Trend Analysis */}
      <div className="bg-slate-900 dark:bg-black rounded-[3.5rem] p-10 text-white premium-shadow relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black tracking-tightest">Cash Flow Trend</h3>
            <div className="flex bg-white/5 p-1 rounded-full backdrop-blur-3xl ring-1 ring-white/10">
              {(['7d', '1m', '1y'] as TimeRange[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-4 py-2 text-[9px] font-black rounded-full transition-all duration-700 ${timeRange === r ? 'bg-white text-slate-950 shadow-lg' : 'text-slate-400'}`}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-48 w-full -ml-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData}>
                <defs>
                  <linearGradient id="glowGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#818cf8" 
                  strokeWidth={5}
                  fillOpacity={1} 
                  fill="url(#glowGradient)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Account Distribution */}
      <div className="px-1">
        <div className="flex items-center justify-between mb-6 px-1">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Managed Account Portfolio</h4>
        </div>
        
        <div className="grid grid-cols-1 gap-5">
          {accounts.map(acc => {
            const colors = colorMap[acc.color] || colorMap.indigo;
            return (
              <div key={acc.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-7 flex items-center justify-between premium-shadow border border-black/[0.01] dark:border-white/5 group hover:border-indigo-500/20 transition-all active:scale-[0.98]">
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-[1.4rem] flex items-center justify-center transition-transform group-hover:scale-110 duration-500 ${colors.icon}`}>
                    <div className={`w-6 h-6 rounded-lg ${colors.bg} opacity-20 absolute`}></div>
                    <Icons.Dashboard className={`w-6 h-6 relative ${colors.text}`} />
                  </div>
                  <div>
                    <p className="text-[15px] font-black text-slate-900 dark:text-white leading-tight">{acc.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${colors.bg}`}></div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{acc.type}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black tracking-tightest text-slate-900 dark:text-white">
                    {currencySymbol}{acc.balance.toLocaleString()}
                  </p>
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">Status: Liquid</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
