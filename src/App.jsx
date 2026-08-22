import React, { useState } from 'react';
import Navbar from './components/Navbar';
import AIGeneratedTryOnStudio from './components/AIGeneratedTryOnStudio';
import JewelleryCatalog from './components/JewelleryCatalog';
import AdminUploaderModal from './components/AdminUploaderModal';
import { INITIAL_JEWELLERY_CATALOG } from './utils/sampleData';
import { PlusCircle, Wand2 } from 'lucide-react';

export default function App() {
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
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const handleSelectItem = (item) => {
    setSelectedItem(item);
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
      <Navbar />

      {/* Main Content */}
      <main style={{ flex: 1, maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Header Banner */}
        <div style={{
          background: 'linear-gradient(90deg, rgba(120, 80, 0, 0.2), rgba(18, 20, 29, 0.95), rgba(120, 80, 0, 0.2))',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: '16px',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: 'rgba(212, 175, 55, 0.15)', border: '1px solid rgba(212, 175, 55, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wand2 style={{ width: '20px', height: '20px', color: '#D4AF37' }} />
            </div>
            <div>
              <h2 className="font-heading text-gold-gradient" style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>
                Marne Jewellery Studio Platform
              </h2>
              <p style={{ fontSize: '11px', color: '#9499AD', margin: '2px 0 0 0' }}>
                Select Jewellery → Upload Photo → Generate Result
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="btn-gold"
            style={{ fontSize: '12px', padding: '9px 18px' }}
          >
            <PlusCircle style={{ width: '15px', height: '15px' }} />
            <span>Add Jewellery Design</span>
          </button>
        </div>

        {/* Guided 2-Step Try-On Studio */}
        <AIGeneratedTryOnStudio
          catalog={catalog}
          selectedItem={selectedItem}
          onSelectItem={handleSelectItem}
          onOpenUploadModal={() => setIsUploadModalOpen(true)}
        />

        {/* Full-Width Jewellery Catalog */}
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
        Marne Jewellery • Virtual Studio Platform
      </footer>

      {/* Modals */}
      <AdminUploaderModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onAddJewellery={handleAddJewellery}
      />
    </div>
  );
}
