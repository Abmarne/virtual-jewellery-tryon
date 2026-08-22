import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, UploadCloud, Camera, RefreshCw, Download, Share2, CheckCircle2, Wand2, Eye } from 'lucide-react';
import { generateHuggingFaceTryOn } from '../utils/huggingFaceAiEngine';

export default function AIGeneratedTryOnStudio({
  catalog,
  selectedItem,
  onSelectItem,
  onOpenUploadModal
}) {
  const [customerPhotoUrl, setCustomerPhotoUrl] = useState(null);
  const personInputRef = useRef(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('Processing Virtual Try-On...');
  const [aiResultUrl, setAiResultUrl] = useState(null);
  const [showBefore, setShowBefore] = useState(false);

  const [loadedJewelleryImg, setLoadedJewelleryImg] = useState(null);
  const [loadedPersonImg, setLoadedPersonImg] = useState(null);

  useEffect(() => {
    if (!selectedItem || !selectedItem.imageUrl) {
      setLoadedJewelleryImg(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setLoadedJewelleryImg(img);
    img.src = selectedItem.imageUrl;
  }, [selectedItem]);

  useEffect(() => {
    if (!customerPhotoUrl) {
      setLoadedPersonImg(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setLoadedPersonImg(img);
    img.src = customerPhotoUrl;
  }, [customerPhotoUrl]);

  const handleUploadPersonPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCustomerPhotoUrl(ev.target.result);
      setAiResultUrl(null);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateAI = async () => {
    if (!selectedItem) {
      alert('Please select a jewellery design from the catalog first.');
      return;
    }
    if (!customerPhotoUrl || !loadedPersonImg || !loadedJewelleryImg) {
      alert('Please upload your photo first.');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress('Processing Virtual Try-On Result...');

    try {
      const resultUrl = await generateHuggingFaceTryOn(
        {
          personImg: loadedPersonImg,
          jewelleryImg: loadedJewelleryImg,
          category: selectedItem.category
        },
        (msg) => setGenerationProgress(msg)
      );

      setAiResultUrl(resultUrl);
      setIsGenerating(false);
    } catch (err) {
      console.error('Try-On error:', err);
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!aiResultUrl) return;
    const link = document.createElement('a');
    link.download = `marne-jewellery-tryon-${Date.now()}.png`;
    link.href = aiResultUrl;
    link.click();
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`Check out this design from Marne Jewellery!`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* Hidden File Input */}
      <input
        ref={personInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleUploadPersonPhoto}
      />

      {/* STEP 1 & STEP 2 CARDS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* CARD 1: Selected Jewellery Design */}
        <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: 'rgba(212, 175, 55, 0.2)', border: '1px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: '#F3E5AB' }}>
                1
              </div>
              <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#F5F6FA', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Select Jewellery Design
              </h3>
            </div>
            {selectedItem && (
              <span className="badge-gold" style={{ fontSize: '10px' }}>
                {selectedItem.category?.replace('_', ' ') || 'Design'}
              </span>
            )}
          </div>

          <div style={{
            width: '100%',
            height: '180px',
            borderRadius: '12px',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px',
            position: 'relative'
          }}>
            {selectedItem ? (
              <img
                src={selectedItem.imageUrl}
                alt={selectedItem.name}
                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
              />
            ) : (
              <span style={{ fontSize: '12px', color: '#9499AD' }}>Select any design below</span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#F3E5AB' }}>
              {selectedItem?.name || 'No Design Selected'}
            </span>
            <button
              onClick={onOpenUploadModal}
              className="btn-secondary"
              style={{ fontSize: '11px', padding: '6px 12px' }}
            >
              + Upload Design
            </button>
          </div>
        </div>

        {/* CARD 2: Customer Person Photo */}
        <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: 'rgba(212, 175, 55, 0.2)', border: '1px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: '#F3E5AB' }}>
                2
              </div>
              <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#F5F6FA', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Upload Your Photo
              </h3>
            </div>

            {customerPhotoUrl && (
              <span style={{ fontSize: '10px', color: '#34D399', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 style={{ width: '12px', height: '12px' }} /> Photo Ready
              </span>
            )}
          </div>

          <div style={{
            width: '100%',
            height: '180px',
            borderRadius: '12px',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            border: '1px dashed rgba(212, 175, 55, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer'
          }}
          onClick={() => !customerPhotoUrl && personInputRef.current?.click()}
          >
            {customerPhotoUrl ? (
              <img
                src={customerPhotoUrl}
                alt="Customer Photo"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px', textAlign: 'center' }}>
                <UploadCloud style={{ width: '32px', height: '32px', color: '#D4AF37' }} />
                <span style={{ fontSize: '12px', color: '#CBD5E1', fontWeight: '500' }}>Click to upload your portrait photo</span>
                <span style={{ fontSize: '10px', color: '#6B7280' }}>JPG, PNG, WebP format supported</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => personInputRef.current?.click()}
              className="btn-gold"
              style={{ fontSize: '11px', padding: '7px 14px', flex: 1 }}
            >
              <UploadCloud style={{ width: '14px', height: '14px' }} />
              <span>{customerPhotoUrl ? 'Change Photo' : 'Upload Photo'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* GENERATE TRY-ON BUTTON */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={handleGenerateAI}
          disabled={!selectedItem || !customerPhotoUrl || isGenerating}
          className="btn-gold"
          style={{
            fontSize: '15px',
            padding: '14px 36px',
            borderRadius: '9999px',
            opacity: (!selectedItem || !customerPhotoUrl || isGenerating) ? 0.5 : 1,
            cursor: (!selectedItem || !customerPhotoUrl || isGenerating) ? 'not-allowed' : 'pointer',
            boxShadow: '0 0 25px rgba(212, 175, 55, 0.4)'
          }}
        >
          {isGenerating ? (
            <>
              <RefreshCw style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />
              <span>{generationProgress}</span>
            </>
          ) : (
            <>
              <Wand2 style={{ width: '20px', height: '20px' }} />
              <span>Generate Virtual Try-On</span>
            </>
          )}
        </button>
      </div>

      {/* RESULT VIEWPORT */}
      {aiResultUrl && !isGenerating && (
        <div className="glass-card" style={{ padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid #D4AF37', boxShadow: '0 0 35px rgba(212, 175, 55, 0.25)' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles style={{ width: '20px', height: '20px', color: '#D4AF37' }} />
              <h3 className="font-heading text-gold-gradient" style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
                Try-On Result
              </h3>
            </div>

            <button
              onClick={() => setShowBefore(!showBefore)}
              className="btn-secondary"
              style={{ fontSize: '11px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Eye style={{ width: '14px', height: '14px', color: '#D4AF37' }} />
              <span>{showBefore ? 'View Generated Result' : 'View Original Photo'}</span>
            </button>
          </div>

          {/* Result Image Frame */}
          <div style={{
            width: '100%',
            maxHeight: '520px',
            borderRadius: '16px',
            overflow: 'hidden',
            backgroundColor: '#000',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img
              src={showBefore ? customerPhotoUrl : aiResultUrl}
              alt="Virtual Try-On Result"
              style={{ maxHeight: '520px', maxWidth: '100%', objectFit: 'contain' }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <button onClick={handleDownload} className="btn-gold" style={{ fontSize: '13px', padding: '12px 20px', justifyContent: 'center' }}>
              <Download style={{ width: '16px', height: '16px' }} />
              <span>Download Photo</span>
            </button>

            <button
              onClick={handleWhatsAppShare}
              className="btn-secondary"
              style={{ fontSize: '13px', padding: '12px 20px', justifyContent: 'center', borderColor: 'rgba(16, 185, 129, 0.4)', color: '#6EE7B7' }}
            >
              <Share2 style={{ width: '16px', height: '16px', color: '#34D399' }} />
              <span>Share on WhatsApp</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
