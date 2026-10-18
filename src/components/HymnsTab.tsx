import React, { useState } from 'react';
import { HymnSong, SlideItem } from '../types/presentation';
import { 
  Music, 
  Search, 
  Play, 
  Eye, 
  Plus, 
  Edit3, 
  Trash2, 
  ListPlus,
  BookOpen,
  Sparkles,
  Hash
} from 'lucide-react';

interface HymnsTabProps {
  hymns: HymnSong[];
  onUpdateHymns: (hymns: HymnSong[]) => void;
  onSendToLive: (slide: SlideItem) => void;
  onSendToPreview: (slide: SlideItem) => void;
  onAddToPlaylist: (slide: SlideItem) => void;
  onAddMultipleToPlaylist: (slides: SlideItem[], title: string) => void;
}

export const HymnsTab: React.FC<HymnsTabProps> = ({
  hymns,
  onUpdateHymns,
  onSendToLive,
  onSendToPreview,
  onAddToPlaylist,
  onAddMultipleToPlaylist
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHymn, setSelectedHymn] = useState<HymnSong | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string>('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingHymn, setEditingHymn] = useState<HymnSong | null>(null);

  // Filter only when user has typed something
  const isSearching = searchQuery.trim().length > 0;
  const filteredHymns = isSearching
    ? hymns.filter((h) => {
        const q = searchQuery.toLowerCase().trim();
        if (h.number.toString() === q || `hymn ${h.number}` === q || `#${h.number}` === q) return true;
        if (h.number.toString().includes(q)) return true;
        if (h.title.toLowerCase().includes(q)) return true;
        if (h.author?.toLowerCase().includes(q)) return true;
        return h.sections.some(s => s.content.toLowerCase().includes(q));
      })
    : [];

  // When search changes, auto-select first match if only 1-2 results
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSelectedHymn(null);
      return;
    }
    const q = query.toLowerCase().trim();
    const match = hymns.find(h => 
      h.number.toString() === q || 
      h.title.toLowerCase().includes(q)
    );
    if (match) {
      setSelectedHymn(match);
      setActiveSectionId(match.sections[0]?.id || '');
    }
  };

  const handleSelectHymn = (h: HymnSong) => {
    setSelectedHymn(h);
    setActiveSectionId(h.sections[0]?.id || '');
  };

  const buildSlideFromSection = (hymn: HymnSong, section: typeof hymn.sections[0]): SlideItem => {
    return {
      id: `hymn-${hymn.id}-${section.id}-${Date.now()}`,
      type: 'hymn',
      title: hymn.title,
      subtitle: `Hymn #${hymn.number} • ${section.label}`,
      content: section.content,
      reference: `${hymn.title} (${section.label})`,
      sectionLabel: section.label
    };
  };

  const handleAddAllToSetlist = () => {
    if (!selectedHymn) return;
    const slides: SlideItem[] = selectedHymn.sections.map(sec => ({
      id: `hymn-${selectedHymn.id}-${sec.id}`,
      type: 'hymn',
      title: selectedHymn.title,
      subtitle: `Hymn #${selectedHymn.number} • ${sec.label}`,
      content: sec.content,
      reference: `${selectedHymn.title} (${sec.label})`,
      sectionLabel: sec.label
    }));
    onAddMultipleToPlaylist(slides, `Hymn #${selectedHymn.number}: ${selectedHymn.title}`);
  };

  // Editor states
  const [editTitle, setEditTitle] = useState('');
  const [editNumber, setEditNumber] = useState(1);
  const [editAuthor, setEditAuthor] = useState('');
  const [editRawLyrics, setEditRawLyrics] = useState('');

  const openNewHymnModal = () => {
    setEditingHymn(null);
    setEditTitle('');
    setEditNumber(hymns.length + 1);
    setEditAuthor('');
    setEditRawLyrics('Verse 1\nType verse 1 lyrics here...\n\nChorus\nType chorus lyrics here...\n\nVerse 2\nType verse 2 lyrics here...');
    setIsEditorOpen(true);
  };

  const openEditModal = (hymn: HymnSong) => {
    setEditingHymn(hymn);
    setEditTitle(hymn.title);
    setEditNumber(hymn.number);
    setEditAuthor(hymn.author || '');
    const raw = hymn.sections.map(s => `[${s.label}]\n${s.content}`).join('\n\n');
    setEditRawLyrics(raw);
    setIsEditorOpen(true);
  };

  const handleSaveHymn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    const blocks = editRawLyrics.split(/\n\s*\n/);
    const sections = blocks.map((block, idx) => {
      const lines = block.trim().split('\n');
      let label = `Verse ${idx + 1}`;
      let content = block.trim();

      if (lines[0].startsWith('[') && lines[0].endsWith(']')) {
        label = lines[0].slice(1, -1);
        content = lines.slice(1).join('\n').trim();
      } else if (/^(verse|chorus|bridge|refrain|intro|outro)/i.test(lines[0])) {
        label = lines[0];
        content = lines.slice(1).join('\n').trim();
      }

      return {
        id: `sec-${idx}-${Date.now()}`,
        label,
        content: content || block
      };
    }).filter(s => s.content.trim().length > 0);

    const updatedHymn: HymnSong = {
      id: editingHymn ? editingHymn.id : `hymn-custom-${Date.now()}`,
      number: editNumber || (hymns.length + 1),
      title: editTitle.trim(),
      author: editAuthor.trim() || undefined,
      sections: sections.length > 0 ? sections : [{ id: 'sec-1', label: 'Verse 1', content: editRawLyrics }]
    };

    let updatedList: HymnSong[];
    if (editingHymn) {
      updatedList = hymns.map(h => h.id === editingHymn.id ? updatedHymn : h);
    } else {
      updatedList = [...hymns, updatedHymn];
    }

    onUpdateHymns(updatedList);
    setSelectedHymn(updatedHymn);
    setActiveSectionId(updatedHymn.sections[0]?.id || '');
    setIsEditorOpen(false);
  };

  const handleDeleteHymn = (id: string) => {
    if (confirm('Delete this hymn?')) {
      const updated = hymns.filter(h => h.id !== id);
      onUpdateHymns(updated);
      setSelectedHymn(null);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-20">
      {/* 1. Sleek Search Box */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-red-500/30 dark:border-red-600/40 p-4 sm:p-5 shadow-lg shadow-red-500/5">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center">
              <Music className="w-4 h-4" />
            </span>
            <span>Hymn Quick Search</span>
          </label>
          <button
            onClick={openNewHymnModal}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm shadow-red-600/20 active:scale-95 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Hymn</span>
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Type hymn number (e.g. 2, 004) or title (Amazing Grace, Holy Holy)..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white px-2 py-1"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick Hymn Number Chips (Fast 1-tap lookup) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 no-scrollbar">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0 mr-1">
            Quick #:
          </span>
          {hymns.slice(0, 10).map((h) => (
            <button
              key={h.id}
              onClick={() => handleSearchChange(h.number.toString())}
              className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap active:scale-95 transition flex items-center gap-1 shadow-sm flex-shrink-0 ${
                selectedHymn?.id === h.id
                  ? 'bg-red-600 text-white shadow-red-600/20'
                  : 'asor-badge-red'
              }`}
            >
              <span>#{h.number}</span>
              <span className="hidden sm:inline font-normal truncate max-w-[120px]">{h.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Search Results (Only shown when user has searched and multiple match) */}
      {isSearching && filteredHymns.length > 1 && (
        <div className="p-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1">
            Matching Hymns ({filteredHymns.length}) • Tap to open
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredHymns.map((h) => (
              <button
                key={h.id}
                onClick={() => handleSelectHymn(h)}
                className={`flex items-center justify-between p-3 rounded-2xl text-left transition ${
                  selectedHymn?.id === h.id
                    ? 'bg-red-50 dark:bg-red-950/40 border border-red-500/60 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:border-red-300'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                    {h.title}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {h.author || `${h.sections.length} verses`}
                  </p>
                </div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-red-600 text-white flex-shrink-0">
                  #{h.number}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Selected Hymn Presentation View */}
      {selectedHymn ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm animate-fade-in">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-xs font-mono font-bold shadow-sm">
                  #{selectedHymn.number}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {selectedHymn.title}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {selectedHymn.author} {selectedHymn.key ? `• Key: ${selectedHymn.key}` : ''}
              </p>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => openEditModal(selectedHymn)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Edit Hymn"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteHymn(selectedHymn.id)}
                className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                title="Delete Hymn"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Slide Jumping Chips (1-tap direct projection) */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Slide Jumper • Tap to Project Live
            </span>
            <div className="flex flex-wrap gap-2">
              {selectedHymn.sections.map((sec) => {
                const isActive = activeSectionId === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => {
                      setActiveSectionId(sec.id);
                      onSendToLive(buildSlideFromSection(selectedHymn, sec));
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 active:scale-95 shadow-sm ${
                      isActive
                        ? 'bg-red-600 text-white shadow-red-600/25'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-red-50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{sec.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Verses Cards */}
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {selectedHymn.sections.map((sec) => {
              const isActive = activeSectionId === sec.id;
              return (
                <div
                  key={sec.id}
                  onClick={() => setActiveSectionId(sec.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-red-50/60 dark:bg-red-950/30 border-red-500/60 ring-1 ring-red-500/30'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase asor-badge-red">
                      {sec.label}
                    </span>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSendToPreview(buildSlideFromSection(selectedHymn, sec))}
                        className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3 text-red-500" />
                        <span>Preview</span>
                      </button>
                      <button
                        onClick={() => onSendToLive(buildSlideFromSection(selectedHymn, sec))}
                        className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Project</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-xs sm:text-base text-slate-800 dark:text-slate-200 whitespace-pre-line font-medium leading-relaxed">
                    {sec.content}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Setlist Button */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              onClick={handleAddAllToSetlist}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold transition active:scale-95"
            >
              <ListPlus className="w-4 h-4 text-red-500" />
              <span>Add All Verses to Setlist</span>
            </button>
          </div>
        </div>
      ) : (
        /* Empty / Idle State when no search is active */
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Music className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Search to Display Hymns
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Type any hymn number or song title in the search box above to immediately display its lyrics and verses.
          </p>
        </div>
      )}

      {/* Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingHymn ? 'Edit Hymn' : 'Add New Hymn'}
            </h3>

            <form onSubmit={handleSaveHymn} className="space-y-3">
              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Hymn #
                  </label>
                  <input
                    type="number"
                    value={editNumber}
                    onChange={(e) => setEditNumber(parseInt(e.target.value) || 1)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold font-mono"
                    required
                  />
                </div>
                <div className="col-span-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="e.g. Great Is Thy Faithfulness"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Lyrics (Separate sections with [Verse 1], [Chorus], etc.)
                </label>
                <textarea
                  value={editRawLyrics}
                  onChange={(e) => setEditRawLyrics(e.target.value)}
                  rows={8}
                  className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20"
                >
                  Save Hymn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
