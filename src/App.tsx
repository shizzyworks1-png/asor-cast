import React, { useState, useEffect, useRef } from 'react';
import { 
  DisplayState, 
  SlideItem, 
  HymnSong, 
  BackgroundItem, 
  PlaylistItem,
  ServicePreset 
} from './types/presentation';
import { storageService } from './services/storageService';
import { castService } from './services/castService';
import { Header } from './components/Header';
import { LiveMonitor } from './components/LiveMonitor';
import { QuickControls } from './components/QuickControls';
import { BibleTab } from './components/BibleTab';
import { HymnsTab } from './components/HymnsTab';
import { BackgroundsTab } from './components/BackgroundsTab';
import { PlaylistTab } from './components/PlaylistTab';
import { ConnectModal } from './components/ConnectModal';
import { SettingsModal } from './components/SettingsModal';
import { DisplayScreen } from './components/DisplayScreen';
import { OfflineIndicator } from './components/OfflineIndicator';
import { 
  BookOpen, 
  Music, 
  Image as ImageIcon, 
  ListOrdered,
  Settings 
} from 'lucide-react';

export default function App() {
  // Check if current URL is in TV / Receiver Display Mode
  const [isDisplayMode, setIsDisplayMode] = useState<boolean>(false);
  const [roomCode, setRoomCode] = useState<string>(() => storageService.getRoomCode());
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('asor_cast_theme');
      if (saved) return saved === 'dark';
    }
    return false; // Default to clean Asor light mode matching screenshots 2, 4, 5, 6
  });

  // Controller states
  const [displayState, setDisplayState] = useState<DisplayState>(() => storageService.getDisplayState());
  const displayStateRef = useRef<DisplayState>(displayState);
  displayStateRef.current = displayState;

  const [previewSlide, setPreviewSlide] = useState<SlideItem | null>(() => displayState.nextSlide);
  const [hymns, setHymns] = useState<HymnSong[]>(() => storageService.getHymns());
  const [backgrounds, setBackgrounds] = useState<BackgroundItem[]>(() => storageService.getBackgrounds());
  const [playlist, setPlaylist] = useState<PlaylistItem[]>(() => storageService.getPlaylist());
  const [activeTab, setActiveTab] = useState<'bible' | 'hymns' | 'playlist' | 'backgrounds'>('bible');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isReceiverConnected, setIsReceiverConnected] = useState<boolean>(() => castService.isConnected());

  // Connection is confirmed when receiver/cast session is active or content is live on TV
  const isCastingConfirmed = isReceiverConnected || (!displayState.isBlackout && !displayState.isTextCleared && displayState.currentSlide !== null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get('mode');
      const displayParam = params.get('display');
      const room = params.get('room');

      if (room) {
        setRoomCode(room.toUpperCase());
        castService.setRoomCode(room.toUpperCase());
      }

      if (mode === 'display' || displayParam === 'true') {
        setIsDisplayMode(true);
      }
    }
  }, []);

  // Update theme class on HTML element
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('asor_cast_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('asor_cast_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  // Listen to remote changes or updates
  useEffect(() => {
    const unsub = castService.subscribe((newState) => {
      displayStateRef.current = newState;
      setDisplayState(newState);
    });
    const unsubConn = castService.subscribeConnection((conn) => {
      setIsReceiverConnected(conn);
    });
    return () => {
      unsub();
      unsubConn();
    };
  }, []);

  // If in dedicated TV Receiver Mode, render purely the projector screen!
  if (isDisplayMode) {
    return <DisplayScreen forcedRoomCode={roomCode} />;
  }

  // Handle updating Display State and broadcasting to TV with ref sync to prevent race conditions
  const handleUpdateDisplayState = (partial: Partial<DisplayState>) => {
    const nextState: DisplayState = {
      ...displayStateRef.current,
      ...partial,
      updatedAt: Date.now()
    };
    displayStateRef.current = nextState;
    setDisplayState(nextState);
    castService.broadcastState(nextState);
  };

  // Atomic live slide and queued preview push (instantly updates both program and preview without stale state clobbering)
  const handleSendLiveAndPreview = (liveSlide: SlideItem, nextPreview?: SlideItem) => {
    if (nextPreview) {
      setPreviewSlide(nextPreview);
    }
    const nextState: DisplayState = {
      ...displayStateRef.current,
      currentSlide: liveSlide,
      ...(nextPreview ? { nextSlide: nextPreview } : {}),
      isBlackout: false,
      isTextCleared: false,
      isLogoActive: false,
      updatedAt: Date.now()
    };
    displayStateRef.current = nextState;
    setDisplayState(nextState);
    castService.broadcastState(nextState);
  };

  // Project an image completely alone on TV (no scripture, no lyrics, 0% overlay dimming)
  const handleProjectImageAlone = (bg: BackgroundItem) => {
    const imageSlide: SlideItem = {
      id: `image-slide-${bg.id}-${Date.now()}`,
      type: 'image',
      title: bg.name,
      content: '', // clean, no text
      reference: '',
      mediaUrl: bg.type === 'image' ? bg.value : undefined
    };
    handleUpdateDisplayState({
      background: bg,
      currentSlide: imageSlide,
      isBlackout: false,
      isTextCleared: false,
      isLogoActive: false,
      overlayOpacity: 0
    });
  };

  // Push preview to program / Go Live
  const handleGoLive = () => {
    if (!previewSlide) return;
    handleUpdateDisplayState({
      currentSlide: previewSlide,
      isBlackout: false,
      isTextCleared: false,
      isLogoActive: false
    });
  };

  // Direct Live send from any tab
  const handleSendToLive = (slide: SlideItem) => {
    handleUpdateDisplayState({
      currentSlide: slide,
      isBlackout: false,
      isTextCleared: false,
      isLogoActive: false
    });
  };

  // Send to Preview queue
  const handleSendToPreview = (slide: SlideItem) => {
    setPreviewSlide(slide);
    handleUpdateDisplayState({
      nextSlide: slide
    });
  };

  // Add slide to Sunday setlist
  const handleAddToPlaylist = (slide: SlideItem) => {
    const newItem: PlaylistItem = {
      id: `pl-item-${Date.now()}`,
      title: slide.reference || slide.title,
      type: slide.type,
      slides: [slide]
    };
    const updated = [...playlist, newItem];
    setPlaylist(updated);
    storageService.savePlaylist(updated);
  };

  // Add multiple slides to Sunday setlist (e.g. all hymn verses)
  const handleAddMultipleToPlaylist = (slides: SlideItem[], title: string) => {
    const newItem: PlaylistItem = {
      id: `pl-item-${Date.now()}`,
      title,
      type: slides[0]?.type || 'hymn',
      slides
    };
    const updated = [...playlist, newItem];
    setPlaylist(updated);
    storageService.savePlaylist(updated);
  };

  // Next / Previous slide steppers across current playlist
  const allPlaylistSlides: SlideItem[] = playlist.flatMap(p => p.slides);
  const currentIdx = allPlaylistSlides.findIndex(s => s.id === displayState.currentSlide?.id);

  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx >= 0 && currentIdx < allPlaylistSlides.length - 1;

  const handlePrevSlide = () => {
    if (hasPrev) {
      handleSendToLive(allPlaylistSlides[currentIdx - 1]);
    }
  };

  const handleNextSlide = () => {
    if (hasNext) {
      handleSendToLive(allPlaylistSlides[currentIdx + 1]);
    }
  };

  const handleSelectBackground = (bg: BackgroundItem) => {
    handleUpdateDisplayState({ background: bg });
  };

  const handleUpdateBackgrounds = (bgs: BackgroundItem[]) => {
    setBackgrounds(bgs);
    storageService.saveBackgrounds(bgs);
  };

  const handleUpdateHymns = (updated: HymnSong[]) => {
    setHymns(updated);
    storageService.saveHymns(updated);
  };

  const handleUpdatePlaylist = (updated: PlaylistItem[]) => {
    setPlaylist(updated);
    storageService.savePlaylist(updated);
  };

  const handleRoomCodeChange = (newCode: string) => {
    setRoomCode(newCode);
    castService.setRoomCode(newCode);
    handleUpdateDisplayState({ roomCode: newCode });
  };

  const handleApplyPreset = (preset: ServicePreset) => {
    setIsDark(preset.theme === 'dark');
    const matchedBg = backgrounds.find(b => b.id === preset.backgroundId) || backgrounds[0];
    handleUpdateDisplayState({
      background: matchedBg,
      overlayOpacity: preset.overlayOpacity,
      fontSize: preset.fontSize,
      alignment: preset.alignment,
      fontFamily: preset.fontFamily
    });
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-red-500 selection:text-white pb-20 sm:pb-8 transition-colors">
      {/* Top Header with Asor Red Emblem */}
      <Header
        onOpenConnectModal={() => setIsConnectModalOpen(true)}
        onOpenDisplayWindow={() => castService.openDisplayWindow()}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        isCastingConfirmed={isCastingConfirmed}
      />

      {/* Program vs Preview Cockpit Live Monitor */}
      <LiveMonitor
        displayState={displayState}
        previewSlide={previewSlide}
        onGoLive={handleGoLive}
        onPrevSlide={handlePrevSlide}
        onNextSlide={handleNextSlide}
        hasPrev={hasPrev}
        hasNext={hasNext}
      />

      {/* Quick Stage Controls (Blackout, Clear Text, Logo, Font, Alignment, Contrast Dim) */}
      <QuickControls
        displayState={displayState}
        onUpdateState={handleUpdateDisplayState}
      />

      {/* Main Tabbed Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6">
        {/* Desktop Tab Selector (Asor Pill Style) */}
        <div className="hidden sm:flex items-center gap-1.5 p-1.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
          <button
            onClick={() => setActiveTab('bible')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition ${
              activeTab === 'bible'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>KJV Bible Reader</span>
          </button>

          <button
            onClick={() => setActiveTab('hymns')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition ${
              activeTab === 'hymns'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Hymns & Lyrics ({hymns.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('playlist')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition ${
              activeTab === 'playlist'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>Order of Service</span>
          </button>

          <button
            onClick={() => setActiveTab('backgrounds')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition ${
              activeTab === 'backgrounds'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Worship Media</span>
          </button>

          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
            title="Service Presets & Bulk Hymns Settings"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>

        {/* Active Tab Screen */}
        {activeTab === 'bible' && (
          <BibleTab
            onSendToLive={handleSendToLive}
            onSendToPreview={handleSendToPreview}
            onSendLiveAndPreview={handleSendLiveAndPreview}
            onAddToPlaylist={handleAddToPlaylist}
          />
        )}

        {activeTab === 'hymns' && (
          <HymnsTab
            hymns={hymns}
            onUpdateHymns={handleUpdateHymns}
            onSendToLive={handleSendToLive}
            onSendToPreview={handleSendToPreview}
            onAddToPlaylist={handleAddToPlaylist}
            onAddMultipleToPlaylist={handleAddMultipleToPlaylist}
          />
        )}

        {activeTab === 'playlist' && (
          <PlaylistTab
            playlist={playlist}
            currentSlideId={displayState.currentSlide?.id}
            onUpdatePlaylist={handleUpdatePlaylist}
            onSendToLive={handleSendToLive}
            onSendToPreview={handleSendToPreview}
          />
        )}

        {activeTab === 'backgrounds' && (
          <BackgroundsTab
            backgrounds={backgrounds}
            activeBackground={displayState.background}
            overlayOpacity={displayState.overlayOpacity ?? 0.35}
            onSelectBackground={handleSelectBackground}
            onProjectImageAlone={handleProjectImageAlone}
            onUpdateBackgrounds={handleUpdateBackgrounds}
            onUpdateOverlayOpacity={(val) => handleUpdateDisplayState({ overlayOpacity: val })}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation (5 icons at base: Bible, Hymns, Setlist, Media, Settings) */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-1.5 px-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveTab('bible')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-2xl transition ${
            activeTab === 'bible' ? 'text-red-600 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px]">Bible</span>
        </button>

        <button
          onClick={() => setActiveTab('hymns')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-2xl transition ${
            activeTab === 'hymns' ? 'text-red-600 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Music className="w-5 h-5" />
          <span className="text-[10px]">Hymns</span>
        </button>

        <button
          onClick={() => setActiveTab('playlist')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-2xl transition ${
            activeTab === 'playlist' ? 'text-red-600 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <ListOrdered className="w-5 h-5" />
          <span className="text-[10px]">Setlist</span>
        </button>

        <button
          onClick={() => setActiveTab('backgrounds')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-2xl transition ${
            activeTab === 'backgrounds' ? 'text-red-600 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <ImageIcon className="w-5 h-5" />
          <span className="text-[10px]">Media</span>
        </button>

        <button
          onClick={() => setIsSettingsModalOpen(true)}
          className="flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-2xl transition text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px]">Settings</span>
        </button>
      </nav>

      {/* Connect Modal */}
      <ConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        roomCode={roomCode}
        onRoomCodeChange={handleRoomCodeChange}
      />

      {/* Service Presets & Bulk Hymns Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        displayState={displayState}
        backgrounds={backgrounds}
        hymns={hymns}
        isDark={isDark}
        onApplyPreset={handleApplyPreset}
        onUpdateHymns={handleUpdateHymns}
        onUpdateDisplayState={handleUpdateDisplayState}
        onOpenConnectModal={() => {
          setIsSettingsModalOpen(false);
          setIsConnectModalOpen(true);
        }}
      />

      {/* Offline Indicator */}
      <OfflineIndicator />
    </div>
  );
}
