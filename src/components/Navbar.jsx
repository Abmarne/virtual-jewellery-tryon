import React from 'react';
import { Camera, User, Upload, Sparkles, Gem } from 'lucide-react';

export default function Navbar({ mode, onSetMode, onTakeSnapshot }) {
  return (
    <header className="sticky top-0 z-40 bg-black/70 backdrop-blur-xl border-b border-yellow-500/20 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-300 via-amber-500 to-yellow-700 p-0.5 shadow-[0_0_15px_rgba(212,175,55,0.4)] flex items-center justify-center">
            <div className="w-full h-full bg-black/90 rounded-[10px] flex items-center justify-center">
              <Gem className="w-5 h-5 text-amber-400" />
            </div>
          </div>

          <div>
            <h1 className="text-lg font-bold font-heading text-gold-gradient tracking-wide leading-none">
              VERA JEWELS
            </h1>
            <span className="text-[10px] text-amber-200/80 font-medium tracking-widest uppercase block mt-0.5">
              Virtual Imitation Jewellery Studio
            </span>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-gray-900/90 p-1 rounded-full border border-gray-800">
          <button
            onClick={() => onSetMode('avatar')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mode === 'avatar'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Model Avatars</span>
          </button>

          <button
            onClick={() => onSetMode('webcam')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mode === 'webcam'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Live Camera AR</span>
          </button>

          <button
            onClick={() => onSetMode('upload')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mode === 'upload'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Photo</span>
          </button>
        </div>

        {/* Snapshot Capture & Free Badge */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Free $0 Operating Cost</span>
          </div>

          <button
            onClick={onTakeSnapshot}
            className="btn-gold text-xs px-4 py-2 flex items-center gap-1.5"
          >
            <Camera className="w-4 h-4" />
            <span>Capture Photo</span>
          </button>
        </div>
      </div>
    </header>
  );
}
