import React, { useRef, useEffect, useState } from 'react';
import { Camera, RefreshCw, Sparkles, AlertCircle, Eye, SlidersHorizontal } from 'lucide-react';
import { calculateJewelleryTransform } from '../utils/faceLandmarks';

export default function TryOnCanvas({
  mode,               // 'webcam' | 'upload' | 'avatar'
  selectedModel,      // { imageUrl, ... }
  uploadedPhotoUrl,   // string data URL
  selectedItem,       // { id, name, category, imageUrl, ... }
  fineTune,           // { scale, offsetY, tilt, opacity }
  onCanvasReady       // callback passing canvas ref for snapshot export
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [faceMesh, setFaceMesh] = useState(null);
  const [landmarks, setLandmarks] = useState(null);
  const [isScanning, setIsScanning] = useState(true);
  const [loadedJewelleryImg, setLoadedJewelleryImg] = useState(null);
  const [loadedSourceImg, setLoadedSourceImg] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Preload Jewellery Image whenever selectedItem changes
  useEffect(() => {
    if (!selectedItem || !selectedItem.imageUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setLoadedJewelleryImg(img);
    img.src = selectedItem.imageUrl;
  }, [selectedItem]);

  // 2. Preload Static Image (Uploaded Photo or Model Avatar)
  useEffect(() => {
    if (mode === 'webcam') {
      setLoadedSourceImg(null);
      return;
    }

    const srcUrl = mode === 'upload' ? uploadedPhotoUrl : selectedModel?.imageUrl;
    if (!srcUrl) return;

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
    img.src = srcUrl;
  }, [mode, uploadedPhotoUrl, selectedModel]);

  // 3. Initialize MediaPipe Face Mesh
  useEffect(() => {
    let active = true;

    async function initFaceMesh() {
      try {
        if (!window.FaceMesh && !window.facemesh) {
          // Dynamic import of MediaPipe FaceMesh from CDN if needed, or fallback
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js';
          script.async = true;
          document.head.appendChild(script);

          await new Promise((resolve) => {
            script.onload = resolve;
          });
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
        console.warn('MediaPipe initialization warning (using fallback tracking):', err);
      }
    }

    initFaceMesh();

    return () => {
      active = false;
    };
  }, []);

  // 4. Webcam Stream Setup
  useEffect(() => {
    let animationFrameId;
    let cameraStream = null;

    if (mode === 'webcam') {
      setIsScanning(true);
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
          console.error('Camera permission denied or camera unvailable:', err);
          setErrorMessage('Camera access denied or unavailable. Switching to Avatar mode.');
          setIsScanning(false);
        });
    }

    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [mode]);

  // 5. Send frame data to MediaPipe when processing static image
  useEffect(() => {
    if (faceMesh && loadedSourceImg && (mode === 'upload' || mode === 'avatar')) {
      faceMesh.send({ image: loadedSourceImg }).catch((e) => console.warn(e));
    }
  }, [faceMesh, loadedSourceImg, mode]);

  // 6. Send webcam frames to MediaPipe in loop
  useEffect(() => {
    let frameId;
    const processWebcamFrame = async () => {
      if (mode === 'webcam' && videoRef.current && faceMesh && videoRef.current.readyState === 4) {
        try {
          await faceMesh.send({ image: videoRef.current });
        } catch (e) {
          // ignore stream frame drops
        }
      }
      if (mode === 'webcam') {
        frameId = requestAnimationFrame(processWebcamFrame);
      }
    };

    if (mode === 'webcam') {
      frameId = requestAnimationFrame(processWebcamFrame);
    }

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [mode, faceMesh]);

  // 7. Render Canvas Frame (Background Video/Photo + Overlay Jewellery)
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

      // A. Draw Background Source
      if (mode === 'webcam' && videoRef.current && videoRef.current.readyState >= 2) {
        ctx.save();
        // Mirror webcam for natural mirror feel
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0, width, height);
        ctx.restore();
      } else if ((mode === 'upload' || mode === 'avatar') && loadedSourceImg) {
        ctx.drawImage(loadedSourceImg, 0, 0, width, height);
      } else {
        // Placeholder background canvas styling
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#12141D');
        grad.addColorStop(1, '#1A1D2A');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = 'rgba(212, 175, 55, 0.4)';
        ctx.font = '16px Outfit';
        ctx.textAlign = 'center';
        ctx.fillText('Select a model portrait or upload your photo to try on jewellery', width / 2, height / 2);
      }

      // B. Draw Jewellery Overlay if item is selected & image is loaded
      if (selectedItem && loadedJewelleryImg) {
        const transform = calculateJewelleryTransform(
          landmarks,
          selectedItem.category,
          width,
          height,
          fineTune
        );

        ctx.save();
        ctx.globalAlpha = fineTune?.opacity ?? 1.0;

        if (transform.type === 'pair') {
          // Render Left Earring
          drawJewelleryImage(ctx, loadedJewelleryImg, transform.left);
          // Render Right Earring
          drawJewelleryImage(ctx, loadedJewelleryImg, transform.right);
        } else {
          // Render Single Item (Necklace, Maang Tikka, Nose Ring)
          drawJewelleryImage(ctx, loadedJewelleryImg, transform);
        }

        ctx.restore();
      }

      // Provide ready canvas ref to parent
      if (onCanvasReady) {
        onCanvasReady(canvas);
      }

      if (mode === 'webcam') {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [mode, loadedSourceImg, loadedJewelleryImg, landmarks, selectedItem, fineTune]);

  // Helper helper to draw rotated, scaled jewellery image
  const drawJewelleryImage = (ctx, img, target) => {
    if (!target) return;
    const { x, y, scale = 1.0, angle = 0 } = target;

    const imgWidth = img.width || 200;
    const imgHeight = img.height || 200;

    const renderWidth = imgWidth * scale * 0.7;
    const renderHeight = imgHeight * scale * 0.7;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.drawImage(img, -renderWidth / 2, -renderHeight / 2, renderWidth, renderHeight);
    ctx.restore();
  };

  return (
    <div className="relative w-full aspect-[4/3] max-h-[640px] rounded-2xl overflow-hidden glass-card flex items-center justify-center border border-yellow-500/30 shadow-2xl">
      {/* Hidden Video element for webcam capture */}
      <video
        ref={videoRef}
        className="hidden"
        playsInline
        muted
      />

      {/* Main Composite Canvas */}
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-full object-contain"
      />

      {/* Top Status Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-yellow-500/30">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="text-xs font-semibold text-amber-200 tracking-wide uppercase">
            {landmarks ? 'AI Face Tracked' : (isScanning ? 'AI Scanning...' : 'Virtual Try-On Active')}
          </span>
        </div>

        {selectedItem && (
          <div className="bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-yellow-500/30 text-xs font-medium text-gray-200 flex items-center gap-1.5">
            <span className="text-amber-400 font-bold">{selectedItem.name}</span>
            <span className="text-gray-400">({selectedItem.category.replace('_', ' ')})</span>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {isScanning && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
          <p className="text-sm font-medium text-amber-100">Initializing AI Vision Mesh...</p>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="absolute bottom-4 left-4 right-4 bg-red-900/80 backdrop-blur-md border border-red-500/50 text-red-200 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
