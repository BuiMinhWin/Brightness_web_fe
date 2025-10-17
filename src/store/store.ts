import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import adminReducer from "./slices/adminSlice";

/**
 * Redux store configuration
 * 
 * Note: Redux Persist has been removed for security reasons.
 * - Access tokens are stored in memory only (Redux state)
 * - Refresh tokens are stored in httpOnly cookies (backend-managed)
 * - Auto-login is handled via silent token refresh on app initialization
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
