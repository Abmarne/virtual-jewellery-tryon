import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import TryOnCanvas from './components/TryOnCanvas';
import JewelleryCatalog from './components/JewelleryCatalog';
import FineTuneControls from './components/FineTuneControls';
import ModelAvatarPicker from './components/ModelAvatarPicker';
import AdminUploaderModal from './components/AdminUploaderModal';
import SnapshotModal from './components/SnapshotModal';
import { INITIAL_JEWELLERY_CATALOG, SAMPLE_MODELS } from './utils/sampleData';
import { Sparkles, ShieldCheck, Zap, Heart } from 'lucide-react';

export default function App() {
  const [mode, setMode] = useState('avatar'); // 'avatar' | 'webcam' | 'upload'
  const [selectedModel, setSelectedModel] = useState(SAMPLE_MODELS[0]);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState(null);

  // Catalog State (LocalStorage sync for custom uploaded items)
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

  const [selectedItem, setSelectedItem] = useState(INITIAL_JEWELLERY_CATALOG[0]);

  // Fine-Tune Controls State
  const [fineTune, setFineTune] = useState({
    scale: 1.0,
    offsetY: 0,
    tilt: 0,
    opacity: 1.0
  });

  // Modal States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);
  const [activeCanvas, setActiveCanvas] = useState(null);

  // When selectedItem changes, update fineTune defaults
  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setFineTune({
      scale: item.defaultScale || 1.0,
      offsetY: item.defaultOffsetY || 0,
      tilt: 0,
      opacity: 1.0
    });
  };

  // Select Model Avatar
  const handleSelectModel = (model) => {
    setSelectedModel(model);
    setMode('avatar');
  };

  // Upload Personal Photo
  const handleUploadPhoto = (dataUrl) => {
    setUploadedPhotoUrl(dataUrl);
    setMode('upload');
  };

  // Add Custom Jewellery Design to Catalog
  const handleAddJewellery = (newItem) => {
    const updated = [newItem, ...catalog];
    setCatalog(updated);
    setSelectedItem(newItem);

    // Save custom items to localStorage
    const customItems = updated.filter((i) => i.id.startsWith('custom-'));
    localStorage.setItem('jewellery_custom_catalog', JSON.stringify(customItems));
  };

  return (
    <div className="min-h-screen bg-[#090A0F] text-gray-100 flex flex-col selection:bg-amber-500 selection:text-black">
      {/* Top Luxury Navbar */}
      <Navbar
        mode={mode}
        onSetMode={setMode}
        onTakeSnapshot={() => setIsSnapshotModalOpen(true)}
      />

      {/* Main Studio Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 flex flex-col gap-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-amber-950/40 via-yellow-900/20 to-amber-950/40 border border-yellow-500/30 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-400 shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-gold-gradient font-heading">
                Instant AI Jewellery Fitting Studio
              </h2>
              <p className="text-xs text-gray-300 mt-0.5">
                Automatic landmark positioning for Earrings, Necklaces, Maang Tikkas & Nose Rings. No software setup required.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-amber-300">
            <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full border border-amber-500/20">
              <ShieldCheck className="w-4 h-4 text-amber-400" /> $0 API Cost
            </span>
            <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full border border-amber-500/20">
              <Zap className="w-4 h-4 text-amber-400" /> Real-Time Vision
            </span>
          </div>
        </div>

        {/* 2-Column Grid: Canvas Viewport (Left) vs Controls & Avatar Picker (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Canvas Viewport & Fine Tune Controls */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            <TryOnCanvas
              mode={mode}
              selectedModel={selectedModel}
              uploadedPhotoUrl={uploadedPhotoUrl}
              selectedItem={selectedItem}
              fineTune={fineTune}
              onCanvasReady={setActiveCanvas}
            />

            {/* Fine Tune Adjuster Sliders */}
            <FineTuneControls
              fineTune={fineTune}
              onChange={setFineTune}
              onReset={() => setFineTune({ scale: 1.0, offsetY: 0, tilt: 0, opacity: 1.0 })}
            />
          </div>

          {/* Right Column: Model Picker & Jewellery Selection */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Model Avatar Picker */}
            <div className="glass-card p-4 rounded-xl border border-yellow-500/20">
              <ModelAvatarPicker
                mode={mode}
                selectedModel={selectedModel}
                onSelectModel={handleSelectModel}
                onUploadPhoto={handleUploadPhoto}
                uploadedPhotoUrl={uploadedPhotoUrl}
              />
            </div>
          </div>
        </div>

        {/* Bottom Section: Full Width Jewellery Catalog Selector */}
        <div className="glass-card p-5 rounded-2xl border border-yellow-500/30">
          <JewelleryCatalog
            catalog={catalog}
            selectedItem={selectedItem}
            onSelectItem={handleSelectItem}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-yellow-500/20 bg-black/80 py-4 px-4 text-center text-xs text-gray-500 flex items-center justify-center gap-1 mt-auto">
        <span>Crafted for Imitation Jewellery Business • 100% Free Virtual AR Solution</span>
        <Heart className="w-3.5 h-3.5 text-amber-400 inline ml-1 fill-amber-400" />
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
