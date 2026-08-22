import React, { useState } from 'react';
import { X, UploadCloud, Sparkles, Check, RefreshCw, AlertCircle, Wand2, Sliders } from 'lucide-react';
import { processJewelleryImage } from '../utils/imageProcessor';

export default function AdminUploaderModal({ isOpen, onClose, onAddJewellery }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('earrings');
  const [tag, setTag] = useState('New Arrival');
  const [autoRemoveBg, setAutoRemoveBg] = useState(true);
  const [tolerance, setTolerance] = useState(35); // 10 to 80 sensitivity

  const [previewUrl, setPreviewUrl] = useState('');
  const [rawFile, setRawFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleImageFile = async (file, shouldRemoveBg = autoRemoveBg, tol = tolerance) => {
    if (!file) return;
    setRawFile(file);
    setErrorMessage('');
    setIsProcessing(true);

    try {
      const result = await processJewelleryImage(file, {
        removeBg: shouldRemoveBg,
        tolerance: tol
      });

      if (!result.success) {
        setErrorMessage(result.error || 'Failed to process image file.');
        setIsProcessing(false);
        return;
      }

      setPreviewUrl(result.processedUrl);
      setIsProcessing(false);
    } catch (err) {
      console.error('File processing error:', err);
      setErrorMessage('Failed to process image.');
      setIsProcessing(false);
    }
  };

  const handleBgToggle = (e) => {
    const checked = e.target.checked;
    setAutoRemoveBg(checked);
    if (rawFile) {
      handleImageFile(rawFile, checked, tolerance);
    }
  };

  const handleToleranceChange = (e) => {
    const tol = parseInt(e.target.value, 10);
    setTolerance(tol);
    if (rawFile && autoRemoveBg) {
      handleImageFile(rawFile, true, tol);
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
      description: 'Marne Jewellery custom upload design.',
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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-lg p-6 rounded-2xl border border-yellow-500/40 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-100 bg-gray-900/60 p-1.5 rounded-full"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-bold font-heading text-gold-gradient">
            Add Marne Jewellery Design
          </h2>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          Upload any photo (PNG, JPG, WebP). Adjust sensitivity slider to remove any studio background cleanly!
        </p>

        {isSuccess ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center border border-amber-500">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h3 className="text-base font-bold text-gray-100">Design Added to Catalog!</h3>
            <p className="text-xs text-gray-400">Ready for Marne Jewellery virtual try-on.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Image Dropzone */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
                <span>Select Jewellery Image</span>
                <label className="flex items-center gap-1.5 font-normal text-amber-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRemoveBg}
                    onChange={handleBgToggle}
                    className="accent-amber-500 rounded cursor-pointer"
                  />
                  <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Remove Background</span>
                </label>
              </div>

              <div className="relative border-2 border-dashed border-gray-800 hover:border-amber-500/50 rounded-xl p-4 bg-gray-900/40 flex flex-col items-center justify-center text-center gap-2 transition-colors cursor-pointer min-h-[130px]">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageFile(e.target.files?.[0])}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  required={!previewUrl}
                />

                {isProcessing ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-3">
                    <RefreshCw className="w-7 h-7 text-amber-400 animate-spin" />
                    <span className="text-xs font-semibold text-amber-200">Removing background...</span>
                  </div>
                ) : previewUrl ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative p-3 bg-black/80 rounded-xl border border-amber-500/30">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-28 object-contain filter drop-shadow-md"
                      />
                    </div>
                    <span className="text-[11px] text-amber-300 font-medium">Click or drag to replace image</span>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="w-8 h-8 text-amber-400/80" />
                    <span className="text-xs text-gray-300 font-medium">Click to choose image file (PNG, JPG, WebP)</span>
                  </>
                )}
              </div>

              {/* Background Sensitivity Slider */}
              {autoRemoveBg && previewUrl && (
                <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-800 flex flex-col gap-1.5 mt-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-gray-300">
                    <span className="flex items-center gap-1 text-amber-300">
                      <Sliders className="w-3.5 h-3.5 text-amber-400" /> Background Removal Sensitivity
                    </span>
                    <span className="text-amber-400 font-mono">{tolerance}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    step="2"
                    value={tolerance}
                    onChange={handleToleranceChange}
                    className="w-full accent-amber-500"
                  />
                  <span className="text-[10px] text-gray-400">Slide to erase subtle background shadows or mannequin fabrics</span>
                </div>
              )}

              {errorMessage && (
                <div className="bg-red-950/80 border border-red-500/50 text-red-200 px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 mt-1">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            {/* Item Name */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-300">Design Name</label>
              <input
                type="text"
                placeholder="e.g. Marne Royal Jhumka Set"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-gray-900 text-xs text-gray-200 px-3.5 py-2.5 rounded-xl border border-gray-800 focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Category & Tag */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-300">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-gray-900 text-xs text-gray-200 px-3 py-2.5 rounded-xl border border-gray-800 focus:border-amber-500 focus:outline-none"
                >
                  <option value="earrings">Earrings (Jhumkas)</option>
                  <option value="necklace">Necklace & Choker</option>
                  <option value="maang_tikka">Maang Tikka</option>
                  <option value="nose_ring">Nose Ring (Nath)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-300">Badge Tag</label>
                <input
                  type="text"
                  placeholder="e.g. Kundan / Bridal"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="bg-gray-900 text-xs text-gray-200 px-3 py-2.5 rounded-xl border border-gray-800 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing || !previewUrl}
                className="btn-gold text-xs disabled:opacity-50"
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
