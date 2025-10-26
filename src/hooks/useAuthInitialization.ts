/**
 * useAuthInitialization Hook
 *
 * Initializes authentication on app startup by checking localStorage for saved tokens.
 * This provides a backup authentication mechanism when cookies fail (e.g., Vercel proxy with HTTP backend).
 *
 * Flow:
 * 1. Check localStorage for saved authentication tokens
 * 2. If found and valid (not expired), restore the session
 * 3. Extract user info from JWT token
 * 4. Dispatch fulfilled login action to restore Redux state
 */

import { useState, useEffect } from "react";
import { useAppDispatch } from "../store/hooks";
import { authStorage } from "../utils/authStorage";
import { loginUser } from "../store/slices/authSlice";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp?: number;
  [key: string]: any;
}

export const useAuthInitialization = () => {
  const dispatch = useAppDispatch();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      console.log("🔍 Checking for saved authentication...");

      try {
        // Try to load tokens from localStorage on app init
        const savedTokens = authStorage.loadTokens();

        if (savedTokens?.accessToken) {
          try {
            // Decode token to check if it's expired
            const decoded = jwtDecode<DecodedToken>(savedTokens.accessToken);
            const isExpired = decoded.exp ? decoded.exp * 1000 < Date.now() : true;

            if (!isExpired) {
              // Token is still valid, restore session
              console.log("✅ Restoring session from localStorage");

              // Helper to extract claim value (handles arrays and single values)
              const takeClaimValue = (value: any) => {
                if (Array.isArray(value)) {
                  const first = value.find((v) => v !== undefined && v !== null);
                  return first !== undefined && first !== null ? String(first) : null;
                }
                return String(value);
              };

              // Helper to pick claim from multiple possible keys
              const pickClaim = (keys: string[]) => {
                for (const key of keys) {
                  const value = takeClaimValue(decoded[key]);
                  if (value) {
                    return value;
                  }
                }
                return null;
              };

              // Extract role from JWT
              const role = pickClaim([
                "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
                "role",
                "roles",
              ]);

              // Extract userId from JWT
              const userId = pickClaim([
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
                "sub",
                "userId",
                "UserId",
                "uid",
                "nameid",
              ]);

              // Restore session with saved tokens by dispatching fulfilled action
              dispatch(
                loginUser.fulfilled(
                  {
                    authData: savedTokens,
                    role,
                    userId,
                    userInfo: null, // Will be fetched by Navbar after restore
                  },
                  "",
                  {} as any
                )
              );

              console.log("✅ Session restored successfully from localStorage");
            } else {
              console.log("⚠️ Saved token is expired, clearing localStorage");
              authStorage.clearTokens();
            }
          } catch (error) {
            console.error("❌ Failed to decode saved token:", error);
            authStorage.clearTokens();
          }
        } else {
          console.log("ℹ️ No saved authentication found");
        }
      } catch (error) {
        console.error("❌ Failed to restore session from localStorage:", error);
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
