import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import { authService } from "../../services/authService";
import { authStorage } from "../../utils/authStorage";
import type {
  AuthData,
  ExternalLoginRequest,
  LoginRequest,
  LoginResponse,
  UserModel,
  RegisterRequest,
} from "../../models/auth";

interface DecodedToken {
  exp?: number;
  [key: string]: any;
}

interface AuthState {
  // Auth data (access token only - refresh token in httpOnly cookie)
  accessToken: string | null;
  accessTokenExpiresAt: string | null;

  // User info
  userId: string | null;
  userRole: string | null;
  userInfo: UserModel | null;

  // Status
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Token refresh
  isRefreshing: boolean;

  // Session management
  lastActivity: number | null; // Timestamp of last user activity
  sessionStartTime: number | null; // Timestamp when session started
  isTabActive: boolean; // Whether the current tab is active/visible
}

const initialState: AuthState = {
  accessToken: null,
  accessTokenExpiresAt: null,
  userId: null,
  userRole: null,
  userInfo: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isRefreshing: false,
  lastActivity: null,
  sessionStartTime: null,
  isTabActive: true,
};

// Helper function to decode token and extract user info
const decodeToken = (token: string) => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);

    const takeClaimValue = (value: unknown) => {
      if (value === undefined || value === null) {
        return null;
      }
      if (Array.isArray(value)) {
        const [first] = value;
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

    const role = pickClaim([
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
      "role",
      "roles",
    ]);

    const userId = pickClaim([
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
      "sub",
      "userId",
      "UserId",
      "uid",
      "nameid",
    ]);

    return { role, userId };
  } catch (error) {
    console.error("Failed to decode token:", error);
    return { role: null, userId: null };
  }
};

// Helper function to check if token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return (decoded.exp ?? 0) < currentTime;
  } catch {
    return true;
  }
};

// Async thunk for login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      console.log("🔐 Attempting login...");
      const response = await authService.login(credentials);
      console.log("📥 Login response:", response);

      if (!response.flag || !response.data) {
        console.error("❌ Login failed:", response.message);
        return rejectWithValue(response.message || "Login failed");
      }

      const { accessToken } = response.data;
      const { role, userId } = decodeToken(accessToken);
      console.log("🔓 Decoded token:", { role, userId });

      // Don't fetch user info during login to avoid timing issues
      // The Navbar will fetch it automatically after login
      const userInfo: UserModel | null = null;

      return {
        authData: response.data,
        role,
        userId,
        userInfo,
      };
    } catch (error) {
      console.error("❌ Login error:", error);
      return rejectWithValue(error instanceof Error ? error.message : "Login failed");
    }
  }
);

// Async thunk for external provider login (e.g., Google)
export const loginWithExternalProvider = createAsyncThunk(
  "auth/loginWithExternalProvider",
  async (payload: ExternalLoginRequest, { rejectWithValue }) => {
    try {
      console.log("[Auth] Attempting external login...", payload.provider);
      const response = await authService.externalLogin(payload);
      console.log("[Auth] External login response:", response);

      if (!response.flag || !response.data) {
        console.error("[Auth] External login failed:", response.message);
        return rejectWithValue(response.message || "External login failed");
      }

      const { accessToken } = response.data;
      const { role, userId } = decodeToken(accessToken);
      console.log("[Auth] External login decoded token:", { role, userId });

      const userInfo: UserModel | null = null;

      return {
        authData: response.data,
        role,
        userId,
        userInfo,
      };
    } catch (error) {
      console.error("[Auth] External login error:", error);
      return rejectWithValue(error instanceof Error ? error.message : "External login failed");
    }
  }
);

