/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Upload, 
  History, 
  Info, 
  CheckCircle2, 
  RotateCcw, 
  Search, 
  Cpu,
  ChevronRight,
  X,
  AlertCircle,
  Save,
  BookmarkCheck,
  Sun,
  Moon,
  Settings
} from 'lucide-react';
import { SparePart, MOCK_PARTS_DATA } from './types';
import { identifyPart } from './services/geminiService';

const Logo = () => (
  <div className="relative w-12 h-12 flex-shrink-0 group">
    {/* Magnifying Glass Outer Circle */}
    <div className="absolute inset-0 border-4 border-[var(--brand-contrast)] rounded-full scale-90 group-hover:scale-100 transition-all duration-500 opacity-80"></div>
    {/* Teal Accent Ring */}
    <div className="absolute inset-[-4px] border-2 border-[var(--brand-teal)] rounded-full opacity-30 animate-pulse"></div>
    {/* Circuits (Abstracted) */}
    <div className="absolute -left-4 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-60">
      <div className="w-4 h-[2px] bg-[var(--brand-teal)] rounded-full"></div>
      <div className="w-6 h-[2px] bg-[var(--brand-blue)] rounded-full"></div>
      <div className="w-4 h-[2px] bg-[var(--brand-teal)] rounded-full"></div>
    </div>
    {/* Central Gear + Loop */}
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative">
        <Search className="w-8 h-8 text-[var(--brand-contrast)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--bg-panel)] rounded-full p-1 border border-[var(--brand-blue)]/40 shadow-lg transition-colors">
          <Settings className="w-4 h-4 text-[var(--brand-teal)] animate-[spin_4s_linear_infinite]" />
        </div>
      </div>
    </div>
    {/* Scanning Frame Corners */}
    <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-[var(--brand-teal)]"></div>
    <div className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-[var(--brand-teal)]"></div>
    <div className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-[var(--brand-teal)]"></div>
    <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-[var(--brand-teal)]"></div>
  </div>
);

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<SparePart | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<SparePart[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('app_theme');
    return (saved as 'dark' | 'light') || 'dark';
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Apply theme to document
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('spare_parts_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('spare_parts_history', JSON.stringify(history));
  }, [history]);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setImage(base64);
        analyzeImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (base64Img: string) => {
    setIsAnalyzing(true);
    setResult(null);
    setError(null);
    setIsSaved(false);

    try {
      const aiResult = await identifyPart(base64Img);
      
      const newResult: SparePart = {
        ...aiResult,
        id: Math.random().toString(36).substr(2, 9),
        imageUrl: base64Img,
        timestamp: Date.now(),
      };

      setResult(newResult);
    } catch (err) {
      console.error("AI Analysis failed", err);
      setError("Strategic analysis engine failed to identify unique neural patterns for this component. Please ensure optimal lighting and central framing.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveToHistory = () => {
    if (result && !isSaved) {
      setHistory(prev => [result, ...prev.slice(0, 19)]); // Keep last 20
      setIsSaved(true);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setIsAnalyzing(false);
    setError(null);
    setIsSaved(false);
  };

  return (
    <div className="min-h-screen text-white relative">
      <div className="mesh-bg" />

      <div className="h-screen w-full p-4 sm:p-8 lg:grid lg:grid-cols-12 lg:gap-8 gap-4 flex flex-col overflow-y-auto lg:overflow-hidden font-sans">
        {/* Sidebar / Top Nav on Mobile */}
        <div className="lg:col-span-3 flex flex-col gap-6 lg:h-full">
          <div className="glass glass-glow chrome-border p-6 rounded-3xl h-full flex flex-col gap-6">
            <div className="flex items-center justify-between lg:block">
              <div className="flex items-center gap-4">
                <Logo />
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-[var(--brand-contrast)] transition-colors">SMART</h1>
                  <p className="text-[10px] brand-text font-bold uppercase tracking-[0.2em] leading-none opacity-80">Spare Parts ID</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-6 lg:mt-8">
                <button 
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="flex-1 flex items-center justify-center gap-2 p-3 glass glass-glow chrome-border rounded-xl transition-all"
                >
                  <AnimatePresence mode="wait">
                    {theme === 'dark' ? (
                      <motion.div 
                        key="dark"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="flex items-center gap-2"
                      >
                        <Sun className="w-4 h-4 text-amber-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-main)]">THEME_DAY</span>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="light"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="flex items-center gap-2"
                      >
                        <Moon className="w-4 h-4 text-indigo-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-main)]">THEME_NIGHT</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>

                <button 
                  onClick={() => setShowHistory(true)}
                  className="lg:hidden p-3 glass glass-glow chrome-border rounded-xl"
                >
                  <History className="w-5 h-5 brand-text" />
                </button>
              </div>
            </div>

            <div className="hidden lg:flex flex-1 flex-col gap-4 overflow-hidden">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">History Log</h3>
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 border-t border-white/5 pt-4">
                {history.length > 0 ? history.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => {
                      setImage(item.imageUrl);
                      setResult(item);
                      setIsSaved(true);
                    }}
                    className="history-item p-3 rounded-2xl cursor-pointer flex items-center gap-4 transition-all bg-white/[0.02]"
                  >
                    <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/5 overflow-hidden flex-shrink-0">
                      <img src={item.imageUrl} alt="" className="history-item-img w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate text-[var(--text-main)] transition-colors">{item.name}</p>
                      <p className="text-[10px] font-mono brand-text uppercase transition-colors">
                        {item.confidence}% MATCH
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="py-8 text-center bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-xs text-zinc-600">Standby... No data.</p>
                  </div>
                )}
              </div>
              
              {history.length > 0 && (
                <button 
                  onClick={() => {
                    setHistory([]);
                    localStorage.removeItem('spare_parts_history');
                  }}
                  className="text-[10px] font-bold text-zinc-600 hover:text-red-400 text-center uppercase tracking-widest transition-colors py-2"
                >
                  Purge History
                </button>
              )}
            </div>

            <div className="mt-auto hidden lg:block py-4 border-t border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full brand-bg status-pulse" />
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">System Online</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="lg:col-span-9 grid grid-rows-12 gap-6 lg:h-full">
          {/* Upload Section / Image Display */}
          <div className={`${(result || error) && !isAnalyzing ? 'row-span-4' : 'row-span-12'} glass glass-glow chrome-border p-8 rounded-3xl flex items-center justify-center transition-all duration-700 relative overflow-hidden group`}>
            {(!image || ((result || error) && !isAnalyzing)) ? (
              <div className="text-center relative z-10">
                <div className="w-16 h-16 rounded-2xl glass border border-white/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:border-[#00BFA5]/40 transition-all">
                  <Camera className="w-8 h-8 brand-text" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-[var(--text-main)] transition-colors">Capture Component</h2>
                <p className="text-[var(--text-dim)] text-sm mt-2 max-w-xs mx-auto transition-colors">Position industrial part within frame for neural identification</p>
                <motion.button 
                  whileHover={{ scale: 1.05, borderColor: '#00BFA5' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-8 px-10 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold transition-all shadow-2xl relative overflow-hidden group/btn flex items-center gap-3 mx-auto"
                >
                  <span className="relative z-10 brand-text font-black tracking-widest">INITIATE SCAN</span>
                  <div className="absolute inset-0 bg-[#00BFA5]/5 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                </motion.button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            ) : (
              <div className="absolute inset-0">
                <img src={image} className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />
                
                {isAnalyzing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.div 
                      initial={{ top: 0 }}
                      animate={{ top: '100%' }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 right-0 h-[2px] bg-[#00BFA5] shadow-[0_0_25px_#00BFA5] z-20"
                    />
                    <div className="glass chrome-border px-8 py-4 rounded-2xl flex items-center gap-4">
                      <div className="w-5 h-5 border-2 border-[#00BFA5] border-t-transparent rounded-full animate-spin" />
                      <span className="font-mono brand-text tracking-[0.3em] text-xs uppercase">Analyzing_Signature...</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Result Section */}
          <AnimatePresence>
            {result && !isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="row-span-8 glass glass-glow chrome-border p-8 rounded-3xl flex flex-col gap-8 overflow-hidden"
              >
                <div className="flex flex-col lg:flex-row items-start justify-between gap-8 h-full">
                  <div className="flex flex-col sm:flex-row gap-8 w-full lg:w-auto h-full">
                    <div className="w-full sm:w-56 sm:h-56 h-64 rounded-2xl bg-zinc-950 border border-white/10 overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.5)] flex-shrink-0">
                      <img src={image || ''} className="w-full h-full object-cover opacity-90 grayscale hover:grayscale-0 transition-all duration-700" alt="" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-md flex justify-between items-center border-t border-white/10">
                        <span className="text-[10px] brand-text uppercase tracking-widest font-black">SIG_VERIFIED</span>
                        <div className="w-2 h-2 rounded-full brand-bg status-pulse"></div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-6 flex-1 overflow-y-auto pr-2">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-3 py-1 rounded-lg bg-[var(--bg-deep)] opacity-80 border border-[#00BFA5]/30 text-[#00BFA5] text-[10px] font-black uppercase tracking-widest transition-colors">
                            CONFIDENCE_{result.confidence}%
                          </span>
                          
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={saveToHistory}
                            disabled={isSaved}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                              isSaved 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                              : 'bg-white/5 border-white/10 hover:border-[#00BFA5]/50 text-[var(--text-main)]'
                            }`}
                          >
                            {isSaved ? (
                              <><BookmarkCheck className="w-4 h-4" /> SAVED</>
                            ) : (
                              <><Save className="w-4 h-4" /> SAVE TO LOG</>
                            )}
                          </motion.button>
                        </div>
                        <h2 className="text-4xl font-black tracking-tighter text-[var(--text-main)] uppercase italic transition-colors">{result.name}</h2>
                        <div className="flex items-center gap-3">
                           <p className="text-[var(--text-dim)] font-mono text-[10px] tracking-widest transition-colors">UID_REF: {result.id.toUpperCase()}</p>
                           <div className="h-[1px] flex-1 bg-white/5" />
                        </div>
                      </div>

                      <div className="max-w-md">
                        <h4 className="text-[10px] font-black text-[var(--text-dim)] opacity-60 uppercase tracking-[0.3em] mb-3 transition-colors">Specification_Data</h4>
                        <p className="text-sm text-[var(--text-dim)] leading-relaxed font-medium transition-colors">
                          {result.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-white/5 mt-auto">
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Operational_Uses</h4>
                          <ul className="text-sm text-[var(--text-dim)] space-y-3 font-medium transition-colors">
                            {result.possibleUses.map((use, i) => (
                              <li key={i} className="flex items-center gap-3 group">
                                <div className="w-1 h-1 rounded-full bg-[var(--text-dim)] opacity-30 group-hover:bg-[#00BFA5] transition-colors" />
                                {use}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-[10px] font-black text-[var(--text-dim)] opacity-60 uppercase tracking-[0.2em] transition-colors">Neural_Metrics</h4>
                          <div className="space-y-3">
                            <div className="h-1 w-full bg-[var(--bg-deep)] rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${result.confidence}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full brand-bg"
                              />
                            </div>
                            <div className="flex justify-between items-center font-mono text-[10px] text-[var(--text-dim)] transition-colors">
                               <span>STABILITY_NOMINAL</span>
                               <span className="brand-text">{result.confidence}.00%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Section */}
          <AnimatePresence>
            {error && !isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="row-span-8 glass glass-glow chrome-border p-12 rounded-3xl flex flex-col items-center justify-center text-center gap-6"
              >
                <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-2">
                  <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <div className="max-w-md space-y-2">
                  <h2 className="text-2xl font-bold text-red-500 uppercase tracking-tight">Signal Loss Detected</h2>
                  <p className="text-[var(--text-dim)] text-sm leading-relaxed transition-colors">
                    {error}
                  </p>
                </div>
                <div className="flex gap-4 mt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => image && analyzeImage(image)}
                    className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl font-bold flex items-center gap-2 hover:border-red-500/50 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" /> RETRY ANALYSIS
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={reset}
                    className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-red-500/20 transition-all"
                  >
                    <Upload className="w-4 h-4" /> NEW IMAGE
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile History Drawer Overlay */}
      <AnimatePresence>
        {showHistory && (
          <div className="fixed inset-0 z-50 lg:hidden font-sans">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-sm glass border-l border-white/10 shadow-2xl p-8 flex flex-col"
            >
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-xl font-black uppercase tracking-tighter italic">History Archive</h3>
                <button onClick={() => setShowHistory(false)} className="p-3 bg-white/5 rounded-2xl border border-white/10">
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4">
                {history.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => {
                      setImage(item.imageUrl);
                      setResult(item);
                      setIsSaved(true);
                      setShowHistory(false);
                    }}
                    className="history-item p-4 rounded-2xl flex items-center gap-4 transition-all"
                  >
                    <div className="w-14 h-14 rounded-xl bg-zinc-950 border border-white/5 overflow-hidden">
                      <img src={item.imageUrl} alt="" className="history-item-img w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-200">{item.name}</p>
                      <p className="text-[10px] font-mono brand-text uppercase tracking-widest">{item.confidence}% SCORE</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
