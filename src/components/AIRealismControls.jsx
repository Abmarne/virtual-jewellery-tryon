import React from 'react';
import { Sparkles, SunMedium, Layers, ArrowUpDown, ZoomIn, RotateCcw, ShieldCheck } from 'lucide-react';

const PRESETS = [
  { label: 'Auto AI Match', curveDepth: 0.5, lightingMatch: 0.7, shadowDepth: 0.6, scale: 1.0, offsetY: 0 },
  { label: 'Choker Fit', curveDepth: 0.75, lightingMatch: 0.75, shadowDepth: 0.7, scale: 1.1, offsetY: -14 },
  { label: 'Long Set', curveDepth: 0.35, lightingMatch: 0.65, shadowDepth: 0.55, scale: 1.25, offsetY: 22 },
  { label: 'Heavy Jhumka', curveDepth: 0.4, lightingMatch: 0.8, shadowDepth: 0.65, scale: 1.15, offsetY: 4 }
];

export default function AIRealismControls({ fineTune, onChange, onReset }) {
  const handleChange = (key, val) => {
    onChange({
      ...fineTune,
      [key]: parseFloat(val)
    });
  };

  const applyPreset = (p) => {
    onChange({
      ...fineTune,
      curveDepth: p.curveDepth,
      lightingMatch: p.lightingMatch,
      shadowDepth: p.shadowDepth,
      scale: p.scale,
      offsetY: p.offsetY
    });
  };

  return (
    <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles style={{ width: '16px', height: '16px', color: '#D4AF37' }} />
          <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#F5F6FA', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
            AI Photorealistic Adjuster
          </h3>
        </div>
        <button
          type="button"
          onClick={onReset}
          style={{ background: 'none', border: 'none', color: '#9499AD', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <RotateCcw style={{ width: '12px', height: '12px' }} />
          <span>Reset</span>
        </button>
      </div>

      {/* Quick AI Presets */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '11px', fontWeight: '600', color: '#9499AD', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ShieldCheck style={{ width: '12px', height: '12px', color: '#D4AF37' }} /> 1-Click AI Presets
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

      <hr style={{ borderColor: 'rgba(255, 255, 255, 0.08)', margin: 0 }} />

      {/* Realism Sliders */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Ambient Lighting Match */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', fontWeight: '500', color: '#E2E8F0' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <SunMedium style={{ width: '14px', height: '14px', color: '#D4AF37' }} /> Room Lighting & Color Match
            </span>
            <span style={{ color: '#D4AF37', fontFamily: 'monospace' }}>{Math.round((fineTune.lightingMatch ?? 0.7) * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={fineTune.lightingMatch ?? 0.7}
            onChange={(e) => handleChange('lightingMatch', e.target.value)}
          />
        </div>

        {/* 3D Neck Curve Wrap */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', fontWeight: '500', color: '#E2E8F0' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers style={{ width: '14px', height: '14px', color: '#D4AF37' }} /> 3D Neck Curve Wrap
            </span>
            <span style={{ color: '#D4AF37', fontFamily: 'monospace' }}>{Math.round((fineTune.curveDepth ?? 0.5) * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={fineTune.curveDepth ?? 0.5}
            onChange={(e) => handleChange('curveDepth', e.target.value)}
          />
        </div>

        {/* Skin Contact Shadow Depth */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', fontWeight: '500', color: '#E2E8F0' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles style={{ width: '14px', height: '14px', color: '#D4AF37' }} /> Skin Shadow Depth
            </span>
            <span style={{ color: '#D4AF37', fontFamily: 'monospace' }}>{Math.round((fineTune.shadowDepth ?? 0.6) * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={fineTune.shadowDepth ?? 0.6}
            onChange={(e) => handleChange('shadowDepth', e.target.value)}
          />
        </div>

        {/* Size Scale */}
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

        {/* Height Position */}
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
      </div>
    </div>
  );
}
