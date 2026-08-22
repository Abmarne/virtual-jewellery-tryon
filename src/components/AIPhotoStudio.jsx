import React, { useRef, useEffect, useState } from 'react';
import { Camera, RefreshCw, Sparkles, AlertCircle, UploadCloud, Eye, Sliders } from 'lucide-react';
import { calculateJewelleryTransform } from '../utils/faceLandmarks';
import { sampleSkinEnvironment, drawWarpedJewelleryWithRealism } from '../utils/aiRealismEngine';

export default function AIPhotoStudio({
  mode,
  uploadedPhotoUrl,
  selectedItem,
  fineTune,
  onCanvasReady,
  onTriggerUpload
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const beforeCanvasRef = useRef(null);

  const [faceMesh, setFaceMesh] = useState(null);
  const [landmarks, setLandmarks] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [loadedJewelleryImg, setLoadedJewelleryImg] = useState(null);
  const [loadedSourceImg, setLoadedSourceImg] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Before/After Split Slider State (0 to 100%)
  const [splitPosition, setSplitPosition] = useState(100); // 100 = full AI try-on, 50 = half split
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);

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

  // 2. Preload Source Photo
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
      setErrorMessage('Failed to load image. Please upload a valid JPG, PNG, or WebP photo.');
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
          setErrorMessage('Camera unavailable. Please upload a portrait photo instead.');
          setIsScanning(false);
        });
    }
    return () => {
      if (cameraStream) cameraStream.getTracks().forEach((t) => t.stop());
    };
  }, [mode]);

  // 5. Send image frame to MediaPipe
  useEffect(() => {
    if (faceMesh && loadedSourceImg && mode === 'upload') {
      faceMesh.send({ image: loadedSourceImg }).catch((e) => console.warn(e));
    }
  }, [faceMesh, loadedSourceImg, mode]);

  // 6. Webcam loop
  useEffect(() => {
    let frameId;
    const processFrame = async () => {
      if (mode === 'webcam' && videoRef.current && faceMesh && videoRef.current.readyState === 4) {
        try { await faceMesh.send({ image: videoRef.current }); } catch (e) {}
      }
      if (mode === 'webcam') frameId = requestAnimationFrame(processFrame);
    };
    if (mode === 'webcam') frameId = requestAnimationFrame(processFrame);
    return () => { if (frameId) cancelAnimationFrame(frameId); };
  }, [mode, faceMesh]);

  // 7. Render AI Photorealistic Synthesis
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

      // A. Draw Source Photo / Video
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

      // B. AI Photorealistic Synthesis Pass
      if (selectedItem && loadedJewelleryImg && (loadedSourceImg || isWebcam)) {
        const transform = calculateJewelleryTransform(landmarks, selectedItem.category, width, height, fineTune, isWebcam);

        // Sample room lighting & skin tone from neck region
        const neckX = transform.type === 'pair' ? transform.left.x : transform.x;
        const neckY = transform.type === 'pair' ? transform.left.y : transform.y;
        const skinEnv = sampleSkinEnvironment(ctx, neckX, neckY);

        if (transform.type === 'pair') {
          drawWarpedJewelleryWithRealism(ctx, loadedJewelleryImg, transform.left, fineTune, skinEnv);
          drawWarpedJewelleryWithRealism(ctx, loadedJewelleryImg, transform.right, fineTune, skinEnv);
        } else {
          drawWarpedJewelleryWithRealism(ctx, loadedJewelleryImg, transform, fineTune, skinEnv);
        }
      }

      // C. Render Before Split Overlay if slider < 100
      if (splitPosition < 99) {
        const splitX = (splitPosition / 100) * width;
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, splitX, height);
        ctx.clip();

        // Draw original background photo without jewellery on left side
        if (isWebcam && videoRef.current && videoRef.current.readyState >= 2) {
          ctx.translate(width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(videoRef.current, 0, 0, width, height);
        } else if (mode === 'upload' && loadedSourceImg) {
          ctx.drawImage(loadedSourceImg, 0, 0, width, height);
        }

        ctx.restore();

        // Draw Split Divider Line
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(splitX, 0);
        ctx.lineTo(splitX, height);
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Divider handle
        ctx.fillStyle = '#D4AF37';
        ctx.beginPath();
        ctx.arc(splitX, height / 2, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('◄►', splitX, height / 2);
        ctx.restore();
      }

      if (onCanvasReady) onCanvasReady(canvas);
      if (isWebcam) animId = requestAnimationFrame(render);
    };

    render();
    return () => { if (animId) cancelAnimationFrame(animId); };
  }, [mode, loadedSourceImg, loadedJewelleryImg, landmarks, selectedItem, fineTune, splitPosition]);

  const showUploadPrompt = mode === 'upload' && !uploadedPhotoUrl;

  const handleMouseMove = (e) => {
    if (!isDraggingSplit || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const pct = Math.round((x / rect.width) * 100);
    setSplitPosition(pct);
  };

  return (
    <div className="glass-card" style={{
      position: 'relative',
      width: '100%',
      aspectRatio: '4 / 3',
      borderRadius: '16px',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      userSelect: 'none'
    }}
    onMouseMove={handleMouseMove}
    onMouseUp={() => setIsDraggingSplit(false)}
    onMouseLeave={() => setIsDraggingSplit(false)}
    >
      {/* Hidden video element */}
      <video ref={videoRef} style={{ display: 'none' }} playsInline muted />

      {/* Main Canvas */}
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onMouseDown={() => setIsDraggingSplit(true)}
        style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '16px', display: 'block', cursor: splitPosition < 100 ? 'ew-resize' : 'default' }}
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
              Upload Portrait Photo for AI Try-On
            </h3>
            <p style={{ fontSize: '12px', color: '#9499AD', margin: '6px 0 0 0', maxWidth: '340px' }}>
              Upload any photo (JPG, PNG, WebP). AI warps jewellery to neck curve and matches room lighting!
            </p>
          </div>
          <button onClick={onTriggerUpload} className="btn-gold" style={{ fontSize: '12px', padding: '10px 22px' }}>
            <UploadCloud style={{ width: '16px', height: '16px' }} />
            <span>Select Photo from Device</span>
          </button>
        </div>
      )}

      {/* Top Bar Status & Before/After Toggle */}
      {!showUploadPrompt && (
        <div style={{
          position: 'absolute',
          top: '12px', left: '12px', right: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          pointerEvents: 'none'
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            padding: '5px 12px',
            borderRadius: '9999px',
            border: '1px solid rgba(212, 175, 55, 0.3)'
          }}>
            <Sparkles style={{ width: '12px', height: '12px', color: '#D4AF37' }} />
            <span style={{ fontSize: '10px', fontWeight: '600', color: '#F3E5AB', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              {landmarks ? 'AI 3D Realism Active' : (isScanning ? 'Detecting Neck Geometry...' : 'Marne AI Studio')}
            </span>
          </div>

          <div style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setSplitPosition(splitPosition === 50 ? 100 : 50)}
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(8px)',
                padding: '5px 12px',
                borderRadius: '9999px',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                fontSize: '11px',
                fontWeight: '600',
                color: '#F3E5AB',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Eye style={{ width: '12px', height: '12px', color: '#D4AF37' }} />
              <span>{splitPosition < 100 ? 'Show Full Try-On' : 'Before / After View'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Loading Spinner */}
      {isScanning && (
        <div style={{
          position: 'absolute', inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px'
        }}>
          <RefreshCw style={{ width: '28px', height: '28px', color: '#D4AF37', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '12px', fontWeight: '500', color: '#FDE68A' }}>Analyzing Neck Geometry & Room Lighting...</p>
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
