import React, { createContext, useContext, useState, useCallback } from "react";
import { Snackbar, Alert, AlertColor } from "@mui/material";

interface ToastOptions {
  message: string;
  severity?: AlertColor;
  duration?: number;
}

interface ToastContextType {
  showToast: (messageOrOptions: string | ToastOptions, severity?: AlertColor, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
    duration: number;
  }>({
    open: false,
    message: "",
    severity: "info",
    duration: 6000,
  });

  const showToast = useCallback((messageOrOptions: string | ToastOptions, severity?: AlertColor, duration?: number) => {
    if (typeof messageOrOptions === "string") {
      // Called with separate parameters: showToast("message", "severity")
      setToast({
        open: true,
        message: messageOrOptions,
        severity: severity || "info",
        duration: duration || 6000,
      });
    } else {
      // Called with options object: showToast({ message: "...", severity: "..." })
      setToast({
        open: true,
        message: messageOrOptions.message,
        severity: messageOrOptions.severity || "info",
        duration: messageOrOptions.duration || 6000,
      });
    }
  }, []);

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    setToast((prev) => ({ ...prev, open: false }));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        open={toast.open}
        autoHideDuration={toast.duration}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ 
          mt: 7,
          zIndex: 99999, // Ensure toast appears above all modals
        }}
      >
        <Alert
          onClose={handleClose}
          severity={toast.severity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

