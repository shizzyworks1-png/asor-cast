import { DisplayState } from '../types/presentation';
import { storageService } from './storageService';

type StateListener = (state: DisplayState) => void;

class CastSyncService {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<StateListener> = new Set();
  private connListeners: Set<(connected: boolean) => void> = new Set();
  private isCastAvailable: boolean = false;
  private castSession: any = null;
  private currentRoomCode: string = 'ASOR';
  private hasActiveReceiver: boolean = false;
  private isTvWindowOpen: boolean = false;

  constructor() {
    this.currentRoomCode = storageService.getRoomCode();
    this.initBroadcastChannel();
    this.initStorageListener();
    this.initGoogleCast();
  }

  public setRoomCode(code: string) {
    this.currentRoomCode = code.toUpperCase();
    storageService.setRoomCode(this.currentRoomCode);
    this.initBroadcastChannel();
  }

  public getRoomCode(): string {
    return this.currentRoomCode;
  }

  public isConnected(): boolean {
    return this.castSession !== null || this.isTvWindowOpen || this.hasActiveReceiver;
  }

  public subscribeConnection(listener: (connected: boolean) => void): () => void {
    this.connListeners.add(listener);
    listener(this.isConnected());
    return () => {
      this.connListeners.delete(listener);
    };
  }

  private notifyConnChange() {
    const conn = this.isConnected();
    this.connListeners.forEach((l) => {
      try { l(conn); } catch { /* ignore */ }
    });
  }

  private initBroadcastChannel() {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;

    if (this.channel) {
      try {
        this.channel.close();
      } catch {
        // ignore
      }
    }

    try {
      this.channel = new BroadcastChannel(`asor_cast_${this.currentRoomCode}`);
      this.channel.onmessage = (event) => {
        if (event.data && event.data.type === 'STATE_UPDATE') {
          this.notifyListeners(event.data.payload);
        } else if (event.data && event.data.type === 'PING_REQUEST') {
          // A new TV receiver just opened!
          this.hasActiveReceiver = true;
          this.notifyConnChange();
          const currentState = storageService.getDisplayState();
          this.broadcastState(currentState);
        } else if (event.data && (event.data.type === 'RECEIVER_HEARTBEAT' || event.data.type === 'RECEIVER_READY')) {
          this.hasActiveReceiver = true;
          this.notifyConnChange();
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel initialization error:', e);
    }
  }

  private initStorageListener() {
    if (typeof window === 'undefined') return;

    window.addEventListener('storage', (event) => {
      if (event.key === 'asor_cast_display_state_v1' && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          this.notifyListeners(parsed);
        } catch {
          // ignore
        }
      }
    });
  }

  private initGoogleCast() {
    if (typeof window === 'undefined') return;

    const checkCast = () => {
      const cast = (window as any).cast;
      const chrome = (window as any).chrome;
      if (cast && cast.framework && chrome && chrome.cast) {
        this.isCastAvailable = true;
        try {
          const context = cast.framework.CastContext.getInstance();
          context.setOptions({
            receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
            autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
          });

          context.addEventListener(
            cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
            (event: any) => {
              if (
                event.sessionState === cast.framework.SessionState.SESSION_STARTED ||
                event.sessionState === cast.framework.SessionState.SESSION_RESUMED
              ) {
                this.castSession = context.getCurrentSession();
              } else if (event.sessionState === cast.framework.SessionState.SESSION_ENDED) {
                this.castSession = null;
              }
            }
          );
        } catch {
          // ignore setup error
        }
      }
    };

    (window as any)['__onGCastApiAvailable'] = (isAvailable: boolean) => {
      if (isAvailable) checkCast();
    };

    // Also poll once if already loaded
    setTimeout(checkCast, 1500);
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(state: DisplayState) {
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch {
        // ignore
      }
    });
  }

  public broadcastState(state: DisplayState) {
    const updated = { ...state, updatedAt: Date.now() };
    storageService.saveDisplayState(updated);

    // Broadcast across windows / tabs / TV browser on same origin
    if (this.channel) {
      try {
        this.channel.postMessage({
          type: 'STATE_UPDATE',
          payload: updated
        });
      } catch {
        // fallback
      }
    }

    // Google Cast custom message if active
    if (this.castSession) {
      try {
        this.castSession.sendMessage('urn:x-cast:com.asorcast.presentation', updated);
      } catch {
        // ignore
      }
    }

    this.notifyListeners(updated);
  }

  public requestCurrentState() {
    if (this.channel) {
      try {
        this.channel.postMessage({ type: 'PING_REQUEST' });
      } catch {
        // ignore
      }
    }
  }

  public requestCastSession() {
    const cast = (window as any).cast;
    if (cast && cast.framework) {
      try {
        cast.framework.CastContext.getInstance().requestSession();
      } catch (e) {
        console.warn('Cast session request failed:', e);
      }
    }
  }

  public sendReceiverReady() {
    if (this.channel) {
      try {
        this.channel.postMessage({ type: 'RECEIVER_READY' });
      } catch {
        // ignore
      }
    }
  }

  public openDisplayWindow(): Window | null {
    if (typeof window === 'undefined') return null;
    this.isTvWindowOpen = true;
    this.notifyConnChange();
    const url = `${window.location.origin}${window.location.pathname}?mode=display&room=${this.currentRoomCode}`;
    return window.open(url, 'AsorCastDisplay', 'width=1280,height=720,menubar=no,toolbar=no');
  }

  public getDisplayUrl(): string {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}${window.location.pathname}?mode=display&room=${this.currentRoomCode}`;
  }
}

export const castService = new CastSyncService();
