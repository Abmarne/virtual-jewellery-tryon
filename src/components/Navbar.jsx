import React from 'react';
import { Camera, Upload, Gem } from 'lucide-react';

export default function Navbar({ mode, onSetMode, onTakeSnapshot }) {
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 40, backgroundColor: 'rgba(9, 10, 15, 0.9)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(212, 175, 55, 0.25)', padding: '14px 28px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        {/* Official Marne Jewellery Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #BF953F, #FCF6BA, #AA771C)', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '100%', height: '100%', backgroundColor: '#000', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Gem style={{ width: '20px', height: '20px', color: '#D4AF37' }} />
            </div>
          </div>

          <div>
            <h1 className="font-heading text-gold-gradient" style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, lineHeight: 1 }}>
              MARNE JEWELLERY
            </h1>
            <span style={{ fontSize: '10px', color: '#F3E5AB', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginTop: '3px' }}>
              Virtual AR Try-On Studio
            </span>
          </div>
        </div>

        {/* Mode Switcher & Snapshot Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '4px 6px', borderRadius: '9999px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <button
              type="button"
              onClick={() => onSetMode('webcam')}
              style={{
                padding: '8px 16px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: mode === 'webcam' ? '#D4AF37' : 'transparent',
                color: mode === 'webcam' ? '#000' : '#AAA',
                transition: 'all 0.2s ease'
              }}
            >
              <Camera style={{ width: '14px', height: '14px' }} />
              <span>Live Camera AR</span>
            </button>

            <button
              type="button"
              onClick={() => onSetMode('upload')}
              style={{
                padding: '8px 16px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: mode === 'upload' ? '#D4AF37' : 'transparent',
                color: mode === 'upload' ? '#000' : '#AAA',
                transition: 'all 0.2s ease'
              }}
            >
              <Upload style={{ width: '14px', height: '14px' }} />
              <span>Upload Photo</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onTakeSnapshot}
            className="btn-gold"
            style={{ fontSize: '12px', padding: '9px 20px' }}
          >
            <Camera style={{ width: '15px', height: '15px' }} />
            <span>Capture Photo</span>
          </button>
        </div>
      </div>
    </header>
  );
}
