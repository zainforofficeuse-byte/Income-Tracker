
import React, { useState } from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "Is my data truly secure?",
      a: "TRACKR. uses enterprise-grade local encryption and proprietary Google Cloud protocols. Your financial data is isolated and only accessible via your authorized credentials."
    },
    {
      q: "Can I operate the system offline?",
      a: "Yes. Architected for zero-latency, the system functions fully without connectivity. Changes are automatically synced the moment a connection is re-established."
    },
    {
      q: "How does the AI metadata scanning work?",
      a: "Using Gemini Pro Vision, we extract product titles and metadata directly from images, automating your inventory entry process in seconds."
    },
    {
      q: "Does it support multi-currency ledgers?",
      a: "Absolutely. TRACKR. supports major global currencies and allows for real-time conversion and financial reporting across different regions."
    }
  ];

  return (
    <div className="h-screen w-full bg-white dark:bg-[#030712] overflow-y-auto scroll-smooth no-scrollbar">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 px-8 py-6 flex justify-between items-center glass border-b border-black/5 dark:border-white/5">
        <h1 className="text-2xl font-black tracking-tightest text-slate-950 dark:text-white">TRACKR<span className="text-emerald-500">.</span></h1>
        <div className="flex gap-4">
          <button onClick={onLogin} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-600 transition-colors px-4 py-2">Sign In</button>
          <button onClick={onGetStarted} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest active-scale">Get Access</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-56 pb-24 px-8 text-center max-w-6xl mx-auto">
        <div className="inline-block px-5 py-2 bg-slate-100 dark:bg-slate-900/50 rounded-full mb-12 animate-slide-up">
           <span className="text-[9px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-[0.4em]">Enterprise Financial Architecture</span>
        </div>
        
        <h1 className="text-6xl md:text-[140px] font-black tracking-tightest leading-[0.85] mb-16 animate-slide-up text-slate-950 dark:text-white" style={{ animationDelay: '0.1s' }}>
          TRACKING <br/> IS THE <br/> NEW <span className="text-emerald-500 italic">ASSET.</span>
        </h1>
        
        <p className="text-slate-500 dark:text-slate-400 text-xl font-medium mb-16 animate-slide-up max-w-xl mx-auto leading-relaxed" style={{ animationDelay: '0.2s' }}>
          An uncompromising interface for growth. AI-driven stock analysis, multi-ledger intelligence, and absolute data clarity for modern firms.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <button onClick={onGetStarted} className="w-full sm:w-auto px-16 py-7 bg-emerald-600 text-white rounded-full font-black text-xs uppercase tracking-[0.3em] shadow-2xl active-scale transition-all hover:bg-emerald-700">
            Open Account
          </button>
          <button onClick={onLogin} className="w-full sm:w-auto px-16 py-7 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-full font-black text-xs uppercase tracking-[0.3em] border-2 border-slate-100 dark:border-white/5 active-scale hover:bg-slate-50 transition-all">
            Direct Portal
          </button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-8 pb-32 max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
        {[
          { label: "Active Nodes", value: "850+" },
          { label: "Daily Volume", value: "$4.2M" },
          { label: "Uptime Rate", value: "99.9%" },
          { label: "Encrypted", value: "AES-256" }
        ].map((stat, i) => (
          <div key={i} className="text-center p-10 bg-white dark:bg-slate-900 rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm">
             <p className="text-4xl font-black text-slate-950 dark:text-white mb-2 tracking-tighter">{stat.value}</p>
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Features Section */}
      <section className="px-8 pb-40 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: "Intelligent Ledger", desc: "Zero-latency transaction tracking with proprietary cloud integration and digital voucher generation.", icon: "01" },
          { title: "Dynamic POS Engine", desc: "Automated retail pricing based on overhead, platform fees, and target margins defined by you.", icon: "02" },
          { title: "Entity Archiving", desc: "Complete transparency for customer balances, vendor payables, and historical cash flow analysis.", icon: "03" }
        ].map((feat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900/40 p-16 rounded-[4rem] border border-black/5 dark:border-white/5 hover:border-emerald-500 transition-all duration-700 group">
            <div className="text-4xl font-black text-slate-100 dark:text-slate-800 mb-8 tracking-tighter group-hover:text-emerald-500/20 transition-colors">{feat.icon}</div>
            <h3 className="text-xl font-black mb-4 uppercase tracking-tightest text-slate-950 dark:text-white">{feat.title}</h3>
            <p className="text-slate-400 text-xs font-medium leading-relaxed uppercase tracking-wide">{feat.desc}</p>
          </div>
        ))}
      </section>

      {/* FAQ Section */}
      <section className="px-8 pb-40 max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em] mb-4">Operations Manual</p>
          <h2 className="text-4xl font-black tracking-tightest text-slate-950 dark:text-white uppercase">Common Queries</h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-black/5 dark:border-white/5 overflow-hidden">
              <button 
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-8 flex justify-between items-center text-left"
              >
                <span className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-tight">{faq.q}</span>
                <span className={`text-xl font-black transition-transform duration-300 ${openFaq === idx ? 'rotate-45 text-emerald-500' : 'text-slate-300'}`}>+</span>
              </button>
              {openFaq === idx && (
                <div className="px-8 pb-8 animate-in slide-in-from-top-2">
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium leading-relaxed uppercase tracking-wide">
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-8 text-center border-t border-black/5 dark:border-white/5 bg-white dark:bg-black">
         <h1 className="text-4xl font-black tracking-tightest mb-8 text-slate-950 dark:text-white">TRACKR<span className="text-emerald-500">.</span></h1>
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.8em]">© 2024 TRACKR ENTERPRISE. ARCHITECTED FOR PERFORMANCE.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
