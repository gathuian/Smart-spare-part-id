import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Cpu, 
  BookOpen, 
  Rocket, 
  Terminal, 
  ShieldCheck, 
  Code, 
  Globe, 
  Zap,
  ChevronRight,
  Database,
  Cloud,
  Layers,
  Search,
  Youtube
} from 'lucide-react';

const ComingSoonBadge = () => (
  <span className="px-2 py-0.5 rounded-full bg-[var(--brand-accent)]/10 border border-[var(--brand-accent)]/20 text-[8px] font-black uppercase tracking-widest text-[var(--brand-accent)]">
    Coming_Soon
  </span>
);

const SectionHeader = ({ title, subtitle, icon: Icon }: { title: string, subtitle: string, icon: any }) => (
  <div className="mb-12">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 glass rounded-lg border border-white/10">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h2 className="text-3xl font-black uppercase italic chrome-text tracking-tighter">{title}</h2>
    </div>
    <p className="text-zinc-500 text-sm max-w-xl leading-relaxed">{subtitle}</p>
  </div>
);

export default function ResourcesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white relative font-sans selection:bg-white selection:text-black pb-40">
      <div className="mesh-bg opacity-30 fixed inset-0 pointer-events-none" />

      {/* Persistent Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-6 backdrop-blur-md border-b border-white/5">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all p-2 glass rounded-xl border border-white/5"
        >
          <ArrowLeft className="w-4 h-4" /> Return_to_Sector
        </button>
        <div className="flex items-center gap-3">
          <Cpu className="w-5 h-5 text-zinc-300" />
          <span className="text-sm font-black uppercase tracking-tighter">Documentation_Suite</span>
        </div>
      </nav>

      <main className="container mx-auto px-6 mt-20 max-w-5xl">
        
        {/* Tutorial Section */}
        <SectionHeader 
          icon={BookOpen}
          title="Operational_Manual"
          subtitle="A step-by-step telemetry guide to achieving 99.8% identification accuracy in field environments."
        />

        {/* Video Tutorial Integration */}
        <div className="mb-20 glass chrome-border rounded-[32px] overflow-hidden group relative aspect-video flex items-center justify-center bg-zinc-950/50">
           <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/40 group-hover:bg-black/20 transition-all">
              <div className="w-20 h-20 rounded-full bg-[var(--brand-accent)] flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.2)] group-hover:scale-110 transition-transform cursor-pointer">
                 <Rocket className="w-10 h-10 text-black fill-black" />
              </div>
              <h3 className="mt-8 text-2xl font-black uppercase italic chrome-text tracking-tight">VIRTUAL_ONBOARDING_SYSTEM</h3>
              <p className="mt-2 text-[10px] brand-text font-black uppercase tracking-[0.3em]">Neural Feed v1.0.4 - Streaming Active</p>
           </div>
           {/* In a real app, this would be an <iframe> */}
           <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center">
              <Youtube className="w-32 h-32 text-white/5" />
           </div>
           
           <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end z-20">
              <div className="space-y-1">
                 <p className="text-[10px] font-black uppercase text-zinc-500">Currently Streaming</p>
                 <p className="text-sm font-bold uppercase tracking-tight italic">Uplink Procedure & Calibration_Guide</p>
              </div>
              <div className="flex gap-2">
                 <div className="h-1 w-12 bg-[var(--brand-accent)] rounded-full" />
                 <div className="h-1 w-12 bg-white/10 rounded-full" />
                 <div className="h-1 w-12 bg-white/10 rounded-full" />
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-32">
          {[
            { step: "01", title: "Initialize Uplink", desc: "Launch the AI Identifier OS from your secure terminal. Ensure a stable neural connection." },
            { step: "02", title: "Capture Telemetry", desc: "Position the component within the scanning frame. Use high-lumen lighting for optimal edge detection." },
            { step: "03", title: "Neural Synthesis", desc: "Wait for the edge processing engine to map the component against our 4.2M part database." },
            { step: "04", title: "Verify & Persist", desc: "Audit the technical specifications and archive the results to your local secure ledger." }
          ].map((s, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass p-6 rounded-3xl border border-white/5 relative group hover:border-white/10 transition-all"
            >
              <span className="text-4xl font-black text-white/5 absolute top-4 right-4 group-hover:text-white/10 transition-colors uppercase italic">{s.step}</span>
              <h3 className="text-sm font-black uppercase tracking-tight mb-3 text-[var(--brand-accent)]">{s.title}</h3>
              <p className="text-zinc-500 text-xs leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Integration Hub */}
        <SectionHeader 
          icon={Terminal}
          title="Enterprise_Integration"
          subtitle="Connect Smart_ID to your existing ERP, SAP, or warehouse management systems via our secure API."
        />

        <div className="glass chrome-border rounded-3xl overflow-hidden mb-32">
          <div className="p-1 px-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
            <div className="flex gap-1.5">
               <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
               <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20" />
               <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20" />
            </div>
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">REST_API_VER_1.4</span>
          </div>
          <div className="p-8 bg-zinc-950/50">
            <pre className="text-sm font-mono text-emerald-400/90 overflow-x-auto selection:bg-emerald-500/20">
{`// Initialize Smart_ID Engine
const smartId = new SmartIdClient({
  apiKey: process.env.SMART_KEY,
  sector: "INDUSTRIAL_MAINTENANCE"
});

// Scan component from buffer
const result = await smartId.analyze({
  telemetry: buffer,
  confidence_threshold: 0.95
});

console.log(\`Signature: \${result.name} | Verified: \${result.audit_trail}\`);`}
            </pre>
          </div>
          <div className="p-6 bg-white/5 border-t border-white/5 flex gap-4">
             <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white hover:text-[var(--brand-accent)] transition-all">
               <ShieldCheck className="w-4 h-4" /> View_Security_Whitepaper
             </button>
             <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white hover:text-[var(--brand-accent)] transition-all">
               <Code className="w-4 h-4" /> Full_API_Reference <ChevronRight className="w-3 h-3" />
             </button>
          </div>
        </div>

        {/* Future Roadmap */}
        <SectionHeader 
          icon={Rocket}
          title="Neural_Blueprint"
          subtitle="Our upcoming feature set designed to push the boundaries of industrial identification."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { 
              icon: Globe, 
              title: "Global Supply Sync", 
              desc: "Instant live inventory checks across your global supplier network when a part is identified.",
              status: "Q3 2026"
            },
            { 
              icon: Search, 
              title: "Thermal Signature ID", 
              desc: "Identify parts based on heat dissipation patterns during active machine operation.",
              status: "Q4 2026"
            },
            { 
              icon: Cloud, 
              title: "Warehouse Digital Twins", 
              desc: "Automatically update your digital twin models as physical parts are scanned and moved.",
              status: "Q1 2027"
            },
            { 
              icon: Zap, 
              title: "Predictive Failure", 
              desc: "Analyze surface micro-cracks to predict when an identified part will likely fail.",
              status: "Coming_Soon"
            },
            { 
              icon: Database, 
              title: "Legacy Schematic Recovery", 
              desc: "Generate blueprints for identified parts that no longer have physical documentation.",
              status: "Coming_Soon"
            },
            { 
              icon: ShieldCheck, 
              title: "Blockchain Compliance", 
              desc: "Automatic minting of inspection certificates on a private enterprise ledger.",
              status: "Coming_Soon"
            }
          ].map((f, i) => (
            <div key={i} className="glass p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-all flex flex-col items-start gap-4 h-full relative overflow-hidden group">
              <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-white group-hover:text-black transition-all">
                <f.icon className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-black uppercase tracking-tight italic chrome-text">{f.title}</h3>
                  <ComingSoonBadge />
                </div>
                <p className="text-zinc-500 text-xs leading-relaxed">{f.desc}</p>
              </div>
              <div className="mt-auto pt-6 w-full flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-zinc-600 border-t border-white/5">
                <span>Release_Window</span>
                <span className="text-zinc-400 italic">{f.status}</span>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
