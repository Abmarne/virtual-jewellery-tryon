import React from 'react';
import { Camera, Upload, Gem } from 'lucide-react';

export default function Navbar({ mode, onSetMode, onTakeSnapshot }) {
  return (
    <header style={{ position: 'relative', width: '100%', zIndex: 40, backgroundColor: 'rgba(9, 10, 15, 0.95)', borderBottom: '1px solid rgba(212, 175, 55, 0.25)', padding: '14px 28px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
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
              AI Virtual Try-On Studio
            </span>
          </div>
        </div>

        {/* Studio Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: '#9499AD', fontWeight: '500' }}>
            Powered by In-Browser AI ($0 Cost)
          </span>
        </div>
      </div>
    </header>
  );
}
