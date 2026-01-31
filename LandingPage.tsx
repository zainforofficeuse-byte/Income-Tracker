
import React from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  return (
    <div className="h-screen w-full bg-white dark:bg-[#030712] overflow-y-auto scroll-smooth">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 px-8 py-6 flex justify-between items-center glass border-b border-black/5">
        <h1 className="text-2xl font-black tracking-tightest">TRACKR<span className="text-slate-900">.</span></h1>
        <div className="flex gap-4">
          <button onClick={onLogin} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-black transition-colors px-4 py-2">Sign In</button>
          <button onClick={onGetStarted} className="bg-black text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest active-scale">Get Access</button>
        </div>
      </nav>

      {/* Hero Section - "Text as Cover" Aesthetic */}
      <section className="pt-48 pb-24 px-8 text-center max-w-6xl mx-auto">
        <div className="inline-block px-5 py-2 bg-slate-100 dark:bg-slate-900 rounded-full mb-12 animate-slide-up">
           <span className="text-[9px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-[0.4em]">Proprietary Financial Architecture</span>
        </div>
        
        {/* Massive "Cover" Typography */}
        <h1 className="text-6xl md:text-[140px] font-black tracking-tightest leading-[0.85] mb-16 animate-slide-up text-slate-950 dark:text-white" style={{ animationDelay: '0.1s' }}>
          TRACKING <br/> IS THE <br/> NEW <span className="opacity-20 italic">ASSET.</span>
        </h1>
        
        <p className="text-slate-400 dark:text-slate-500 text-xl font-medium mb-16 animate-slide-up max-w-xl mx-auto leading-relaxed" style={{ animationDelay: '0.2s' }}>
          An uncompromising interface for growth. AI-driven stock analysis, multi-ledger intelligence, and absolute data clarity.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <button onClick={onGetStarted} className="w-full sm:w-auto px-16 py-7 bg-black text-white rounded-full font-black text-xs uppercase tracking-[0.3em] shadow-2xl active-scale transition-all hover:bg-slate-800">
            Open Account
          </button>
          <button onClick={onLogin} className="w-full sm:w-auto px-16 py-7 bg-white dark:bg-slate-900 text-black dark:text-white rounded-full font-black text-xs uppercase tracking-[0.3em] border-2 border-slate-100 dark:border-white/5 active-scale hover:bg-slate-50 transition-all">
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
          <div key={i} className="text-center p-10 bg-white dark:bg-slate-900 rounded-[2rem] border border-black/5 shadow-sm">
             <p className="text-4xl font-black text-black dark:text-white mb-2 tracking-tighter">{stat.value}</p>
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Visual Canvas - Minimalist Design */}
      <div className="px-8 pb-40 max-w-7xl mx-auto animate-slide-up" style={{ animationDelay: '0.4s' }}>
         <div className="bg-slate-50 dark:bg-slate-900 rounded-[4rem] p-12 border border-black/5 flex flex-col items-center justify-center text-center">
            <h2 className="text-4xl font-black text-black dark:text-white mb-6 uppercase tracking-tightest">THE DASHBOARD.</h2>
            <div className="w-full max-w-4xl h-96 bg-white dark:bg-black rounded-[3rem] shadow-2xl border border-black/5 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-12 border-b border-black/5 flex items-center px-6 gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                  <div className="w-2 h-2 rounded-full bg-slate-200"></div>
               </div>
               <div className="p-12 pt-24 grid grid-cols-3 gap-6">
                  <div className="h-32 bg-slate-50 dark:bg-slate-900 rounded-2xl animate-pulse"></div>
                  <div className="h-32 bg-slate-50 dark:bg-slate-900 rounded-2xl animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="h-32 bg-slate-50 dark:bg-slate-900 rounded-2xl animate-pulse" style={{ animationDelay: '0.4s' }}></div>
               </div>
            </div>
         </div>
      </div>

      {/* Features - Black on White */}
      <section className="px-8 pb-40 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: "INTELLIGENT LEDGER", desc: "No-latency tracking with deep cloud integration and digital voucher distribution.", icon: "01" },
          { title: "AUTONOMOUS STOCK", desc: "Advanced AI product recognition with dynamic margin logic for scaling businesses.", icon: "02" },
          { title: "ENTITY ARCHIVE", desc: "Absolute clarity on customer balances, vendor payables, and historical flow.", icon: "03" }
        ].map((feat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-16 rounded-[4rem] border border-black/5 hover:border-black transition-all duration-700">
            <div className="text-4xl font-black text-slate-100 dark:text-slate-800 mb-8 tracking-tighter">{feat.icon}</div>
            <h3 className="text-xl font-black mb-4 uppercase tracking-tightest text-black dark:text-white">{feat.title}</h3>
            <p className="text-slate-400 text-xs font-medium leading-relaxed uppercase tracking-wide">{feat.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="py-24 px-8 text-center border-t border-black/5 dark:border-white/5 bg-white dark:bg-black">
         <h1 className="text-4xl font-black tracking-tightest mb-8 text-black dark:text-white">TRACKR.</h1>
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.8em]">© 2024 TRACKR ENTERPRISE. ARCHITECTED FOR PERFORMANCE.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
