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
  ArrowLeft,
  BookOpen,
  Terminal,
  Rocket,
  Youtube,
  ExternalLink,
  TableProperties
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
  const [sessionResults, setSessionResults] = useState<SparePart[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<SparePart[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCriteria, setFilterCriteria] = useState<'all' | 'high' | 'recent' | 'saved' | 'material' | 'temp' | 'date'>('all');
  const [filterValue, setFilterValue] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState<string | null>(null);
  const [qualityFeedback, setQualityFeedback] = useState<{rating: 'good' | 'fair' | 'poor', message: string} | null>(null);
  const [showFeedbackFormId, setShowFeedbackFormId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [comparingParts, setComparingParts] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scanContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('has_seen_onboarding');
    if (!hasSeenTour) {
      setShowOnboarding(true);
    }
  }, []);

  const completeOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('has_seen_onboarding', 'true');
  };

  const onboardingSteps = [
    {
      title: "INITIALIZE_NEURAL_LINK",
      description: "Welcome to SMART ID. Our neural network can identify industrial components with high precision.",
      icon: Cpu,
      position: "center"
    },
    {
      title: "SCAN_CARGO",
      description: "Use the TACTICAL_CAPTURE button to upload or take a photo of any mechanical part.",
      icon: Camera,
      position: "top"
    },
    {
      title: "ARCHIVE_TELEMETRY",
      description: "Your scans are automatically tracked in the Archive Log for future reference.",
      icon: History,
      position: "left"
    },
    {
      title: "SYNC_COMPLETE",
      description: "You're now ready to begin. Establish uplink whenever you're ready.",
      icon: Rocket,
      position: "center"
    }
  ];

  useEffect(() => {
    const saved = localStorage.getItem('spare_parts_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHistory(parsed);
        setSavedIds(new Set(parsed.map((item: SparePart) => item.id)));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('spare_parts_history', JSON.stringify(history));
    setSavedIds(new Set(history.map(item => item.id)));
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
          poor: "Low image quality detected. Attempting identification with enhanced neural processing."
        };
        
        setQualityFeedback({
          rating: randomQ,
          message: messages[randomQ]
        });

        // Always attempt scan regardless of quality rating
        analyzeImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Check filter criteria
    if (filterCriteria === 'high') return matchesSearch && item.confidence >= 90;
    if (filterCriteria === 'recent') return matchesSearch && (Date.now() - item.timestamp < 24 * 3600000);
    if (filterCriteria === 'saved') return matchesSearch && savedIds.has(item.id);
    if (filterCriteria === 'material') return matchesSearch && item.technicalSpecs.material.toLowerCase().includes(filterValue.toLowerCase());
    if (filterCriteria === 'temp') return matchesSearch && item.technicalSpecs.tempRange.includes(filterValue);
    if (filterCriteria === 'date') {
      const itemDate = new Date(item.timestamp).toISOString().split('T')[0];
      return matchesSearch && itemDate === filterValue;
    }
    
    return matchesSearch;
  });

  const generateImagenPlaceholder = async (part: SparePart) => {
    setIsGeneratingImage(part.id);
    // Simulate Imagen processing
    setTimeout(() => {
      setIsGeneratingImage(null);
    }, 2000);
  };

  const toggleComparison = (id: string) => {
    setComparingParts(prev => {
      if (prev.includes(id)) return prev.filter(pid => pid !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const getComparedParts = () => {
    return history.concat(sessionResults).filter(p => comparingParts.includes(p.id));
  };

  const handleFeedback = (partId: string, feedback: 'helpful' | 'not-helpful') => {
    const updateResults = sessionResults.map(res => 
      res.id === partId ? { ...res, userFeedback: feedback } : res
    );
    setSessionResults(updateResults);

    setHistory(prev => prev.map(item => item.id === partId ? { ...item, userFeedback: feedback } : item));
    setShowFeedbackFormId(partId);
  };

  const submitFeedbackComment = (partId: string) => {
    const updateResults = sessionResults.map(res => 
      res.id === partId ? { ...res, feedbackComment: feedbackMsg } : res
    );
    setSessionResults(updateResults);

    setHistory(prev => prev.map(item => item.id === partId ? { ...item, feedbackComment: feedbackMsg } : item));
    setShowFeedbackFormId(null);
    setFeedbackMsg('');
  };

  const analyzeImage = async (base64Img: string) => {
    setIsAnalyzing(true);
    setError(null);
    setShowFeedbackFormId(null);

    try {
      const aiResult = await identifyPart(base64Img);
      
      const newResult: SparePart = {
        ...aiResult,
        id: Math.random().toString(36).substr(2, 9),
        imageUrl: base64Img,
        timestamp: Date.now(),
      };

      setSessionResults(prev => [newResult, ...prev]);
      setImage(null); // Clear preview for next scan
      setQualityFeedback(null);
      
      // Auto-scroll to the new result
      setTimeout(() => {
        scanContainerRef.current?.scrollBy({ top: 300, behavior: 'smooth' });
      }, 100);

    } catch (err) {
      console.error("AI Analysis failed", err);
      setError(`Neural signature identification failed. 
        UNABLE_TO_SCAN: The image could not be definitively mapped to a known industrial component.
        
        Primary Diagnostics:
        • Geometric Deformation: The part may be too damaged or distorted for architectural matching.
        • Telemetry Interference: High noise or motion blur in the capture feed.
        • Shadow Occlusion: Critical mounting points or labels are obscured by poor lighting.
        
        Recommendation: Recalibrate lighting and re-attempt capture from a different angle.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveToHistory = (part: SparePart) => {
    if (!savedIds.has(part.id)) {
      setHistory(prev => [part, ...prev.slice(0, 19)]);
    }
  };

  const reset = () => {
    setImage(null);
    setIsAnalyzing(false);
    setError(null);
    setSessionResults([]);
    setShowFeedbackFormId(null);
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
                <div className="sidebar-item" onClick={() => navigate('/resources')}>
                  <BookOpen className="w-5 h-5 flex-shrink-0" />
                  <span>Study Guide</span>
                </div>
                <div className="sidebar-item" onClick={() => navigate('/resources')}>
                  <Settings className="w-5 h-5 flex-shrink-0" />
                  <span>Integration Hub</span>
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
                      <option value="saved">SAVED_ONLY</option>
                      <option value="material">MATERIAL</option>
                      <option value="temp">TEMPERATURE</option>
                      <option value="date">DATE_REPORT</option>
                    </select>
                  </div>
                </div>

                {(filterCriteria === 'material' || filterCriteria === 'temp' || filterCriteria === 'date') && (
                  <div className="relative mx-1 mt-2">
                    <input 
                      type={filterCriteria === 'date' ? 'date' : 'text'}
                      placeholder={`Filter by ${filterCriteria}...`}
                      value={filterValue}
                      onChange={(e) => setFilterValue(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-xl py-2 px-4 text-[10px] text-[var(--brand-accent)] placeholder:text-zinc-700 focus:outline-none focus:border-[var(--brand-accent)]/30 transition-all font-mono uppercase"
                    />
                  </div>
                )}

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
                        setSessionResults(prev => {
                           if (prev.some(p => p.id === item.id)) return prev;
                           return [item, ...prev];
                        });
                      }}
                      className={`history-item p-3 rounded-2xl cursor-pointer flex items-center gap-4 transition-all bg-white/[0.02] active:scale-[0.98] ${sessionResults.some(res => res.id === item.id) ? 'ring-1 ring-[var(--brand-accent)]/30 bg-white/[0.05]' : ''}`}
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
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-black truncate text-[var(--text-main)] transition-colors uppercase tracking-tight">{item.name}</p>
                          <button 
                            onClick={(e) => { e.stopPropagation(); generateImagenPlaceholder(item); }}
                            className={`p-1 rounded-lg border transition-all ${isGeneratingImage === item.id ? 'animate-pulse bg-emerald-500/20 border-emerald-500/30' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                            title="Generate Imagen Visual"
                          >
                            {isGeneratingImage === item.id ? <RotateCcw className="w-2 h-2 animate-spin" /> : <Rocket className="w-2 h-2" />}
                          </button>
                        </div>
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
        <main className="lg:col-span-9 flex flex-col gap-6 h-full overflow-hidden">
          {/* Scanner Header - Always available for next scan */}
          <div className="glass glass-glow chrome-border p-8 rounded-3xl flex items-center justify-center transition-all duration-700 relative overflow-hidden group shrink-0">
            {!isAnalyzing ? (
              <div className="text-center relative z-10 w-full px-8">
                <div className="flex items-center justify-center gap-8">
                  <div className="w-16 h-16 rounded-2xl glass border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:border-[var(--brand-accent)]/40 transition-all shadow-2xl">
                    <Camera className="w-8 h-8 brand-text" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-2xl font-black tracking-tighter text-[var(--text-main)] transition-colors uppercase italic">CONTINUE_SCAN</h2>
                    <p className="text-[10px] font-mono text-zinc-500 mt-1 uppercase tracking-widest leading-none">Neural Feed Active // Ready for Input</p>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="ml-auto px-8 py-4 bg-[var(--brand-accent)] text-black rounded-2xl font-black transition-all shadow-[0_10px_40px_rgba(255,255,255,0.1)] flex items-center gap-3 uppercase tracking-widest text-xs"
                  >
                    <Camera className="w-4 h-4" /> SCAN_NEW_ITEM
                  </motion.button>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              </div>
            ) : (
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />
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
              </div>
            )}
            
            {qualityFeedback && !isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`absolute bottom-4 left-4 right-4 p-3 rounded-xl border backdrop-blur-md z-30 flex items-center gap-4 ${
                  qualityFeedback.rating === 'good' ? 'bg-emerald-500/10 border-emerald-500/30' :
                  qualityFeedback.rating === 'fair' ? 'bg-amber-500/10 border-amber-500/30' :
                  'bg-red-500/10 border-red-500/30'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[8px] font-black uppercase tracking-widest opacity-50">Visual_Telemetry_Health</p>
                  <p className="text-xs text-white/90 truncate">{qualityFeedback.message}</p>
                </div>
                {qualityFeedback.rating === 'poor' && (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-[9px] font-black uppercase transition-all flex-shrink-0"
                  >
                    RECAPTURE
                  </button>
                )}
              </motion.div>
            )}
          </div>

          {/* Results Feed */}
          <div 
            ref={scanContainerRef}
            className="flex-1 overflow-y-auto space-y-6 pb-20 scrollbar-hide pt-2"
          >
            {sessionResults.length > 0 && (
              <div className="flex justify-end pr-2">
                <button 
                  onClick={reset}
                  className="px-6 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                >
                  <RotateCcw className="w-3 h-3" /> Flush_Session_Log
                </button>
              </div>
            )}
            <AnimatePresence>
              {error && !isAnalyzing && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass chrome-border p-8 rounded-3xl flex flex-col items-center justify-center text-center gap-4 bg-red-500/5 border-red-500/20"
                >
                  <div className="p-3 rounded-full bg-red-500/10 border border-red-500/10">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-relaxed font-mono whitespace-pre-line max-w-md">
                    {error}
                  </p>
                  <button onClick={() => analyzeImage(image || '')} className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl font-black text-[10px] uppercase hover:border-red-500/50 transition-all flex items-center gap-2">
                    <RotateCcw className="w-3 h-3" /> Retry_Neural_Lock
                  </button>
                </motion.div>
              )}

              {sessionResults.map((resultItem, index) => (
                <motion.div 
                  key={resultItem.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`glass glass-glow chrome-border p-8 rounded-3xl flex flex-col gap-8 overflow-hidden relative ${index === 0 ? 'ring-2 ring-[var(--brand-accent)]/20 shadow-[0_0_50px_rgba(255,255,255,0.05)]' : 'opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0 transition-all'}`}
                >
                  <div className="absolute top-0 right-0 p-4">
                    <button 
                      onClick={() => setSessionResults(prev => prev.filter(r => r.id !== resultItem.id))}
                      className="p-2 glass rounded-lg border border-white/5 text-zinc-600 hover:text-white transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-col lg:flex-row gap-8 items-start">
                    <div className="w-full lg:w-48 h-48 rounded-2xl bg-zinc-950 border border-white/10 overflow-hidden relative shadow-2xl flex-shrink-0">
                      <img src={resultItem.imageUrl} className="w-full h-full object-cover" alt="" />
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 backdrop-blur-md flex justify-between items-center border-t border-white/10 text-[8px] font-black uppercase tracking-widest text-zinc-500">
                        <span>TRACE_VERIFIED</span>
                        <div className="w-1.5 h-1.5 rounded-full brand-bg"></div>
                      </div>
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="px-2 py-1 rounded bg-[var(--brand-accent)] text-black text-[9px] font-black uppercase tracking-tighter shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                          MATCH_{resultItem.confidence}%
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.05 }} 
                          onClick={() => toggleComparison(resultItem.id)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black transition-all border ${comparingParts.includes(resultItem.id) ? 'bg-[var(--brand-accent)] text-black border-transparent' : 'bg-white/5 border-white/10 hover:border-white text-white'}`}
                        >
                          <TableProperties className="w-3 h-3" />
                          {comparingParts.includes(resultItem.id) ? 'DESELECT_FOR_COMPARE' : 'ADD_TO_COMPARE'}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }} 
                          onClick={() => saveToHistory(resultItem)} 
                          disabled={savedIds.has(resultItem.id)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black transition-all border ${savedIds.has(resultItem.id) ? 'bg-[var(--brand-accent)]/10 border-[var(--brand-accent)]/30 text-[var(--brand-accent)]' : 'bg-white/5 border-white/10 hover:border-white text-white'}`}
                        >
                          {savedIds.has(resultItem.id) ? <BookmarkCheck className="w-3 h-3" /> : <Save className="w-3 h-3" />}
                          {savedIds.has(resultItem.id) ? 'ARCHIVED' : 'PERSIST'}
                        </motion.button>
                      </div>
                      <h2 className="text-3xl sm:text-4xl font-black chrome-text uppercase tracking-tight leading-none italic">{resultItem.name}</h2>
                      <div className="flex items-center gap-4">
                        <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.3em]">TELEMETRY_ID_{resultItem.id}</p>
                        <p className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest">{new Date(resultItem.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <SpecCard icon={Layers} label="Material" value={resultItem.technicalSpecs?.material} tooltip="Molecular base verified." />
                    <SpecCard icon={Zap} label="Dimension" value={resultItem.technicalSpecs?.dimensions} tooltip="Spatial scale extraction." />
                    <SpecCard icon={Thermometer} label="Thermal" value={resultItem.technicalSpecs?.tempRange} tooltip="Threshold boundaries." />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                       <h4 className="text-[9px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2"><Cpu className="w-2.5 h-2.5" /> Result_Summary</h4>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed font-medium">{resultItem.description}</p>
                  </div>

                  {resultItem.maintenanceTips && resultItem.maintenanceTips.length > 0 && (
                    <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-3">
                      <h4 className="text-[9px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2"><Zap className="w-3 h-3" /> Maintenance_Directives</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {resultItem.maintenanceTips.map((tip, i) => (
                          <div key={i} className="flex gap-2">
                            <div className="w-1 h-1 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                            <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">{tip}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {resultItem.youtubeSearchQuery && (
                    <div className="space-y-4">
                      <h4 className="text-[9px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2"><Youtube className="w-3 h-3" /> Technical_Deep_Dive</h4>
                      <div className="aspect-video w-full rounded-2xl glass border border-white/5 overflow-hidden relative group">
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 group-hover:bg-black/20 transition-all">
                          <Youtube className="w-12 h-12 text-red-600 mb-3" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-white">Neural feed: {resultItem.youtubeSearchQuery}</p>
                          <a 
                            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(resultItem.youtubeSearchQuery)}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                          >
                            <ExternalLink className="w-3 h-3" /> Open_Intelligence_Feeds
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex-1">
                      <h4 className="text-[8px] font-black text-zinc-700 uppercase tracking-widest mb-3">Compatibility_Checks</h4>
                      <div className="flex flex-wrap gap-2">
                        {resultItem.similarParts?.map((part, i) => (
                          <div key={i} className="px-3 py-2 bg-white/5 rounded-xl border border-white/5 hover:border-[var(--brand-accent)]/20 transition-all">
                            <p className="text-[9px] font-black text-[var(--brand-accent)] uppercase">{part.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="w-full md:w-64 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-zinc-600 uppercase italic">Validate Result?</span>
                        <div className="flex gap-2">
                          <button onClick={() => handleFeedback(resultItem.id, 'helpful')} className={`p-1.5 rounded-lg border transition-all ${resultItem.userFeedback === 'helpful' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/10 text-zinc-500 hover:text-white'}`}><ThumbsUp className="w-3 h-3" /></button>
                          <button onClick={() => handleFeedback(resultItem.id, 'not-helpful')} className={`p-1.5 rounded-lg border transition-all ${resultItem.userFeedback === 'not-helpful' ? 'bg-red-500/20 border-red-500/30 text-red-500' : 'bg-white/5 border-white/10 text-zinc-500 hover:text-white'}`}><ThumbsDown className="w-3 h-3" /></button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {showFeedbackFormId === resultItem.id && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2 overflow-hidden">
                            <textarea value={feedbackMsg} onChange={(e) => setFeedbackMsg(e.target.value)} placeholder="Refinement note..." className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-[10px] text-white focus:outline-none min-h-[60px]" />
                            <button onClick={() => submitFeedbackComment(resultItem.id)} className="w-full py-1.5 bg-[var(--brand-accent)] text-black rounded-lg font-black text-[9px] uppercase tracking-widest">SUBMIT_REPORT</button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      {resultItem.feedbackComment && showFeedbackFormId !== resultItem.id && (
                        <div className="p-2 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                          <p className="text-[9px] text-zinc-500 italic">"{resultItem.feedbackComment}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {sessionResults.length === 0 && !isAnalyzing && !error && (
              <div className="h-64 flex flex-col items-center justify-center text-zinc-700 font-black uppercase italic grayscale opacity-30">
                <Layers className="w-12 h-12 mb-4" />
                <span>Session_Log_Empty</span>
              </div>
            )}
          </div>
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
                      onClick={() => { 
                        setSessionResults(prev => prev.some(p => p.id === item.id) ? prev : [item, ...prev]); 
                        setShowHistory(false); 
                      }}
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

      {/* Comparison Overlay */}
      <AnimatePresence>
        {comparingParts.length === 2 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
             <motion.div 
               initial={{ scale: 0.95, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.95, opacity: 0 }}
               className="w-full max-w-5xl glass glass-glow chrome-border rounded-[40px] p-10 relative"
             >
                <div className="flex justify-between items-center mb-12">
                   <div>
                     <h3 className="text-3xl font-black chrome-text uppercase tracking-tight italic">Technical Comparison</h3>
                     <p className="text-[10px] brand-text font-black uppercase tracking-widest mt-1">Direct Telemetry Alignment</p>
                   </div>
                   <button 
                     onClick={() => setComparingParts([])}
                     className="p-4 glass rounded-2xl hover:bg-white/10 transition-all border border-white/10"
                   >
                     <X className="w-6 h-6" />
                   </button>
                </div>

                <div className="grid grid-cols-2 gap-12">
                   {getComparedParts().map((part) => (
                     <div key={part.id} className="space-y-8">
                        <div className="h-48 w-full rounded-2xl overflow-hidden glass border border-white/10 relative">
                           <img src={part.imageUrl} className="w-full h-full object-cover" alt="" />
                           <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 text-[9px] font-black uppercase">
                              {part.confidence}% CONF
                           </div>
                        </div>
                        <h4 className="text-2xl font-black uppercase italic tracking-tight">{part.name}</h4>
                        
                        <div className="space-y-4">
                           <div className="grid grid-cols-1 gap-2">
                             <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                               <p className="text-[8px] font-black uppercase text-zinc-500 mb-1">Material_Composition</p>
                               <p className="font-bold text-white">{part.technicalSpecs.material}</p>
                             </div>
                             <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                               <p className="text-[8px] font-black uppercase text-zinc-500 mb-1">Dimensional_Metrics</p>
                               <p className="font-bold text-white">{part.technicalSpecs.dimensions}</p>
                             </div>
                             <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                               <p className="text-[8px] font-black uppercase text-zinc-500 mb-1">Thermal_Threshold</p>
                               <p className="font-bold text-[var(--brand-accent)]">{part.technicalSpecs.tempRange}</p>
                             </div>
                           </div>
                        </div>

                        <div className="p-4 rounded-xl glass border border-[var(--brand-accent)]/10">
                           <p className="text-[8px] font-black uppercase text-zinc-500 mb-2">Neural_Trace_Summary</p>
                           <p className="text-xs text-zinc-400 leading-relaxed font-medium line-clamp-3">{part.description}</p>
                        </div>
                     </div>
                   ))}
                </div>

                <div className="mt-12 pt-8 border-t border-white/5 flex justify-center">
                   <button 
                     onClick={() => setComparingParts([])}
                     className="px-12 py-4 bg-[var(--brand-accent)] text-black rounded-2xl font-black text-xs uppercase tracking-widest"
                   >
                     CLOSE_COMPARISON_VIEW
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Onboarding Overlay */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md w-full glass glass-glow chrome-border p-10 rounded-[32px] text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                <motion.div 
                  className="h-full bg-[var(--brand-accent)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${((onboardingStep + 1) / onboardingSteps.length) * 100}%` }}
                />
              </div>
              
              <div className="mb-8 flex justify-center">
                <div className="w-16 h-16 rounded-2xl bg-[var(--brand-accent)]/10 border border-[var(--brand-accent)]/20 flex items-center justify-center">
                  {onboardingSteps[onboardingStep].icon && (
                    <motion.div
                      key={onboardingStep}
                      initial={{ rotate: -10, scale: 0.8 }}
                      animate={{ rotate: 0, scale: 1 }}
                    >
                      {(() => {
                        const Icon = onboardingSteps[onboardingStep].icon;
                        return <Icon className="w-8 h-8 text-[var(--brand-accent)]" />;
                      })()}
                    </motion.div>
                  )}
                </div>
              </div>
              
              <h3 className="text-2xl font-black chrome-text uppercase tracking-tight italic mb-4">
                {onboardingSteps[onboardingStep].title}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-10 font-medium">
                {onboardingSteps[onboardingStep].description}
              </p>
              
              <div className="flex gap-4">
                {onboardingStep > 0 && (
                  <button 
                    onClick={() => setOnboardingStep(s => s - 1)}
                    className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-white/30 transition-all"
                  >
                    BACK_STEP
                  </button>
                )}
                <button 
                  onClick={() => {
                    if (onboardingStep < onboardingSteps.length - 1) {
                      setOnboardingStep(s => s + 1);
                    } else {
                      completeOnboarding();
                    }
                  }}
                  className="flex-[2] py-4 bg-[var(--brand-accent)] text-black rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
                >
                  {onboardingStep === onboardingSteps.length - 1 ? 'START_MISSION' : 'CONTINUE_SYNC'}
                </button>
              </div>
              
              <button 
                onClick={completeOnboarding}
                className="mt-6 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] hover:text-white transition-colors"
              >
                Skip_Tutorial
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
