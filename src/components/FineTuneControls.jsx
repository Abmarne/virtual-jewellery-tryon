import React from 'react';
import { SlidersHorizontal, RotateCcw, ZoomIn, ArrowUpDown, RotateCw, Eye } from 'lucide-react';

export default function FineTuneControls({ fineTune, onChange, onReset }) {
  const handleChange = (key, value) => {
    onChange({
      ...fineTune,
      [key]: parseFloat(value)
    });
  };

  return (
    <div className="glass-card p-4 rounded-xl flex flex-col gap-3.5 border border-yellow-500/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">
            Fine-Tune Position & Fit
          </h3>
        </div>
        <button
          onClick={onReset}
          className="text-[11px] text-gray-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Scale Slider */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] font-medium text-gray-300">
            <span className="flex items-center gap-1.5">
              <ZoomIn className="w-3.5 h-3.5 text-amber-400" /> Size Scale
            </span>
            <span className="text-amber-400 font-mono">{(fineTune.scale ?? 1.0).toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.05"
            value={fineTune.scale ?? 1.0}
            onChange={(e) => handleChange('scale', e.target.value)}
          />
        </div>

        {/* Vertical Height Offset */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] font-medium text-gray-300">
            <span className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" /> Height Position
            </span>
            <span className="text-amber-400 font-mono">{fineTune.offsetY > 0 ? `+${fineTune.offsetY}` : fineTune.offsetY} px</span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            step="1"
            value={fineTune.offsetY ?? 0}
            onChange={(e) => handleChange('offsetY', e.target.value)}
          />
        </div>

        {/* Rotation Tilt */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] font-medium text-gray-300">
            <span className="flex items-center gap-1.5">
              <RotateCw className="w-3.5 h-3.5 text-amber-400" /> Angle Tilt
            </span>
            <span className="text-amber-400 font-mono">{fineTune.tilt ?? 0}°</span>
          </div>
          <input
            type="range"
            min="-30"
            max="30"
            step="1"
            value={fineTune.tilt ?? 0}
            onChange={(e) => handleChange('tilt', e.target.value)}
          />
        </div>

        {/* Opacity */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] font-medium text-gray-300">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-amber-400" /> Opacity
            </span>
            <span className="text-amber-400 font-mono">{Math.round((fineTune.opacity ?? 1.0) * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="1.0"
            step="0.05"
            value={fineTune.opacity ?? 1.0}
            onChange={(e) => handleChange('opacity', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
