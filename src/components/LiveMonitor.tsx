import React from 'react';
import { DisplayState, SlideItem } from '../types/presentation';
import { DisplayScreen } from './DisplayScreen';
import { 
  Play, 
  ChevronRight, 
  ChevronLeft, 
  Tv, 
  Radio, 
  Eye, 
  Layers
} from 'lucide-react';

interface LiveMonitorProps {
  displayState: DisplayState;
  previewSlide: SlideItem | null;
  onGoLive: () => void;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export const LiveMonitor: React.FC<LiveMonitorProps> = ({
  displayState,
  previewSlide,
  onGoLive,
  onPrevSlide,
  onNextSlide,
  hasPrev,
  hasNext
}) => {
  const { isBlackout, isTextCleared, isLogoActive, currentSlide } = displayState;

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-3 sm:p-4 transition-colors">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center">
        {/* Live Program Monitor (On TV) */}
        <div className="md:col-span-5 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isBlackout ? 'bg-rose-400' : isTextCleared ? 'bg-amber-400' : 'bg-red-500'
                }`} />
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isBlackout ? 'bg-rose-500' : isTextCleared ? 'bg-amber-500' : 'bg-red-600'
                }`} />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-red-600" />
                Live on TV (Program)
              </span>
            </div>

            {/* Status pills */}
            <div className="flex items-center gap-1">
              {isBlackout && (
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 border border-rose-300">
                  Blackout
                </span>
              )}
              {isTextCleared && !isBlackout && (
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border border-amber-300">
                  Text Cleared
                </span>
              )}
              {isLogoActive && !isBlackout && (
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-300">
                  Logo Active
                </span>
              )}
            </div>
          </div>

          {/* Program Viewport (16:9 Aspect Ratio) */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-2 border-red-500/40 shadow-md bg-black">
            <DisplayScreen state={displayState} isEmbeddedPreview={true} />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 truncate px-1">
            <span className="truncate font-medium">
              {currentSlide?.reference || currentSlide?.title || 'No active slide'}
            </span>
            {currentSlide?.sectionLabel && (
              <span className="text-red-600 dark:text-red-400 font-bold">{currentSlide.sectionLabel}</span>
            )}
          </div>
        </div>

        {/* Center Take & Controls (Asor Red Play Trigger) */}
        <div className="md:col-span-2 flex flex-row md:flex-col items-center justify-center gap-2 py-1">
          {/* TAKE / GO LIVE BUTTON */}
          <button
            onClick={onGoLive}
            className="flex-1 md:w-full py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-600/25 active:scale-95 transition"
            title="Push Preview to TV Screen"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Go Live</span>
          </button>

          {/* Steppers */}
          <div className="flex items-center gap-1.5 w-auto md:w-full">
            <button
              onClick={onPrevSlide}
              disabled={!hasPrev}
              className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-300 flex items-center justify-center transition"
              title="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onNextSlide}
              disabled={!hasNext}
              className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-300 flex items-center justify-center transition"
              title="Next Slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Queued Next Monitor (Preview) */}
        <div className="md:col-span-5 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-red-500" />
              Queued Next (Preview)
            </span>
            {previewSlide ? (
              <button
                onClick={onGoLive}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold shadow-sm active:scale-95 transition"
                title="Send queued preview to TV screen"
              >
                <span>Go Live Next</span>
                <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            ) : (
              <span className="text-[10px] text-slate-400">Ready to Take</span>
            )}
          </div>

          {/* Preview Viewport */}
          <div 
            onClick={previewSlide ? onGoLive : undefined}
            className={`group relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900 flex flex-col justify-center items-center p-4 text-center transition-all ${
              previewSlide ? 'cursor-pointer hover:border-red-500/80 shadow-md' : ''
            }`}
          >
            {previewSlide ? (
              <>
                <div className="w-full flex flex-col items-center justify-center">
                  {previewSlide.sectionLabel && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-600/20 text-red-400 border border-red-500/30 mb-1.5">
                      {previewSlide.sectionLabel}
                    </span>
                  )}
                  <p className="text-xs sm:text-sm font-semibold text-white line-clamp-3 leading-snug">
                    {previewSlide.content}
                  </p>
                  {previewSlide.reference && (
                    <span className="text-[10px] text-red-400 font-medium mt-1.5">
                      {previewSlide.reference}
                    </span>
                  )}
                </div>

                {/* Sleek Floating Overlay Trigger */}
                <div className="absolute inset-x-0 bottom-2 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/90 backdrop-blur-md text-white font-bold text-xs shadow-lg shadow-black/40">
                    <Play className="w-3 h-3 fill-current" />
                    <span>Tap to Go Live</span>
                  </span>
                </div>
              </>
            ) : (
              <div className="text-slate-500 flex flex-col items-center gap-1">
                <Layers className="w-6 h-6 opacity-40 text-slate-400" />
                <span className="text-xs">No slide queued</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 truncate px-1">
            <span className="truncate">
              {previewSlide?.reference || previewSlide?.title || 'Select content below'}
            </span>
            {previewSlide && (
              <button
                onClick={onGoLive}
                className="text-red-600 dark:text-red-400 font-bold hover:underline flex items-center gap-0.5"
              >
                <span>Take Live</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
