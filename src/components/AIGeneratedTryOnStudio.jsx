import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles, UploadCloud, RefreshCw, Download, Share2,
  CheckCircle2, Wand2, Eye, AlertTriangle, XCircle,
  ChevronDown, Image as ImageIcon, Key, Zap
} from 'lucide-react';
import { generateHuggingFaceTryOn, isApiKeyConfigured } from '../utils/huggingFaceAiEngine';

// Progress stage definitions
const PROGRESS_STAGES = [
  { id: 'analyze', label: 'Analyzing Photo', icon: '1' },
  { id: 'understand', label: 'Understanding Design', icon: '2' },
  { id: 'apply', label: 'Applying Jewellery', icon: '3' },
  { id: 'enhance', label: 'Enhancing Realism', icon: '4' },
];

// Map progress messages to stage indices
function getStageFromMessage(msg) {
  const m = (msg || '').toLowerCase();
  if (m.includes('analyz')) return 0;
  if (m.includes('understand') || m.includes('design')) return 1;
  if (m.includes('apply') || m.includes('calling') || m.includes('generat')) return 2;
  if (m.includes('enhanc') || m.includes('realism')) return 3;
  if (m.includes('complete')) return 4;
  return -1;
}

export default function AIGeneratedTryOnStudio({
  catalog,
  selectedItem,
  onSelectItem,
  onOpenUploadModal
}) {
  const [customerPhotoUrl, setCustomerPhotoUrl] = useState(null);
  const personInputRef = useRef(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStage, setCurrentStage] = useState(-1);
  const [progressMessage, setProgressMessage] = useState('');
  const [aiResultUrl, setAiResultUrl] = useState(null);
  const [showBefore, setShowBefore] = useState(false);

  // Generation history (max 5)
  const [history, setHistory] = useState([]);
  const [activeHistoryIndex, setActiveHistoryIndex] = useState(-1);

  // Error state
  const [error, setError] = useState(null);

  // Download dropdown
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const downloadRef = useRef(null);

  // Loaded image refs
  const [loadedJewelleryImg, setLoadedJewelleryImg] = useState(null);
  const [loadedPersonImg, setLoadedPersonImg] = useState(null);

  const apiKeyReady = isApiKeyConfigured();

  useEffect(() => {
    if (!selectedItem || !selectedItem.imageUrl) {
      setLoadedJewelleryImg(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setLoadedJewelleryImg(img);
    img.onerror = () => setLoadedJewelleryImg(null);
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
    img.onerror = () => setLoadedPersonImg(null);
    img.src = customerPhotoUrl;
  }, [customerPhotoUrl]);

  // Close download menu on outside click
  useEffect(() => {
    function handleClick(e) {
      if (downloadRef.current && !downloadRef.current.contains(e.target)) {
        setShowDownloadMenu(false);
      }
    }
    if (showDownloadMenu) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [showDownloadMenu]);

  const handleUploadPersonPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCustomerPhotoUrl(ev.target.result);
      setAiResultUrl(null);
      setError(null);
      setHistory([]);
      setActiveHistoryIndex(-1);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateAI = async () => {
    if (!selectedItem) {
      setError({ type: 'input', title: 'No Design Selected', message: 'Please select a jewellery design from the catalog first.', retryable: false });
      return;
    }
    if (!customerPhotoUrl || !loadedPersonImg) {
      setError({ type: 'input', title: 'No Photo Uploaded', message: 'Please upload your portrait photo first.', retryable: false });
      return;
    }

    setIsGenerating(true);
    setCurrentStage(0);
    setProgressMessage('Analyzing your photo...');
    setError(null);
    setAiResultUrl(null);
    setShowBefore(false);

    try {
      const resultUrl = await generateHuggingFaceTryOn(
        {
          personImg: loadedPersonImg,
          jewelleryImg: loadedJewelleryImg,
          category: selectedItem.category,
          item: selectedItem
        },
        (msg) => {
          setProgressMessage(msg);
          const stage = getStageFromMessage(msg);
          if (stage >= 0) setCurrentStage(stage);
        }
      );

      setAiResultUrl(resultUrl);

      // Add to history (max 5)
      setHistory((prev) => {
        const updated = [resultUrl, ...prev].slice(0, 5);
        return updated;
      });
      setActiveHistoryIndex(0);

      setIsGenerating(false);
      setCurrentStage(4); // All complete
    } catch (err) {
      console.error('AI Try-On error:', err);
      setError(err?.title ? err : {
        type: 'unknown',
        title: 'Generation Failed',
        message: err?.message || 'An unexpected error occurred. Please try again.',
        retryable: true
      });
      setIsGenerating(false);
      setCurrentStage(-1);
    }
  };

  const handleHistorySelect = (index) => {
    setActiveHistoryIndex(index);
    setAiResultUrl(history[index]);
    setShowBefore(false);
  };

  const handleDownload = (format, quality, maxDim) => {
    if (!aiResultUrl) return;
    setShowDownloadMenu(false);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');

      let w = img.naturalWidth;
      let h = img.naturalHeight;

      // Resize if maxDim specified
      if (maxDim && (w > maxDim || h > maxDim)) {
        const ratio = Math.min(maxDim / w, maxDim / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }

      // Upscale for 4K
      if (maxDim && maxDim > img.naturalWidth) {
        const ratio = maxDim / Math.max(img.naturalWidth, img.naturalHeight);
        w = Math.round(img.naturalWidth * ratio);
        h = Math.round(img.naturalHeight * ratio);
      }

      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);

      const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
      const ext = format === 'jpg' ? 'jpg' : 'png';
      const dataUrl = canvas.toDataURL(mimeType, quality || 1.0);

      const link = document.createElement('a');
      link.download = `marne-jewellery-tryon-${Date.now()}.${ext}`;
      link.href = dataUrl;
      link.click();
    };
    img.src = aiResultUrl;
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent('Check out this virtual try-on from Marne Jewellery Studio! ✨');
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Current displayed result
  const displayUrl = showBefore ? customerPhotoUrl : aiResultUrl;

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

      {/* API KEY WARNING */}
      {!apiKeyReady && (
        <div className="api-key-warning" id="api-key-warning">
          <div className="api-key-warning-icon">
            <Key style={{ width: '18px', height: '18px' }} />
          </div>
          <div className="api-key-warning-content">
            <h4>Hugging Face API Key Required</h4>
            <p>
              To use AI-powered virtual try-on, add your free API token to the <strong>.env</strong> file:<br />
              <code style={{ fontSize: '11px', color: '#F3E5AB', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '4px' }}>
                VITE_HF_API_TOKEN=hf_your_token_here
              </code><br />
              <span style={{ marginTop: '4px', display: 'inline-block' }}>
                Get a free token at{' '}
                <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer">
                  huggingface.co/settings/tokens
                </a>
              </span>
            </p>
          </div>
        </div>
      )}

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

      {/* MULTI-STAGE PROGRESS BAR (during generation) */}
      {isGenerating && (
        <div className="glass-card" style={{ padding: '16px 20px', borderRadius: '16px' }}>
          <div className="progress-stepper">
            {PROGRESS_STAGES.map((stage, i) => {
              const isCompleted = currentStage > i;
              const isActive = currentStage === i;
              const showConnector = i < PROGRESS_STAGES.length - 1;

              return (
                <React.Fragment key={stage.id}>
                  <div className={`progress-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                    <div className="progress-step-icon">
                      {isCompleted ? (
                        <CheckCircle2 style={{ width: '16px', height: '16px' }} />
                      ) : (
                        stage.icon
                      )}
                    </div>
                    <span className="progress-step-label">{stage.label}</span>
                  </div>
                  {showConnector && (
                    <div className={`progress-connector ${isCompleted ? 'completed' : ''}`}>
                      <div className="progress-connector-fill" style={{ width: isCompleted ? '100%' : isActive ? '50%' : '0%' }} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <p style={{ textAlign: 'center', fontSize: '12px', color: '#9499AD', marginTop: '4px' }}>
            {progressMessage}
          </p>
        </div>
      )}

      {/* GENERATE TRY-ON BUTTON */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={handleGenerateAI}
          disabled={!selectedItem || !customerPhotoUrl || isGenerating || !apiKeyReady}
          className="btn-gold"
          id="generate-tryon-btn"
          style={{
            fontSize: '15px',
            padding: '14px 36px',
            borderRadius: '9999px',
            opacity: (!selectedItem || !customerPhotoUrl || isGenerating || !apiKeyReady) ? 0.5 : 1,
            cursor: (!selectedItem || !customerPhotoUrl || isGenerating || !apiKeyReady) ? 'not-allowed' : 'pointer',
            boxShadow: '0 0 25px rgba(212, 175, 55, 0.4)'
          }}
        >
          {isGenerating ? (
            <>
              <RefreshCw style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Wand2 style={{ width: '20px', height: '20px' }} />
              <span>Generate AI Try-On</span>
            </>
          )}
        </button>
      </div>

      {/* ERROR CARD */}
      {error && !isGenerating && (
        <div className={`error-card ${error.type === 'loading' || error.type === 'rate_limit' ? 'warning' : ''}`} id="error-card">
          <div className="error-card-title">
            {error.type === 'loading' || error.type === 'rate_limit' ? (
              <AlertTriangle style={{ width: '18px', height: '18px' }} />
            ) : (
              <XCircle style={{ width: '18px', height: '18px' }} />
            )}
            {error.title}
          </div>
          <div className="error-card-message">
            {error.message}
          </div>
          {error.retryable && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button
                onClick={handleGenerateAI}
                className="btn-gold"
                style={{ fontSize: '12px', padding: '8px 20px' }}
              >
                <RefreshCw style={{ width: '14px', height: '14px' }} />
                <span>Retry</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* RESULT VIEWPORT */}
      {aiResultUrl && !isGenerating && !error && (
        <div className="glass-card result-viewport" id="result-viewport" style={{ padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid #D4AF37', boxShadow: '0 0 35px rgba(212, 175, 55, 0.25)' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles style={{ width: '20px', height: '20px', color: '#D4AF37' }} />
              <h3 className="font-heading text-gold-gradient" style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
                AI Try-On Result
              </h3>
              <span className="result-badge">
                <Zap style={{ width: '10px', height: '10px' }} /> AI Generated
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setShowBefore(!showBefore)}
                className="btn-secondary"
                style={{ fontSize: '11px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Eye style={{ width: '14px', height: '14px', color: '#D4AF37' }} />
                <span>{showBefore ? 'View AI Result' : 'View Original'}</span>
              </button>

              <button
                onClick={handleGenerateAI}
                className="btn-secondary"
                style={{ fontSize: '11px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <RefreshCw style={{ width: '14px', height: '14px', color: '#D4AF37' }} />
                <span>Regenerate</span>
              </button>
            </div>
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
            justifyContent: 'center',
            position: 'relative'
          }}>
            <img
              src={displayUrl}
              alt="Virtual Try-On Result"
              style={{ maxHeight: '520px', maxWidth: '100%', objectFit: 'contain' }}
            />
            {/* Before/After label */}
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              background: 'rgba(0,0,0,0.65)',
              padding: '4px 10px',
              borderRadius: '8px',
              fontSize: '10px',
              fontWeight: '600',
              color: showBefore ? '#9499AD' : '#34D399',
              backdropFilter: 'blur(8px)'
            }}>
              {showBefore ? 'Original Photo' : 'AI Generated'}
            </div>
          </div>

          {/* Generation History Strip */}
          {history.length > 1 && (
            <div>
              <p style={{ fontSize: '11px', color: '#9499AD', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Generation History
              </p>
              <div className="history-strip">
                {history.map((url, i) => (
                  <div
                    key={`hist-${i}`}
                    className={`history-thumb ${activeHistoryIndex === i ? 'selected' : ''}`}
                    onClick={() => handleHistorySelect(i)}
                  >
                    <img src={url} alt={`Generation ${i + 1}`} />
                    <span className="history-thumb-index">#{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {/* Download with dropdown */}
            <div className="download-dropdown-wrapper" ref={downloadRef} style={{ width: '100%' }}>
              <button
                onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                className="btn-gold"
                id="download-btn"
                style={{ fontSize: '13px', padding: '12px 20px', justifyContent: 'center', width: '100%' }}
              >
                <Download style={{ width: '16px', height: '16px' }} />
                <span>Download</span>
                <ChevronDown style={{ width: '14px', height: '14px', transform: showDownloadMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {showDownloadMenu && (
                <div className="download-menu">
                  <button className="download-menu-item" onClick={() => handleDownload('png', 1.0, null)}>
                    <ImageIcon style={{ width: '14px', height: '14px', color: '#D4AF37' }} />
                    <span>Original Quality</span>
                    <span className="format-tag">PNG</span>
                  </button>
                  <button className="download-menu-item" onClick={() => handleDownload('jpg', 0.85, null)}>
                    <ImageIcon style={{ width: '14px', height: '14px', color: '#9499AD' }} />
                    <span>Compressed</span>
                    <span className="format-tag">JPG</span>
                  </button>
                  <button className="download-menu-item" onClick={() => handleDownload('png', 1.0, 1920)}>
                    <ImageIcon style={{ width: '14px', height: '14px', color: '#6EE7B7' }} />
                    <span>HD 1080p</span>
                    <span className="format-tag">PNG</span>
                  </button>
                  <button className="download-menu-item" onClick={() => handleDownload('png', 1.0, 3840)}>
                    <ImageIcon style={{ width: '14px', height: '14px', color: '#F3E5AB' }} />
                    <span>4K Ultra HD</span>
                    <span className="format-tag">PNG</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleWhatsAppShare}
              className="btn-secondary"
              id="share-whatsapp-btn"
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
