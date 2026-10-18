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
  Smartphone,
  Radio,
  Sparkles,
  ShieldCheck,
  RefreshCw
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
  const [activeSubTab, setActiveSubTab] = useState<'anyview' | 'qr' | 'cast' | 'hdmi'>('anyview');
  const [tempCode, setTempCode] = useState(roomCode);
  const [isAnyviewActive, setIsAnyviewActive] = useState(() => castService.isAnyviewActive());
  const [isRequestingAnyview, setIsRequestingAnyview] = useState(false);
  const [anyviewStatusMessage, setAnyviewStatusMessage] = useState<string | null>(null);

  const displayUrl = castService.getDisplayUrl();

  useEffect(() => {
    const unsub = castService.subscribeConnection(() => {
      setIsAnyviewActive(castService.isAnyviewActive());
    });
    return () => unsub();
  }, []);

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

  const handleLaunchAnyview = async () => {
    setIsRequestingAnyview(true);
    setAnyviewStatusMessage(null);
    try {
      const res = await castService.requestAnyviewPresentation();
      if (res.success) {
        setIsAnyviewActive(true);
        setAnyviewStatusMessage('Connected to Anyview / Wireless Display!');
      } else {
        setAnyviewStatusMessage(res.message);
      }
    } catch (e: any) {
      setAnyviewStatusMessage(e?.message || 'Could not launch wireless display picker');
    } finally {
      setIsRequestingAnyview(false);
    }
  };

  const handleToggleAnyviewManual = () => {
    const nextState = !isAnyviewActive;
    castService.setAnyviewConnected(nextState);
    setIsAnyviewActive(nextState);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Connect Asor Cast to TV
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                  Anyview & Wireless
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Project scriptures & hymns to Hisense, smart TVs, and projectors
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation with Anyview Cast first */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 px-2 sm:px-3 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveSubTab('anyview')}
            className={`flex items-center gap-1.5 sm:gap-2 py-3 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition ${
              activeSubTab === 'anyview'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>Anyview Cast (Hisense)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('qr')}
            className={`flex items-center gap-1.5 sm:gap-2 py-3 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition ${
              activeSubTab === 'qr'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>TV Browser / QR</span>
          </button>
          <button
            onClick={() => setActiveSubTab('cast')}
            className={`flex items-center gap-1.5 sm:gap-2 py-3 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition ${
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
            className={`flex items-center gap-1.5 sm:gap-2 py-3 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition ${
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
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* TAB 1: ANYVIEW CAST (HISENSE & VIDAA SMART TV) */}
          {activeSubTab === 'anyview' && (
            <div className="space-y-4 text-left">
              {/* Anyview Feature Card */}
              <div className="p-4 rounded-3xl bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent border border-red-200 dark:border-red-900/40">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-red-600/30">
                      <Tv className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                          Anyview Cast for Hisense & VIDAA TVs
                        </h3>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        Connect wirelessly to any Hisense Smart TV, Toshiba, or VIDAA OS display on your church Wi-Fi.
                      </p>
                    </div>
                  </div>

                  {/* Status indicator badge */}
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 flex-shrink-0 ${
                    isAnyviewActive 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800' 
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${isAnyviewActive ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
                    {isAnyviewActive ? 'Connected' : 'Ready'}
                  </span>
                </div>

                {/* Primary Action Buttons */}
                <div className="mt-4 flex flex-wrap items-center gap-2.5 pt-2 border-t border-red-200/60 dark:border-red-900/40">
                  <button
                    onClick={handleLaunchAnyview}
                    disabled={isRequestingAnyview}
                    className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-600/25 transition disabled:opacity-50"
                  >
                    {isRequestingAnyview ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Searching for Anyview TV...</span>
                      </>
                    ) : (
                      <>
                        <Radio className="w-4 h-4" />
                        <span>Launch Anyview Wireless Cast</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleToggleAnyviewManual}
                    className={`px-4 py-3 rounded-2xl text-xs font-bold border transition ${
                      isAnyviewActive
                        ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                    title="Toggle casting active badge if you mirrored using phone Quick Settings"
                  >
                    {isAnyviewActive ? '✓ Anyview Active' : 'Mark Phone Mirrored'}
                  </button>
                </div>

                {anyviewStatusMessage && (
                  <div className="mt-3 p-3 rounded-xl bg-white dark:bg-slate-900 text-xs font-semibold border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200">
                    <Info className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span>{anyviewStatusMessage}</span>
                  </div>
                )}
              </div>

              {/* Step-by-Step Guide 1: Native Anyview Screen Mirroring */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-red-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    How to Connect via Anyview Cast (3 Steps)
                  </h4>
                </div>

                <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-2 pl-4 list-decimal">
                  <li>
                    <strong className="text-slate-900 dark:text-white">On your Hisense TV remote:</strong> Press the <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono font-bold text-slate-800 dark:text-slate-200">[INPUT]</span> or <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono font-bold text-slate-800 dark:text-slate-200">[HOME]</span> button and select <strong className="text-red-600">Anyview Cast</strong>. The TV screen will say <em>"Waiting for connection..."</em>.
                  </li>
                  <li>
                    <strong className="text-slate-900 dark:text-white">On your phone:</strong> Tap <strong className="text-red-600">"Launch Anyview Wireless Cast"</strong> above, or swipe down your phone's notification bar and tap <span className="font-bold">Smart View</span> (Samsung), <span className="font-bold">Cast / Screen Cast</span> (Android/Pixel), or <span className="font-bold">Wireless Projection</span>.
                  </li>
                  <li>
                    <strong className="text-slate-900 dark:text-white">Select TV:</strong> Choose your Hisense TV name from the list. Once connected, whatever you project in Asor Cast goes live immediately on the sanctuary TV!
                  </li>
                </ol>
              </div>

              {/* Step-by-Step Guide 2: Hisense Built-in VIDAA Browser (Best for Crisp 4K & No Notification Popups) */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Recommended: Hisense VIDAA TV Browser
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                    No Phone Calls on Sanctuary Screen
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Prefer not to mirror personal notifications or WhatsApp alerts to the congregation? Open the built-in <strong>VIDAA Browser</strong> on your Hisense TV, enter your church room code, and press fullscreen!
                </p>

                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-500 pl-1">Church Room Code:</span>
                  <span className="font-mono text-sm font-black text-red-600 tracking-wider">{roomCode}</span>
                  <div className="flex-1" />
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied URL' : 'Copy TV Link'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TV BROWSER / QR CODE */}
          {activeSubTab === 'qr' && (
            <div className="space-y-4 text-center">
              <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col items-center">
                <span className="text-xs uppercase font-bold text-red-600 tracking-wider mb-2">
                  Scan with Smart TV, Projector or Browser
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
                  <span>Works on Hisense VIDAA, Samsung, LG webOS, Fire TV Silk & Android TV</span>
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

          {/* TAB 3: GOOGLE CAST */}
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

          {/* TAB 4: HDMI / 2ND SCREEN */}
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
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isAnyviewActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
            <span className="text-xs text-slate-400 font-medium">
              {isAnyviewActive ? 'Live Casting Connected' : 'Ready to Cast'}
            </span>
          </div>
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