// Async thunk for registration
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (registerData: RegisterRequest, { rejectWithValue }) => {
    try {
      console.log("📝 Attempting registration...");
      const registerResponse = await authService.register(registerData);
      console.log("📥 Registration response:", registerResponse);

      if (!registerResponse.flag) {
        console.error("❌ Registration failed:", registerResponse.message);
        return rejectWithValue(registerResponse.message || "Registration failed");
      }

      // After successful registration, auto-login
      console.log("🔐 Auto-login after registration...");
      const loginPayload: LoginRequest = {
        email: registerData.email,
        password: registerData.password,
      };

      const loginResponse = await authService.login(loginPayload);

      if (!loginResponse.flag || !loginResponse.data) {
        console.error("❌ Auto-login failed:", loginResponse.message);
        return rejectWithValue(loginResponse.message || "Auto-login failed after registration");
      }

      const { accessToken } = loginResponse.data;
      const { role, userId } = decodeToken(accessToken);
      console.log("🔓 Auto-login successful:", { role, userId });

      const userInfo: UserModel | null = null;

      return {
        authData: loginResponse.data,
        role,
        userId,
        userInfo,
      };
    } catch (error) {
      console.error("❌ Registration error:", error);
      return rejectWithValue(error instanceof Error ? error.message : "Registration failed");
    }
  }
);

// Async thunk for token refresh (refresh token now in httpOnly cookie)
export const refreshAuthToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      // Refresh token is now in httpOnly cookie - backend reads it automatically
      const response = await authService.refreshToken();

      if (!response.flag || !response.data) {
        return rejectWithValue("Failed to refresh token");
      }

      const { accessToken } = response.data;
      const { role, userId } = decodeToken(accessToken);

      return {
        authData: response.data,
        role,
        userId,
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Token refresh failed");
    }
  }
);

// Async thunk to fetch user info
export const fetchUserInfo = createAsyncThunk(
  "auth/fetchUserInfo",
  async (userId: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: AuthState };

      // Double-check we have a valid token before trying to fetch
      if (!state.auth.accessToken) {
        console.warn("⚠️ Cannot fetch user info: No access token");
        return rejectWithValue("No access token available");
      }

      console.log("👤 Fetching user info for:", userId);
      const userInfo = await authService.getUser(userId);
      console.log("✅ User info loaded:", userInfo);
      return userInfo;
    } catch (error) {
      console.error("❌ Failed to fetch user info:", error);
      // Don't propagate the error - we don't want to break auth flow
      return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch user info");
    }
  }
);

// Async thunk for logout (refresh token in httpOnly cookie)
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      // Refresh token is in httpOnly cookie - backend will read it
      try {
        await authService.revokeToken();
      } catch (err) {
        console.warn("Failed to revoke refresh token:", err);
      }

      return true;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Logout failed");
    }
  }
);

