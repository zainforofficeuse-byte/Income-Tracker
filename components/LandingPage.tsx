
import React from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  return (
    <div className="h-screen w-full bg-white dark:bg-[#030712] overflow-y-auto scroll-smooth">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 px-8 py-6 flex justify-between items-center glass border-b border-emerald-500/5">
        <h1 className="text-2xl font-black tracking-tightest">TRACKR<span className="text-emerald-500">.</span></h1>
        <div className="flex gap-4">
          <button onClick={onLogin} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-600 transition-colors px-4 py-2">Sign In</button>
          <button onClick={onGetStarted} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest active-scale shadow-lg shadow-emerald-500/10">Get Access</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-48 pb-24 px-8 text-center max-w-6xl mx-auto">
        <div className="inline-block px-5 py-2 bg-emerald-50 dark:bg-emerald-950 rounded-full mb-12 animate-slide-up">
           <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-[0.4em]">Proprietary Financial Architecture</span>
        </div>
        
        <h1 className="text-6xl md:text-[140px] font-black tracking-tightest leading-[0.85] mb-16 animate-slide-up text-slate-950 dark:text-white" style={{ animationDelay: '0.1s' }}>
          TRACKING <br/> IS THE <br/> NEW <span className="text-emerald-500 italic">ASSET.</span>
        </h1>
        
        <p className="text-slate-400 dark:text-slate-500 text-xl font-medium mb-16 animate-slide-up max-w-xl mx-auto leading-relaxed" style={{ animationDelay: '0.2s' }}>
          An uncompromising interface for growth. AI-driven stock analysis, multi-ledger intelligence, and absolute data clarity.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <button onClick={onGetStarted} className="w-full sm:w-auto px-16 py-7 bg-emerald-600 text-white rounded-full font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-emerald-500/30 active-scale transition-all hover:bg-emerald-700">
            Open Account
          </button>
          <button onClick={onLogin} className="w-full sm:w-auto px-16 py-7 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-full font-black text-xs uppercase tracking-[0.3em] border-2 border-emerald-50 dark:border-white/5 active-scale hover:bg-emerald-50 transition-all">
            Direct Portal
          </button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-8 pb-32 max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Nodes", value: "24.5k+" },
          { label: "Daily Volume", value: "$4.2M" },
          { label: "Uptime Rate", value: "99.9%" },
          { label: "Encrypted", value: "AES-256" }
        ].map((stat, i) => (
          <div key={i} className="text-center p-10 bg-white dark:bg-slate-900 rounded-[2rem] border border-emerald-500/5 shadow-sm">
             <p className="text-4xl font-black text-emerald-600 dark:text-emerald-500 mb-2 tracking-tighter">{stat.value}</p>
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Visual Canvas */}
      <div className="px-8 pb-40 max-w-7xl mx-auto animate-slide-up" style={{ animationDelay: '0.4s' }}>
         <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-[4rem] p-12 border border-emerald-500/10 flex flex-col items-center justify-center text-center">
            <h2 className="text-4xl font-black text-emerald-900 dark:text-emerald-100 mb-6 uppercase tracking-tightest">THE DASHBOARD.</h2>
            <div className="w-full max-w-4xl h-96 bg-white dark:bg-black rounded-[3rem] shadow-2xl border border-emerald-500/5 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-12 border-b border-emerald-500/5 flex items-center px-6 gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-200"></div>
                  <div className="w-2 h-2 rounded-full bg-emerald-200"></div>
               </div>
               <div className="p-12 pt-24 grid grid-cols-3 gap-6">
                  <div className="h-32 bg-emerald-50 dark:bg-emerald-900/50 rounded-2xl animate-pulse"></div>
                  <div className="h-32 bg-emerald-50 dark:bg-emerald-900/50 rounded-2xl animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="h-32 bg-emerald-50 dark:bg-emerald-900/50 rounded-2xl animate-pulse" style={{ animationDelay: '0.4s' }}></div>
               </div>
            </div>
         </div>
      </div>

      {/* Features */}
      <section className="px-8 pb-40 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: "INTELLIGENT LEDGER", desc: "No-latency tracking with deep cloud integration and digital voucher distribution.", icon: "01" },
          { title: "AUTONOMOUS STOCK", desc: "Advanced AI product recognition with dynamic margin logic for scaling businesses.", icon: "02" },
          { title: "ENTITY ARCHIVE", desc: "Absolute clarity on customer balances, vendor payables, and historical flow.", icon: "03" }
        ].map((feat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-16 rounded-[4rem] border border-emerald-500/5 hover:border-emerald-500 transition-all duration-700">
            <div className="text-4xl font-black text-emerald-100 dark:text-emerald-900 mb-8 tracking-tighter">{feat.icon}</div>
            <h3 className="text-xl font-black mb-4 uppercase tracking-tightest text-slate-900 dark:text-white">{feat.title}</h3>
            <p className="text-slate-400 text-xs font-medium leading-relaxed uppercase tracking-wide">{feat.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="py-24 px-8 text-center border-t border-emerald-500/10 bg-white dark:bg-black">
         <h1 className="text-4xl font-black tracking-tightest mb-8 text-slate-900 dark:text-white">TRACKR<span className="text-emerald-500">.</span></h1>
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.8em]">© 2024 TRACKR ENTERPRISE. ARCHITECTED FOR PERFORMANCE.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
