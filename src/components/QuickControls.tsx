import React from 'react';
import { DisplayState } from '../types/presentation';
import { 
  EyeOff, 
  Sparkles, 
  Type, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Sliders, 
  Square,
  LayoutTemplate
} from 'lucide-react';

interface QuickControlsProps {
  displayState: DisplayState;
  onUpdateState: (partial: Partial<DisplayState>) => void;
}

export const QuickControls: React.FC<QuickControlsProps> = ({
  displayState,
  onUpdateState
}) => {
  const {
    isBlackout,
    isTextCleared,
    isLogoActive,
    fontSize,
    alignment,
    fontFamily,
    overlayOpacity,
    isLowerThird
  } = displayState;

  return (
    <div className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800/80 px-3 sm:px-6 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        {/* Instant Stage Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Blackout Button */}
          <button
            onClick={() => onUpdateState({ isBlackout: !isBlackout })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 ${
              isBlackout
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
            }`}
            title="Blackout TV screen"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Blackout</span>
          </button>

          {/* Clear Text Button */}
          <button
            onClick={() => onUpdateState({ isTextCleared: !isTextCleared })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 ${
              isTextCleared
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
            }`}
            title="Clear text overlay"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Clear Text</span>
          </button>

          {/* Church Logo Button */}
          <button
            onClick={() => onUpdateState({ isLogoActive: !isLogoActive })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 ${
              isLogoActive
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
            }`}
            title="Display Church Logo / Welcome"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Logo</span>
          </button>

          {/* Lower Third */}
          <button
            onClick={() => onUpdateState({ isLowerThird: !isLowerThird })}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              isLowerThird
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
            }`}
            title="Toggle Lower-Third"
          >
            <LayoutTemplate className="w-3.5 h-3.5" />
            <span>Lower Third</span>
          </button>
        </div>

        {/* Presentation Styling Controls */}
        <div className="flex items-center gap-2">
          {/* Alignment */}
          <div className="flex items-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-0.5">
            <button
              onClick={() => onUpdateState({ alignment: 'left' })}
              className={`p-1.5 rounded-lg text-xs transition ${
                alignment === 'left' ? 'bg-red-600 text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Align Left"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onUpdateState({ alignment: 'center' })}
              className={`p-1.5 rounded-lg text-xs transition ${
                alignment === 'center' ? 'bg-red-600 text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Align Center"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onUpdateState({ alignment: 'right' })}
              className={`p-1.5 rounded-lg text-xs transition ${
                alignment === 'right' ? 'bg-red-600 text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Align Right"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Font Size Selector */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1">
            <Type className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={fontSize}
              onChange={(e) => onUpdateState({ fontSize: e.target.value as any })}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
              <option value="xl">Extra Large</option>
              <option value="2xl">Auditorium</option>
              <option value="3xl">Giant</option>
            </select>
          </div>

          {/* Font Family */}
          <select
            value={fontFamily}
            onChange={(e) => onUpdateState({ fontFamily: e.target.value as any })}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer hidden md:block"
          >
            <option value="sans">Modern Sans</option>
            <option value="serif">Scripture Serif</option>
            <option value="cinzel">Majestic Cinzel</option>
          </select>

          {/* Dim Slider */}
          <div className="hidden lg:flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400">
            <Sliders className="w-3 h-3 text-red-500" />
            <span>Dim: {Math.round((overlayOpacity ?? 0.35) * 100)}%</span>
            <input
              type="range"
              min="0"
              max="0.85"
              step="0.05"
              value={overlayOpacity ?? 0.35}
              onChange={(e) => onUpdateState({ overlayOpacity: parseFloat(e.target.value) })}
              className="w-16 accent-red-600 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