// Note: loadAuthFromStorage has been removed - auto-login now uses silent token refresh via httpOnly cookies

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAuth: (state) => {
      state.accessToken = null;
      state.accessTokenExpiresAt = null;
      state.userId = null;
      state.userRole = null;
      state.userInfo = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isRefreshing = false;
      state.isLoading = false;
      state.lastActivity = null;
      state.sessionStartTime = null;
      
      // Clear localStorage
      authStorage.clearTokens();
    },
    setUserInfo: (state, action: PayloadAction<UserModel>) => {
      state.userInfo = action.payload;
    },
    updateLastActivity: (state) => {
      state.lastActivity = Date.now();
    },
    setTabActive: (state, action: PayloadAction<boolean>) => {
      state.isTabActive = action.payload;
    },
    setSessionStartTime: (state, action: PayloadAction<number>) => {
      state.sessionStartTime = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log("✅ LOGIN SUCCESS:", action.payload);
        state.isLoading = false;
        state.isAuthenticated = true;
        state.error = null;

        const { authData, role, userId, userInfo } = action.payload;
        state.accessToken = authData.accessToken;
        state.accessTokenExpiresAt = authData.accessTokenExpiresAt;
        state.userRole = role;
        state.userId = userId;
        state.userInfo = userInfo;
        
        // Set session tracking
        state.sessionStartTime = Date.now();
        state.lastActivity = Date.now();
        
        // Save to localStorage as backup
        authStorage.saveTokens(authData);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })

      // External login cases
      .addCase(loginWithExternalProvider.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithExternalProvider.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.error = null;

        const { authData, role, userId, userInfo } = action.payload;
        state.accessToken = authData.accessToken;
        state.accessTokenExpiresAt = authData.accessTokenExpiresAt;
        state.userRole = role;
        state.userId = userId;
        state.userInfo = userInfo;

        state.sessionStartTime = Date.now();
        state.lastActivity = Date.now();
        
        // Save to localStorage as backup
        authStorage.saveTokens(authData);
      })
      .addCase(loginWithExternalProvider.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })

      // Registration cases
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        console.log("✅ REGISTRATION SUCCESS:", action.payload);
        state.isLoading = false;
        state.isAuthenticated = true;
        state.error = null;

        const { authData, role, userId, userInfo } = action.payload;
        state.accessToken = authData.accessToken;
        state.accessTokenExpiresAt = authData.accessTokenExpiresAt;
        state.userRole = role;
        state.userId = userId;
        state.userInfo = userInfo;
        
        // Set session tracking
        state.sessionStartTime = Date.now();
        state.lastActivity = Date.now();
        
        // Save to localStorage as backup
        authStorage.saveTokens(authData);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })

      // Refresh token cases
      .addCase(refreshAuthToken.pending, (state) => {
        state.isRefreshing = true;
        state.error = null;
      })
      .addCase(refreshAuthToken.fulfilled, (state, action) => {
        state.isRefreshing = false;
        state.error = null;

        const { authData, role, userId } = action.payload;
        
        // Save refreshed tokens to localStorage
        authStorage.saveTokens(authData);
        state.accessToken = authData.accessToken;
        state.accessTokenExpiresAt = authData.accessTokenExpiresAt;
        state.userRole = role;
        state.userId = userId;
        state.isAuthenticated = true;
        
        // Update activity on successful refresh
        state.lastActivity = Date.now();
      })
      .addCase(refreshAuthToken.rejected, (state, action) => {
        state.isRefreshing = false;
        state.isAuthenticated = false;
        state.error = action.payload as string;
        // Clear auth data on refresh failure
        authSlice.caseReducers.clearAuth(state);
      })

      // Logout cases
      .addCase(logoutUser.fulfilled, (state) => {
        authSlice.caseReducers.clearAuth(state);
      })

      // Fetch user info cases
      .addCase(fetchUserInfo.pending, (state) => {
        // Don't set isLoading to prevent UI flicker
        console.log("🔄 Fetching user info...");
      })
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        console.log("✅ User info fetched successfully");
        state.userInfo = action.payload;
      })
      .addCase(fetchUserInfo.rejected, (state, action) => {
        console.log("⚠️ Failed to fetch user info (non-critical):", action.payload);
        // Don't set error - failing to fetch user info shouldn't break the app
        // User will just see a placeholder avatar
      });
  },
});

export const { clearError, clearAuth, setUserInfo, updateLastActivity, setTabActive, setSessionStartTime } = authSlice.actions;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectUserRole = (state: { auth: AuthState }) => state.auth.userRole;
export const selectUserId = (state: { auth: AuthState }) => state.auth.userId;
export const selectUserInfo = (state: { auth: AuthState }) => state.auth.userInfo;
export const selectAccessToken = (state: { auth: AuthState }) => state.auth.accessToken;
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectIsRefreshing = (state: { auth: AuthState }) => state.auth.isRefreshing;
export const selectLastActivity = (state: { auth: AuthState }) => state.auth.lastActivity;
export const selectSessionStartTime = (state: { auth: AuthState }) => state.auth.sessionStartTime;
export const selectIsTabActive = (state: { auth: AuthState }) => state.auth.isTabActive;

export default authSlice.reducer;
