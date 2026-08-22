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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-lg p-6 rounded-2xl border border-yellow-500/40 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-100 bg-gray-900/60 p-1.5 rounded-full"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <Camera className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-bold font-heading text-gold-gradient">
            Marne Jewellery Virtual Snapshot
          </h2>
        </div>

        <div className="w-full aspect-[4/3] rounded-xl overflow-hidden border border-amber-500/30 bg-black mb-5 shadow-lg flex items-center justify-center">
          <img
            src={snapshotUrl}
            alt="Marne Jewellery Virtual Try-On"
            className="w-full h-full object-contain"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleDownload}
            className="btn-gold text-xs justify-center py-3"
          >
            <Download className="w-4 h-4" />
            <span>Download HD Photo</span>
          </button>

          <button
            onClick={handleWhatsAppShare}
            className="btn-secondary text-xs justify-center py-3 border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/40 hover:border-emerald-400"
          >
            <Share2 className="w-4 h-4 text-emerald-400" />
            <span>Share on WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}
