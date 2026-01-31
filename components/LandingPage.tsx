
import React from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  return (
    <div className="h-screen w-full bg-[#fcfcfd] dark:bg-[#030712] overflow-y-auto scroll-smooth">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 px-8 py-6 flex justify-between items-center glass">
        <h1 className="text-2xl font-black tracking-tightest">TRACKR<span className="text-indigo-600">.</span></h1>
        <div className="flex gap-4">
          <button onClick={onLogin} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-colors px-4 py-2">Sign In</button>
          <button onClick={onGetStarted} className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 active-scale">Open Account</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-48 pb-24 px-8 text-center max-w-4xl mx-auto">
        <div className="inline-block px-5 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-full mb-10 animate-slide-up border border-indigo-100 dark:border-indigo-800/30">
           <span className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.3em]">Next-Gen Financial Intelligence</span>
        </div>
        <h1 className="text-5xl md:text-8xl font-black tracking-tightest leading-[1] mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Enterprise <br/> Growth <span className="text-indigo-600">Simpler.</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl font-medium mb-14 animate-slide-up max-w-2xl mx-auto leading-relaxed" style={{ animationDelay: '0.2s' }}>
          Track inventory with AI scanning, manage multi-company ledgers, and visualize profit with high-end architectural precision. 
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <button onClick={onGetStarted} className="w-full sm:w-auto px-12 py-6 bg-indigo-600 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-500/40 active-scale transition-all hover:bg-indigo-700">Create Account</button>
          <button onClick={onLogin} className="w-full sm:w-auto px-12 py-6 bg-white dark:bg-slate-900 rounded-[2.5rem] font-black text-sm uppercase tracking-widest premium-shadow border border-black/5 active-scale transition-all hover:bg-slate-50 dark:hover:bg-slate-800">Direct Login</button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-8 pb-32 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { label: "Active Nodes", value: "24.5k+" },
          { label: "Daily Volume", value: "$4.2M" },
          { label: "Uptime Rate", value: "99.9%" },
          { label: "Data Integrity", value: "AES-256" }
        ].map((stat, i) => (
          <div key={i} className="text-center p-8 bg-white dark:bg-slate-900 rounded-[2rem] border border-black/[0.02] shadow-sm">
             <p className="text-3xl font-black text-indigo-600 mb-1">{stat.value}</p>
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Visual Mockup */}
      <div className="px-8 pb-40 max-w-5xl mx-auto animate-slide-up" style={{ animationDelay: '0.4s' }}>
         <div className="bg-slate-900 rounded-[3.5rem] p-2 premium-shadow relative overflow-hidden group border border-white/5">
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] h-96 md:h-[600px] flex items-center justify-center relative z-10">
               <div className="grid grid-cols-2 gap-4 w-full max-w-md p-8">
                  <div className="h-40 bg-indigo-50 dark:bg-slate-800 rounded-3xl animate-pulse"></div>
                  <div className="h-40 bg-slate-50 dark:bg-slate-800/50 rounded-3xl animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="h-32 col-span-2 bg-indigo-600/10 rounded-3xl animate-pulse" style={{ animationDelay: '0.4s' }}></div>
               </div>
            </div>
         </div>
      </div>

      {/* Features Grid */}
      <section className="px-8 pb-40 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        {[
          { title: "Real-time Ledger", desc: "Instant tracking with cloud-sync and digital voucher sharing for professional accounting.", icon: "📊" },
          { title: "Smart Inventory", desc: "AI product recognition and global multi-tag categorization for accurate stock values.", icon: "📦" },
          { title: "Entity Analytics", desc: "Detailed customer/vendor statements with automated balance age tracking.", icon: "🏢" }
        ].map((feat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-12 rounded-[3.5rem] premium-shadow border border-black/[0.01] hover:-translate-y-2 transition-transform duration-500">
            <div className="text-5xl mb-8 bg-slate-50 dark:bg-slate-800 w-20 h-20 rounded-3xl flex items-center justify-center">{feat.icon}</div>
            <h3 className="text-2xl font-black mb-4">{feat.title}</h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="py-24 px-8 text-center border-t border-black/5 dark:border-white/5 bg-slate-50 dark:bg-slate-900/20">
         <h1 className="text-3xl font-black tracking-tightest mb-8">TRACKR<span className="text-indigo-600">.</span></h1>
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.6em]">© 2024 TRACKR ENTERPRISE. SECURED & CLOUD READY.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
