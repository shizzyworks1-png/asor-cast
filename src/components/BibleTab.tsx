import React, { useState, useEffect } from 'react';
import { 
  BIBLE_BOOKS, 
  KJV_POPULAR_VERSES, 
  parseScriptureQuery, 
  getScriptureVerse, 
  getScripturePassage, 
  BibleBook 
} from '../data/bibleData';
import { SlideItem } from '../types/presentation';
import { 
  BookOpen, 
  Search, 
  Tv, 
  Play, 
  Eye, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  Sparkles,
  Zap,
  Edit2
} from 'lucide-react';

interface BibleTabProps {
  onSendToLive: (slide: SlideItem) => void;
  onSendToPreview: (slide: SlideItem) => void;
  onSendLiveAndPreview?: (liveSlide: SlideItem, previewSlide: SlideItem) => void;
  onAddToPlaylist: (slide: SlideItem) => void;
}

export const BibleTab: React.FC<BibleTabProps> = ({
  onSendToLive,
  onSendToPreview,
  onSendLiveAndPreview,
  onAddToPlaylist
}) => {
  // Quick Insertion Box input
  const [quickInput, setQuickInput] = useState('John 3:16');
  
  // Current active scripture for presentation
  const [activeBook, setActiveBook] = useState<BibleBook>(() => {
    return BIBLE_BOOKS.find(b => b.name === 'John') || BIBLE_BOOKS[0];
  });
  const [activeChapter, setActiveChapter] = useState<number>(3);
  const [activeVerse, setActiveVerse] = useState<number>(16);
  const [endVerse, setEndVerse] = useState<number | null>(null);
  const [customText, setCustomText] = useState<string>(() => {
    return getScriptureVerse('John', 3, 16).text;
  });
  const [isEditing, setIsEditing] = useState(false);

  // Helper to build verse slide
  const buildVerseSlide = (bookName: string, chapter: number, verseNum: number): SlideItem => {
    const item = getScriptureVerse(bookName, chapter, verseNum);
    return {
      id: `scripture-${bookName}-${chapter}-${verseNum}-${Date.now()}`,
      type: 'scripture',
      title: `${bookName} ${chapter}:${verseNum}`,
      content: item.text,
      reference: `${bookName} ${chapter}:${verseNum} (KJV)`,
      sectionLabel: 'Holy Scripture'
    };
  };

  // Primary synchronous resolver and projector for Quick Scripture Insertion
  const resolveAndProjectScripture = (query: string, target: 'live' | 'preview' = 'live') => {
    const parsed = parseScriptureQuery(query);
    let book = activeBook;
    let ch = activeChapter;
    let vs = activeVerse;
    let endVs = endVerse;

    if (parsed.bookName) {
      const foundBook = BIBLE_BOOKS.find(b => b.name.toLowerCase() === parsed.bookName?.toLowerCase());
      if (foundBook) {
        book = foundBook;
        ch = Math.min(Math.max(parsed.chapter || 1, 1), foundBook.chapters);
        vs = Math.max(parsed.verse || 1, 1);
        endVs = parsed.endVerse ? Math.max(parsed.endVerse, vs) : null;
      }
    } else {
      // Keyword fallback match in popular verses
      const qLower = query.toLowerCase().trim();
      if (qLower.length > 2) {
        const match = KJV_POPULAR_VERSES.find(v => 
          v.text.toLowerCase().includes(qLower) || 
          v.book.toLowerCase().includes(qLower)
        );
        if (match) {
          book = BIBLE_BOOKS.find(b => b.name.toLowerCase() === match.book.toLowerCase()) || book;
          ch = match.chapter;
          vs = match.verse;
          endVs = null;
        }
      }
    }

    // Synchronously resolve exact text for this passage
    const passage = getScripturePassage(book.name, ch, vs, endVs);

    // Build the resolved live slide
    const liveSlide: SlideItem = {
      id: `scripture-${book.name}-${ch}-${vs}-${Date.now()}`,
      type: 'scripture',
      title: passage.label,
      content: passage.text,
      reference: passage.reference,
      sectionLabel: 'Holy Scripture'
    };

    // Build the subsequent verse for Preview queue
    const nextVerseNum = (endVs || vs) + 1;
    const nextPreviewSlide: SlideItem = {
      id: `scripture-${book.name}-${ch}-${nextVerseNum}-${Date.now() + 1}`,
      type: 'scripture',
      title: `${book.name} ${ch}:${nextVerseNum}`,
      content: getScriptureVerse(book.name, ch, nextVerseNum).text,
      reference: `${book.name} ${ch}:${nextVerseNum} (KJV)`,
      sectionLabel: 'Holy Scripture'
    };

    // Update state synchronously
    setActiveBook(book);
    setActiveChapter(ch);
    setActiveVerse(vs);
    setEndVerse(endVs);
    setCustomText(passage.text);
    setQuickInput(passage.label);
    setIsEditing(false);

    if (target === 'live') {
      if (onSendLiveAndPreview) {
        onSendLiveAndPreview(liveSlide, nextPreviewSlide);
      } else {
        onSendToLive(liveSlide);
        onSendToPreview(nextPreviewSlide);
      }
    } else {
      onSendToPreview(liveSlide);
    }
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resolveAndProjectScripture(quickInput, 'live');
  };

  // Live navigation steppers during preaching
  const handlePrevVerse = () => {
    const prevV = activeVerse > 1 ? activeVerse - 1 : 1;
    resolveAndProjectScripture(`${activeBook.name} ${activeChapter}:${prevV}`, 'live');
  };

  const handleNextVerse = () => {
    const nextV = (endVerse || activeVerse) + 1;
    resolveAndProjectScripture(`${activeBook.name} ${activeChapter}:${nextV}`, 'live');
  };

  const handleProjectLiveNow = () => {
    // If text was manually edited in the card, project that edited text!
    const verseLabel = endVerse && endVerse > activeVerse ? `${activeVerse}-${endVerse}` : `${activeVerse}`;
    const currentSlide: SlideItem = {
      id: `scripture-${activeBook.name}-${activeChapter}-${activeVerse}-${Date.now()}`,
      type: 'scripture',
      title: `${activeBook.name} ${activeChapter}:${verseLabel}`,
      content: customText,
      reference: `${activeBook.name} ${activeChapter}:${verseLabel} (KJV)`,
      sectionLabel: 'Holy Scripture'
    };

    // Queue next verse in Preview
    const nextV = (endVerse || activeVerse) + 1;
    const nextPreview = buildVerseSlide(activeBook.name, activeChapter, nextV);

    if (onSendLiveAndPreview) {
      onSendLiveAndPreview(currentSlide, nextPreview);
    } else {
      onSendToLive(currentSlide);
      onSendToPreview(nextPreview);
    }
  };

  const handleQueuePreviewNow = () => {
    const verseLabel = endVerse && endVerse > activeVerse ? `${activeVerse}-${endVerse}` : `${activeVerse}`;
    const slide: SlideItem = {
      id: `scripture-${activeBook.name}-${activeChapter}-${activeVerse}-${Date.now()}`,
      type: 'scripture',
      title: `${activeBook.name} ${activeChapter}:${verseLabel}`,
      content: customText,
      reference: `${activeBook.name} ${activeChapter}:${verseLabel} (KJV)`,
      sectionLabel: 'Holy Scripture'
    };
    onSendToPreview(slide);
  };

  const handleAddToSetlistNow = () => {
    const verseLabel = endVerse && endVerse > activeVerse ? `${activeVerse}-${endVerse}` : `${activeVerse}`;
    const slide: SlideItem = {
      id: `scripture-${activeBook.name}-${activeChapter}-${activeVerse}-${Date.now()}`,
      type: 'scripture',
      title: `${activeBook.name} ${activeChapter}:${verseLabel}`,
      content: customText,
      reference: `${activeBook.name} ${activeChapter}:${verseLabel} (KJV)`,
      sectionLabel: 'Holy Scripture'
    };
    onAddToPlaylist(slide);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-16">
      {/* 1. QUICK SCRIPTURE INSERTION BOX (HERO ELEMENT FOR LIVE CHURCH SERVICES) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-red-500/30 dark:border-red-600/40 p-4 sm:p-5 shadow-lg shadow-red-500/5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center">
              <Zap className="w-4 h-4 fill-current" />
            </span>
            <label className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Quick Scripture Insertion (KJV)
            </label>
          </div>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            Press Enter to resolve
          </span>
        </div>

        <form onSubmit={handleQuickSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder="e.g. John 3:16, Rom 8:28, Ps 23:1, Gen 1:1-3..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-red-600/25 active:scale-95 transition flex-shrink-0"
            title="Project directly to TV screen"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Cast Live</span>
          </button>
        </form>

        {/* 1-Tap Sunday Scripture Chips (Matching user's screenshots) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 no-scrollbar">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0 mr-1">
            Instant:
          </span>
          {[
            { label: 'John 3 v 16', query: 'John 3:16' },
            { label: 'Ps 23 v 1-6', query: 'Psalms 23:1-6' },
            { label: 'Rom 8 v 28', query: 'Romans 8:28' },
            { label: '1 Cor 13 v 4-7', query: '1 Corinthians 13:4-7' },
            { label: 'Phil 4 v 13', query: 'Philippians 4:13' },
            { label: 'Jer 29 v 11', query: 'Jeremiah 29:11' },
            { label: 'Gen 1 v 1-3', query: 'Genesis 1:1-3' },
          ].map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => resolveAndProjectScripture(chip.query, 'live')}
              className="px-2.5 py-1 rounded-full asor-badge-red text-xs font-bold whitespace-nowrap active:scale-95 transition flex items-center gap-1 shadow-sm flex-shrink-0"
            >
              <span>{chip.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. COMPACT PRESENTATION SLIDE CARD (WHAT WILL BE PROJECTED) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-3">
        {/* Card Header & Reference */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {activeBook.name} {activeChapter}:{endVerse && endVerse > activeVerse ? `${activeVerse}-${endVerse}` : activeVerse}
            </span>
            <span className="px-2 py-0.5 rounded-full asor-badge-red text-[11px] font-bold">
              KJV
            </span>
          </div>

          {/* Stepper buttons (Next / Prev Verse during live sermon) */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevVerse}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1"
              title="Previous Verse"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Prev Verse</span>
            </button>
            <button
              onClick={handleNextVerse}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1"
              title="Next Verse"
            >
              <span className="hidden sm:inline">Next Verse</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Verse Text Area */}
        <div className="relative">
          {isEditing ? (
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              rows={4}
              className="w-full p-3.5 rounded-2xl border border-red-500 bg-red-50/20 dark:bg-slate-800 text-slate-900 dark:text-white font-scripture text-base sm:text-lg leading-relaxed focus:outline-none"
            />
          ) : (
            <div 
              onClick={() => setIsEditing(true)}
              className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 cursor-pointer hover:border-red-400 transition"
              title="Click to edit text before projecting"
            >
              <p className="text-slate-900 dark:text-slate-100 font-scripture text-base sm:text-lg leading-relaxed font-normal">
                "{customText}"
              </p>
              <div className="flex items-center justify-end gap-1 mt-2 text-[10px] text-slate-400">
                <Edit2 className="w-3 h-3" />
                <span>Tap to edit text</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons for Presentation */}
        <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
          <button
            onClick={handleAddToSetlistNow}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
          >
            <Plus className="w-3.5 h-3.5 text-red-500" />
            <span>To Setlist</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleQueuePreviewNow}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <Eye className="w-3.5 h-3.5 text-red-500" />
              <span>To Preview</span>
            </button>

            <button
              onClick={handleProjectLiveNow}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-red-600/25 active:scale-95 transition"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Project Live</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. COMPACT 3-ROW SELECTOR (FOR OPERATOR WHO WANTS TO PICK BOOK, CHAPTER, VERSE QUICKLY) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
          Compact Scripture Browser
        </span>

        {/* Row 1: Book & Chapter Selection dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {/* Book Select */}
          <div className="col-span-1 sm:col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Book
            </label>
            <select
              value={activeBook.name}
              onChange={(e) => {
                const b = BIBLE_BOOKS.find(book => book.name === e.target.value) || activeBook;
                resolveAndProjectScripture(`${b.name} 1:1`, 'live');
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
            >
              <optgroup label="New Testament">
                {BIBLE_BOOKS.filter(b => b.testament === 'NT').map(b => (
                  <option key={b.name} value={b.name}>{b.name}</option>
                ))}
              </optgroup>
              <optgroup label="Old Testament">
                {BIBLE_BOOKS.filter(b => b.testament === 'OT').map(b => (
                  <option key={b.name} value={b.name}>{b.name}</option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Chapter Select */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Chapter (1 - {activeBook.chapters})
            </label>
            <select
              value={activeChapter}
              onChange={(e) => {
                const ch = parseInt(e.target.value, 10);
                resolveAndProjectScripture(`${activeBook.name} ${ch}:1`, 'live');
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
            >
              {Array.from({ length: activeBook.chapters }, (_, i) => i + 1).map(ch => (
                <option key={ch} value={ch}>Chapter {ch}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Compact Verse Buttons Grid (Tap any verse number to instantly load and project) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Tap Verse Number to Cast Live
            </label>
            <span className="text-[10px] font-semibold text-red-500">
              1-Tap Instant Projection
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
            {Array.from({ length: 35 }, (_, i) => i + 1).map((v) => {
              const isSelected = activeVerse === v && !endVerse;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => {
                    resolveAndProjectScripture(`${activeBook.name} ${activeChapter}:${v}`, 'live');
                  }}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition flex items-center justify-center flex-shrink-0 ${
                    isSelected
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-red-400 hover:text-red-600'
                  }`}
                >
                  {v}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
