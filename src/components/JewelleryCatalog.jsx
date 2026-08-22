import React, { useState } from 'react';
import { Gem, Sparkles, PlusCircle, CheckCircle2, Search } from 'lucide-react';

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
    <div className="flex flex-col gap-5 w-full">
      {/* Top Header & Search / Add New Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-heading text-gold-gradient flex items-center gap-2">
            <Gem className="w-5 h-5 text-amber-400" />
            Exquisite Jewellery Collection
          </h2>
          <p className="text-xs text-gray-400">Select any piece to instantly try it on your live video or photo</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search design..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-900/80 text-xs text-gray-200 pl-9 pr-3 py-2 rounded-full border border-gray-800 focus:border-amber-500 focus:outline-none w-40 sm:w-48 transition-all"
            />
          </div>

          {/* Upload Custom Jewellery Button */}
          <button
            onClick={onOpenUploadModal}
            className="btn-gold text-xs px-3.5 py-2 rounded-full flex items-center gap-1.5 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Custom Design</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
              activeCategory === cat.id
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-[0_0_15px_rgba(212,175,55,0.25)]'
                : 'bg-gray-900/50 text-gray-400 border-gray-800 hover:text-gray-200 hover:border-gray-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 max-h-[380px] overflow-y-auto pr-1">
        {filteredCatalog.map((item) => {
          const isSelected = selectedItem?.id === item.id;
          return (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className={`group relative rounded-xl p-3 cursor-pointer transition-all duration-300 flex flex-col justify-between border ${
                isSelected
                  ? 'bg-amber-950/40 border-amber-400 shadow-[0_0_20px_rgba(212,175,55,0.3)] transform -translate-y-1'
                  : 'bg-gray-900/40 border-gray-800/80 hover:border-amber-500/40 hover:bg-gray-900/80'
              }`}
            >
              {/* Active Badge */}
              {isSelected && (
                <div className="absolute top-2 right-2 text-amber-400 z-10">
                  <CheckCircle2 className="w-4 h-4 fill-amber-400 text-black" />
                </div>
              )}

              {/* Tag Badge */}
              {item.tag && (
                <div className="absolute top-2 left-2 z-10">
                  <span className="badge-gold text-[10px] px-2 py-0.5">
                    {item.tag}
                  </span>
                </div>
              )}

              {/* Preview Thumbnail */}
              <div className="w-full h-32 flex items-center justify-center p-2 rounded-lg bg-black/40 border border-gray-800/50 group-hover:border-amber-500/30 transition-colors my-2">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="max-h-full max-w-full object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Details */}
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

        {filteredCatalog.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 text-xs flex flex-col items-center gap-2">
            <Sparkles className="w-6 h-6 text-gray-600" />
            <span>No jewellery designs found in this category.</span>
          </div>
        )}
      </div>
    </div>
  );
}
