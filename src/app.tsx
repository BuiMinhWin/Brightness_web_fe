import React, { useEffect } from "react";
import Router from "./routes/Router";
import { ThemeProvider } from "@mui/material/styles";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import theme from "./mui/theme";
import { store, persistor } from "./store/store";

const App: React.FC = () => {
  // One-time cleanup of old manual localStorage items
  useEffect(() => {
    const AUTH_VERSION = "v1.0";
    const storedVersion = localStorage.getItem("auth-version");
    
    if (storedVersion !== AUTH_VERSION) {
      console.log("🧹 Cleaning up old localStorage items");
      // Remove old manual localStorage items (from before Redux Persist)
      localStorage.removeItem("user"); // Old mock user data
      localStorage.removeItem("token"); // Old token storage
      localStorage.removeItem("auth"); // Old auth data
      localStorage.setItem("auth-version", AUTH_VERSION);
      console.log("✅ Cleanup complete");
    }
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider theme={theme}>
          <Router />
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
