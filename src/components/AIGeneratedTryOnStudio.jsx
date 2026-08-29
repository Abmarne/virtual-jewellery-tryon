import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles, UploadCloud, RefreshCw, Download, Share2,
  CheckCircle2, Wand2, Eye, AlertTriangle, XCircle,
  ChevronDown, Image as ImageIcon, Key, Zap, Camera, X, SlidersHorizontal
} from 'lucide-react';
import { generateHuggingFaceTryOn, isApiKeyConfigured } from '../utils/huggingFaceAiEngine';
import FineTuneControls from './FineTuneControls';

// Progress stage definitions
const PROGRESS_STAGES = [
  { id: 'analyze', label: 'Analyzing Photo', icon: '1' },
  { id: 'understand', label: 'Understanding Design', icon: '2' },
  { id: 'apply', label: 'Applying Jewellery', icon: '3' },
  { id: 'enhance', label: 'Enhancing Realism', icon: '4' },
];

export default function AIGeneratedTryOnStudio({ selectedItem, customerPhotoUrl: propPhotoUrl, onPhotoUpload: propOnUpload }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  const [currentStage, setCurrentStage] = useState(0);
  const [error, setError] = useState(null);

  // Customer photo internal state fallback
  const [internalPhotoUrl, setInternalPhotoUrl] = useState(null);
  const activeCustomerPhotoUrl = propPhotoUrl || internalPhotoUrl;

  const handleSetCustomerPhoto = (url) => {
    setInternalPhotoUrl(url);
    if (typeof propOnUpload === 'function') {
      try { propOnUpload(url); } catch (e) { console.warn('onPhotoUpload prop notice:', e); }
    }
  };

  // Results & History
  const [aiResultUrl, setAiResultUrl] = useState(null);
  const [landmarkUrl, setLandmarkUrl] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeHistoryIndex, setActiveHistoryIndex] = useState(0);
  const [showBefore, setShowBefore] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const downloadRef = useRef(null);

  // Loaded image refs
  const [loadedJewelleryImg, setLoadedJewelleryImg] = useState(null);
  const [loadedPersonImg, setLoadedPersonImg] = useState(null);

  // Camera capture state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Fine tune alignment & size state
  const [fineTune, setFineTune] = useState({ scale: 1.0, offsetY: 0, offsetX: 0, tilt: 0, opacity: 1.0 });
  const [showFineTune, setShowFineTune] = useState(false);

  const apiKeyReady = isApiKeyConfigured();

  useEffect(() => {
    if (!selectedItem || !selectedItem.imageUrl) {
      setLoadedJewelleryImg(null);
      return;
    }
    const url = selectedItem.imageUrl;
    const img = new Image();
    if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => setLoadedJewelleryImg(img);
    img.onerror = () => {
      const fb = new Image();
      fb.onload = () => setLoadedJewelleryImg(fb);
      fb.onerror = () => setLoadedJewelleryImg(null);
      fb.src = url;
    };
    img.src = url;
  }, [selectedItem]);

  useEffect(() => {
    if (!activeCustomerPhotoUrl) {
      setLoadedPersonImg(null);
      return;
    }
    const url = activeCustomerPhotoUrl;
    const img = new Image();
    if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => setLoadedPersonImg(img);
    img.onerror = () => {
      const fb = new Image();
      fb.onload = () => setLoadedPersonImg(fb);
      fb.onerror = () => setLoadedPersonImg(null);
      fb.src = url;
    };
    img.src = url;
  }, [activeCustomerPhotoUrl]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (downloadRef.current && !downloadRef.current.contains(e.target)) {
        setShowDownloadMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const personInputRef = useRef(null);

  const handleUploadPersonPhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleSetCustomerPhoto(event.target.result);
        setAiResultUrl(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Attach video stream as soon as modal mounts in DOM
  useEffect(() => {
    if (isCameraOpen && streamRef.current && videoRef.current) {
      const video = videoRef.current;
      video.srcObject = streamRef.current;
      video.onloadedmetadata = () => {
        video.play().then(() => {
          setIsCameraLoading(false);
        }).catch((e) => {
          console.warn('Video play warning:', e);
          setIsCameraLoading(false);
        });
      };
      const fallbackTimer = setTimeout(() => {
        setIsCameraLoading(false);
      }, 800);
      return () => clearTimeout(fallbackTimer);
    }
  }, [isCameraOpen]);

  const startCamera = async () => {
    setIsCameraOpen(true);
    setCameraError(null);
    setIsCameraLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().then(() => setIsCameraLoading(false)).catch(() => setIsCameraLoading(false));
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('Unable to access webcam. Please check permissions or upload a photo file.');
      setIsCameraLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
    setCameraError(null);
  };

  const capturePhotoFromCamera = () => {
    try {
      const video = videoRef.current;
      if (!video) {
        console.error('No video element found for camera snap.');
        return;
      }

      const vWidth = video.videoWidth || video.offsetWidth || video.clientWidth || 1280;
      const vHeight = video.videoHeight || video.offsetHeight || video.clientHeight || 720;

      if (vWidth === 0 || vHeight === 0) {
        console.warn('Camera stream dimensions not initialized yet.');
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = vWidth;
      canvas.height = vHeight;
      const ctx = canvas.getContext('2d');

      // Mirror selfie frame
      ctx.translate(vWidth, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, vWidth, vHeight);

      const dataUrl = canvas.toDataURL('image/png', 1.0);

      if (!dataUrl || dataUrl.length < 100) {
        console.error('Captured canvas output invalid base64 string.');
        return;
      }

      // 1. Immediately pass photo to helper
      handleSetCustomerPhoto(dataUrl);

      // 2. Preload image element directly for generator
      const img = new Image();
      img.onload = () => {
        setLoadedPersonImg(img);
      };
      img.onerror = () => {
        console.warn('Loaded person img fallback');
      };
      img.src = dataUrl;

      setAiResultUrl(null);
      setError(null);
      stopCamera();
    } catch (err) {
      console.error('Error during camera snap capture:', err);
    }
  };

  const getStageFromMessage = (msg) => {
    if (msg.includes('Analyzing') || msg.includes('Resolving')) return 0;
    if (msg.includes('Detecting') || msg.includes('Understanding')) return 1;
    if (msg.includes('Calculating') || msg.includes('Synthesizing') || msg.includes('Compositing')) return 2;
    if (msg.includes('Harmonizing') || msg.includes('Refining') || msg.includes('Finalizing')) return 3;
    return 0;
  };

  const [viewMode, setViewMode] = useState('ai');

  const handleGenerateAI = async () => {
    if (!selectedItem) {
      setError({ type: 'input', title: 'No Design Selected', message: 'Please select a jewellery design from the catalog first.', retryable: false });
      return;
    }
    if (!activeCustomerPhotoUrl || !loadedPersonImg) {
      setError({ type: 'input', title: 'No Photo Uploaded', message: 'Please upload your portrait photo first.', retryable: false });
      return;
    }

    setIsGenerating(true);
    setCurrentStage(0);
    setProgressMessage('Analyzing your photo...');
    setError(null);
    setAiResultUrl(null);
    setLandmarkUrl(null);
    setViewMode('ai');

    try {
      const res = await generateHuggingFaceTryOn(
        {
          personImg: loadedPersonImg || activeCustomerPhotoUrl,
          jewelleryImg: loadedJewelleryImg || selectedItem?.imageUrl,
          category: selectedItem.category,
          item: selectedItem,
          fineTune
        },
        (msg) => {
          setProgressMessage(msg);
          const stage = getStageFromMessage(msg);
          if (stage >= 0) setCurrentStage(stage);
        }
      );

      const mainUrl = typeof res === 'object' ? res.aiResultUrl : res;
      const lmkUrl = typeof res === 'object' ? res.landmarkUrl : null;

      setAiResultUrl(mainUrl);
      setLandmarkUrl(lmkUrl);

      setHistory((prev) => {
        const updated = [mainUrl, ...prev].slice(0, 5);
        return updated;
      });
      setActiveHistoryIndex(0);

      setIsGenerating(false);
      setCurrentStage(4);
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

      if (maxDim && (w > maxDim || h > maxDim)) {
        const ratio = Math.min(maxDim / w, maxDim / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }

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

  const displayUrl = showBefore ? activeCustomerPhotoUrl : aiResultUrl;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      <input
        ref={personInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleUploadPersonPhoto}
      />

      {/* WEBCAM MODAL */}
      {isCameraOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="glass-card" style={{
            width: '100%', maxWidth: '640px', padding: '24px', borderRadius: '24px',
            display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera style={{ width: '20px', height: '20px', color: '#D4AF37' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#FFF', margin: 0 }}>
                  Take Photo with Camera
                </h3>
              </div>
              <button
                onClick={stopCamera}
                style={{ background: 'none', border: 'none', color: '#A0A0A0', cursor: 'pointer', padding: '4px' }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            {cameraError ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#FF6B6B', fontSize: '14px' }}>
                {cameraError}
              </div>
            ) : (
              <div style={{
                position: 'relative', width: '100%', aspectRatio: '4/3', backgroundColor: '#000',
                borderRadius: '16px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {isCameraLoading && (
                  <div style={{ color: '#D4AF37', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <RefreshCw style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
                    Starting Camera...
                  </div>
                )}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%', height: '100%', objectFit: 'cover',
                    transform: 'scaleX(-1)', display: isCameraLoading ? 'none' : 'block'
                  }}
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" onClick={stopCamera} className="btn-secondary" style={{ padding: '10px 20px', fontSize: '13px' }}>
                Cancel
              </button>
              {!cameraError && (
                <button
                  type="button"
                  onClick={capturePhotoFromCamera}
                  className="btn-gold"
                  disabled={isCameraLoading}
                  style={{
                    padding: '10px 24px',
                    fontSize: '13px',
                    opacity: isCameraLoading ? 0.6 : 1,
                    cursor: isCameraLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  Capture Snap
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TOP SECTION: STEP 1 & STEP 2 CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* STEP 1: SELECTED JEWELLERY DESIGN */}
        <div className="glass-card" style={{ padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="step-badge">1</div>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#FFF', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
                Select Jewellery Design
              </h3>
            </div>
            {selectedItem && (
              <span className="gold-tag" style={{ fontSize: '11px', padding: '3px 10px' }}>
                {selectedItem.category || 'Jewellery'}
              </span>
            )}
          </div>

          <div style={{
            position: 'relative', width: '100%', height: '220px', borderRadius: '14px',
            backgroundColor: 'rgba(0, 0, 0, 0.4)', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {selectedItem ? (
              <img
                src={selectedItem.imageUrl}
                alt={selectedItem.name}
                style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }}
              />
            ) : (
              <div style={{ textAlign: 'center', color: '#71717A', padding: '20px' }}>
                <ImageIcon style={{ width: '40px', height: '40px', margin: '0 auto 8px', opacity: 0.4 }} />
                <p style={{ fontSize: '13px', margin: 0 }}>Select a jewellery item from the catalog below</p>
              </div>
            )}
          </div>

          {selectedItem && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 'bold', color: '#FFF', margin: '0 0 2px' }}>
                  {selectedItem.name}
                </h4>
                <p style={{ fontSize: '12px', color: '#A0A0A0', margin: 0 }}>
                  {selectedItem.description || 'Custom Jewellery Piece'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* STEP 2: UPLOAD CUSTOMER PHOTO */}
        <div className="glass-card" style={{ padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="step-badge">2</div>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#FFF', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
                Upload Your Photo
              </h3>
            </div>
          </div>

          <div
            onClick={() => personInputRef.current?.click()}
            style={{
              position: 'relative', width: '100%', height: '220px', borderRadius: '14px',
              backgroundColor: 'rgba(0, 0, 0, 0.4)', overflow: 'hidden',
              border: activeCustomerPhotoUrl ? '1px solid rgba(212, 175, 55, 0.4)' : '2px dashed rgba(255, 255, 255, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {activeCustomerPhotoUrl ? (
              <img
                src={activeCustomerPhotoUrl}
                alt="User Photo"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ textAlign: 'center', color: '#71717A', padding: '20px' }}>
                <UploadCloud style={{ width: '44px', height: '44px', color: '#D4AF37', margin: '0 auto 12px', opacity: 0.8 }} />
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#E4E4E7', margin: '0 0 4px' }}>
                  Upload photo or snap with camera
                </p>
                <p style={{ fontSize: '12px', color: '#71717A', margin: 0 }}>
                  JPG, PNG, WebP format supported
                </p>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => personInputRef.current?.click()}
              className="btn-gold"
              style={{ fontSize: '12px', padding: '9px 16px', flex: 1 }}
            >
              <UploadCloud style={{ width: '15px', height: '15px' }} />
              <span>{activeCustomerPhotoUrl ? 'Change File' : 'Upload File'}</span>
            </button>
            <button
              type="button"
              onClick={startCamera}
              className="btn-secondary"
              style={{ fontSize: '12px', padding: '9px 16px', flex: 1 }}
            >
              <Camera style={{ width: '15px', height: '15px', color: '#D4AF37' }} />
              <span>Take Photo</span>
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

      {/* PRIMARY ACTION BUTTONS: GENERATE AI TRY-ON & ADJUST ALIGNMENT */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={handleGenerateAI}
          disabled={!selectedItem || !activeCustomerPhotoUrl || isGenerating || !apiKeyReady}
          className="btn-gold"
          id="generate-tryon-btn"
          style={{
            fontSize: '16px',
            padding: '16px 48px',
            borderRadius: '9999px',
            opacity: (!selectedItem || !activeCustomerPhotoUrl || isGenerating || !apiKeyReady) ? 0.5 : 1,
            cursor: (!selectedItem || !activeCustomerPhotoUrl || isGenerating || !apiKeyReady) ? 'not-allowed' : 'pointer',
            boxShadow: '0 0 30px rgba(212, 175, 55, 0.45)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          {isGenerating ? (
            <>
              <RefreshCw style={{ width: '22px', height: '22px', animation: 'spin 1s linear infinite' }} />
              <span>Generating AI Try-On...</span>
            </>
          ) : (
            <>
              <Wand2 style={{ width: '22px', height: '22px' }} />
              <span>Generate AI Try-On</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => setShowFineTune(!showFineTune)}
          className={showFineTune ? 'btn-gold' : 'btn-secondary'}
          style={{
            fontSize: '13px',
            padding: '14px 24px',
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <SlidersHorizontal style={{ width: '16px', height: '16px', color: '#D4AF37' }} />
          <span>{showFineTune ? 'Hide Adjuster' : 'Adjust Alignment & Size'}</span>
        </button>
      </div>

      {/* FINE TUNE ADJUSTER PANEL */}
      {showFineTune && (
        <FineTuneControls
          fineTune={fineTune}
          onChange={(newFT) => {
            setFineTune(newFT);
            if (aiResultUrl) {
              handleGenerateAI();
            }
          }}
          onReset={() => {
            const resetFT = { scale: 1.0, offsetY: 0, offsetX: 0, tilt: 0, opacity: 1.0 };
            setFineTune(resetFT);
            if (aiResultUrl) {
              handleGenerateAI();
            }
          }}
        />
      )}

      {/* ERROR CARD */}
      {error && !isGenerating && (
        <div className="error-card" style={{
          padding: '16px 20px', borderRadius: '16px', backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <XCircle style={{ width: '20px', height: '20px', color: '#EF4444', flexShrink: 0 }} />
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#FCA5A5', margin: '0 0 2px' }}>
                {error.title}
              </h4>
              <p style={{ fontSize: '12px', color: '#FECACA', margin: 0 }}>
                {error.message}
              </p>
            </div>
          </div>
          {error.retryable && (
            <button
              onClick={handleGenerateAI}
              className="btn-secondary"
              style={{ fontSize: '12px', padding: '6px 14px', whiteSpace: 'nowrap' }}
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* AI TRY-ON RESULT VIEWPORT */}
      {aiResultUrl && !isGenerating && (
        <div className="glass-card" style={{ padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Header Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles style={{ width: '20px', height: '20px', color: '#D4AF37' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#FFF', margin: 0 }}>
                AI Try-On Result
              </h3>
              <span className="gold-tag" style={{ fontSize: '11px', padding: '3px 10px' }}>
                AI Neural Try-On
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Before / After Toggle */}
              <button
                onClick={() => setShowBefore(!showBefore)}
                className="btn-secondary"
                style={{ fontSize: '12px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Eye style={{ width: '14px', height: '14px', color: '#D4AF37' }} />
                <span>{showBefore ? 'View AI Try-On' : 'View Original Photo'}</span>
              </button>

              {/* Regenerate Button */}
              <button
                onClick={handleGenerateAI}
                className="btn-secondary"
                style={{ fontSize: '12px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <RefreshCw style={{ width: '14px', height: '14px', color: '#D4AF37' }} />
                <span>Regenerate</span>
              </button>

              {/* Download Dropdown */}
              <div ref={downloadRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                  className="btn-gold"
                  style={{ fontSize: '12px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Download style={{ width: '14px', height: '14px' }} />
                  <span>Download</span>
                  <ChevronDown style={{ width: '12px', height: '12px' }} />
                </button>

                {showDownloadMenu && (
                  <div className="download-menu" style={{
                    position: 'absolute', right: 0, top: '100%', marginTop: '8px', zIndex: 100,
                    width: '200px', backgroundColor: '#18181B', border: '1px solid rgba(212, 175, 55, 0.3)',
                    borderRadius: '14px', padding: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    display: 'flex', flexDirection: 'column', gap: '4px'
                  }}>
                    <button onClick={() => handleDownload('png', 1.0)} className="download-menu-item">
                      <span>PNG (Original High Res)</span>
                    </button>
                    <button onClick={() => handleDownload('jpg', 0.92)} className="download-menu-item">
                      <span>JPG (Standard)</span>
                    </button>
                    <button onClick={() => handleDownload('jpg', 0.98, 1920)} className="download-menu-item">
                      <span>HD 1080p Web</span>
                    </button>
                    <button onClick={() => handleDownload('png', 1.0, 3840)} className="download-menu-item">
                      <span>4K Ultra HD</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* MAIN PHOTO RESULT CANVAS */}
          <div style={{
            position: 'relative', width: '100%', maxHeight: '680px', borderRadius: '16px',
            backgroundColor: '#09090B', overflow: 'hidden', border: '1px solid rgba(212, 175, 55, 0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <img
              src={displayUrl}
              alt="AI Try-On Result"
              style={{ maxWidth: '100%', maxHeight: '680px', objectFit: 'contain' }}
            />
            {showBefore && (
              <div style={{
                position: 'absolute', top: '16px', left: '16px',
                backgroundColor: 'rgba(0,0,0,0.75)', color: '#FFF', fontSize: '11px',
                padding: '4px 12px', borderRadius: '9999px', border: '1px solid rgba(255,255,255,0.2)'
              }}>
                Original Photo
              </div>
            )}
          </div>

          {/* GENERATION HISTORY CAROUSEL STRIP */}
          {history.length > 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#9499AD', letterSpacing: '0.5px' }}>
                GENERATION HISTORY ({history.length})
              </span>
              <div className="history-strip" style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
                {history.map((url, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleHistorySelect(idx)}
                    style={{
                      width: '72px', height: '72px', borderRadius: '12px', overflow: 'hidden',
                      border: activeHistoryIndex === idx ? '2px solid #D4AF37' : '1px solid rgba(255,255,255,0.1)',
                      cursor: 'pointer', flexShrink: 0, opacity: activeHistoryIndex === idx ? 1 : 0.6,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <img src={url} alt={`History ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
