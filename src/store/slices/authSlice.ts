import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import { authService } from "../../services/authService";
import type {
  AuthData,
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
  // Auth data
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpiresAt: string | null;
  refreshTokenExpiresAt: string | null;

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
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  accessTokenExpiresAt: null,
  refreshTokenExpiresAt: null,
  userId: null,
  userRole: null,
  userInfo: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isRefreshing: false,
};

// Helper function to decode token and extract user info
const decodeToken = (token: string) => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    const userId = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
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

// Async thunk for token refresh
export const refreshAuthToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const { refreshToken } = state.auth;

      if (!refreshToken) {
        return rejectWithValue("No refresh token available");
      }

      const response = await authService.refreshToken(refreshToken);

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

// Async thunk for logout
export const logoutUser = createAsyncThunk("auth/logoutUser", async (_, { rejectWithValue }) => {
  try {
    // Here you could call a logout endpoint if your API has one
    // For now, we just clear the local state
    return true;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Logout failed");
  }
});

// Async thunk to load auth state from localStorage (for app initialization)
export const loadAuthFromStorage = createAsyncThunk(
  "auth/loadFromStorage",
  async (_, { rejectWithValue }) => {
    try {
      console.log("📦 Checking storage for auth...");
      console.log("📦 All localStorage keys:", Object.keys(localStorage));
      console.log("📦 All sessionStorage keys:", Object.keys(sessionStorage));

      // Try sessionStorage first, then localStorage
      let authJson = sessionStorage.getItem("auth") || localStorage.getItem("auth");
      console.log("📦 Auth data from storage:", authJson ? "FOUND" : "NOT FOUND");

      if (!authJson) {
        return rejectWithValue("No auth data in storage");
      }

      const authData: AuthData = JSON.parse(authJson);

      // Check if token is still valid
      if (isTokenExpired(authData.accessToken)) {
        return rejectWithValue("Token expired");
      }

      const { role, userId } = decodeToken(authData.accessToken);

      // Fetch user info if we have userId
      let userInfo: UserModel | null = null;
      if (userId) {
        try {
          userInfo = await authService.getUser(userId);
        } catch (error) {
          console.warn("Failed to fetch user info:", error);
        }
      }

      return {
        authData,
        role,
        userId,
        userInfo,
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to load auth from storage"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAuth: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.accessTokenExpiresAt = null;
      state.refreshTokenExpiresAt = null;
      state.userId = null;
      state.userRole = null;
      state.userInfo = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isRefreshing = false;
      state.isLoading = false;
      // Note: Redux Persist will automatically sync this to storage
    },
    setUserInfo: (state, action: PayloadAction<UserModel>) => {
      state.userInfo = action.payload;
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
        state.refreshToken = authData.refreshToken;
        state.accessTokenExpiresAt = authData.accessTokenExpiresAt;
        state.refreshTokenExpiresAt = authData.refreshTokenExpiresAt;
        state.userRole = role;
        state.userId = userId;
        state.userInfo = userInfo;

        // Note: Redux Persist automatically handles localStorage persistence
      })
      .addCase(loginUser.rejected, (state, action) => {
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
        state.refreshToken = authData.refreshToken;
        state.accessTokenExpiresAt = authData.accessTokenExpiresAt;
        state.refreshTokenExpiresAt = authData.refreshTokenExpiresAt;
        state.userRole = role;
        state.userId = userId;
        state.userInfo = userInfo;

        // Note: Redux Persist automatically handles localStorage persistence
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
        state.accessToken = authData.accessToken;
        state.refreshToken = authData.refreshToken;
        state.accessTokenExpiresAt = authData.accessTokenExpiresAt;
        state.refreshTokenExpiresAt = authData.refreshTokenExpiresAt;
        state.userRole = role;
        state.userId = userId;

        // Note: Redux Persist automatically handles storage
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

      // Load from storage cases
      .addCase(loadAuthFromStorage.pending, (state) => {
        console.log("🔄 Loading auth from storage...");
        state.isLoading = true;
      })
      .addCase(loadAuthFromStorage.fulfilled, (state, action) => {
        console.log("✅ Auth loaded from storage:", action.payload);
        state.isLoading = false;
        state.isAuthenticated = true;
        state.error = null;

        const { authData, role, userId, userInfo } = action.payload;
        state.accessToken = authData.accessToken;
        state.refreshToken = authData.refreshToken;
        state.accessTokenExpiresAt = authData.accessTokenExpiresAt;
        state.refreshTokenExpiresAt = authData.refreshTokenExpiresAt;
        state.userRole = role;
        state.userId = userId;
        state.userInfo = userInfo;
      })
      .addCase(loadAuthFromStorage.rejected, (state, action) => {
        console.log("❌ Failed to load auth from storage:", action.payload);
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = null; // Don't show error for failed storage load
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
      })

      // Handle Redux Persist REHYDRATE action (must be after all addCase calls)
      .addMatcher(
        (action) => action.type === "persist/REHYDRATE",
        (state) => {
          console.log("🔄 REHYDRATE action caught, resetting loading state");
          // Always reset loading state after rehydration
          state.isLoading = false;
          state.error = null;
        }
      );
  },
});

export const { clearError, clearAuth, setUserInfo } = authSlice.actions;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectUserRole = (state: { auth: AuthState }) => state.auth.userRole;
export const selectUserId = (state: { auth: AuthState }) => state.auth.userId;
export const selectUserInfo = (state: { auth: AuthState }) => state.auth.userInfo;
export const selectAccessToken = (state: { auth: AuthState }) => state.auth.accessToken;
export const selectRefreshToken = (state: { auth: AuthState }) => state.auth.refreshToken;
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectIsRefreshing = (state: { auth: AuthState }) => state.auth.isRefreshing;

export default authSlice.reducer;
