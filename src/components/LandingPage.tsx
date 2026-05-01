import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Cpu, Zap, Search, ShieldCheck, ChevronRight } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden font-sans selection:bg-white selection:text-black">
      {/* Background Effects */}
      <div className="mesh-bg opacity-30" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] opacity-20 bg-zinc-400/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg">
            <Cpu className="w-5 h-5 text-black" />
          </div>
          <span className="text-xl font-black tracking-tighter chrome-text uppercase">Smart_ID</span>
        </div>
        <div className="hidden md:flex gap-8 text-[10px] font-black uppercase tracking-widest text-zinc-500">
          <a href="#" className="hover:text-white transition-colors">Technology</a>
          <a href="#" className="hover:text-white transition-colors">Efficiency</a>
          <a href="#" className="hover:text-white transition-colors">Enterprise</a>
        </div>
        <button 
          onClick={() => navigate('/tool')}
          className="px-6 py-2 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:border-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.05)]"
        >
          Launch_OS
        </button>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 pt-40 pb-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "circOut" }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-[0.4em] mb-8 animate-pulse text-zinc-300">
              Neural Network Identification v4.0.2
            </span>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter chrome-text uppercase italic leading-[0.9] mb-8">
              Scan. Identify.<br/><span className="not-italic">Solve Industrial.</span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
              Revolutionizing industrial maintenance with AI-powered component verification. Zero errors, absolute precision, instant resolution.
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/tool')}
              className="group relative px-12 py-6 bg-white text-black rounded-3xl font-black text-lg transition-all hover:shadow-[0_0_50px_rgba(255,255,255,0.3)] flex items-center gap-4 mx-auto"
            >
              LAUNCH AI IDENTIFIER
              <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
            </motion.button>
          </motion.div>
        </div>

        {/* Features Bento Grid */}
        <div className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass chrome-border p-8 rounded-3xl group hover:border-white/20 transition-all"
          >
            <div className="w-12 h-12 rounded-2xl border border-white/10 flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-black transition-all">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-4 chrome-text italic">Zero Latency</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Industrial-grade response times. Identify complex parts in under 1.2 seconds through our neural edge engine.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="glass chrome-border p-8 rounded-3xl group hover:border-white/20 transition-all"
          >
            <div className="w-12 h-12 rounded-2xl border border-white/10 flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-black transition-all">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-4 chrome-text italic">Absolute Precision</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Trained on over 4 million industrial schematics. Highest identification accuracy in high-temperature environments.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="glass chrome-border p-8 rounded-3xl group hover:border-white/20 transition-all"
          >
            <div className="w-12 h-12 rounded-2xl border border-white/10 flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-black transition-all">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-4 chrome-text italic">Audit Verified</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Blockchain-backed log history for every scan, ensuring full transparency in regulatory compliance workflows.
            </p>
          </motion.div>
        </div>

        {/* Social Proof / Stats */}
        <div className="mt-32 pt-20 border-t border-white/5 flex flex-wrap justify-between gap-12">
          <div>
            <p className="text-4xl font-black chrome-text italic">99.8%</p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mt-2">Accuracy_Rate</p>
          </div>
          <div>
            <p className="text-4xl font-black chrome-text italic">4.2M+</p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mt-2">Components_Cataloged</p>
          </div>
          <div>
            <p className="text-4xl font-black chrome-text italic">&lt;2 SEC</p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mt-2">Identification_Speed</p>
          </div>
          <div className="ml-auto flex items-center gap-4">
             <div className="flex -space-x-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full bg-zinc-900 border-2 border-black flex items-center justify-center">
                    <div className={`w-8 h-8 rounded-full bg-zinc-${i*100+400}/20`} />
                  </div>
                ))}
             </div>
             <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Trusted by Global<br/>Manufacturing Giants</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-20 bg-black relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <Cpu className="w-4 h-4 text-white" />
            <span className="text-xs font-black uppercase tracking-widest opacity-50">© 2026 Smart Industrial Solutions</span>
          </div>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-zinc-600">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
