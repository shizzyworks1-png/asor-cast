import React, { useEffect, useState, useRef } from 'react';
import { DisplayState } from '../types/presentation';
import { castService } from '../services/castService';
import { storageService } from '../services/storageService';
import { Maximize2, Minimize2, Tv, Sparkles } from 'lucide-react';

interface DisplayScreenProps {
  forcedRoomCode?: string;
  isEmbeddedPreview?: boolean;
  state?: DisplayState;
}

export const DisplayScreen: React.FC<DisplayScreenProps> = ({
  forcedRoomCode,
  isEmbeddedPreview = false,
  state: propState
}) => {
  const [internalState, setInternalState] = useState<DisplayState>(() => storageService.getDisplayState());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(!isEmbeddedPreview);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);

  // Use passed prop state if available, otherwise internal synced state
  const displayState = propState || internalState;

  useEffect(() => {
    if (forcedRoomCode) {
      castService.setRoomCode(forcedRoomCode);
    }

    // Tell any active controller that receiver is connected
    castService.sendReceiverReady();

    // Subscribe to state changes from controller or storage
    const unsubscribe = castService.subscribe((newState) => {
      setInternalState(newState);
    });

    // Request current state from any active controller
    castService.requestCurrentState();

    return () => {
      unsubscribe();
    };
  }, [forcedRoomCode]);

  // Mouse activity timer for hiding UI buttons in full screen
  const handleMouseMove = () => {
    if (isEmbeddedPreview) return;
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const {
    currentSlide,
    isBlackout,
    isTextCleared,
    isLogoActive,
    background,
    overlayOpacity,
    fontSize,
    alignment,
    fontFamily,
    textShadow,
    isLowerThird
  } = displayState;

  // Font family class
  const fontClass =
    fontFamily === 'cinzel'
      ? 'font-cinzel tracking-wider'
      : fontFamily === 'serif'
      ? 'font-scripture'
      : 'font-sans font-medium';

  // Responsive font sizes for big TV displays
  const fontSizeClasses = {
    sm: isEmbeddedPreview ? 'text-xs leading-normal' : 'text-xl md:text-2xl lg:text-3xl leading-relaxed',
    md: isEmbeddedPreview ? 'text-sm leading-normal' : 'text-2xl md:text-3xl lg:text-4xl leading-relaxed',
    lg: isEmbeddedPreview ? 'text-base leading-snug' : 'text-3xl md:text-4xl lg:text-5xl leading-relaxed',
    xl: isEmbeddedPreview ? 'text-lg leading-snug' : 'text-4xl md:text-5xl lg:text-6xl leading-snug',
    '2xl': isEmbeddedPreview ? 'text-xl leading-tight' : 'text-5xl md:text-6xl lg:text-7xl leading-snug',
    '3xl': isEmbeddedPreview ? 'text-2xl leading-tight' : 'text-6xl md:text-7xl lg:text-8xl leading-tight'
  }[fontSize || 'xl'];

  // Text alignment
  const alignClass = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end'
  }[alignment || 'center'];

  const isCleanImage = currentSlide?.type === 'image';
  const cleanImageUrl = currentSlide?.mediaUrl || (background?.type === 'image' ? background.value : undefined);

  // Background styling with explicit longhand properties to avoid React shorthand conflicts
  const bgStyle: React.CSSProperties = {
    backgroundColor: background?.type === 'solid' ? background.value : '#000000',
    backgroundImage:
      !isCleanImage && background?.type === 'image'
        ? `url(${background.value})`
        : !isCleanImage && background?.type === 'gradient'
        ? background.value
        : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative w-full h-full overflow-hidden select-none bg-black flex flex-col justify-center items-center ${
        isEmbeddedPreview ? 'rounded-lg' : ''
      }`}
      style={bgStyle}
    >
      {/* Background Dim / Overlay (Disabled during clean image display) */}
      <div
        className="absolute inset-0 transition-opacity duration-500 pointer-events-none"
        style={{
          backgroundColor: '#000000',
          opacity: isBlackout ? 1 : isCleanImage ? 0 : overlayOpacity ?? 0.35
        }}
      />

      {/* Blackout State Screen */}
      <div
        className={`absolute inset-0 bg-black z-30 transition-opacity duration-300 pointer-events-none ${
          isBlackout ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Main Content Presentation */}
      <div
        className={`relative z-10 w-full h-full flex flex-col transition-all duration-300 ${
          isCleanImage
            ? 'justify-center items-center p-0'
            : isLowerThird
            ? 'justify-end pb-8 sm:pb-14 px-6 sm:px-16'
            : 'justify-center p-6 sm:p-14 lg:p-20'
        } ${alignClass} ${
          isTextCleared || isBlackout ? 'opacity-0 scale-98' : 'opacity-100 scale-100'
        }`}
      >
        {isCleanImage && cleanImageUrl ? (
          /* Pure Clean Image Display - Nothing on top of it */
          <div className="w-full h-full flex items-center justify-center p-2 sm:p-4">
            <img
              src={cleanImageUrl}
              alt={currentSlide?.title || 'Church Media'}
              className="max-h-full max-w-full object-contain shadow-2xl"
            />
          </div>
        ) : isLogoActive ? (
          /* Church Logo / Welcome Screen */
          <div className="flex flex-col items-center justify-center text-center max-w-4xl animate-fade-in">
            <div className="relative mb-6">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-amber-500/10 border-2 border-amber-400/40 flex items-center justify-center shadow-2xl backdrop-blur-md">
                <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 text-amber-400" />
              </div>
            </div>
            <h1 className="font-cinzel text-4xl sm:text-6xl md:text-7xl font-bold tracking-widest text-amber-300 text-projector-shadow mb-3">
              ASOR CAST
            </h1>
            <p className="text-xl sm:text-3xl text-slate-200 font-medium tracking-wider text-projector-shadow">
              Welcome to the House of the Lord
            </p>
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/60 border border-slate-700/60 text-xs sm:text-sm text-slate-300">
              <span>Worship Service in Session</span>
            </div>
          </div>
        ) : currentSlide ? (
          /* Slide / Scripture / Hymn Content */
          <div
            className={`w-full flex flex-col ${alignClass} ${
              isLowerThird
                ? 'max-w-6xl bg-slate-950/85 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl'
                : 'max-w-6xl'
            }`}
          >
            {/* Section / Category Badge */}
            {(currentSlide.sectionLabel || currentSlide.subtitle) && (
              <div className="mb-3 sm:mb-5 flex items-center gap-2">
                <span className="px-3.5 py-1 rounded-full text-xs sm:text-sm font-bold tracking-widest uppercase bg-amber-500/25 border border-amber-400/50 text-amber-300 text-subtle-shadow backdrop-blur-sm">
                  {currentSlide.sectionLabel || currentSlide.subtitle}
                </span>
              </div>
            )}

            {/* Primary Text / Verse / Hymn Lyrics */}
            <div
              className={`w-full text-white ${fontClass} ${fontSizeClasses} ${
                textShadow ? 'text-projector-shadow' : ''
              } whitespace-pre-line tracking-normal transition-all duration-200 font-semibold`}
            >
              {currentSlide.content}
            </div>

            {/* Reference Badge (e.g. John 3:16 KJV or Hymn Title) */}
            {currentSlide.reference && (
              <div
                className={`mt-4 sm:mt-8 flex items-center ${
                  alignment === 'left'
                    ? 'justify-start'
                    : alignment === 'right'
                    ? 'justify-end'
                    : 'justify-center'
                } w-full`}
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-slate-950/60 border border-slate-700/50 text-amber-300 font-semibold text-sm sm:text-lg md:text-xl backdrop-blur-md text-subtle-shadow">
                  <span>{currentSlide.reference}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Idle standby state */
          <div className="text-center text-slate-400">
            <Tv className="w-16 h-16 mx-auto mb-3 opacity-40 text-amber-400" />
            <p className="font-cinzel text-2xl text-slate-300 font-bold tracking-wider">ASOR CAST</p>
            <p className="text-sm text-slate-400 mt-1">Ready to Present • Select content on your phone</p>
          </div>
        )}
      </div>

      {/* Floating Display Controls (Only when hovering / on non-embedded TV mode) */}
      {!isEmbeddedPreview && showControls && (
        <div className="absolute top-4 right-4 z-40 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-xl p-1.5 shadow-xl transition-opacity duration-300">
          <div className="flex items-center gap-2 px-3 py-1 text-xs text-slate-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Room: {displayState.roomCode || 'ASOR'}</span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      )}

      {/* Mini Asor Cast Watermark (Church-appropriate, subtle) */}
      {!isEmbeddedPreview && (
        <div className="absolute bottom-3 right-4 z-20 pointer-events-none opacity-20 hover:opacity-80 transition-opacity">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-300">
            Asor Cast
          </span>
        </div>
      )}
    </div>
  );
};
