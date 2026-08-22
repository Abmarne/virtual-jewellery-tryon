import React, { useRef, useEffect, useState } from 'react';
import { Camera, RefreshCw, Sparkles, AlertCircle, UploadCloud } from 'lucide-react';
import { calculateJewelleryTransform } from '../utils/faceLandmarks';

export default function TryOnCanvas({
  mode,               // 'webcam' | 'upload'
  uploadedPhotoUrl,   // string data URL
  selectedItem,       // { id, name, category, imageUrl, ... }
  fineTune,           // { scale, offsetY, tilt, opacity }
  onCanvasReady,      // callback passing canvas ref for snapshot export
  onTriggerUpload     // callback to trigger file input
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
        console.warn('MediaPipe initialization warning:', err);
      }
    }

    initFaceMesh();

    return () => {
      active = false;
    };
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
          setErrorMessage('Camera permission denied or camera unavailable. Please upload a photo instead.');
          setIsScanning(false);
        });
    }

    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [mode]);

  // 5. Send frame data to MediaPipe when processing static image
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
        try {
          await faceMesh.send({ image: videoRef.current });
        } catch (e) {
          // ignore
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

  // 7. Render Canvas Frame
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

      // A. Draw Background Source
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

      // B. Draw Jewellery Overlay with 3D perspective & dynamic skin contact shadow
      if (selectedItem && loadedJewelleryImg && (loadedSourceImg || isWebcam)) {
        const transform = calculateJewelleryTransform(
          landmarks,
          selectedItem.category,
          width,
          height,
          fineTune,
          isWebcam
        );

        ctx.save();
        ctx.globalAlpha = fineTune?.opacity ?? 1.0;

        if (transform.type === 'pair') {
          drawJewelleryImageRealistic(ctx, loadedJewelleryImg, transform.left);
          drawJewelleryImageRealistic(ctx, loadedJewelleryImg, transform.right);
        } else {
          drawJewelleryImageRealistic(ctx, loadedJewelleryImg, transform);
        }

        ctx.restore();
      }

      if (onCanvasReady) {
        onCanvasReady(canvas);
      }

      if (isWebcam) {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [mode, loadedSourceImg, loadedJewelleryImg, landmarks, selectedItem, fineTune]);

  // Realistic renderer with 3D scaling and soft contact shadows on skin
  const drawJewelleryImageRealistic = (ctx, img, target) => {
    if (!target) return;
    const {
      x,
      y,
      scaleX = 1.0,
      scaleY = 1.0,
      angle = 0,
      shadowBlur = 12,
      shadowOffsetY = 6
    } = target;

    const imgWidth = img.naturalWidth || img.width || 200;
    const imgHeight = img.naturalHeight || img.height || 200;

    const renderWidth = imgWidth * scaleX * 0.7;
    const renderHeight = imgHeight * scaleY * 0.7;

    ctx.save();

    // Natural Skin Contact Shadow to eliminate floating appearance
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = shadowBlur;
    ctx.shadowOffsetY = shadowOffsetY;

    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.drawImage(img, -renderWidth / 2, -renderHeight / 2, renderWidth, renderHeight);

    ctx.restore();
  };

  const showUploadPrompt = mode === 'upload' && !uploadedPhotoUrl;

  return (
    <div className="relative w-full aspect-[4/3] max-h-[560px] rounded-2xl overflow-hidden glass-card flex items-center justify-center border border-gray-800 shadow-2xl">
      <video
        ref={videoRef}
        className="hidden"
        playsInline
        muted
      />

      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-full object-contain"
      />

      {/* Upload Dropzone Prompt */}
      {showUploadPrompt && (
        <div className="absolute inset-0 bg-[#0F111A]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg">
            <UploadCloud className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-100 font-heading">
              Upload Your Portrait Photo
            </h3>
            <p className="text-xs text-gray-400 max-w-sm mt-1">
              Select any photo (JPG, PNG, WebP) for instant AR virtual try-on.
            </p>
          </div>
          <button
            onClick={onTriggerUpload}
            className="btn-gold text-xs px-5 py-2.5 rounded-full flex items-center gap-2 mt-1"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Select Photo from Device</span>
          </button>
        </div>
      )}

      {/* Top Status Bar */}
      {!showUploadPrompt && (
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-yellow-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="text-[11px] font-semibold text-amber-200 tracking-wider uppercase">
              {landmarks ? '3D AI Tracking Active' : (isScanning ? 'Scanning Face...' : 'Marne Virtual Studio')}
            </span>
          </div>

          {selectedItem && (
            <div className="bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-yellow-500/30 text-xs font-medium text-gray-200">
              <span className="text-amber-400 font-bold">{selectedItem.name}</span>
            </div>
          )}
        </div>
      )}

      {/* Loading Spinner */}
      {isScanning && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-7 h-7 text-amber-400 animate-spin" />
          <p className="text-xs font-medium text-amber-100">Calculating 3D Face Mesh...</p>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="absolute bottom-4 left-4 right-4 bg-red-950/90 border border-red-500/50 text-red-200 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
