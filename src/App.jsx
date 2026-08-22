import React, { useState, useRef } from 'react';
import Navbar from './components/Navbar';
import TryOnCanvas from './components/TryOnCanvas';
import JewelleryCatalog from './components/JewelleryCatalog';
import FineTuneControls from './components/FineTuneControls';
import AdminUploaderModal from './components/AdminUploaderModal';
import SnapshotModal from './components/SnapshotModal';
import { INITIAL_JEWELLERY_CATALOG } from './utils/sampleData';

export default function App() {
  const [mode, setMode] = useState('webcam'); // 'webcam' | 'upload'
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
    <div className="min-h-screen bg-[#090A0F] text-gray-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Navbar */}
      <Navbar
        mode={mode}
        onSetMode={setMode}
        onTakeSnapshot={() => setIsSnapshotModalOpen(true)}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUploadPhotoFile}
      />

      {/* Main Studio Workbench */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Main Studio Canvas */}
          <div className="lg:col-span-8 flex flex-col gap-4">
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
          <div className="lg:col-span-4 flex flex-col gap-4">
            <FineTuneControls
              fineTune={fineTune}
              onChange={setFineTune}
              onReset={() => setFineTune({ scale: 1.0, offsetY: 0, tilt: 0, opacity: 1.0 })}
            />
          </div>
        </div>

        {/* Bottom Section: Jewellery Catalog Grid */}
        <div className="glass-card p-5 rounded-2xl border border-yellow-500/20">
          <JewelleryCatalog
            catalog={catalog}
            selectedItem={selectedItem}
            onSelectItem={handleSelectItem}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-yellow-500/10 bg-black/80 py-3.5 px-4 text-center text-xs text-gray-500 mt-auto">
        Marne Jewellery • Virtual AR Try-On Studio Platform
      </footer>

      {/* Admin Add Jewellery Modal */}
      <AdminUploaderModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onAddJewellery={handleAddJewellery}
      />

      {/* Snapshot Download Modal */}
      <SnapshotModal
        isOpen={isSnapshotModalOpen}
        onClose={() => setIsSnapshotModalOpen(false)}
        canvasRef={activeCanvas}
        selectedItem={selectedItem}
      />
    </div>
  );
}
