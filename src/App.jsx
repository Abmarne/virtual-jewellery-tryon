import React, { useState, useRef } from 'react';
import Navbar from './components/Navbar';
import TryOnCanvas from './components/TryOnCanvas';
import JewelleryCatalog from './components/JewelleryCatalog';
import FineTuneControls from './components/FineTuneControls';
import AdminUploaderModal from './components/AdminUploaderModal';
import SnapshotModal from './components/SnapshotModal';
import { INITIAL_JEWELLERY_CATALOG } from './utils/sampleData';
import { Sparkles, PlusCircle } from 'lucide-react';

export default function App() {
  const [mode, setMode] = useState('webcam');
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState(null);
  const fileInputRef = useRef(null);

  const [catalog, setCatalog] = useState(() => {
    const saved = localStorage.getItem('jewellery_custom_catalog');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return [...INITIAL_JEWELLERY_CATALOG, ...parsed];
      } catch (e) {
        console.warn('Failed parsing custom catalog:', e);
      }
    }
    return INITIAL_JEWELLERY_CATALOG;
  });

  const [selectedItem, setSelectedItem] = useState(catalog[0] || null);

  const [fineTune, setFineTune] = useState({
    scale: 1.0,
    offsetY: 0,
    tilt: 0,
    opacity: 1.0
  });

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);
  const [activeCanvas, setActiveCanvas] = useState(null);

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setFineTune({
      scale: item.defaultScale || 1.0,
      offsetY: item.defaultOffsetY || 0,
      tilt: 0,
      opacity: 1.0
    });
  };

  const handleUploadPhotoFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedPhotoUrl(event.target.result);
      setMode('upload');
    };
    reader.readAsDataURL(file);
  };

  const handleAddJewellery = (newItem) => {
    const updated = [newItem, ...catalog];
    setCatalog(updated);
    setSelectedItem(newItem);
    const customItems = updated.filter((i) => i.id.startsWith('custom-'));
    localStorage.setItem('jewellery_custom_catalog', JSON.stringify(customItems));
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090A0F', color: '#F5F6FA', display: 'flex', flexDirection: 'column', fontFamily: "'Outfit', sans-serif" }}>
      {/* Top Navbar */}
      <Navbar
        mode={mode}
        onSetMode={setMode}
        onTakeSnapshot={() => setIsSnapshotModalOpen(true)}
      />

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleUploadPhotoFile}
      />

      {/* Main Content */}
      <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '20px 24px' }}>

        {/* Quick Guide Banner */}
        <div style={{
          background: 'linear-gradient(90deg, rgba(120, 80, 0, 0.15), rgba(18, 20, 29, 0.9), rgba(120, 80, 0, 0.15))',
          border: '1px solid rgba(212, 175, 55, 0.2)',
          borderRadius: '12px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F3E5AB', fontSize: '12px', fontWeight: '500' }}>
            <Sparkles style={{ width: '16px', height: '16px', color: '#D4AF37', flexShrink: 0 }} />
            <span><strong>Quick Guide:</strong> 1. Camera / Upload Photo → 2. Select Jewellery → 3. Fine-Tune Fit → 4. Capture</span>
          </div>
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="btn-secondary"
            style={{ fontSize: '11px', padding: '6px 14px', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}
          >
            <PlusCircle style={{ width: '14px', height: '14px', color: '#D4AF37' }} />
            <span>Add Jewellery</span>
          </button>
        </div>

        {/* 2-Column Workbench: Canvas (left) + Controls (right) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: '20px',
          alignItems: 'start',
          marginBottom: '20px'
        }}>
          {/* Left: AR Try-On Viewport */}
          <div style={{ width: '100%' }}>
            <TryOnCanvas
              mode={mode}
              uploadedPhotoUrl={uploadedPhotoUrl}
              selectedItem={selectedItem}
              fineTune={fineTune}
              onCanvasReady={setActiveCanvas}
              onTriggerUpload={() => fileInputRef.current?.click()}
            />
          </div>

          {/* Right: Fine-Tune Controls Panel */}
          <div style={{ width: '100%' }}>
            <FineTuneControls
              fineTune={fineTune}
              onChange={setFineTune}
              onReset={() => setFineTune({ scale: 1.0, offsetY: 0, tilt: 0, opacity: 1.0 })}
            />
          </div>
        </div>

        {/* Bottom: Jewellery Catalog */}
        <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
          <JewelleryCatalog
            catalog={catalog}
            selectedItem={selectedItem}
            onSelectItem={handleSelectItem}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
          />
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(212, 175, 55, 0.1)',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: '14px 16px',
        textAlign: 'center',
        fontSize: '12px',
        color: '#6B7280',
        marginTop: 'auto'
      }}>
        Marne Jewellery • Virtual AR Studio Platform
      </footer>

      {/* Modals */}
      <AdminUploaderModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onAddJewellery={handleAddJewellery}
      />
      <SnapshotModal
        isOpen={isSnapshotModalOpen}
        onClose={() => setIsSnapshotModalOpen(false)}
        canvasRef={activeCanvas}
        selectedItem={selectedItem}
      />
    </div>
  );
}
