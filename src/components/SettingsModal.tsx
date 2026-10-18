import React, { useState } from 'react';
import { HymnSong, ServicePreset, DisplayState, BackgroundItem } from '../types/presentation';
import { storageService } from '../services/storageService';
import { castService } from '../services/castService';
import { 
  Settings as SettingsIcon, 
  X, 
  Upload, 
  Download, 
  Bookmark, 
  Sparkles, 
  Check, 
  Trash2, 
  Plus, 
  Palette, 
  Tv, 
  Layers,
  FileText,
  AlertCircle,
  Radio,
  Smartphone,
  ExternalLink
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  displayState: DisplayState;
  backgrounds: BackgroundItem[];
  hymns: HymnSong[];
  isDark: boolean;
  onApplyPreset: (preset: ServicePreset) => void;
  onUpdateHymns: (hymns: HymnSong[]) => void;
  onUpdateDisplayState: (partial: Partial<DisplayState>) => void;
  onOpenConnectModal?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  displayState,
  backgrounds,
  hymns,
  isDark,
  onApplyPreset,
  onUpdateHymns,
  onUpdateDisplayState,
  onOpenConnectModal
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'hymns' | 'anyview'>('presets');
  const [presets, setPresets] = useState<ServicePreset[]>(() => storageService.getPresets());

  // New Preset state
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDesc, setNewPresetDesc] = useState('');
  const [presetSavedSuccess, setPresetSavedSuccess] = useState(false);

  // Bulk Hymn import state
  const [bulkText, setBulkText] = useState('');
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  // Save current display state as a new preset
  const handleSaveCurrentAsPreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;

    const newPreset: ServicePreset = {
      id: `preset-${Date.now()}`,
      name: newPresetName.trim(),
      description: newPresetDesc.trim() || undefined,
      theme: isDark ? 'dark' : 'light',
      backgroundId: displayState.background.id,
      overlayOpacity: displayState.overlayOpacity,
      fontSize: displayState.fontSize,
      alignment: displayState.alignment,
      fontFamily: displayState.fontFamily
    };

    const updated = [newPreset, ...presets];
    setPresets(updated);
    storageService.savePresets(updated);
    setNewPresetName('');
    setNewPresetDesc('');
    setPresetSavedSuccess(true);
    setTimeout(() => setPresetSavedSuccess(false), 2500);
  };

  const handleDeletePreset = (id: string) => {
    const updated = presets.filter(p => p.id !== id);
    setPresets(updated);
    storageService.savePresets(updated);
  };

  // Bulk Hymns parser
  const handleBulkImport = () => {
    if (!bulkText.trim()) return;

    try {
      // First try JSON parse
      if (bulkText.trim().startsWith('[') || bulkText.trim().startsWith('{')) {
        const parsed = JSON.parse(bulkText.trim());
        const list: HymnSong[] = Array.isArray(parsed) ? parsed : [parsed];
        if (list.length > 0 && list[0].title) {
          const finalList = importMode === 'replace' ? list : [...hymns, ...list];
          onUpdateHymns(finalList);
          setImportStatus(`Successfully imported ${list.length} hymn(s)!`);
          setBulkText('');
          return;
        }
      }
    } catch {
      // fallback to plain text parsing
    }

    // Text parser: splits by double newline or "Hymn" prefix
    const blocks = bulkText.split(/\n(?=(?:Hymn\s*#?\d+|[A-Z0-9\s]{4,}:))/i);
    const parsedHymns: HymnSong[] = [];

    blocks.forEach((block, idx) => {
      const trimmed = block.trim();
      if (!trimmed) return;

      const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
      const titleLine = lines[0] || `Imported Hymn ${idx + 1}`;
      
      // Extract number if present
      const numMatch = titleLine.match(/(?:Hymn\s*#?|#\s*)(\d+)/i);
      const hymnNum = numMatch ? parseInt(numMatch[1], 10) : (hymns.length + idx + 1);
      const cleanTitle = titleLine.replace(/(?:Hymn\s*#?\d+[:\s-]*|#\d+[:\s-]*)/i, '').trim() || titleLine;

      const bodyLines = lines.slice(1).join('\n');
      const sectionBlocks = bodyLines.split(/\n\s*\n/);
      
      const sections = sectionBlocks.map((sec, sIdx) => {
        const sTrim = sec.trim();
        const firstLine = sTrim.split('\n')[0];
        let label = `Verse ${sIdx + 1}`;
        let content = sTrim;

        if (firstLine.startsWith('[') && firstLine.endsWith(']')) {
          label = firstLine.slice(1, -1);
          content = sTrim.split('\n').slice(1).join('\n').trim();
        } else if (/^(verse|chorus|bridge|refrain)/i.test(firstLine)) {
          label = firstLine;
          content = sTrim.split('\n').slice(1).join('\n').trim();
        }

        return {
          id: `imp-${idx}-${sIdx}-${Date.now()}`,
          label,
          content: content || sTrim
        };
      }).filter(s => s.content.length > 0);

      parsedHymns.push({
        id: `hymn-bulk-${Date.now()}-${idx}`,
        number: hymnNum,
        title: cleanTitle,
        sections: sections.length > 0 ? sections : [{ id: 's1', label: 'Verse 1', content: bodyLines || trimmed }]
      });
    });

    if (parsedHymns.length > 0) {
      const finalList = importMode === 'replace' ? parsedHymns : [...hymns, ...parsedHymns];
      onUpdateHymns(finalList);
      setImportStatus(`Successfully parsed and added ${parsedHymns.length} hymn(s)!`);
      setBulkText('');
    } else {
      setImportStatus('Could not parse any hymns. Please check the template format.');
    }
  };

  // Export hymns JSON
  const handleExportHymns = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(hymns, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'asor_cast_hymns_library.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const insertSampleTemplate = () => {
    setBulkText(
`Hymn 21: Joy to the World
[Verse 1]
Joy to the world, the Lord is come!
Let earth receive her King;
Let every heart prepare Him room,
And heaven and nature sing.

[Verse 2]
Joy to the earth, the Savior reigns!
Let men their songs employ;
While fields and floods, rocks, hills, and plains
Repeat the sounding joy.

Hymn 22: O Come All Ye Faithful
[Verse 1]
O come, all ye faithful, joyful and triumphant!
O come ye, O come ye to Bethlehem;
Come and behold Him, born the King of angels.

[Chorus]
O come, let us adore Him,
O come, let us adore Him,
O come, let us adore Him,
Christ the Lord!`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center flex-shrink-0">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Asor Cast Settings
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Service themes, presets, and bulk hymn management
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 px-4">
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition ${
              activeTab === 'presets'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Service Presets & Themes</span>
          </button>

          <button
            onClick={() => setActiveTab('hymns')}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition ${
              activeTab === 'hymns'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Bulk Hymn Import</span>
          </button>

          <button
            onClick={() => setActiveTab('anyview')}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition ${
              activeTab === 'anyview'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>Anyview Cast & TV</span>
          </button>
        </div>

        {/* Content area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* TAB 1: SERVICE PRESETS & THEMES */}
          {activeTab === 'presets' && (
            <div className="space-y-5">
              {/* Save Current State as Preset */}
              <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-red-500" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Save Current Service Setup as Preset
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Saves your active theme, background ({displayState.background.name}), font size ({displayState.fontSize.toUpperCase()}), and dimmer level.
                </p>

                <form onSubmit={handleSaveCurrentAsPreset} className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newPresetName}
                      onChange={(e) => setNewPresetName(e.target.value)}
                      placeholder="Preset name (e.g. Sunday Morning, Communion)..."
                      className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
                      required
                    />
                    <input
                      type="text"
                      value={newPresetDesc}
                      onChange={(e) => setNewPresetDesc(e.target.value)}
                      placeholder="Description (optional)..."
                      className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 active:scale-95 transition"
                    >
                      Save As Preset
                    </button>
                  </div>
                </form>

                {presetSavedSuccess && (
                  <div className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Preset saved successfully!</span>
                  </div>
                )}
              </div>

              {/* Saved Presets List */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Saved Church Service Presets ({presets.length})
                </span>

                <div className="space-y-2.5">
                  {presets.map((preset) => {
                    const presetBg = backgrounds.find(b => b.id === preset.backgroundId) || backgrounds[0];
                    return (
                      <div
                        key={preset.id}
                        className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                              {preset.name}
                            </h4>
                            <span className="px-2 py-0.5 rounded-full asor-badge-red text-[10px] font-bold uppercase">
                              {preset.theme} mode
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                            Background: {presetBg.name} • Font: {preset.fontFamily.toUpperCase()} ({preset.fontSize}) • Dim: {Math.round(preset.overlayOpacity * 100)}%
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => {
                              onApplyPreset(preset);
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm shadow-red-600/20 active:scale-95"
                          >
                            Apply Preset
                          </button>
                          <button
                            onClick={() => handleDeletePreset(preset.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                            title="Delete preset"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BULK HYMNS IMPORT */}
          {activeTab === 'hymns' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Bulk Import Hymns & Songs
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Paste lyrics in bulk or upload a JSON hymnbook
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={insertSampleTemplate}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                  >
                    Load Sample
                  </button>
                  <button
                    onClick={handleExportHymns}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                    title="Export all hymns"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export ({hymns.length})</span>
                  </button>
                </div>
              </div>

              {/* Textarea for bulk paste */}
              <div>
                <textarea
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  rows={9}
                  placeholder={`Paste hymns here...\n\nHymn 101: Blessed Assurance\n[Verse 1]\nBlessed assurance, Jesus is mine!\n\n[Chorus]\nThis is my story, this is my song...`}
                  className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Mode switch & Import trigger */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="accent-red-600"
                    />
                    <span>Append to existing library</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="accent-red-600"
                    />
                    <span>Replace whole library</span>
                  </label>
                </div>

                <button
                  onClick={handleBulkImport}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 active:scale-95"
                >
                  Import Hymns
                </button>
              </div>

              {importStatus && (
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span>{importStatus}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ANYVIEW CAST & TV BROADCAST SETTINGS */}
          {activeTab === 'anyview' && (
            <div className="space-y-4 text-left">
              <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tv className="w-5 h-5 text-red-600" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Anyview Cast (Hisense & VIDAA Smart TVs)
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                    Live TV Broadcast
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Connect your church Hisense TV wirelessly via Anyview Cast, or open the sanctuary display in the Hisense VIDAA TV browser for uninterrupted presentation.
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      if (onOpenConnectModal) {
                        onClose();
                        onOpenConnectModal();
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 active:scale-95 transition"
                  >
                    <Radio className="w-4 h-4" />
                    <span>Open Anyview Connection Options</span>
                  </button>

                  <button
                    onClick={() => castService.openDisplayWindow()}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-red-500" />
                    <span>Test TV Display Window</span>
                  </button>
                </div>
              </div>

              {/* Display & Text Preferences */}
              <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  TV Display Text & Scaling Preferences
                </h4>

                {/* Font Size */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Sanctuary Screen Font Size</span>
                  <div className="flex items-center gap-1">
                    {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => onUpdateDisplayState({ fontSize: size })}
                        className={`px-2.5 py-1 rounded-lg font-bold uppercase transition ${
                          displayState.fontSize === size
                            ? 'bg-red-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text Alignment */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Text Alignment</span>
                  <div className="flex items-center gap-1">
                    {(['center', 'left'] as const).map((align) => (
                      <button
                        key={align}
                        onClick={() => onUpdateDisplayState({ alignment: align })}
                        className={`px-3 py-1 rounded-lg font-bold capitalize transition ${
                          displayState.alignment === align
                            ? 'bg-red-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {align}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background Dimmer */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                    <span>Background Dimmer Overlay</span>
                    <span className="text-red-600">{Math.round((displayState.overlayOpacity ?? 0.35) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.85"
                    step="0.05"
                    value={displayState.overlayOpacity ?? 0.35}
                    onChange={(e) => onUpdateDisplayState({ overlayOpacity: parseFloat(e.target.value) })}
                    className="w-full accent-red-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Clear (0%)</span>
                    <span>Standard (35%)</span>
                    <span>High Contrast (85%)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-bold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
