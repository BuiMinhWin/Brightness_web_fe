/**
 * Tab Synchronization Utility
 * Synchronizes authentication state across multiple browser tabs
 * Uses BroadcastChannel API for modern browsers with localStorage fallback
 */

export type TabSyncEvent = 
  | { type: 'LOGIN'; payload: { userId: string; timestamp: number } }
  | { type: 'LOGOUT'; payload: { timestamp: number } }
  | { type: 'TOKEN_REFRESHED'; payload: { timestamp: number } }
  | { type: 'ACTIVITY'; payload: { timestamp: number } };

type TabSyncCallback = (event: TabSyncEvent) => void;

class TabSyncManager {
  private channel: BroadcastChannel | null = null;
  private callbacks: Set<TabSyncCallback> = new Set();
  private readonly channelName = 'auth-sync-channel';
  private readonly storageKey = 'auth-sync-event';
  private useBroadcastChannel: boolean;

  constructor() {
    // Check if BroadcastChannel is supported
    this.useBroadcastChannel = typeof BroadcastChannel !== 'undefined';
    
    if (this.useBroadcastChannel) {
      this.initBroadcastChannel();
    } else {
      this.initLocalStorageFallback();
    }
  }

  /**
   * Initialize BroadcastChannel for modern browsers
   */
  private initBroadcastChannel(): void {
    try {
      this.channel = new BroadcastChannel(this.channelName);
      
      this.channel.onmessage = (event: MessageEvent<TabSyncEvent>) => {
        this.notifyCallbacks(event.data);
      };

      this.channel.onmessageerror = (error) => {
        console.error('BroadcastChannel message error:', error);
      };
    } catch (error) {
      console.error('Failed to initialize BroadcastChannel:', error);
      // Fallback to localStorage
      this.useBroadcastChannel = false;
      this.initLocalStorageFallback();
    }
  }

  /**
   * Initialize localStorage fallback for older browsers
   */
  private initLocalStorageFallback(): void {
    window.addEventListener('storage', this.handleStorageEvent);
  }

  /**
   * Handle storage events (fallback method)
   */
  private handleStorageEvent = (event: StorageEvent): void => {
    if (event.key === this.storageKey && event.newValue) {
      try {
        const syncEvent: TabSyncEvent = JSON.parse(event.newValue);
        this.notifyCallbacks(syncEvent);
      } catch (error) {
        console.error('Failed to parse storage event:', error);
      }
    }
  };

  /**
   * Broadcast an event to all other tabs
   */
  public broadcast(event: TabSyncEvent): void {
    if (this.useBroadcastChannel && this.channel) {
      try {
        this.channel.postMessage(event);
      } catch (error) {
        console.error('Failed to broadcast message:', error);
      }
    } else {
      // Use localStorage for fallback
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(event));
        // Clear immediately to allow repeated events with same data
        setTimeout(() => {
          localStorage.removeItem(this.storageKey);
        }, 100);
      } catch (error) {
        console.error('Failed to broadcast via localStorage:', error);
      }
    }
  }

  /**
   * Subscribe to tab sync events
   */
  public subscribe(callback: TabSyncCallback): () => void {
    this.callbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback);
    };
  }

  /**
   * Notify all subscribers of an event
   */
  private notifyCallbacks(event: TabSyncEvent): void {
    this.callbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Tab sync callback error:', error);
      }
    });
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    
    if (!this.useBroadcastChannel) {
      window.removeEventListener('storage', this.handleStorageEvent);
    }
    
    this.callbacks.clear();
  }
}

// Singleton instance
let tabSyncInstance: TabSyncManager | null = null;

/**
 * Get the global tab sync instance
 */
export const getTabSync = (): TabSyncManager => {
  if (!tabSyncInstance) {
    tabSyncInstance = new TabSyncManager();
  }
  return tabSyncInstance;
};

/**
 * Cleanup the global tab sync instance
 */
export const cleanupTabSync = (): void => {
  if (tabSyncInstance) {
    tabSyncInstance.cleanup();
    tabSyncInstance = null;
  }
};

/**
 * Broadcast login event to other tabs
 */
export const broadcastLogin = (userId: string): void => {
  getTabSync().broadcast({
    type: 'LOGIN',
    payload: { userId, timestamp: Date.now() }
  });
};

/**
 * Broadcast logout event to other tabs
 */
export const broadcastLogout = (): void => {
  getTabSync().broadcast({
    type: 'LOGOUT',
    payload: { timestamp: Date.now() }
  });
};

/**
 * Broadcast token refresh event to other tabs
 */
export const broadcastTokenRefresh = (): void => {
  getTabSync().broadcast({
    type: 'TOKEN_REFRESHED',
    payload: { timestamp: Date.now() }
  });
};

/**
 * Broadcast user activity to other tabs
 */
export const broadcastActivity = (): void => {
  getTabSync().broadcast({
    type: 'ACTIVITY',
    payload: { timestamp: Date.now() }
  });
};

export default getTabSync;

