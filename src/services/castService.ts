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

  private presentationConnection: any = null;
  private isAnyviewConnectedManually: boolean = false;

  constructor() {
    this.currentRoomCode = storageService.getRoomCode();
    this.initBroadcastChannel();
    this.initStorageListener();
    this.initGoogleCast();
    this.initPresentationDefault();
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
    const isPresConnected = this.presentationConnection && this.presentationConnection.state === 'connected';
    return this.castSession !== null || this.isTvWindowOpen || this.hasActiveReceiver || isPresConnected || this.isAnyviewConnectedManually;
  }

  public setAnyviewConnected(connected: boolean) {
    this.isAnyviewConnectedManually = connected;
    this.notifyConnChange();
  }

  public isAnyviewActive(): boolean {
    const isPresConnected = this.presentationConnection && this.presentationConnection.state === 'connected';
    return isPresConnected || this.isAnyviewConnectedManually;
  }

  public isPresentationSupported(): boolean {
    return typeof window !== 'undefined' && 'PresentationRequest' in window;
  }

  private initPresentationDefault() {
    if (typeof window === 'undefined' || !('PresentationRequest' in window)) return;
    try {
      const url = this.getDisplayUrl();
      const request = new (window as any).PresentationRequest([url]);
      if ('presentation' in navigator && (navigator as any).presentation) {
        (navigator as any).presentation.defaultRequest = request;
      }
    } catch {
      // ignore
    }
  }

  public async requestAnyviewPresentation(): Promise<{ success: boolean; message: string; connected?: boolean }> {
    if (typeof window === 'undefined') {
      return { success: false, message: 'Window is not available' };
    }

    const url = this.getDisplayUrl();

    if ('PresentationRequest' in window) {
      try {
        const request = new (window as any).PresentationRequest([url]);
        const connection = await request.start();
        this.presentationConnection = connection;
        this.hasActiveReceiver = true;
        this.notifyConnChange();

        connection.addEventListener('connect', () => {
          this.hasActiveReceiver = true;
          this.notifyConnChange();
          this.broadcastState(storageService.getDisplayState());
        });

        connection.addEventListener('close', () => {
          this.presentationConnection = null;
          this.notifyConnChange();
        });

        connection.addEventListener('terminate', () => {
          this.presentationConnection = null;
          this.notifyConnChange();
        });

        // Send initial state immediately once connected
        setTimeout(() => {
          try {
            connection.send(JSON.stringify({
              type: 'STATE_UPDATE',
              payload: storageService.getDisplayState()
            }));
          } catch {
            // ignore
          }
        }, 800);

        return { success: true, message: 'Connected to Anyview / Wireless Display', connected: true };
      } catch (err: any) {
        if (err?.name === 'AbortError' || err?.name === 'NotAllowedError') {
          return { success: false, message: 'Wireless display selection was dismissed or cancelled.' };
        }
        return { 
          success: false, 
          message: err?.message || 'Direct Presentation request could not complete. Use phone Quick Settings (Smart View / Cast) or the Hisense TV Browser.' 
        };
      }
    }

    return {
      success: false,
      message: 'Direct web Presentation is best supported in Chrome / Android browsers. Use phone Smart View / Screen Mirroring or the Hisense VIDAA browser.'
    };
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

    // Wireless Display / Anyview Presentation API connection if active
    if (this.presentationConnection && this.presentationConnection.state === 'connected') {
      try {
        this.presentationConnection.send(JSON.stringify({
          type: 'STATE_UPDATE',
          payload: updated
        }));
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
