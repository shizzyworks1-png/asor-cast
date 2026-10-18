import React from 'react';
import { PWAInstallButton } from './PWAInstallButton';
import { 
  Moon, 
  Sun, 
  Cast, 
  ExternalLink,
  BookOpen
} from 'lucide-react';

interface HeaderProps {
  onOpenConnectModal: () => void;
  onOpenDisplayWindow: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  isCastingConfirmed: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenConnectModal,
  onOpenDisplayWindow,
  isDark,
  onToggleTheme,
  isCastingConfirmed
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
        {/* Brand: Asor Red Square Logo & App Name */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-md shadow-red-500/20 flex items-center justify-center flex-shrink-0 text-white relative">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-[10px] font-black text-red-600 -mt-0.5">✝</span>
            </div>
          </div>

          <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Asor Cast
          </h1>
        </div>

        {/* Header Icons & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* PWA Install */}
          <PWAInstallButton />

          {/* Theme Toggle (Moon / Sun) */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {/* External Display Window */}
          <button
            onClick={onOpenDisplayWindow}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition"
            title="Launch TV Display Window"
          >
            <ExternalLink className="w-3.5 h-3.5 text-red-500" />
            <span>TV Window</span>
          </button>

          {/* Cast Button in top right: Simple Red "Cast" / Simple Green "Casting" */}
          <button
            onClick={onOpenConnectModal}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl font-bold text-xs sm:text-sm active:scale-95 transition-all shadow-md ${
              isCastingConfirmed
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25 ring-2 ring-emerald-400/40'
                : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20'
            }`}
            title={isCastingConfirmed ? 'Connected to TV - Casting is active' : 'Click to Cast to TV'}
          >
            {isCastingConfirmed ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-200" />
                </span>
                <Cast className="w-4 h-4 stroke-[2.5]" />
                <span>Casting</span>
              </>
            ) : (
              <>
                <Cast className="w-4 h-4 stroke-[2.5]" />
                <span>Cast</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
