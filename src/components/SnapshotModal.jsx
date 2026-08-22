import React, { useEffect, useState } from 'react';
import { Download, Share2, X, Camera } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SnapshotModal({ isOpen, onClose, canvasRef, selectedItem }) {
  const [snapshotUrl, setSnapshotUrl] = useState('');

  useEffect(() => {
    if (isOpen && canvasRef) {
      try {
        const dataUrl = canvasRef.toDataURL('image/png', 1.0);
        setSnapshotUrl(dataUrl);

        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#F3E5AB', '#FF4D6D', '#FFFFFF']
        });
      } catch (err) {
        console.error('Error generating snapshot image:', err);
      }
    }
  }, [isOpen, canvasRef]);

  if (!isOpen || !snapshotUrl) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = `marne-jewellery-${selectedItem?.name || 'design'}-${Date.now()}.png`;
    link.href = snapshotUrl;
    link.click();
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Check out how this stunning ${selectedItem?.name || 'jewellery'} from Marne Jewellery looks on me! Tried on using Marne Jewellery Virtual Studio.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 9999,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '520px',
        padding: '28px',
        borderRadius: '20px',
        border: '1px solid rgba(212, 175, 55, 0.4)',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
        position: 'relative'
      }}>
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'rgba(30, 30, 40, 0.8)',
            border: 'none', borderRadius: '50%',
            width: '32px', height: '32px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#9CA3AF', cursor: 'pointer'
          }}
        >
          <X style={{ width: '16px', height: '16px' }} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Camera style={{ width: '20px', height: '20px', color: '#D4AF37' }} />
          <h2 className="font-heading text-gold-gradient" style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
            Virtual Snapshot
          </h2>
        </div>

        {/* Preview Image */}
        <div style={{
          width: '100%',
          aspectRatio: '4 / 3',
          borderRadius: '14px',
          overflow: 'hidden',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          backgroundColor: '#000',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img
            src={snapshotUrl}
            alt="Marne Jewellery Virtual Try-On"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <button onClick={handleDownload} className="btn-gold" style={{ fontSize: '12px', padding: '12px 16px', justifyContent: 'center' }}>
            <Download style={{ width: '16px', height: '16px' }} />
            <span>Download HD Photo</span>
          </button>

          <button
            onClick={handleWhatsAppShare}
            className="btn-secondary"
            style={{
              fontSize: '12px', padding: '12px 16px', justifyContent: 'center',
              borderColor: 'rgba(16, 185, 129, 0.4)', color: '#6EE7B7'
            }}
          >
            <Share2 style={{ width: '16px', height: '16px', color: '#34D399' }} />
            <span>Share on WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}
