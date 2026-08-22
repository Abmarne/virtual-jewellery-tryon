import React, { useState } from 'react';
import { Sparkles, PlusCircle, CheckCircle2, Search, Plus } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Designs' },
  { id: 'earrings', label: 'Earrings (Jhumkas)' },
  { id: 'necklace', label: 'Necklaces & Chokers' },
  { id: 'maang_tikka', label: 'Maang Tikkas' },
  { id: 'nose_ring', label: 'Nose Rings (Nath)' }
];

export default function JewelleryCatalog({
  catalog,
  selectedItem,
  onSelectItem,
  onOpenUploadModal
}) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCatalog = catalog.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.tag?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 className="font-heading text-gold-gradient" style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles style={{ width: '18px', height: '18px', color: '#D4AF37' }} />
            Jewellery Catalog
          </h2>
          <p style={{ fontSize: '12px', color: '#9499AD', margin: '4px 0 0 0' }}>Select any piece to try it on live video or photo</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Search Box */}
          {catalog.length > 0 && (
            <div style={{ position: 'relative' }}>
              <Search style={{ width: '14px', height: '14px', color: '#9499AD', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search design..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  backgroundColor: '#12141D',
                  color: '#F5F6FA',
                  fontSize: '12px',
                  paddingLeft: '32px',
                  paddingRight: '12px',
                  paddingTop: '6px',
                  paddingBottom: '6px',
                  borderRadius: '9999px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  outline: 'none',
                  width: '180px'
                }}
              />
            </div>
          )}

          {/* Add Custom Jewellery Button */}
          <button
            type="button"
            onClick={onOpenUploadModal}
            className="btn-gold"
            style={{ fontSize: '12px', padding: '8px 16px' }}
          >
            <PlusCircle style={{ width: '14px', height: '14px' }} />
            <span>Add Jewellery Design</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      {catalog.length > 0 && (
        <div style={{ display: 'flex', items: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                border: activeCategory === cat.id ? '1px solid rgba(212, 175, 55, 0.6)' : '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: activeCategory === cat.id ? 'rgba(212, 175, 55, 0.2)' : 'rgba(18, 20, 29, 0.6)',
                color: activeCategory === cat.id ? '#F3E5AB' : '#9499AD',
                transition: 'all 0.2s ease'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Product Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px', maxHeight: '360px', overflowY: 'auto' }}>
        {/* Upload Card */}
        <div
          onClick={onOpenUploadModal}
          style={{
            borderRadius: '12px',
            padding: '16px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            border: '2px dashed rgba(212, 175, 55, 0.4)',
            backgroundColor: 'rgba(18, 20, 29, 0.4)',
            minHeight: '160px',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(212, 175, 55, 0.15)', border: '1px solid rgba(212, 175, 55, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37' }}>
            <Plus style={{ width: '20px', height: '20px' }} />
          </div>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#F3E5AB' }}>Add New Design</span>
          <span style={{ fontSize: '10px', color: '#9499AD' }}>Upload photo of your jewellery</span>
        </div>

        {/* Existing Jewellery Items */}
        {filteredCatalog.map((item) => {
          const isSelected = selectedItem?.id === item.id;
          return (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              style={{
                position: 'relative',
                borderRadius: '12px',
                padding: '12px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: isSelected ? '1px solid #D4AF37' : '1px solid rgba(255, 255, 255, 0.08)',
                backgroundColor: isSelected ? 'rgba(212, 175, 55, 0.15)' : 'rgba(18, 20, 29, 0.5)',
                boxShadow: isSelected ? '0 0 15px rgba(212, 175, 55, 0.3)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {isSelected && (
                <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10 }}>
                  <CheckCircle2 style={{ width: '16px', height: '16px', color: '#D4AF37' }} />
                </div>
              )}

              {item.tag && (
                <div style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 10 }}>
                  <span className="badge-gold" style={{ fontSize: '9px', padding: '2px 8px' }}>
                    {item.tag}
                  </span>
                </div>
              )}

              <div style={{ width: '100%', height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(0, 0, 0, 0.4)', margin: '4px 0' }}>
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                />
              </div>

              <div>
                <h3 style={{ fontSize: '12px', fontWeight: '600', color: '#F5F6FA', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.name}
                </h3>
                <p style={{ fontSize: '10px', color: '#9499AD', margin: '2px 0 0 0', textTransform: 'capitalize' }}>
                  {item.category.replace('_', ' ')}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
