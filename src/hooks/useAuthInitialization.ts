/**
 * useAuthInitialization Hook
 * 
 * Handles authentication initialization on app start:
 * - Attempts silent token refresh (auto-login via httpOnly cookie)
 * - Initializes AuthManager on successful authentication
 * - Manages loading states during initialization
 */

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { refreshAuthToken, selectIsAuthenticated, selectIsLoading } from '../store/slices/authSlice';
import { getAuthManager } from '../services/authManager';

interface UseAuthInitializationResult {
  isInitializing: boolean;
  isAuthenticated: boolean;
  initializationComplete: boolean;
}

export const useAuthInitialization = (): UseAuthInitializationResult => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsLoading);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initializationComplete, setInitializationComplete] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const attemptAutoLogin = async () => {
      try {
        console.log('🔐 Attempting auto-login via token refresh...');
        
        // Try to refresh token (will use httpOnly cookie if available)
        const result = await dispatch(refreshAuthToken()).unwrap();
        
        if (isMounted) {
          if (result) {
            console.log('✅ Auto-login successful');
            
            // Initialize AuthManager for authenticated session
            const authManager = getAuthManager();
            if (!authManager.isActive()) {
              authManager.initialize({
                onIdleWarning: () => {
                  // Show warning toast (you can implement this with MUI Snackbar)
                  console.warn('⚠️ Your session will expire in 2 minutes due to inactivity');
                },
                onIdleLogout: () => {
                  console.log('⏱️ Logging out due to inactivity');
                }
              });
            }
          } else {
            console.log('ℹ️ No active session found');
          }
        }
      } catch (error) {
        // Silent failure - user will need to log in manually
        if (isMounted) {
          console.log('ℹ️ Auto-login failed (no active session)');
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
          setInitializationComplete(true);
        }
      }
    };

    attemptAutoLogin();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  // Initialize AuthManager when user logs in after initialization
  useEffect(() => {
    if (initializationComplete && isAuthenticated) {
      const authManager = getAuthManager();
      if (!authManager.isActive()) {
        console.log('🔐 Initializing AuthManager for new session');
        authManager.initialize({
          onIdleWarning: () => {
            console.warn('⚠️ Your session will expire in 2 minutes due to inactivity');
          },
          onIdleLogout: () => {
            console.log('⏱️ Logging out due to inactivity');
          }
        });
      }
    }
  }, [isAuthenticated, initializationComplete]);

  // Cleanup AuthManager on unmount
  useEffect(() => {
    return () => {
      if (!isAuthenticated) {
        const authManager = getAuthManager();
        if (authManager.isActive()) {
          authManager.cleanup();
        }
      }
    };
  }, [isAuthenticated]);

  return {
    isInitializing: isInitializing || isLoading,
    isAuthenticated,
    initializationComplete
  };
};

export default useAuthInitialization;

