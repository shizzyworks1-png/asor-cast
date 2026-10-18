import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { castService } from '../services/castService';
import { 
  Tv, 
  Cast, 
  ExternalLink, 
  Copy, 
  Check, 
  X, 
  QrCode, 
  Wifi, 
  Info,
  HelpCircle
} from 'lucide-react';

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
  onRoomCodeChange: (newCode: string) => void;
}

export const ConnectModal: React.FC<ConnectModalProps> = ({
  isOpen,
  onClose,
  roomCode,
  onRoomCodeChange
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'qr' | 'cast' | 'hdmi'>('qr');
  const [tempCode, setTempCode] = useState(roomCode);

  const displayUrl = castService.getDisplayUrl();

  useEffect(() => {
    if (displayUrl) {
      QRCode.toDataURL(displayUrl, {
        width: 260,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      })
        .then((url) => setQrDataUrl(url))
        .catch(() => {});
    }
  }, [displayUrl, roomCode]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(displayUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleApplyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempCode.trim()) {
      onRoomCodeChange(tempCode.trim().toUpperCase());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Connect Asor Cast to TV
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Project KJV scriptures & hymns wirelessly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 px-3">
          <button
            onClick={() => setActiveSubTab('qr')}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition ${
              activeSubTab === 'qr'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>TV Browser / QR Code</span>
          </button>
          <button
            onClick={() => setActiveSubTab('cast')}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition ${
              activeSubTab === 'cast'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Cast className="w-4 h-4" />
            <span>Google Cast</span>
          </button>
          <button
            onClick={() => setActiveSubTab('hdmi')}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition ${
              activeSubTab === 'hdmi'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ExternalLink className="w-4 h-4" />
            <span>HDMI / 2nd Screen</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {activeSubTab === 'qr' && (
            <div className="space-y-4 text-center">
              <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col items-center">
                <span className="text-xs uppercase font-bold text-red-600 tracking-wider mb-2">
                  Scan with Smart TV or Projector
                </span>
                {qrDataUrl ? (
                  <div className="p-3 bg-white rounded-2xl shadow-md inline-block">
                    <img src={qrDataUrl} alt="TV Display QR Code" className="w-44 h-44 sm:w-52 sm:h-52" />
                  </div>
                ) : (
                  <div className="w-44 h-44 sm:w-52 sm:h-52 bg-slate-200 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                    <QrCode className="w-10 h-10 text-slate-400 animate-spin" />
                  </div>
                )}
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Works on any TV browser (Fire TV Silk, Samsung, LG, Android TV)</span>
                </div>
              </div>

              {/* Room Code */}
              <form onSubmit={handleApplyCode} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <div className="text-left">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Church Room Code / PIN
                  </label>
                  <input
                    type="text"
                    value={tempCode}
                    onChange={(e) => setTempCode(e.target.value.toUpperCase())}
                    maxLength={8}
                    className="bg-transparent font-mono text-lg font-black text-red-600 tracking-widest focus:outline-none uppercase w-28"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 shadow-sm"
                >
                  Save Code
                </button>
              </form>

              {/* Direct Link */}
              <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                <input
                  type="text"
                  readOnly
                  value={displayUrl}
                  className="flex-1 bg-transparent text-xs text-slate-600 dark:text-slate-300 truncate focus:outline-none font-mono"
                />
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition shadow-sm"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}

          {activeSubTab === 'cast' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-left">
                <div className="flex items-start gap-3">
                  <Cast className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-red-900 dark:text-red-200">Chromecast & Google Cast</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      Cast directly from Google Chrome on your Android phone or laptop to any Chromecast, Google TV, or Android TV on church Wi-Fi.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center py-6">
                <button
                  onClick={() => castService.requestCastSession()}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-base shadow-lg shadow-red-600/25 active:scale-95 transition"
                >
                  <Cast className="w-5 h-5" />
                  <span>Connect Chromecast</span>
                </button>
                <p className="text-xs text-slate-400 mt-3">
                  Ensure phone and TV are connected to the same Wi-Fi.
                </p>
              </div>
            </div>
          )}

          {activeSubTab === 'hdmi' && (
            <div className="space-y-4 text-left">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="flex items-start gap-3">
                  <ExternalLink className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Dual Screen / HDMI Projector</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      Connect via USB-C to HDMI, Samsung DeX, or secondary monitor window.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => castService.openDisplayWindow()}
                className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-red-600 hover:bg-red-700 font-bold text-sm text-white shadow-md shadow-red-600/20 transition active:scale-98"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Projector Window</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Asor Cast • Realtime Sync Active
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-bold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
