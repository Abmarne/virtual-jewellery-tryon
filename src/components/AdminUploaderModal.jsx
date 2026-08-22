import React, { useState } from 'react';
import { X, UploadCloud, Sparkles, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { processJewelleryImage } from '../utils/imageProcessor';

const inputStyle = {
  backgroundColor: '#12141D',
  color: '#E2E8F0',
  fontSize: '13px',
  padding: '10px 14px',
  borderRadius: '10px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  outline: 'none',
  width: '100%',
  fontFamily: "'Outfit', sans-serif"
};

const labelStyle = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#CBD5E1',
  marginBottom: '4px',
  display: 'block'
};

export default function AdminUploaderModal({ isOpen, onClose, onAddJewellery }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('necklace');
  const [tag, setTag] = useState('New Arrival');

  const [previewUrl, setPreviewUrl] = useState('');
  const [rawFile, setRawFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStatus, setProgressStatus] = useState('Processing Image...');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleImageFile = async (file) => {
    if (!file) return;
    setRawFile(file);
    setErrorMessage('');
    setIsProcessing(true);
    setProgressStatus('Processing Image...');

    try {
      const result = await processJewelleryImage(file);

      if (!result.success) {
        setErrorMessage(result.error || 'Failed to process image file.');
        setIsProcessing(false);
        return;
      }

      setPreviewUrl(result.processedUrl);
      setIsProcessing(false);
    } catch (err) {
      console.error('File processing error:', err);
      setErrorMessage('Failed to process image file.');
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !previewUrl) return;

    const newItem = {
      id: `custom-${Date.now()}`,
      name,
      category,
      tag: tag || 'Custom',
      description: 'Marne Jewellery custom design.',
      imageUrl: previewUrl,
      defaultScale: 1.0,
      defaultOffsetY: 0
    };

    onAddJewellery(newItem);
    setIsSuccess(true);

    setTimeout(() => {
      setIsSuccess(false);
      setName('');
      setPreviewUrl('');
      setRawFile(null);
      setErrorMessage('');
      onClose();
    }, 1200);
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
        {/* Close Button */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Sparkles style={{ width: '20px', height: '20px', color: '#D4AF37' }} />
          <h2 className="font-heading text-gold-gradient" style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
            Add Marne Jewellery Design
          </h2>
        </div>
        <p style={{ fontSize: '12px', color: '#9499AD', margin: '0 0 16px 0' }}>
          Upload any jewellery photo to add it to your studio catalog.
        </p>

        {isSuccess ? (
          <div style={{ padding: '48px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', textAlign: 'center' }}>
            <div style={{
              width: '52px', height: '52px',
              backgroundColor: 'rgba(212, 175, 55, 0.2)',
              color: '#D4AF37',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid #D4AF37'
            }}>
              <Check style={{ width: '24px', height: '24px', strokeWidth: 3 }} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#F5F6FA', margin: 0 }}>Design Added to Catalog!</h3>
            <p style={{ fontSize: '12px', color: '#9499AD', margin: 0 }}>Ready for virtual studio try-on.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Image Dropzone */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{
                position: 'relative',
                border: '2px dashed rgba(212, 175, 55, 0.3)',
                borderRadius: '14px',
                padding: '20px',
                backgroundColor: 'rgba(18, 20, 29, 0.5)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                textAlign: 'center', gap: '10px',
                minHeight: '140px',
                cursor: 'pointer'
              }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageFile(e.target.files?.[0])}
                  required={!previewUrl}
                  style={{
                    position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 10
                  }}
                />

                {isProcessing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '16px 0' }}>
                    <RefreshCw style={{ width: '28px', height: '28px', color: '#D4AF37', animation: 'spin 1s linear infinite' }} />
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#F3E5AB' }}>{progressStatus}</span>
                  </div>
                ) : previewUrl ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      padding: '12px', backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.3)'
                    }}>
                      <img
                        src={previewUrl}
                        alt="Processed Preview"
                        style={{ maxHeight: '130px', objectFit: 'contain' }}
                      />
                    </div>
                    <span style={{ fontSize: '11px', color: '#F3E5AB', fontWeight: '500' }}>Click or drag to replace image</span>
                  </div>
                ) : (
                  <>
                    <UploadCloud style={{ width: '32px', height: '32px', color: 'rgba(212, 175, 55, 0.7)' }} />
                    <span style={{ fontSize: '12px', color: '#CBD5E1', fontWeight: '500' }}>Click to upload jewellery image (PNG, JPG, WebP)</span>
                  </>
                )}
              </div>

              {/* Error */}
              {errorMessage && (
                <div style={{
                  backgroundColor: 'rgba(80, 10, 20, 0.8)',
                  border: '1px solid rgba(239, 68, 68, 0.5)',
                  color: '#FECACA',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                  <AlertCircle style={{ width: '16px', height: '16px', color: '#F87171', flexShrink: 0 }} />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            {/* Design Name */}
            <div>
              <label style={labelStyle}>Design Name</label>
              <input
                type="text"
                placeholder="e.g. Marne Laxmi Coin Kundan Necklace"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={inputStyle}
              />
            </div>

            {/* Category & Tag side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ ...inputStyle, appearance: 'auto' }}
                >
                  <option value="necklace">Necklace & Choker</option>
                  <option value="earrings">Earrings (Jhumkas)</option>
                  <option value="maang_tikka">Maang Tikka</option>
                  <option value="nose_ring">Nose Ring (Nath)</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Badge Tag</label>
                <input
                  type="text"
                  placeholder="e.g. Laxmi Coin / Temple"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <button type="button" onClick={onClose} className="btn-secondary" style={{ fontSize: '12px', padding: '9px 18px' }}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing || !previewUrl}
                className="btn-gold"
                style={{ fontSize: '12px', padding: '9px 20px', opacity: (isProcessing || !previewUrl) ? 0.5 : 1 }}
              >
                Add Design to Catalog
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
