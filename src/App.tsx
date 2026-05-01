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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/tool" element={<IdentifierTool />} />
      </Routes>
    </BrowserRouter>
  );
}
