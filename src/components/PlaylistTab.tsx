import React from 'react';
import { PlaylistItem, SlideItem } from '../types/presentation';
import { 
  Play, 
  Eye, 
  Trash2, 
  RotateCcw, 
  BookOpen,
  ChevronRight,
  ListOrdered,
  Calendar
} from 'lucide-react';
import { defaultPlaylist } from '../services/storageService';

interface PlaylistTabProps {
  playlist: PlaylistItem[];
  currentSlideId?: string;
  onUpdatePlaylist: (playlist: PlaylistItem[]) => void;
  onSendToLive: (slide: SlideItem) => void;
  onSendToPreview: (slide: SlideItem) => void;
}

export const PlaylistTab: React.FC<PlaylistTabProps> = ({
  playlist,
  currentSlideId,
  onUpdatePlaylist,
  onSendToLive,
  onSendToPreview
}) => {
  const handleDeleteItem = (id: string) => {
    onUpdatePlaylist(playlist.filter(p => p.id !== id));
  };

  const handleResetDefault = () => {
    if (confirm('Reset to standard Sunday Order of Service?')) {
      onUpdatePlaylist(defaultPlaylist);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header Bar */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            Sunday Order of Service
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Service Rundown • Tap any slide to project on TV
          </p>
        </div>

        <button
          onClick={handleResetDefault}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition"
        >
          <RotateCcw className="w-3.5 h-3.5 text-red-500" />
          <span>Reset</span>
        </button>
      </div>

      {/* Playlist Items in Asor Card Style */}
      <div className="space-y-3">
        {playlist.map((item, index) => (
          <div
            key={item.id}
            className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm"
          >
            {/* Top row */}
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 font-bold text-[11px] flex items-center justify-center font-mono">
                  {index + 1}
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {item.title}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full asor-badge-red text-[11px] font-bold">
                  {item.slides.length} Slide{item.slides.length !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-red-600 transition"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Slide Chips / Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 mt-3">
              {item.slides.map((slide, sIdx) => {
                const isLive = currentSlideId === slide.id;
                return (
                  <div
                    key={slide.id || sIdx}
                    onClick={() => onSendToLive(slide)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      isLive
                        ? 'bg-red-50 dark:bg-red-950/40 border-red-500/80 shadow-md ring-1 ring-red-500/50'
                        : 'bg-slate-50/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-red-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                          {slide.sectionLabel || `Slide ${sIdx + 1}`}
                        </span>
                        {isLive && (
                          <span className="px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-black uppercase tracking-wider animate-pulse">
                            On TV
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-800 dark:text-slate-200 line-clamp-2 font-medium leading-relaxed">
                        {slide.content}
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSendToPreview(slide);
                        }}
                        className="px-2 py-0.5 rounded-lg border border-slate-300 dark:border-slate-600 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        title="Preview"
                      >
                        <Eye className="w-3 h-3 text-red-500 inline mr-1" />
                        Preview
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSendToLive(slide);
                        }}
                        className="px-2.5 py-0.5 rounded-lg bg-red-600 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm"
                        title="Project Live"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        Live
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
