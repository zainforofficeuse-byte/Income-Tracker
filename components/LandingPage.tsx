
import React from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  return (
    <div className="min-h-screen w-full bg-[#fcfcfd] dark:bg-[#030712] overflow-y-auto no-scrollbar">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 px-8 py-6 flex justify-between items-center glass">
        <h1 className="text-2xl font-black tracking-tightest">TRACKR<span className="text-indigo-600">.</span></h1>
        <div className="flex gap-4">
          <button onClick={onLogin} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-colors px-4 py-2">Login</button>
          <button onClick={onGetStarted} className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 active-scale">Get Started</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-8 text-center max-w-4xl mx-auto">
        <div className="inline-block px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-full mb-8 animate-slide-up">
           <span className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.3em]">Modern Enterprise Resource Planning</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tightest leading-[1.1] mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Finance Redefined for <span className="text-indigo-600">Modern Teams.</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl font-medium mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          Track inventory, manage multi-company ledgers, and visualize growth with our high-end financial architecture. Built for speed, security, and aesthetics.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <button onClick={onGetStarted} className="px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-500/30 active-scale">Create Business Account</button>
          <button onClick={onLogin} className="px-10 py-5 bg-white dark:bg-slate-900 rounded-[2rem] font-black text-sm uppercase tracking-widest premium-shadow border border-black/5 active-scale">Watch Demo</button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-8 pb-32 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: "Real-time Ledger", desc: "Instantly track every transaction with cloud-sync and digital voucher generation.", icon: "📊" },
          { title: "Smart Inventory", desc: "AI-powered product scanning with auto-pricing and low-stock alerts.", icon: "📦" },
          { title: "Multi-Company", desc: "Switch between businesses effortlessly with enterprise-grade permission levels.", icon: "🏢" }
        ].map((feat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] premium-shadow border border-black/[0.01] animate-slide-up" style={{ animationDelay: `${0.4 + (i * 0.1)}s` }}>
            <div className="text-4xl mb-6">{feat.icon}</div>
            <h3 className="text-xl font-black mb-3">{feat.title}</h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="py-20 px-8 text-center border-t border-black/5 dark:border-white/5">
         <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">© 2024 TRACKR ENTERPRISE. ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
