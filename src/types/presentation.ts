export type SlideType = 'scripture' | 'hymn' | 'announcement' | 'sermon' | 'custom' | 'logo' | 'image';

export interface SlideItem {
  id: string;
  type: SlideType;
  title: string;
  subtitle?: string;
  content: string; // The primary displayed text or lyrics
  reference?: string; // e.g. "John 3:16 KJV" or "Hymn #2 - Verse 1"
  sectionLabel?: string; // e.g. "Verse 1", "Chorus", "Bridge", "Point 1"
  backgroundId?: string;
  customBackgroundUrl?: string;
  mediaUrl?: string; // Direct image URL for clean image display
  notes?: string;
}

export interface BackgroundItem {
  id: string;
  name: string;
  type: 'gradient' | 'image' | 'solid';
  value: string; // CSS gradient, color, or image URL / base64
  thumbnail?: string;
  category: 'worship' | 'ethereal' | 'stained-glass' | 'minimal' | 'custom';
}

export interface HymnSong {
  id: string;
  number: number;
  title: string;
  author?: string;
  key?: string;
  meter?: string;
  tags?: string[];
  sections: {
    id: string;
    label: string; // "Verse 1", "Chorus", "Verse 2", "Bridge"
    content: string;
  }[];
}

export interface PlaylistItem {
  id: string;
  title: string;
  type: SlideType;
  slides: SlideItem[];
  color?: string;
}

export interface DisplayState {
  currentSlide: SlideItem | null;
  nextSlide: SlideItem | null;
  isBlackout: boolean;
  isTextCleared: boolean;
  isLogoActive: boolean;
  background: BackgroundItem;
  overlayOpacity: number; // 0 to 1
  fontSize: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  alignment: 'left' | 'center' | 'right';
  fontFamily: 'sans' | 'serif' | 'cinzel';
  textShadow: boolean;
  isLowerThird: boolean;
  roomCode: string;
  updatedAt: number;
}

export interface ServicePreset {
  id: string;
  name: string;
  description?: string;
  theme: 'light' | 'dark';
  backgroundId: string;
  overlayOpacity: number;
  fontSize: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  alignment: 'left' | 'center' | 'right';
  fontFamily: 'sans' | 'serif' | 'cinzel';
}

