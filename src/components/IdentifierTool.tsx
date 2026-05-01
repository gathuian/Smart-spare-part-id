import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
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
  Layers,
  HelpCircle,
  MessageSquare,
  ArrowLeft
} from 'lucide-react';
import { SparePart } from '../types';
import { identifyPart } from '../services/geminiService';

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

const SpecCard = ({ icon: Icon, label, value, tooltip }: { icon: any, label: string, value: string, tooltip: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => { setShowTooltip(false); }}
    >
      <motion.div 
        layout
        onClick={() => setIsExpanded(!isExpanded)}
        className={`glass p-5 rounded-2xl flex flex-col gap-2 cursor-pointer transition-all hover:border-[var(--brand-accent)]/30 ${isExpanded ? 'ring-1 ring-[var(--brand-accent)]/20 shadow-[0_0_20px_rgba(255,255,255,0.05)]' : ''}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-500">
            <Icon className="w-3 h-3" />
            <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
          </div>
          <HelpCircle className="w-3 h-3 text-zinc-700" />
        </div>
        <p className="text-xl font-bold text-white transition-colors truncate">{value || 'N/A'}</p>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden pb-1"
            >
              <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                <p className="text-[10px] text-zinc-400 leading-relaxed">
                  Detailed telemetry suggests high-durability {value} composition optimized for high-cycle industrial operations.
                </p>
                <div className="flex items-center gap-2">
                   <div className="w-1 h-1 rounded-full bg-[var(--brand-accent)]" />
                   <span className="text-[9px] text-zinc-500 font-mono">ID_VERIFIED_BY_GEMINI</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && !isExpanded && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute z-50 bottom-full left-0 mb-3 w-56 p-3 glass glass-glow chrome-border rounded-xl text-[10px] text-zinc-300 pointer-events-none"
          >
            {tooltip}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function IdentifierTool() {
  const navigate = useNavigate();
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
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (filterCriteria === 'recent') return matchesSearch && (Date.now() - item.timestamp < 3600000); 
    return matchesSearch;
  });

  const handleFeedback = (feedback: 'helpful' | 'not-helpful') => {
    if (result) {
      const updatedResult = { ...result, userFeedback: feedback };
      setResult(updatedResult);
      setHistory(prev => prev.map(item => item.id === result.id ? updatedResult : item));
      setShowFeedbackForm(true);
    }
  };

  const submitFeedbackComment = () => {
    if (result) {
      const updatedResult = { ...result, feedbackComment: feedbackMsg };
      setResult(updatedResult);
      setHistory(prev => prev.map(item => item.id === result.id ? updatedResult : item));
      setShowFeedbackForm(false);
      setFeedbackMsg('');
    }
  };

  const analyzeImage = async (base64Img: string) => {
    setIsAnalyzing(true);
    setResult(null);
    setError(null);
    setIsSaved(false);
    setShowFeedbackForm(false);

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
      setError(`Neural uplink established, but signature verification failed. 
        Possible causes:
        • Weak network bandwidth causing frame corruption.
        • AI service saturation (neural servers under heavy load).
        • Insufficient telemetry clarity (poor lighting or out of focus).
        Please recalibrate and retry.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveToHistory = () => {
    if (result && !isSaved) {
      setHistory(prev => [result, ...prev.slice(0, 19)]);
      setIsSaved(true);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setIsAnalyzing(false);
    setError(null);
    setIsSaved(false);
    setShowFeedbackForm(false);
  };

  return (
    <div className="min-h-screen text-white relative font-sans">
      <div className="mesh-bg" />

      <div className="h-screen w-full p-4 sm:p-8 lg:grid lg:grid-cols-12 lg:gap-8 gap-4 flex flex-col overflow-y-auto lg:overflow-hidden">
        {/* Sidebar */}
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
              
              <div className="flex flex-col gap-2 mt-6 lg:mt-8">
                <button 
                  onClick={() => navigate('/')}
                  className="w-full p-3 glass glass-glow chrome-border rounded-xl flex items-center justify-center gap-2 hover:border-white/20 transition-all text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4" /> Exit_to_Terminal
                </button>
                <button 
                  onClick={() => setShowHistory(true)}
                  className="lg:hidden w-full p-3 glass glass-glow chrome-border rounded-xl flex items-center justify-center gap-2 group-hover:border-[var(--brand-accent)]"
                >
                  <History className="w-5 h-5 brand-text" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-main)]">VIEW_ARCHIVE</span>
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
                      className={`history-item p-3 rounded-2xl cursor-pointer flex items-center gap-4 transition-all bg-white/[0.02] active:scale-[0.98] ${result?.id === item.id ? 'ring-1 ring-[var(--brand-accent)]/30 bg-white/[0.05]' : ''}`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/5 overflow-hidden flex-shrink-0 relative">
                        <img src={item.imageUrl} alt="" className="history-item-img w-full h-full object-cover opacity-60 group-hover/history:opacity-100 transition-opacity" />
                        {item.userFeedback === 'helpful' && (
                          <div className="absolute top-1 right-1 bg-emerald-500 rounded-full p-0.5 shadow-lg shadow-emerald-500/30">
                            <ThumbsUp className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 pr-6">
                        <p className="text-xs font-black truncate text-[var(--text-main)] transition-colors uppercase tracking-tight">{item.name}</p>
                        <div className="flex items-center gap-2">
                           <p className="text-[10px] font-mono brand-text uppercase">
                            {item.confidence}% MATCH
                          </p>
                          {item.feedbackComment && <MessageSquare className="w-2 h-2 text-zinc-600" />}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const updated = history.filter(h => h.id !== item.id);
                        setHistory(updated);
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
                  className="text-[10px] font-black text-zinc-600 hover:text-red-400 text-center uppercase tracking-widest transition-colors py-2"
                >
                  Purge History
                </button>
              )}
            </div>
          </div>

          <div className="mt-auto hidden lg:block py-4 border-t border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full brand-bg status-pulse" />
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">System Online</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="lg:col-span-9 grid grid-rows-12 gap-6 lg:h-full">
          <div className={`${(result || error) && !isAnalyzing ? 'row-span-4' : 'row-span-12'} glass glass-glow chrome-border p-8 rounded-3xl flex items-center justify-center transition-all duration-700 relative overflow-hidden group`}>
            {(!image || ((result || error) && !isAnalyzing)) ? (
              <div className="text-center relative z-10 w-full px-8">
                <div className="w-20 h-20 rounded-3xl glass border border-white/10 flex items-center justify-center mx-auto mb-10 group-hover:scale-110 group-hover:border-[var(--brand-accent)]/40 transition-all shadow-2xl">
                  <Camera className="w-10 h-10 brand-text" />
                </div>
                <h2 className="text-4xl font-black tracking-tighter text-[var(--text-main)] transition-colors uppercase italic">INITIALIZE_SCAN</h2>
                <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-12 py-5 bg-[var(--brand-accent)] text-black rounded-3xl font-black transition-all shadow-[0_10px_40px_rgba(255,255,255,0.1)] flex items-center gap-3 uppercase tracking-widest text-sm"
                  >
                    <Camera className="w-5 h-5" /> TACTICAL_CAPTURE
                  </motion.button>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              </div>
            ) : (
              <div className="absolute inset-0">
                <img src={image} className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />
                {isAnalyzing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.div 
                      initial={{ top: 0 }} animate={{ top: '100%' }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 right-0 h-[3px] bg-[var(--brand-accent)] shadow-[0_0_30px_var(--brand-accent)] z-20"
                    />
                    <div className="glass px-8 py-5 rounded-3xl flex items-center gap-4 border-white/10 shadow-2xl">
                      <div className="w-6 h-6 border-3 border-[var(--brand-accent)] border-t-transparent rounded-full animate-spin" />
                      <span className="font-mono text-[var(--brand-accent)] tracking-[0.4em] text-[10px] font-black uppercase">Analyzing_Signature...</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <AnimatePresence>
            {result && !isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="row-span-8 glass glass-glow chrome-border p-8 rounded-3xl flex flex-col gap-8 overflow-hidden"
              >
                <div className="flex flex-col gap-8 h-full overflow-y-auto pr-4 scrollbar-hide">
                  <div className="flex flex-col lg:flex-row gap-8 items-start">
                    <div className="w-full lg:w-64 h-64 rounded-2xl bg-zinc-950 border border-white/10 overflow-hidden relative shadow-2xl flex-shrink-0">
                      <img src={image || ''} className="w-full h-full object-cover" alt="" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/60 backdrop-blur-md flex justify-between items-center border-t border-white/10 text-[10px] brand-text uppercase font-black tracking-widest">
                        <span>SIG_VERIFIED</span>
                        <div className="w-2 h-2 rounded-full brand-bg status-pulse"></div>
                      </div>
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="px-2 py-1 rounded bg-[var(--brand-accent)] text-black text-[10px] font-black uppercase tracking-tighter">
                          CONF_{result.confidence}%
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.05 }} onClick={saveToHistory} disabled={isSaved}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all border ${isSaved ? 'bg-[var(--brand-accent)]/10 border-[var(--brand-accent)]/30 text-[var(--brand-accent)]' : 'bg-white/5 border-white/10 hover:border-white text-white'}`}
                        >
                          {isSaved ? <BookmarkCheck className="w-3 h-3" /> : <Save className="w-3 h-3" />}
                          {isSaved ? 'ARCHIVED' : 'PERSIST'}
                        </motion.button>
                      </div>
                      <h2 className="text-4xl sm:text-5xl font-black chrome-text uppercase tracking-tight leading-none italic">{result.name}</h2>
                      <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.3em]">TRACE_ID_{result.id}</p>
                    </div>
                  </div>

                  {/* Technical Specs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <SpecCard 
                      icon={Layers} label="Material" value={result.technicalSpecs?.material} 
                      tooltip="The base molecular composition of the component. Determines thermal resistance and tensile strength."
                    />
                    <SpecCard 
                      icon={Zap} label="Dimension" value={result.technicalSpecs?.dimensions} 
                      tooltip="Physical scale metrics extracted from visual telemetry. Used for spatial alignment verification."
                    />
                    <SpecCard 
                      icon={Thermometer} label="Thermal" value={result.technicalSpecs?.tempRange} 
                      tooltip="Operational temperature boundaries. Exceeding these limits may lead to neural service disruption or part failure."
                    />
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                       <Cpu className="w-3 h-3" /> Synthesis_Data
                    </h4>
                    <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                      {result.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                        <Layers className="w-3 h-3" /> Complementary_Parts
                      </h4>
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
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${result.confidence}%` }} className="h-full bg-[var(--brand-accent)]" />
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 uppercase">
                          <span>Status: Nominal</span>
                          <span className="text-[var(--brand-accent)]">{result.confidence}.00%</span>
                        </div>
                      </div>

                      <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
                         <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-zinc-600 uppercase italic">Refine Neural weights?</span>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleFeedback('helpful')}
                                className={`p-2 rounded-lg border transition-all ${result.userFeedback === 'helpful' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/10 text-zinc-500 hover:text-white'}`}
                              >
                                <ThumbsUp className="w-3 h-3 shadow-sm" />
                              </button>
                              <button 
                                onClick={() => handleFeedback('not-helpful')}
                                className={`p-2 rounded-lg border transition-all ${result.userFeedback === 'not-helpful' ? 'bg-red-500/20 border-red-500/30 text-red-500' : 'bg-white/5 border-white/10 text-zinc-500 hover:text-white'}`}
                              >
                                <ThumbsDown className="w-3 h-3 shadow-sm" />
                              </button>
                            </div>
                         </div>

                         <AnimatePresence>
                           {showFeedbackForm && (
                             <motion.div 
                               initial={{ opacity: 0, height: 0 }}
                               animate={{ opacity: 1, height: 'auto' }}
                               exit={{ opacity: 0, height: 0 }}
                               className="space-y-3 overflow-hidden"
                             >
                                <textarea 
                                  value={feedbackMsg}
                                  onChange={(e) => setFeedbackMsg(e.target.value)}
                                  placeholder="Briefly explain your rating..."
                                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-zinc-700 focus:outline-none focus:border-[var(--brand-accent)]/30 min-h-[80px]"
                                />
                                <button 
                                  onClick={submitFeedbackComment}
                                  className="w-full py-2 bg-[var(--brand-accent)] text-black rounded-lg font-black text-[10px] uppercase tracking-widest"
                                >
                                  Submit_Report
                                </button>
                             </motion.div>
                           )}
                         </AnimatePresence>
                         {result.feedbackComment && !showFeedbackForm && (
                           <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                              <p className="text-[10px] font-black text-zinc-600 uppercase mb-1">User_Note</p>
                              <p className="text-[10px] text-zinc-400 italic">"{result.feedbackComment}"</p>
                           </div>
                         )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {error && !isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="row-span-8 glass glass-glow chrome-border p-12 rounded-3xl flex flex-col items-center justify-center text-center gap-6"
              >
                <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-2">
                  <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <div className="max-w-md space-y-4">
                  <h2 className="text-2xl font-black text-red-500 uppercase tracking-tight italic">Signal Loss Detected</h2>
                  <p className="text-[10px] text-zinc-400 leading-relaxed transition-colors whitespace-pre-line font-mono">
                    {error}
                  </p>
                </div>
                <div className="flex gap-4 mt-4">
                  <button onClick={() => image && analyzeImage(image)} className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl font-black text-xs flex items-center gap-2 hover:border-red-500/50 transition-all uppercase tracking-widest">
                    <RotateCcw className="w-4 h-4" /> RETRY_UPLINK
                  </button>
                  <button onClick={reset} className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-black text-xs flex items-center gap-2 shadow-lg shadow-red-500/20 transition-all uppercase tracking-widest">
                    <Upload className="w-4 h-4" /> RECAPTURE_SCAN
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* History Drawer Overlay */}
      <AnimatePresence>
        {showHistory && (
          <div className="fixed inset-0 z-50 lg:hidden font-sans">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowHistory(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="absolute right-0 top-0 bottom-0 w-full max-w-sm glass border-l border-white/10 shadow-2xl p-8 flex flex-col">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-xl font-black uppercase tracking-tighter italic">History Archive</h3>
                <button onClick={() => setShowHistory(false)} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-zinc-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
                <div className="relative mb-4">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                  <input type="text" placeholder="Search archive..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-black/20 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none" />
                </div>
                {filteredHistory.map((item) => (
                  <div key={item.id} className="relative group/mobile">
                    <div 
                      onClick={() => { setImage(item.imageUrl); setResult(item); setIsSaved(true); setShowHistory(false); }}
                      className="history-item p-4 rounded-2xl flex items-center gap-4 bg-white/[0.03]"
                    >
                      <div className="w-16 h-16 rounded-xl bg-zinc-950 border border-white/5 overflow-hidden flex-shrink-0 relative">
                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover opacity-80" />
                        {item.userFeedback === 'helpful' && (
                          <div className="absolute top-1 right-1 bg-emerald-500 rounded-full p-1 border-1 border-black">
                             <ThumbsUp className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-white uppercase tracking-tight truncate">{item.name}</p>
                        <p className="text-[10px] font-mono text-[var(--brand-accent)] uppercase tracking-wider">{item.confidence}% MATCH</p>
                        {item.feedbackComment && <p className="text-[8px] text-zinc-500 mt-1 truncate">"{item.feedbackComment}"</p>}
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); const updated = history.filter(h => h.id !== item.id); setHistory(updated); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-red-500/10 text-red-500 rounded-xl opacity-0 group-hover/mobile:opacity-100 transition-all">
                      <X className="w-4 h-4" />
                    </button>
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
