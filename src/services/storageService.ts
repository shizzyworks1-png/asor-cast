import { HymnSong, PlaylistItem, BackgroundItem, DisplayState, ServicePreset } from '../types/presentation';
import { DEFAULT_HYMNS } from '../data/hymnData';
import { DEFAULT_BACKGROUNDS } from '../data/backgroundData';

const STORAGE_KEYS = {
  HYMNS: 'asor_cast_hymns_v1',
  BACKGROUNDS: 'asor_cast_backgrounds_v1',
  PLAYLIST: 'asor_cast_playlist_v1',
  DISPLAY_STATE: 'asor_cast_display_state_v1',
  SETTINGS: 'asor_cast_settings_v1',
  ROOM_CODE: 'asor_cast_room_code_v1'
};

export const defaultDisplayState: DisplayState = {
  currentSlide: {
    id: 'welcome-slide',
    type: 'logo',
    title: 'Welcome to Church',
    subtitle: 'Sunday Worship Service',
    content: 'Praise the LORD with harp: sing unto him with the psaltery and an instrument of ten strings.',
    reference: 'Psalm 33:2 KJV',
    sectionLabel: 'Welcome'
  },
  nextSlide: {
    id: 'next-scripture',
    type: 'scripture',
    title: 'The LORD is my shepherd',
    content: 'The LORD is my shepherd; I shall not want.\nHe maketh me to lie down in green pastures:\nhe leadeth me beside the still waters.',
    reference: 'Psalms 23:1-2 KJV',
    sectionLabel: 'Scripture'
  },
  isBlackout: false,
  isTextCleared: false,
  isLogoActive: false,
  background: DEFAULT_BACKGROUNDS[0],
  overlayOpacity: 0.35,
  fontSize: 'xl',
  alignment: 'center',
  fontFamily: 'sans',
  textShadow: true,
  isLowerThird: false,
  roomCode: 'ASOR',
  updatedAt: Date.now()
};

export const defaultPlaylist: PlaylistItem[] = [
  {
    id: 'p-welcome',
    title: 'Service Welcome & Call to Worship',
    type: 'announcement',
    color: '#f59e0b',
    slides: [
      {
        id: 's-w1',
        type: 'announcement',
        title: 'Welcome to Worship',
        subtitle: 'Asor Cast Church Service',
        content: 'We are so glad you are here with us today!\nPlease take a seat and prepare your heart for worship.',
        reference: 'Sunday Morning',
        sectionLabel: 'Announcement'
      },
      {
        id: 's-w2',
        type: 'scripture',
        title: 'Call to Worship',
        content: 'Enter into his gates with thanksgiving, and into his courts with praise: be thankful unto him, and bless his name.\nFor the LORD is good; his mercy is everlasting.',
        reference: 'Psalms 100:4-5 KJV',
        sectionLabel: 'Scripture'
      }
    ]
  },
  {
    id: 'p-hymn1',
    title: 'Opening Hymn: Holy, Holy, Holy',
    type: 'hymn',
    color: '#6366f1',
    slides: DEFAULT_HYMNS[0].sections.map((sec, idx) => ({
      id: `pl-h1-${idx}`,
      type: 'hymn',
      title: DEFAULT_HYMNS[0].title,
      subtitle: `Hymn #${DEFAULT_HYMNS[0].number} - ${sec.label}`,
      content: sec.content,
      reference: `${DEFAULT_HYMNS[0].title} (${sec.label})`,
      sectionLabel: sec.label
    }))
  },
  {
    id: 'p-scripture',
    title: 'Scripture: Psalm 23 (KJV)',
    type: 'scripture',
    color: '#10b981',
    slides: [
      {
        id: 's-ps23-1',
        type: 'scripture',
        title: 'The Lord is My Shepherd',
        content: 'The LORD is my shepherd; I shall not want.\nHe maketh me to lie down in green pastures: he leadeth me beside the still waters.',
        reference: 'Psalms 23:1-2 KJV',
        sectionLabel: 'Verses 1-2'
      },
      {
        id: 's-ps23-2',
        type: 'scripture',
        title: 'The Valley of the Shadow',
        content: 'Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.',
        reference: 'Psalms 23:4 KJV',
        sectionLabel: 'Verse 4'
      },
      {
        id: 's-ps23-3',
        type: 'scripture',
        title: 'Goodness & Mercy',
        content: 'Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever.',
        reference: 'Psalms 23:6 KJV',
        sectionLabel: 'Verse 6'
      }
    ]
  },
  {
    id: 'p-hymn2',
    title: 'Worship: Amazing Grace',
    type: 'hymn',
    color: '#8b5cf6',
    slides: DEFAULT_HYMNS[1].sections.slice(0, 3).map((sec, idx) => ({
      id: `pl-h2-${idx}`,
      type: 'hymn',
      title: DEFAULT_HYMNS[1].title,
      subtitle: `Hymn #${DEFAULT_HYMNS[1].number} - ${sec.label}`,
      content: sec.content,
      reference: `${DEFAULT_HYMNS[1].title} (${sec.label})`,
      sectionLabel: sec.label
    }))
  }
];

