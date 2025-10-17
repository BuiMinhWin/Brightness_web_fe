/**
 * Authentication Manager
 * 
 * Manages authentication lifecycle including:
 * - Activity tracking
 * - Idle timeout
 * - Background token refresh
 * - Tab synchronization
 * - Automatic logout
 */

import { jwtDecode } from 'jwt-decode';
import { store } from '../store/store';
import { 
  updateLastActivity, 
  setTabActive, 
  clearAuth,
  refreshAuthToken,
  logoutUser,
  selectAccessToken,
  selectIsAuthenticated,
  selectLastActivity,
  selectIsTabActive
} from '../store/slices/authSlice';
import { 
  getTabSync, 
  broadcastLogin, 
  broadcastLogout, 
  broadcastActivity,
  broadcastTokenRefresh,
  type TabSyncEvent 
} from '../utils/tabSync';

// Configuration (can be overridden by environment variables)
const IDLE_TIMEOUT_MS = Number(import.meta.env.VITE_IDLE_TIMEOUT_MS) || 1800000; // 30 minutes
const IDLE_WARNING_BEFORE_MS = Number(import.meta.env.VITE_IDLE_WARNING_BEFORE_MS) || 120000; // 2 minutes
const TOKEN_REFRESH_BEFORE_EXPIRY_MS = Number(import.meta.env.VITE_TOKEN_REFRESH_BEFORE_EXPIRY_MS) || 300000; // 5 minutes
const ACTIVITY_CHECK_INTERVAL_MS = 30000; // 30 seconds
const ACTIVITY_THROTTLE_MS = 1000; // 1 second

interface DecodedToken {
  exp?: number;
  [key: string]: any;
}

class AuthManager {
  private activityTimer: NodeJS.Timeout | null = null;
  private idleCheckTimer: NodeJS.Timeout | null = null;
  private tokenRefreshTimer: NodeJS.Timeout | null = null;
  private lastActivityTimestamp: number = Date.now();
  private activityThrottleTimer: NodeJS.Timeout | null = null;
  private tabSyncUnsubscribe: (() => void) | null = null;
  private isInitialized: boolean = false;
  private idleWarningShown: boolean = false;
  private onIdleWarning?: () => void;
  private onIdleLogout?: () => void;

  /**
   * Initialize the auth manager
   */
  public initialize(options?: {
    onIdleWarning?: () => void;
    onIdleLogout?: () => void;
  }): void {
    if (this.isInitialized) {
      console.warn('AuthManager already initialized');
      return;
    }

    this.onIdleWarning = options?.onIdleWarning;
    this.onIdleLogout = options?.onIdleLogout;

    console.log('🔐 Initializing AuthManager');

    // Setup activity tracking
    this.setupActivityListeners();

    // Setup idle timeout checker
    this.setupIdleTimer();

    // Setup token refresh timer
    this.setupTokenRefreshTimer();

    // Setup tab synchronization
    this.setupTabSync();

    // Setup visibility tracking
    this.setupVisibilityTracking();

    this.isInitialized = true;
    console.log('✅ AuthManager initialized');
  }

  /**
   * Setup activity event listeners
   */
  private setupActivityListeners(): void {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    events.forEach(event => {
      document.addEventListener(event, this.handleActivity, { passive: true });
    });
  }

  /**
   * Handle user activity
   */
  private handleActivity = (): void => {
    const now = Date.now();

    // Throttle activity updates to avoid excessive Redux dispatches
    if (now - this.lastActivityTimestamp < ACTIVITY_THROTTLE_MS) {
      return;
    }

    this.lastActivityTimestamp = now;

    // Update Redux state
    store.dispatch(updateLastActivity());

    // Reset idle warning flag
    this.idleWarningShown = false;

    // Broadcast activity to other tabs (throttled)
    if (!this.activityThrottleTimer) {
      this.activityThrottleTimer = setTimeout(() => {
        broadcastActivity();
        this.activityThrottleTimer = null;
      }, 5000); // Broadcast at most every 5 seconds
    }
  };

  /**
   * Setup idle timeout checker
   */
  private setupIdleTimer(): void {
    // Check for idle every 30 seconds
    this.idleCheckTimer = setInterval(() => {
      this.checkIdleStatus();
    }, ACTIVITY_CHECK_INTERVAL_MS);
  }

  /**
   * Check if user is idle and handle accordingly
   */
  private checkIdleStatus(): void {
    const state = store.getState();
    const isAuthenticated = selectIsAuthenticated(state);
    const lastActivity = selectLastActivity(state);
    const isTabActive = selectIsTabActive(state);

    if (!isAuthenticated || !lastActivity) {
      return;
    }

    const timeSinceLastActivity = Date.now() - lastActivity;
    const timeUntilTimeout = IDLE_TIMEOUT_MS - timeSinceLastActivity;

    // Show warning before timeout
    if (timeUntilTimeout <= IDLE_WARNING_BEFORE_MS && timeUntilTimeout > 0 && !this.idleWarningShown) {
      this.idleWarningShown = true;
      const minutesRemaining = Math.ceil(timeUntilTimeout / 60000);
      console.warn(`⚠️ Session will expire in ${minutesRemaining} minute(s) due to inactivity`);
      
      if (this.onIdleWarning) {
        this.onIdleWarning();
      }
    }

    // Logout if idle timeout exceeded
    if (timeSinceLastActivity >= IDLE_TIMEOUT_MS) {
      console.log('⏱️ Idle timeout exceeded, logging out');
      
      if (this.onIdleLogout) {
        this.onIdleLogout();
      }

      this.handleIdleLogout();
    }
  }

