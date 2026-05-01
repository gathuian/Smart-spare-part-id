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

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import IdentifierTool from './components/IdentifierTool';
import ResourcesPage from './components/ResourcesPage';

const CreditWatermark = ({ position }: { position: 'top' | 'bottom' }) => (
  <div className={`fixed ${position === 'top' ? 'top-0' : 'bottom-0'} left-0 right-0 z-[10000] pointer-events-none select-none`}>
    <div className={`flex items-center justify-between px-4 py-1.5 bg-black/60 backdrop-blur-xl border-${position === 'top' ? 'b' : 't'} border-white/5`}>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-1 h-1 rounded-full bg-[var(--brand-accent)] animate-pulse" />
          <span className="text-[8px] font-black tracking-[0.2em] uppercase text-zinc-500">System_Feed_Active</span>
        </div>
        <div className="h-3 w-[1px] bg-white/10" />
        <span className="text-[8px] font-black tracking-[0.2em] uppercase brand-text">Created by Gathu</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest leading-none">Contact: gathuian077@gmail.com</span>
        <div className="h-3 w-[1px] bg-white/10" />
        <span className="text-[8px] font-mono text-zinc-700 uppercase">v4.0.2_Production</span>
      </div>
    </div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <CreditWatermark position="top" />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/tool" element={<IdentifierTool />} />
        <Route path="/resources" element={<ResourcesPage />} />
      </Routes>
      <CreditWatermark position="bottom" />
    </BrowserRouter>
  );
}
