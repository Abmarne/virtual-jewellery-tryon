import React from 'react';
import { SlidersHorizontal, RotateCcw, ZoomIn, ArrowUpDown, RotateCw, Eye, Sparkles } from 'lucide-react';

const PRESETS = [
  { label: 'Auto Fit', scale: 1.0, offsetY: 0, tilt: 0, opacity: 1.0 },
  { label: 'Choker Fit', scale: 1.1, offsetY: -12, tilt: 0, opacity: 1.0 },
  { label: 'Long Set', scale: 1.25, offsetY: 20, tilt: 0, opacity: 1.0 },
  { label: 'Heavy Jhumka', scale: 1.15, offsetY: 6, tilt: 0, opacity: 1.0 }
];

export default function FineTuneControls({ fineTune, onChange, onReset }) {
  const handleChange = (key, value) => {
    onChange({
      ...fineTune,
      [key]: parseFloat(value)
    });
  };

  const applyPreset = (preset) => {
    onChange({
      ...fineTune,
      scale: preset.scale,
      offsetY: preset.offsetY,
      tilt: preset.tilt,
      opacity: preset.opacity
    });
  };

  return (
    <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SlidersHorizontal style={{ width: '16px', height: '16px', color: '#D4AF37' }} />
          <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#F5F6FA', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
            Fit & Position Adjuster
          </h3>
        </div>
        <button
          type="button"
          onClick={onReset}
          style={{ background: 'none', border: 'none', color: '#9499AD', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
          title="Reset to default AI landmark alignment"
        >
          <RotateCcw style={{ width: '12px', height: '12px' }} />
          <span>Reset</span>
        </button>
      </div>

      {/* 1-Click Fit Presets */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '11px', fontWeight: '600', color: '#9499AD', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Sparkles style={{ width: '12px', height: '12px', color: '#D4AF37' }} /> Quick Presets
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(p)}
              style={{
                padding: '8px 10px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: '600',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#F3E5AB',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <hr style={{ borderColor: 'rgba(255, 255, 255, 0.08)', margin: '0' }} />

      {/* Sliders */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Scale Slider */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', fontWeight: '500', color: '#E2E8F0' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ZoomIn style={{ width: '14px', height: '14px', color: '#D4AF37' }} /> Size Scale
            </span>
            <span style={{ color: '#D4AF37', fontFamily: 'monospace' }}>{(fineTune.scale ?? 1.0).toFixed(2)}x</span>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', fontWeight: '500', color: '#E2E8F0' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowUpDown style={{ width: '14px', height: '14px', color: '#D4AF37' }} /> Height Position
            </span>
            <span style={{ color: '#D4AF37', fontFamily: 'monospace' }}>{fineTune.offsetY > 0 ? `+${fineTune.offsetY}` : fineTune.offsetY} px</span>
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

        {/* Angle Tilt */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', fontWeight: '500', color: '#E2E8F0' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RotateCw style={{ width: '14px', height: '14px', color: '#D4AF37' }} /> Tilt Rotation
            </span>
            <span style={{ color: '#D4AF37', fontFamily: 'monospace' }}>{fineTune.tilt ?? 0}°</span>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', fontWeight: '500', color: '#E2E8F0' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Eye style={{ width: '14px', height: '14px', color: '#D4AF37' }} /> Transparency Blend
            </span>
            <span style={{ color: '#D4AF37', fontFamily: 'monospace' }}>{Math.round((fineTune.opacity ?? 1.0) * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.3"
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
