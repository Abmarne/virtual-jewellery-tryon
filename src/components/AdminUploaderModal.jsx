import React, { useState } from 'react';
import { X, UploadCloud, Sparkles, Check, Image as ImageIcon } from 'lucide-react';

export default function AdminUploaderModal({ isOpen, onClose, onAddJewellery }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('earrings');
  const [tag, setTag] = useState('New Arrival');
  const [description, setDescription] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      setPreviewUrl(evt.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !previewUrl) return;

    const newItem = {
      id: `custom-${Date.now()}`,
      name,
      category,
      tag: tag || 'Custom',
      description: description || 'Custom uploaded imitation jewellery design.',
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
      setDescription('');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-lg p-6 rounded-2xl border border-yellow-500/30 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-100 bg-gray-900/60 p-1.5 rounded-full"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-bold font-heading text-gold-gradient">
            Add Custom Jewellery Design
          </h2>
        </div>
        <p className="text-xs text-gray-400 mb-5">
          Upload a transparent PNG image of your jewellery design to try it instantly on customers in real-time.
        </p>

        {isSuccess ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center border border-amber-500">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h3 className="text-base font-bold text-gray-100">Design Added to Catalog!</h3>
            <p className="text-xs text-gray-400">It is now ready for virtual try-on.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Image Dropzone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-300">
                Jewellery Image (Transparent PNG recommended)
              </label>
              <div className="relative border-2 border-dashed border-gray-800 hover:border-amber-500/50 rounded-xl p-4 bg-gray-900/40 flex flex-col items-center justify-center text-center gap-2 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFile}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  required={!previewUrl}
                />

                {previewUrl ? (
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-28 object-contain filter drop-shadow-md"
                    />
                    <span className="text-[11px] text-amber-300 font-medium">Click or drag to replace image</span>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="w-8 h-8 text-amber-400/80" />
                    <span className="text-xs text-gray-300 font-medium">Click to select PNG image</span>
                    <span className="text-[10px] text-gray-500">Supports PNG, WebP, JPG</span>
                  </>
                )}
              </div>
            </div>

            {/* Item Name */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-300">Design Name</label>
              <input
                type="text"
                placeholder="e.g. Royal Ruby Jhumka Set"
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

            {/* Submit Button */}
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
                className="btn-gold text-xs"
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
