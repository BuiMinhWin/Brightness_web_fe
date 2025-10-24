import React, { useEffect } from "react";
import Router from "./routes/Router";
import { ThemeProvider } from "@mui/material/styles";
import { Provider } from "react-redux";
import { CircularProgress, Box } from "@mui/material";
import theme from "./mui/theme";
import { store } from "./store/store";
import { useAuthInitialization } from "./hooks/useAuthInitialization";
import { ToastProvider } from "./hooks/useToast";

/**
 * App Content with Auth Initialization
 * Separated to use hooks after Provider
 */
const AppContent: React.FC = () => {
  const { isInitializing } = useAuthInitialization();

  // One-time cleanup of old localStorage items
  useEffect(() => {
    const AUTH_VERSION = "v2.0"; // Updated version for cookie-based auth
    const storedVersion = localStorage.getItem("auth-version");
    
    if (storedVersion !== AUTH_VERSION) {
      console.log("🧹 Cleaning up old localStorage items");
      // Remove old manual localStorage items and Redux Persist data
      localStorage.removeItem("user"); // Old mock user data
      localStorage.removeItem("token"); // Old token storage
      localStorage.removeItem("auth"); // Old auth data
      localStorage.removeItem("persist:brightnest-auth"); // Old Redux Persist data
      localStorage.setItem("auth-version", AUTH_VERSION);
      console.log("✅ Cleanup complete - migrated to cookie-based auth");
    }
  }, []);

  // Show loading indicator during initial authentication check
  if (isInitializing) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return <Router />;
};

/**
 * Main App Component
 * 
 * Note: Authentication now uses:
 * - httpOnly cookies for refresh tokens (secure, not accessible via JavaScript)
 * - Access tokens in memory (Redux state, lost on page refresh)
 * - Auto-login via silent token refresh on app initialization
 * - AuthManager for activity tracking, idle timeout, and tab synchronization
 */
const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
