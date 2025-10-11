import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import { authService } from "../../services/authService";
import type { AuthData, LoginRequest, LoginResponse, UserModel } from "../../models/auth";

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

      // Don't fetch user info during login - it requires auth which we just got
      // We'll fetch it later if needed
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
      const authJson = localStorage.getItem("auth");
      if (!authJson) {
        return rejectWithValue("No auth data in storage");
      }

      const authData: AuthData = JSON.parse(authJson);

      // Check if token is still valid
      if (isTokenExpired(authData.accessToken)) {
        localStorage.removeItem("auth");
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
      localStorage.removeItem("auth");
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
      localStorage.removeItem("auth");
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

        // Store in localStorage for persistence
        localStorage.setItem("auth", JSON.stringify(authData));
        console.log("💾 Auth saved to localStorage");
      })
      .addCase(loginUser.rejected, (state, action) => {
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

        // Update localStorage
        localStorage.setItem("auth", JSON.stringify(authData));
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
      });
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
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectIsRefreshing = (state: { auth: AuthState }) => state.auth.isRefreshing;

export default authSlice.reducer;