  /**
   * Handle automatic logout due to idle timeout
   */
  private async handleIdleLogout(): Promise<void> {
    try {
      await store.dispatch(logoutUser());
      broadcastLogout();
      window.location.href = '/auth?mode=signin';
    } catch (error) {
      console.error('Failed to logout on idle:', error);
      store.dispatch(clearAuth());
      window.location.href = '/auth?mode=signin';
    }
  }

  /**
   * Setup automatic token refresh before expiry
   */
  private setupTokenRefreshTimer(): void {
    // Check token expiry every minute
    this.tokenRefreshTimer = setInterval(() => {
      this.checkAndRefreshToken();
    }, 60000); // Check every minute
  }

  /**
   * Check if token needs refresh and refresh if necessary
   */
  private async checkAndRefreshToken(): Promise<void> {
    const state = store.getState();
    const accessToken = selectAccessToken(state);
    const isAuthenticated = selectIsAuthenticated(state);
    const isTabActive = selectIsTabActive(state);

    if (!isAuthenticated || !accessToken) {
      return;
    }

    // Don't refresh if tab is not active (save resources)
    if (!isTabActive) {
      console.log('⏸️ Tab inactive, skipping token refresh check');
      return;
    }

    try {
      const decoded = jwtDecode<DecodedToken>(accessToken);
      const expiresAt = (decoded.exp ?? 0) * 1000; // Convert to milliseconds
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;

      // Refresh if token expires within the configured window
      if (timeUntilExpiry > 0 && timeUntilExpiry <= TOKEN_REFRESH_BEFORE_EXPIRY_MS) {
        const minutesRemaining = Math.round(timeUntilExpiry / 60000);
        console.log(`🔄 Token expires in ${minutesRemaining} minute(s), refreshing...`);
        
        await store.dispatch(refreshAuthToken());
        broadcastTokenRefresh();
        
        console.log('✅ Token refreshed successfully');
      }
    } catch (error) {
      console.error('Failed to check/refresh token:', error);
    }
  }

  /**
   * Setup tab synchronization
   */
  private setupTabSync(): void {
    const tabSync = getTabSync();

    this.tabSyncUnsubscribe = tabSync.subscribe((event: TabSyncEvent) => {
      this.handleTabSyncEvent(event);
    });
  }

  /**
   * Handle tab sync events from other tabs
   */
  private handleTabSyncEvent(event: TabSyncEvent): void {
    switch (event.type) {
      case 'LOGIN':
        console.log('🔐 Login detected from another tab');
        // Optionally refresh the page or update state
        break;

      case 'LOGOUT':
        console.log('🚪 Logout detected from another tab');
        store.dispatch(clearAuth());
        window.location.href = '/auth?mode=signin';
        break;

      case 'TOKEN_REFRESHED':
        console.log('🔄 Token refresh detected from another tab');
        // The token is in httpOnly cookie, so all tabs benefit automatically
        break;

      case 'ACTIVITY':
        // Update last activity timestamp to prevent premature logout in this tab
        store.dispatch(updateLastActivity());
        this.idleWarningShown = false;
        break;
    }
  }

  /**
   * Setup visibility tracking
   */
  private setupVisibilityTracking(): void {
    document.addEventListener('visibilitychange', () => {
      const isVisible = !document.hidden;
      store.dispatch(setTabActive(isVisible));

      if (isVisible) {
        console.log('👁️ Tab became visible, resuming auth checks');
        // Check token status immediately when tab becomes visible
        this.checkAndRefreshToken();
      } else {
        console.log('😴 Tab hidden, pausing background refreshes');
      }
    });
  }

  /**
   * Manually trigger a token refresh
   */
  public async refreshToken(): Promise<void> {
    try {
      await store.dispatch(refreshAuthToken());
      broadcastTokenRefresh();
    } catch (error) {
      console.error('Manual token refresh failed:', error);
      throw error;
    }
  }

  /**
   * Notify other tabs about login
   */
  public notifyLogin(userId: string): void {
    broadcastLogin(userId);
  }

  /**
   * Notify other tabs about logout
   */
  public notifyLogout(): void {
    broadcastLogout();
  }

  /**
   * Cleanup and stop all timers
   */
  public cleanup(): void {
    console.log('🧹 Cleaning up AuthManager');

    // Clear timers
    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
      this.activityTimer = null;
    }

    if (this.idleCheckTimer) {
      clearInterval(this.idleCheckTimer);
      this.idleCheckTimer = null;
    }

    if (this.tokenRefreshTimer) {
      clearInterval(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }

    if (this.activityThrottleTimer) {
      clearTimeout(this.activityThrottleTimer);
      this.activityThrottleTimer = null;
    }

    // Remove event listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.removeEventListener(event, this.handleActivity);
    });

    // Unsubscribe from tab sync
    if (this.tabSyncUnsubscribe) {
      this.tabSyncUnsubscribe();
      this.tabSyncUnsubscribe = null;
    }

    this.isInitialized = false;
    console.log('✅ AuthManager cleaned up');
  }

  /**
   * Check if manager is initialized
   */
  public isActive(): boolean {
    return this.isInitialized;
  }
}

// Singleton instance
let authManagerInstance: AuthManager | null = null;

/**
 * Get the global auth manager instance
 */
export const getAuthManager = (): AuthManager => {
  if (!authManagerInstance) {
    authManagerInstance = new AuthManager();
  }
  return authManagerInstance;
};

/**
 * Cleanup the global auth manager
 */
export const cleanupAuthManager = (): void => {
  if (authManagerInstance) {
    authManagerInstance.cleanup();
    authManagerInstance = null;
  }
};

export default getAuthManager;

