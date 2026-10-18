import React, { useState } from 'react';
import { BackgroundItem } from '../types/presentation';
import { 
  Upload, 
  Check, 
  Trash2, 
  SunDim,
  Play,
  Image as ImageIcon,
  Tv
} from 'lucide-react';

interface BackgroundsTabProps {
  backgrounds: BackgroundItem[];
  activeBackground: BackgroundItem;
  overlayOpacity: number;
  onSelectBackground: (bg: BackgroundItem) => void;
  onProjectImageAlone: (bg: BackgroundItem) => void;
  onUpdateBackgrounds: (bgs: BackgroundItem[]) => void;
  onUpdateOverlayOpacity: (opacity: number) => void;
}

export const BackgroundsTab: React.FC<BackgroundsTabProps> = ({
  backgrounds,
  activeBackground,
  overlayOpacity,
  onSelectBackground,
  onProjectImageAlone,
  onUpdateBackgrounds,
  onUpdateOverlayOpacity
}) => {
  const [filter, setFilter] = useState<string>('all');

  const filtered = backgrounds.filter((bg) => {
    if (filter === 'all') return true;
    return bg.category === filter;
  });

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>, projectAlone: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const newBg: BackgroundItem = {
        id: `bg-custom-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, '').slice(0, 25),
        type: 'image',
        value: base64,
        category: 'custom'
      };
      const updated = [newBg, ...backgrounds];
      onUpdateBackgrounds(updated);
      if (projectAlone) {
        onProjectImageAlone(newBg);
      } else {
        onSelectBackground(newBg);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteCustomBg = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = backgrounds.filter(b => b.id !== id);
    onUpdateBackgrounds(updated);
    if (activeBackground.id === id && updated.length > 0) {
      onSelectBackground(updated[0]);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Top Controls Card */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Dimmer Slider */}
        <div className="flex items-center gap-3">
          <SunDim className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Text Contrast Dimmer: {Math.round(overlayOpacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="0.85"
              step="0.05"
              value={overlayOpacity}
              onChange={(e) => onUpdateOverlayOpacity(parseFloat(e.target.value))}
              className="w-44 sm:w-56 accent-red-600 cursor-pointer mt-1"
            />
          </div>
        </div>

        {/* Upload Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Upload & Project Image Alone (No text / pure image) */}
          <label className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95 transition">
            <Tv className="w-4 h-4" />
            <span>Project Image Alone</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleUploadImage(e, true)}
              className="hidden"
            />
          </label>

          {/* Upload as Background wallpaper */}
          <label className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm cursor-pointer shadow-md shadow-red-600/20 active:scale-95 transition">
            <Upload className="w-4 h-4" />
            <span>Upload Background</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleUploadImage(e, false)}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Categories Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'all', label: 'All Media' },
          { id: 'worship', label: 'Worship Themes' },
          { id: 'ethereal', label: 'Ethereal / Sky' },
          { id: 'stained-glass', label: 'Stained Glass' },
          { id: 'minimal', label: 'Solid Black & Navy' },
          { id: 'custom', label: 'Uploaded Custom' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition shadow-sm ${
              filter === cat.id
                ? 'bg-red-600 text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Background Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {filtered.map((bg) => {
          const isSelected = activeBackground.id === bg.id;
          const bgStyle: React.CSSProperties = {
            backgroundColor: bg.type === 'solid' ? bg.value : '#000000',
            backgroundImage:
              bg.type === 'image'
                ? `url(${bg.value})`
                : bg.type === 'gradient'
                ? bg.value
                : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          };

          return (
            <div
              key={bg.id}
              onClick={() => onSelectBackground(bg)}
              className={`group relative aspect-video rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-200 shadow-sm ${
                isSelected
                  ? 'border-red-600 ring-2 ring-red-600/40 scale-[1.02]'
                  : 'border-slate-200 dark:border-slate-800 hover:border-red-400'
              }`}
              style={bgStyle}
            >
              {/* Dim layer preview */}
              <div
                className="absolute inset-0 bg-black transition-opacity"
                style={{ opacity: overlayOpacity }}
              />

              {/* Top Controls on Card */}
              <div className="absolute top-2 inset-x-2 z-10 flex items-center justify-between pointer-events-none">
                {/* Delete Custom Icon */}
                {bg.category === 'custom' ? (
                  <button
                    onClick={(e) => handleDeleteCustomBg(bg.id, e)}
                    className="p-1.5 rounded-lg bg-black/60 hover:bg-red-600 text-white transition pointer-events-auto opacity-80 hover:opacity-100"
                    title="Remove Custom Background"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                ) : <div />}

                {/* Selected Badge */}
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg font-bold pointer-events-auto">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* Quick Actions on Hover / Mobile */}
              <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity p-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onProjectImageAlone(bg);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-lg flex items-center gap-1 active:scale-95 transition"
                  title="Display this image completely clean on TV (No text or overlay)"
                >
                  <Tv className="w-3 h-3" />
                  <span>Project Alone</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectBackground(bg);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold shadow-lg flex items-center gap-1 active:scale-95 transition"
                  title="Use as text background"
                >
                  <Check className="w-3 h-3" />
                  <span>Set BG</span>
                </button>
              </div>

              {/* Background Name Label & Quick Project Button */}
              <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-between gap-1">
                <div className="truncate flex-1">
                  <p className="text-[11px] font-bold text-white truncate text-subtle-shadow">
                    {bg.name}
                  </p>
                  <span className="text-[9px] uppercase font-bold text-red-400 tracking-wider">
                    {bg.category}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onProjectImageAlone(bg);
                  }}
                  className="sm:hidden px-2 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-0.5 shadow flex-shrink-0"
                  title="Project alone"
                >
                  <Tv className="w-3 h-3" />
                  <span>Alone</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
