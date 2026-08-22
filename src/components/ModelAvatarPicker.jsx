import React, { useRef, useState } from 'react';
import { User, Upload, Check, Image as ImageIcon, AlertCircle, RefreshCw } from 'lucide-react';
import { SAMPLE_MODELS } from '../utils/sampleData';
import { analyzeImageQuality } from '../utils/imageProcessor';

export default function ModelAvatarPicker({
  mode,
  selectedModel,
  onSelectModel,
  onUploadPhoto,
  uploadedPhotoUrl
}) {
  const fileInputRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage('');
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const srcUrl = event.target.result;
      const img = new Image();
      img.onload = () => {
        const qualityCheck = analyzeImageQuality(img);

        if (!qualityCheck.isOk) {
          setErrorMessage(qualityCheck.reason || 'Image quality is too low or blurry. Please upload a clearer portrait photo.');
          setIsProcessing(false);
          return;
        }

        onUploadPhoto(srcUrl);
        setIsProcessing(false);
      };
      img.onerror = () => {
        setErrorMessage('Failed to read photo. Please upload a valid JPG or PNG image.');
        setIsProcessing(false);
      };
      img.src = srcUrl;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
          <User className="w-4 h-4 text-amber-400" />
          Choose Model Avatar or Upload Photo
        </h3>

        {/* Upload Custom Photo Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all disabled:opacity-50"
        >
          {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" /> : <Upload className="w-3.5 h-3.5" />}
          <span>{isProcessing ? 'Processing...' : 'Upload Your Photo'}</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {SAMPLE_MODELS.map((model) => {
          const isSelected = mode === 'avatar' && selectedModel?.id === model.id;
          return (
            <div
              key={model.id}
              onClick={() => {
                setErrorMessage('');
                onSelectModel(model);
              }}
              className={`group relative rounded-xl overflow-hidden cursor-pointer border transition-all duration-200 aspect-[4/3] flex flex-col justify-end p-2.5 ${
                isSelected
                  ? 'border-amber-400 shadow-[0_0_15px_rgba(212,175,55,0.4)] ring-2 ring-amber-400/50'
                  : 'border-gray-800 hover:border-gray-600 opacity-80 hover:opacity-100'
              }`}
            >
              {/* Avatar Background Image */}
              <img
                src={model.imageUrl}
                alt={model.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

              {/* Selection Check Circle */}
              {isSelected && (
                <div className="absolute top-2 right-2 bg-amber-500 text-black p-1 rounded-full">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}

              {/* Label */}
              <div className="relative z-10">
                <span className="text-[11px] font-semibold text-amber-200 block truncate">
                  {model.name}
                </span>
                <span className="text-[9px] text-gray-400 capitalize">
                  {model.type}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Error Toast for Low Quality Photos */}
      {errorMessage && (
        <div className="bg-red-950/80 border border-red-500/50 text-red-200 px-3.5 py-2 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Uploaded Custom Photo Indicator */}
      {mode === 'upload' && uploadedPhotoUrl && !errorMessage && (
        <div className="flex items-center gap-3 bg-amber-950/30 border border-amber-500/40 p-2.5 rounded-xl">
          <img
            src={uploadedPhotoUrl}
            alt="Uploaded portrait"
            className="w-10 h-10 rounded-lg object-cover border border-amber-400/50"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-amber-200 flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
              Custom Photo Active
            </p>
            <p className="text-[10px] text-gray-400">AI face landmark scanner active on your photo</p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-[11px] text-amber-300 underline font-medium"
          >
            Change
          </button>
        </div>
      )}
    </div>
  );
}
