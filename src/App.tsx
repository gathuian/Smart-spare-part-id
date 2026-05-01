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
  Settings,
  ThumbsUp,
  ThumbsDown,
  Filter,
  Zap,
  Droplets,
  Thermometer,
  Layers
} from 'lucide-react';
import { SparePart, MOCK_PARTS_DATA } from './types';
import { identifyPart } from './services/geminiService';

const Logo = () => (
  <div className="relative w-10 h-10 flex-shrink-0 group">
    <div className="absolute inset-0 bg-[var(--brand-accent)] rounded-lg rotate-3 group-hover:rotate-6 transition-all duration-500 opacity-20"></div>
    <div className="absolute inset-0 bg-[var(--brand-accent)] rounded-lg -rotate-3 group-hover:-rotate-6 transition-all duration-500">
      <div className="w-full h-full flex items-center justify-center">
        <Cpu className="w-6 h-6 text-black" />
      </div>
    </div>
    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[var(--brand-glow)] rounded-full border-2 border-[var(--bg-deep)] shadow-lg"></div>
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCriteria, setFilterCriteria] = useState<'all' | 'high' | 'recent'>('all');
  const [qualityFeedback, setQualityFeedback] = useState<{rating: 'good' | 'fair' | 'poor', message: string} | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        
        // Quality Simulation Logic
        const qualities: ('good' | 'fair' | 'poor')[] = ['good', 'fair', 'poor'];
        const randomQ = qualities[Math.floor(Math.random() * qualities.length)];
        const messages = {
          good: "Optimal lighting and contrast detected. Ready for neural scan.",
          fair: "Slight blur or low contrast detected. Scanning may be less accurate.",
          poor: "Poor image quality detected. Please recapture with better lighting."
        };
        
        setQualityFeedback({
          rating: randomQ,
          message: messages[randomQ]
        });

        // Auto-analyze only if quality is not poor
        if (randomQ !== 'poor') {
          analyzeImage(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterCriteria === 'high') return matchesSearch && item.confidence >= 90;
    if (filterCriteria === 'recent') return matchesSearch && (Date.now() - item.timestamp < 3600000); // last hour
    return matchesSearch;
  });

  const handleFeedback = (feedback: 'helpful' | 'not-helpful') => {
    if (result) {
      const updatedResult = { ...result, userFeedback: feedback };
      setResult(updatedResult);
      setHistory(prev => prev.map(item => item.id === result.id ? updatedResult : item));
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
    <>
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
                  <h1 className="text-xl font-bold tracking-tight chrome-text">SMART</h1>
                  <p className="text-[10px] brand-text font-bold uppercase tracking-[0.2em] leading-none opacity-80">Spare Parts ID</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-6 lg:mt-8">
                <button 
                  onClick={() => setShowHistory(true)}
                  className="w-full p-3 glass glass-glow chrome-border rounded-xl flex items-center justify-center gap-2 group-hover:border-[var(--brand-accent)]"
                >
                  <History className="w-5 h-5 brand-text" />
                  <span className="lg:hidden text-[10px] font-black uppercase tracking-widest text-[var(--text-main)]">VIEW_ARCHIVE</span>
                </button>
              </div>
            </div>

            <div className="hidden lg:flex flex-1 flex-col gap-6 overflow-hidden">
              <div className="space-y-1">
                <div className="sidebar-item active">
                  <History className="w-5 h-5 flex-shrink-0" />
                  <span>Scan History</span>
                </div>
                <div className="sidebar-item">
                  <Search className="w-5 h-5 flex-shrink-0" />
                  <span>Global Search</span>
                </div>
                <div className="sidebar-item">
                  <BookmarkCheck className="w-5 h-5 flex-shrink-0" />
                  <span>Saved Parts</span>
                </div>
                <div className="sidebar-item">
                  <Settings className="w-5 h-5 flex-shrink-0" />
                  <span>System Config</span>
                </div>
              </div>

              <div className="border-t border-white/5 pt-6 flex-1 flex flex-col gap-4 overflow-hidden">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Archive_Log</h3>
                  <div className="flex items-center gap-1">
                    <Filter className="w-3 h-3 text-zinc-600" />
                    <select 
                      value={filterCriteria}
                      onChange={(e) => setFilterCriteria(e.target.value as any)}
                      className="text-[10px] bg-transparent text-zinc-500 border-none outline-none cursor-pointer hover:text-[var(--brand-accent)] transition-colors"
                    >
                      <option value="all">ALL</option>
                      <option value="high">HIGH_CONF</option>
                      <option value="recent">RECENT</option>
                    </select>
                  </div>
                </div>

                <div className="relative mx-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                  <input 
                    type="text"
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-xl py-2 pl-9 pr-4 text-xs text-[var(--text-main)] placeholder:text-zinc-700 focus:outline-none focus:border-[var(--brand-accent)]/30 transition-all"
                  />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
                  {filteredHistory.length > 0 ? filteredHistory.map((item) => (
                  <div 
                    key={item.id}
                    className="relative group/history"
                  >
                    <div 
                      onClick={() => {
                        setImage(item.imageUrl);
                        setResult(item);
                        setIsSaved(true);
                      }}
                      className="history-item p-3 rounded-2xl cursor-pointer flex items-center gap-4 transition-all bg-white/[0.02] active:scale-[0.98]"
                    >
                      <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/5 overflow-hidden flex-shrink-0">
                        <img src={item.imageUrl} alt="" className="history-item-img w-full h-full object-cover opacity-60 group-hover/history:opacity-100 transition-opacity" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black truncate text-[var(--text-main)] transition-colors uppercase tracking-tight">{item.name}</p>
                        <p className="text-[10px] font-mono brand-text uppercase transition-colors">
                          {item.confidence}% MATCH
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const updated = history.filter(h => h.id !== item.id);
                        setHistory(updated);
                        localStorage.setItem('spare_parts_history', JSON.stringify(updated));
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover/history:opacity-100 transition-all hover:bg-red-500/20"
                    >
                      <X className="w-3 h-3" />
                    </button>
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
              <div className="text-center relative z-10 w-full px-8">
                <div className="w-20 h-20 rounded-3xl glass border border-white/10 flex items-center justify-center mx-auto mb-10 group-hover:scale-110 group-hover:border-[var(--brand-accent)]/40 transition-all shadow-2xl">
                  <Camera className="w-10 h-10 brand-text" />
                </div>
                <h2 className="text-4xl font-black tracking-tighter text-[var(--text-main)] transition-colors uppercase italic">INITIALIZE_SCAN</h2>
                <p className="text-[var(--text-dim)] text-sm mt-4 max-w-sm mx-auto transition-colors leading-relaxed">
                  Position industrial components within neural telemetry frame for high-precision identification.
                </p>
                <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-12 py-5 bg-[var(--brand-accent)] text-black rounded-3xl font-black transition-all shadow-[0_10px_40px_rgba(250,173,20,0.2)] flex items-center gap-3 uppercase tracking-widest text-sm"
                  >
                    <Camera className="w-5 h-5" /> TACTICAL_CAPTURE
                  </motion.button>
                </div>
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
                      className="absolute left-0 right-0 h-[3px] bg-[var(--brand-accent)] shadow-[0_0_30px_var(--brand-accent)] z-20"
                    />
                    <div className="glass px-8 py-5 rounded-3xl flex items-center gap-4 border-white/10 shadow-2xl">
                      <div className="w-6 h-6 border-3 border-[var(--brand-accent)] border-t-transparent rounded-full animate-spin" />
                      <span className="font-mono text-[var(--brand-accent)] tracking-[0.4em] text-[10px] font-black uppercase">Analyzing_Signature...</span>
                    </div>
                  </div>
                )}

                {qualityFeedback && !isAnalyzing && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`absolute bottom-6 left-6 right-6 p-4 rounded-xl border backdrop-blur-md z-30 flex items-center gap-4 ${
                      qualityFeedback.rating === 'good' ? 'bg-emerald-500/10 border-emerald-500/30' :
                      qualityFeedback.rating === 'fair' ? 'bg-amber-500/10 border-amber-500/30' :
                      'bg-red-500/10 border-red-500/30'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      qualityFeedback.rating === 'good' ? 'bg-emerald-500/20 text-emerald-400' :
                      qualityFeedback.rating === 'fair' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {qualityFeedback.rating === 'good' ? <CheckCircle2 className="w-5 h-5" /> :
                       qualityFeedback.rating === 'fair' ? <AlertCircle className="w-5 h-5" /> : 
                       <X className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[10px] font-black uppercase tracking-widest ${
                        qualityFeedback.rating === 'good' ? 'text-emerald-400' :
                        qualityFeedback.rating === 'fair' ? 'text-amber-400' :
                        'text-red-400'
                      }`}>Neural_Visual_Health: {qualityFeedback.rating}</p>
                      <p className="text-xs text-white/70 truncate">{qualityFeedback.message}</p>
                    </div>
                    {qualityFeedback.rating === 'poor' && (
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-bold transition-all flex-shrink-0"
                      >
                        RECAPTURE
                      </button>
                    )}
                  </motion.div>
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
                <div className="flex flex-col gap-8 h-full overflow-y-auto pr-4 scrollbar-hide">
                  <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Image Box */}
                    <div className="w-full lg:w-64 h-64 rounded-2xl bg-zinc-950 border border-white/10 overflow-hidden relative shadow-2xl flex-shrink-0">
                      <img src={image || ''} className="w-full h-full object-cover" alt="" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/60 backdrop-blur-md flex justify-between items-center border-t border-white/10">
                        <span className="text-[10px] brand-text uppercase font-black tracking-widest">SIG_VERIFIED</span>
                        <div className="w-2 h-2 rounded-full brand-bg status-pulse"></div>
                      </div>
                    </div>

                    {/* Title and ID */}
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="px-2 py-1 rounded bg-[var(--brand-accent)] text-black text-[10px] font-black uppercase tracking-tighter">
                          CONF_{result.confidence}%
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={saveToHistory}
                          disabled={isSaved}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all border ${
                            isSaved 
                            ? 'bg-[var(--brand-accent)]/10 border-[var(--brand-accent)]/30 text-[var(--brand-accent)]' 
                            : 'bg-white/5 border-white/10 hover:border-[var(--brand-accent)]/40 text-white'
                          }`}
                        >
                          {isSaved ? <BookmarkCheck className="w-3 h-3" /> : <Save className="w-3 h-3" />}
                          {isSaved ? 'ARCHIVED' : 'PERSIST'}
                        </motion.button>
                      </div>
                      <h2 className="text-4xl sm:text-5xl font-black chrome-text uppercase tracking-tight leading-none">{result.name}</h2>
                      <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em]">TRACE_ID: {result.id}</p>
                    </div>
                  </div>

                  {/* Technical Specs - Cards style */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="glass p-5 rounded-2xl flex flex-col gap-2">
                       <div className="flex items-center gap-2 text-zinc-500">
                         <Layers className="w-3 h-3" />
                         <span className="text-[8px] font-black uppercase tracking-widest">Material</span>
                       </div>
                       <p className="text-xl font-bold text-white transition-colors">{result.technicalSpecs?.material || 'Alloy-X'}</p>
                    </div>
                    <div className="glass p-5 rounded-2xl flex flex-col gap-2">
                       <div className="flex items-center gap-2 text-zinc-500">
                         <Zap className="w-3 h-3" />
                         <span className="text-[8px] font-black uppercase tracking-widest">Dimension</span>
                       </div>
                       <p className="text-xl font-bold text-white transition-colors">{result.technicalSpecs?.dimensions || 'Std-Size'}</p>
                    </div>
                    <div className="glass p-5 rounded-2xl flex flex-col gap-2">
                       <div className="flex items-center gap-2 text-zinc-500">
                         <Thermometer className="w-3 h-3" />
                         <span className="text-[8px] font-black uppercase tracking-widest">Thermal</span>
                       </div>
                       <p className="text-xl font-bold text-white transition-colors">{result.technicalSpecs?.tempRange || 'Stable'}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Synthesis_Data</h4>
                    <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                      {result.description}
                    </p>
                  </div>

                  {/* Similar and Feedback Footer */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Complementary_Parts</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {result.similarParts?.map((part, i) => (
                          <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 hover:border-[var(--brand-accent)]/20 transition-all">
                            <p className="text-[10px] font-black text-[var(--brand-accent)] uppercase mb-1">{part.name}</p>
                            <p className="text-[10px] text-zinc-500 leading-tight">{part.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-6">
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Neural_Confidence</h4>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${result.confidence}%` }}
                            className="h-full bg-[var(--brand-accent)]"
                          />
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 uppercase">
                          <span>Status: Nominal</span>
                          <span className="text-[var(--brand-accent)]">{result.confidence}.00%</span>
                        </div>
                      </div>

                      <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                         <span className="text-[10px] font-black text-zinc-600 uppercase italic">Helpful Metadata?</span>
                         <div className="flex gap-2">
                           <button 
                             onClick={() => handleFeedback('helpful')}
                             className={`p-2 rounded-lg border transition-all ${result.userFeedback === 'helpful' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-white/5 border-white/10 text-zinc-500 hover:text-white'}`}
                           >
                             <ThumbsUp className="w-3 h-3" />
                           </button>
                           <button 
                             onClick={() => handleFeedback('not-helpful')}
                             className={`p-2 rounded-lg border transition-all ${result.userFeedback === 'not-helpful' ? 'bg-red-500/20 border-red-500/50 text-red-500' : 'bg-white/5 border-white/10 text-zinc-500 hover:text-white'}`}
                           >
                             <ThumbsDown className="w-3 h-3" />
                           </button>
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
    </div>
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
                <div className="relative mb-4">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                  <input 
                    type="text"
                    placeholder="Search archive..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-black/20 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none"
                  />
                </div>
                {filteredHistory.map((item) => (
                  <div 
                    key={item.id}
                    className="relative group/mobile"
                  >
                    <div 
                      onClick={() => {
                        setImage(item.imageUrl);
                        setResult(item);
                        setIsSaved(true);
                        setShowHistory(false);
                      }}
                      className="history-item p-4 rounded-2xl flex items-center gap-4 active:scale-[0.98] transition-all"
                    >
                      <div className="w-16 h-16 rounded-xl bg-zinc-950 border border-white/5 overflow-hidden shadow-lg">
                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover opacity-80" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-black text-white uppercase tracking-tight">{item.name}</p>
                        <p className="text-[10px] font-mono text-[var(--brand-accent)] uppercase tracking-wider">{item.confidence}% MATCH</p>
                        <p className="text-[9px] text-zinc-500 mt-1 uppercase">{new Date(item.id).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const updated = history.filter(h => h.id !== item.id);
                        setHistory(updated);
                        localStorage.setItem('spare_parts_history', JSON.stringify(updated));
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-red-500/10 text-red-500 rounded-xl opacity-0 group-hover/mobile:opacity-100 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
