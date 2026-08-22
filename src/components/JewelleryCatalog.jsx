import React, { useState } from 'react';
import { Sparkles, PlusCircle, CheckCircle2, Search, Plus } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Designs' },
  { id: 'earrings', label: 'Earrings (Jhumkas)' },
  { id: 'necklace', label: 'Necklaces & Chokers' },
  { id: 'maang_tikka', label: 'Maang Tikkas' },
  { id: 'nose_ring', label: 'Nose Rings (Nath)' }
];

export default function JewelleryCatalog({
  catalog,
  selectedItem,
  onSelectItem,
  onOpenUploadModal
}) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCatalog = catalog.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.tag?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Top Header & Search / Add New Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold font-heading text-gold-gradient flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Jewellery Catalog
          </h2>
          <p className="text-xs text-gray-400">Select any piece to try it on live video or photo</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Box */}
          {catalog.length > 0 && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search design..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-900 text-xs text-gray-200 pl-8 pr-3 py-1.5 rounded-full border border-gray-800 focus:border-amber-500 focus:outline-none w-36 sm:w-44 transition-all"
              />
            </div>
          )}

          {/* Upload Custom Jewellery Button */}
          <button
            onClick={onOpenUploadModal}
            className="btn-gold text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Jewellery Design</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      {catalog.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
                activeCategory === cat.id
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-sm'
                  : 'bg-gray-900/50 text-gray-400 border-gray-800 hover:text-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Product Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-h-[360px] overflow-y-auto pr-1">
        {/* Upload Card always available first */}
        <div
          onClick={onOpenUploadModal}
          className="group rounded-xl p-4 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-800 hover:border-amber-500/60 bg-gray-900/30 hover:bg-gray-900/60 min-h-[160px] gap-2"
        >
          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-xs font-bold text-amber-300">Add New Design</span>
          <span className="text-[10px] text-gray-500">Upload photo of your jewellery</span>
        </div>

        {/* Existing Jewellery Items */}
        {filteredCatalog.map((item) => {
          const isSelected = selectedItem?.id === item.id;
          return (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className={`group relative rounded-xl p-3 cursor-pointer transition-all duration-200 flex flex-col justify-between border ${
                isSelected
                  ? 'bg-amber-950/40 border-amber-400 shadow-[0_0_15px_rgba(212,175,55,0.25)]'
                  : 'bg-gray-900/40 border-gray-800 hover:border-amber-500/40 hover:bg-gray-900/80'
              }`}
            >
              {/* Active Checkmark */}
              {isSelected && (
                <div className="absolute top-2 right-2 text-amber-400 z-10">
                  <CheckCircle2 className="w-4 h-4 fill-amber-400 text-black" />
                </div>
              )}

              {/* Tag Badge */}
              {item.tag && (
                <div className="absolute top-2 left-2 z-10">
                  <span className="badge-gold text-[9px] px-2 py-0.5">
                    {item.tag}
                  </span>
                </div>
              )}

              {/* Image Preview */}
              <div className="w-full h-28 flex items-center justify-center p-2 rounded-lg bg-black/40 border border-gray-800/50 group-hover:border-amber-500/30 transition-colors my-1">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="max-h-full max-w-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-200"
                />
              </div>

              {/* Title */}
              <div className="mt-1">
                <h3 className="text-xs font-semibold text-gray-200 line-clamp-1 group-hover:text-amber-300 transition-colors">
                  {item.name}
                </h3>
                <p className="text-[10px] text-gray-400 capitalize mt-0.5">
                  {item.category.replace('_', ' ')}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
