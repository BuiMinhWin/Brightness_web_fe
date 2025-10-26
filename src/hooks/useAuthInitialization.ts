import { useState, useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import { authStorage } from '../utils/authStorage';
import { loginUser } from '../store/slices/authSlice';
import { jwtDecode } from 'jwt-decode';

/**
 * Hook to initialize authentication from localStorage on app start
 * This provides a fallback when cookies aren't available or fail
 */
export const useAuthInitialization = () => {
  const dispatch = useAppDispatch();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔍 Checking for saved authentication...');
      
      try {
        // Try to load tokens from localStorage on app init
        const savedTokens = authStorage.loadTokens();
        
        if (savedTokens?.accessToken) {
          // Decode token to check if it's expired
          const decoded = jwtDecode<any>(savedTokens.accessToken);
          const isExpired = decoded.exp ? decoded.exp * 1000 < Date.now() : true;
          
          if (!isExpired) {
            // Token is still valid, restore session
            console.log('✅ Restoring session from localStorage');
            
            // Helper to extract claim value
            const takeClaimValue = (value: any) => {
              if (Array.isArray(value)) {
                const first = value.find(v => v !== undefined && v !== null);
                return first !== undefined && first !== null ? String(first) : null;
              }
              return String(value);
            };

            const pickClaim = (keys: string[]) => {
              for (const key of keys) {
                const value = takeClaimValue(decoded[key]);
                if (value) {
                  return value;
                }
              }
              return null;
            };

            // Extract role
            const role = pickClaim([
              "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
              "role",
              "roles",
            ]);

            // Extract userId
            const userId = pickClaim([
              "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
              "sub",
              "userId",
              "UserId",
              "uid",
              "nameid",
            ]);
            
            // Restore session with saved tokens
            dispatch(loginUser.fulfilled({
              authData: savedTokens,
              role,
              userId,
              userInfo: null,
            }, '', {} as any));
            
            console.log('✅ Session restored successfully');
          } else {
            console.log('⚠️ Saved token is expired, clearing localStorage');
            authStorage.clearTokens();
          }
        } else {
          console.log('ℹ️ No saved authentication found');
        }
      } catch (error) {
        console.error('❌ Failed to restore session from localStorage:', error);
        authStorage.clearTokens();
      } finally {
        // Always complete initialization, even if there's an error
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, [dispatch]);

  return { isInitializing };
};
