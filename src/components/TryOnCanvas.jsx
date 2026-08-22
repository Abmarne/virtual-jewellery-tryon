import React, { useRef, useEffect, useState } from 'react';
import { Camera, RefreshCw, Sparkles, AlertCircle, UploadCloud } from 'lucide-react';
import { calculateJewelleryTransform } from '../utils/faceLandmarks';

export default function TryOnCanvas({
  mode,
  uploadedPhotoUrl,
  selectedItem,
  fineTune,
  onCanvasReady,
  onTriggerUpload
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [faceMesh, setFaceMesh] = useState(null);
  const [landmarks, setLandmarks] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [loadedJewelleryImg, setLoadedJewelleryImg] = useState(null);
  const [loadedSourceImg, setLoadedSourceImg] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Preload Jewellery Image
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

  // 2. Preload Uploaded Photo
  useEffect(() => {
    if (mode === 'webcam') {
      setLoadedSourceImg(null);
      return;
    }
    if (!uploadedPhotoUrl) {
      setLoadedSourceImg(null);
      setIsScanning(false);
      return;
    }
    setIsScanning(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setLoadedSourceImg(img);
      setIsScanning(false);
    };
    img.onerror = () => {
      setErrorMessage('Failed to load image. Please try another file.');
      setIsScanning(false);
    };
    img.src = uploadedPhotoUrl;
  }, [mode, uploadedPhotoUrl]);

  // 3. Initialize MediaPipe Face Mesh
  useEffect(() => {
    let active = true;

    async function initFaceMesh() {
      try {
        if (!window.FaceMesh && !window.facemesh) {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js';
          script.async = true;
          document.head.appendChild(script);
          await new Promise((resolve) => { script.onload = resolve; });
        }

        if (window.FaceMesh && active) {
          const fm = new window.FaceMesh({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
          });
          fm.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
          });
          fm.onResults((results) => {
            if (active && results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
              setLandmarks(results.multiFaceLandmarks[0]);
            } else if (active) {
              setLandmarks(null);
            }
          });
          setFaceMesh(fm);
        }
      } catch (err) {
        console.warn('MediaPipe initialization warning:', err);
      }
    }
    initFaceMesh();
    return () => { active = false; };
  }, []);

  // 4. Webcam Stream Setup
  useEffect(() => {
    let cameraStream = null;
    if (mode === 'webcam') {
      setIsScanning(true);
      setErrorMessage('');
      navigator.mediaDevices?.getUserMedia({ video: { width: 1280, height: 720, facingMode: 'user' } })
        .then((stream) => {
          cameraStream = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current.play();
              setIsScanning(false);
            };
          }
        })
        .catch((err) => {
          console.error('Camera permission error:', err);
          setErrorMessage('Camera permission denied or unavailable. Please upload a photo instead.');
          setIsScanning(false);
        });
    }
    return () => {
      if (cameraStream) cameraStream.getTracks().forEach((t) => t.stop());
    };
  }, [mode]);

  // 5. Send uploaded image to MediaPipe
  useEffect(() => {
    if (faceMesh && loadedSourceImg && mode === 'upload') {
      faceMesh.send({ image: loadedSourceImg }).catch((e) => console.warn(e));
    }
  }, [faceMesh, loadedSourceImg, mode]);

  // 6. Send webcam frames to MediaPipe in loop
  useEffect(() => {
    let frameId;
    const processWebcamFrame = async () => {
      if (mode === 'webcam' && videoRef.current && faceMesh && videoRef.current.readyState === 4) {
        try { await faceMesh.send({ image: videoRef.current }); } catch (e) { /* ignore */ }
      }
      if (mode === 'webcam') frameId = requestAnimationFrame(processWebcamFrame);
    };
    if (mode === 'webcam') frameId = requestAnimationFrame(processWebcamFrame);
    return () => { if (frameId) cancelAnimationFrame(frameId); };
  }, [mode, faceMesh]);

  // 7. Render Canvas Frame with Realistic Wearing Physics
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);
      const isWebcam = (mode === 'webcam');

      // A. Draw Background Video or Static Photo
      if (isWebcam && videoRef.current && videoRef.current.readyState >= 2) {
        ctx.save();
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0, width, height);
        ctx.restore();
      } else if (mode === 'upload' && loadedSourceImg) {
        ctx.drawImage(loadedSourceImg, 0, 0, width, height);
      } else {
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#0F111A');
        grad.addColorStop(1, '#161926');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }

      // B. Draw Realistic Jewellery Pass (Dual-Pass Contact Shadow + Skin Grounding)
      if (selectedItem && loadedJewelleryImg && (loadedSourceImg || isWebcam)) {
        const transform = calculateJewelleryTransform(landmarks, selectedItem.category, width, height, fineTune, isWebcam);

        ctx.save();

        if (transform.type === 'pair') {
          drawJewelleryImageRealistic(ctx, loadedJewelleryImg, transform.left, fineTune?.opacity);
          drawJewelleryImageRealistic(ctx, loadedJewelleryImg, transform.right, fineTune?.opacity);
        } else {
          drawJewelleryImageRealistic(ctx, loadedJewelleryImg, transform, fineTune?.opacity);
        }

        ctx.restore();
      }

      if (onCanvasReady) onCanvasReady(canvas);
      if (isWebcam) animId = requestAnimationFrame(render);
    };

    render();
    return () => { if (animId) cancelAnimationFrame(animId); };
  }, [mode, loadedSourceImg, loadedJewelleryImg, landmarks, selectedItem, fineTune]);

  /**
   * Dual-pass realistic skin contact shadow & sharp jewellery renderer
   */
  const drawJewelleryImageRealistic = (ctx, img, target, userOpacity = 1.0) => {
    if (!target) return;
    const {
      x,
      y,
      scaleX = 1.0,
      scaleY = 1.0,
      angle = 0,
      opacity = 1.0,
      shadowBlur = 18,
      shadowOffsetY = 10,
      contactShadowColor = 'rgba(25, 10, 0, 0.45)'
    } = target;

    const imgWidth = img.naturalWidth || img.width || 200;
    const imgHeight = img.naturalHeight || img.height || 200;
    const renderWidth = imgWidth * scaleX * 0.68;
    const renderHeight = imgHeight * scaleY * 0.68;

    const finalAlpha = opacity * userOpacity;

    // --- PASS 1: Skin Contact Shadow (Grounds the jewellery onto neck/chest skin) ---
    ctx.save();
    ctx.globalAlpha = finalAlpha * 0.65;
    ctx.shadowColor = contactShadowColor;
    ctx.shadowBlur = shadowBlur * 1.2;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = shadowOffsetY;

    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.drawImage(img, -renderWidth / 2, -renderHeight / 2, renderWidth, renderHeight);
    ctx.restore();

    // --- PASS 2: Sharp Jewellery Overlay (Pure Gold Texture & Crisp Details) ---
    ctx.save();
    ctx.globalAlpha = finalAlpha;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = shadowBlur * 0.3;
    ctx.shadowOffsetY = 2;

    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.drawImage(img, -renderWidth / 2, -renderHeight / 2, renderWidth, renderHeight);
    ctx.restore();
  };

  const showUploadPrompt = mode === 'upload' && !uploadedPhotoUrl;

  return (
    <div className="glass-card" style={{
      position: 'relative',
      width: '100%',
      aspectRatio: '4 / 3',
      borderRadius: '16px',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Hidden video element */}
      <video ref={videoRef} style={{ display: 'none' }} playsInline muted />

      {/* Main Canvas */}
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '16px', display: 'block' }}
      />

      {/* Upload Dropzone Prompt */}
      {showUploadPrompt && (
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(15, 17, 26, 0.95)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            backgroundColor: 'rgba(212, 175, 55, 0.1)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#D4AF37'
          }}>
            <UploadCloud style={{ width: '28px', height: '28px' }} />
          </div>
          <div>
            <h3 className="font-heading" style={{ fontSize: '16px', fontWeight: 'bold', color: '#F5F6FA', margin: 0 }}>
              Upload Your Portrait Photo
            </h3>
            <p style={{ fontSize: '12px', color: '#9499AD', margin: '6px 0 0 0', maxWidth: '320px' }}>
              Select any photo (JPG, PNG, WebP) for instant AR virtual try-on.
            </p>
          </div>
          <button onClick={onTriggerUpload} className="btn-gold" style={{ fontSize: '12px', padding: '10px 22px' }}>
            <UploadCloud style={{ width: '16px', height: '16px' }} />
            <span>Select Photo from Device</span>
          </button>
        </div>
      )}

      {/* Top Status Bar */}
      {!showUploadPrompt && (
        <div style={{
          position: 'absolute',
          top: '12px', left: '12px', right: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          pointerEvents: 'none'
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            padding: '5px 12px',
            borderRadius: '9999px',
            border: '1px solid rgba(212, 175, 55, 0.3)'
          }}>
            <Sparkles style={{ width: '12px', height: '12px', color: '#D4AF37' }} />
            <span style={{ fontSize: '10px', fontWeight: '600', color: '#F3E5AB', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              {landmarks ? '3D AI Tracking Active' : (isScanning ? 'Scanning Face...' : 'Marne Virtual Studio')}
            </span>
          </div>

          {selectedItem && (
            <div style={{
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(8px)',
              padding: '5px 12px',
              borderRadius: '9999px',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              fontSize: '11px',
              fontWeight: '500',
              color: '#E2E8F0'
            }}>
              <span style={{ color: '#D4AF37', fontWeight: 'bold' }}>{selectedItem.name}</span>
            </div>
          )}
        </div>
      )}

      {/* Loading Spinner */}
      {isScanning && (
        <div style={{
          position: 'absolute', inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px'
        }}>
          <RefreshCw style={{ width: '28px', height: '28px', color: '#D4AF37', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '12px', fontWeight: '500', color: '#FDE68A' }}>Calculating 3D Face Mesh...</p>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div style={{
          position: 'absolute', bottom: '12px', left: '12px', right: '12px',
          backgroundColor: 'rgba(80, 10, 20, 0.9)',
          border: '1px solid rgba(239, 68, 68, 0.5)',
          color: '#FECACA',
          padding: '10px 14px',
          borderRadius: '12px',
          fontSize: '12px',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <AlertCircle style={{ width: '16px', height: '16px', color: '#F87171', flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