export const storageService = {
  getHymns(): HymnSong[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HYMNS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_HYMNS;
  },

  saveHymns(hymns: HymnSong[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.HYMNS, JSON.stringify(hymns));
    } catch {
      // ignore
    }
  },

  getBackgrounds(): BackgroundItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BACKGROUNDS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_BACKGROUNDS;
  },

  saveBackgrounds(bgs: BackgroundItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.BACKGROUNDS, JSON.stringify(bgs));
    } catch {
      // ignore
    }
  },

  getPlaylist(): PlaylistItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLAYLIST);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return defaultPlaylist;
  },

  savePlaylist(playlist: PlaylistItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PLAYLIST, JSON.stringify(playlist));
    } catch {
      // ignore
    }
  },

  getDisplayState(): DisplayState {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DISPLAY_STATE);
      if (data) {
        const parsed = JSON.parse(data);
        return { ...defaultDisplayState, ...parsed };
      }
    } catch {
      // ignore
    }
    return defaultDisplayState;
  },

  saveDisplayState(state: DisplayState): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DISPLAY_STATE, JSON.stringify(state));
    } catch {
      // ignore
    }
  },

  getRoomCode(): string {
    try {
      return localStorage.getItem(STORAGE_KEYS.ROOM_CODE) || 'ASOR';
    } catch {
      return 'ASOR';
    }
  },

  setRoomCode(code: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ROOM_CODE, code.toUpperCase());
    } catch {
      // ignore
    }
  },

  getPresets(): ServicePreset[] {
    try {
      const data = localStorage.getItem('asor_cast_service_presets_v1');
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [
      {
        id: 'preset-sunday-morning',
        name: 'Sunday Morning Worship',
        description: 'Bright church sanctuary, golden ethereal rays, large sans font',
        theme: 'light',
        backgroundId: 'bg-majesty-gold',
        overlayOpacity: 0.35,
        fontSize: 'xl',
        alignment: 'center',
        fontFamily: 'sans'
      },
      {
        id: 'preset-evening-service',
        name: 'Evening Praise & Prayer',
        description: 'Deep sanctuary indigo, majestic cinzel sacred styling',
        theme: 'dark',
        backgroundId: 'bg-sanctuary-indigo',
        overlayOpacity: 0.40,
        fontSize: '2xl',
        alignment: 'center',
        fontFamily: 'cinzel'
      },
      {
        id: 'preset-scripture-communion',
        name: 'Communion & Solemn Reflection',
        description: 'Pure high-contrast black, scripture serif font',
        theme: 'dark',
        backgroundId: 'bg-pure-black',
        overlayOpacity: 0.50,
        fontSize: 'lg',
        alignment: 'center',
        fontFamily: 'serif'
      }
    ];
  },

  savePresets(presets: ServicePreset[]): void {
    try {
      localStorage.setItem('asor_cast_service_presets_v1', JSON.stringify(presets));
    } catch {
      // ignore
    }
  }
};
