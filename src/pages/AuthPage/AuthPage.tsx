import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./AuthPage.css";
import logoImg from "/assets/logo_color.png";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { loginUser, registerUser, loginWithExternalProvider } from "../../store/slices/authSlice";
import type { LoginRequest, RegisterRequest } from "../../models";
import { Snackbar, Alert } from "@mui/material";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type AuthMode = "signin" | "signup";

type AuthFormValues = {
  email: string;
  userName: string;
  password: string;
  fullName?: string;
  gender?: string;
  dateOfBirth?: string;
};

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
] as const;

const INITIAL_FORM_VALUES: AuthFormValues = {
  email: "",
  userName: "",
  password: "",
  fullName: "",
  gender: "",
  dateOfBirth: "",
};

interface GoogleCredentialResponse {
  credential?: string;
  select_by?: string;
}

interface GooglePromptNotification {
  isDismissed?: () => boolean;
  getDismissedReason?: () => string;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (options: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
            ux_mode?: "popup" | "redirect";
            auto_select?: boolean;
            context?: "signin" | "signup" | "use";
            use_fedcm_for_prompt?: boolean;
          }) => void;
          prompt: (momentListener?: (notification: GooglePromptNotification) => void) => void;
          renderButton?: (element: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

const AuthPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, userRole, isLoading, error } = useAppSelector((state) => state.auth);
  const [searchParams, setSearchParams] = useSearchParams();
  const [authMode, setAuthMode] = useState<AuthMode>(
    (searchParams.get("mode") as AuthMode) || "signin"
  );
  const [formValues, setFormValues] = useState<AuthFormValues>({ ...INITIAL_FORM_VALUES });
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "error" as "error" | "success" | "info" | "warning",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const googleScriptInitialized = useRef(false);

  useEffect(() => {
    console.log("Origin:", window.location.origin);
  }, []);

  useEffect(() => {
    const mode = searchParams.get("mode") as AuthMode;
    if (mode && (mode === "signin" || mode === "signup")) {
      setAuthMode(mode);
    }
  }, [searchParams]);

  useEffect(() => {
    console.log(" Auth state changed:", { isAuthenticated, userRole, isLoading, error });
    if (isAuthenticated && userRole && !isLoading) {
      if (authMode === "signup") {
        navigate("/fitness", { replace: true });
      } else {
        console.log(" Navigating to:", userRole === "admin" ? "/admin" : "/home");
        if (userRole === "admin") {
          navigate("/admin", { replace: true });
        } else if (userRole === "user") {
          navigate("/home", { replace: true });
        }
      }
    }
  }, [isAuthenticated, userRole, isLoading, navigate, error, authMode]);

  const handleGoogleCredentialResponse = useCallback(
    async (response: GoogleCredentialResponse) => {
      if (!response?.credential) {
        setIsGoogleLoading(false);
        setToast({
          open: true,
          message: "Google did not provide a credential. Please try again.",
          severity: "error",
        });
        return;
      }

      try {
        await dispatch(
          loginWithExternalProvider({
            provider: "Google",
            token: response.credential,
          })
        ).unwrap();

        setToast({
          open: true,
          message: `Successfully ${authMode === "signup" ? "signed up" : "signed in"} with Google.`,
          severity: "success",
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : typeof err === "string"
              ? err
              : "Google authentication failed. Please try again.";
        setToast({
          open: true,
          message: errorMessage,
          severity: "error",
        });
      } finally {
        setIsGoogleLoading(false);
      }
    },
    [authMode, dispatch, setToast]
  );

  const initializeGoogleAccounts = useCallback(() => {
    if (!googleClientId || !googleClientId.trim() || !window.google?.accounts?.id) {
      return;
    }

    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleGoogleCredentialResponse,
      ux_mode: "popup",
      auto_select: false,
      context: authMode === "signup" ? "signup" : "signin",
      use_fedcm_for_prompt: true,
    });

    setIsGoogleReady(true);
  }, [authMode, googleClientId, handleGoogleCredentialResponse]);

  useEffect(() => {
    if (!googleClientId || !googleClientId.trim()) {
      setIsGoogleReady(false);
      return;
    }

    if (window.google?.accounts?.id) {
      initializeGoogleAccounts();
      return;
    }

    if (googleScriptInitialized.current) {
      return;
    }

    const existingScript = document.getElementById(
      "google-identity-services"
    ) as HTMLScriptElement | null;
    if (existingScript) {
      const onLoad = () => initializeGoogleAccounts();
      existingScript.addEventListener("load", onLoad);
      googleScriptInitialized.current = true;

      return () => {
        existingScript.removeEventListener("load", onLoad);
      };
    }

    const script = document.createElement("script");
    script.id = "google-identity-services";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      initializeGoogleAccounts();
    };
    script.onerror = () => {
      setIsGoogleReady(false);
      setToast({
        open: true,
        message: "Unable to load Google authentication. Please try again later.",
        severity: "error",
      });
    };

    document.head.appendChild(script);
    googleScriptInitialized.current = true;

    return () => {
      script.onload = null;
    };
  }, [googleClientId, initializeGoogleAccounts, setToast]);

  const switchMode = (mode: AuthMode) => {
    if (mode === authMode) return;
    setAuthMode(mode);
    setSearchParams({ mode });
    setFormValues({ ...INITIAL_FORM_VALUES });
    setShowPassword(false);
    setAgreeTerms(false);
    setRememberMe(false);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenderChange = (value: string) => {
    setFormValues((prev) => ({ ...prev, gender: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedEmail = formValues.email.trim();
    const trimmedUserName = formValues.userName.trim();
    const trimmedFullName = formValues.fullName?.trim();

    if (authMode === "signup") {
      if (!agreeTerms) {
        alert("Please accept the terms to create an account");
        return;
      }

      const registerPayload: RegisterRequest = {
        email: trimmedEmail,
        userName: trimmedUserName || trimmedEmail,
        password: formValues.password,
        role: "user",
        status: "active",
        ...(trimmedFullName ? { fullName: trimmedFullName } : {}),
        ...(formValues.gender ? { gender: formValues.gender } : {}),
        ...(formValues.dateOfBirth ? { dateOfBirth: formValues.dateOfBirth } : {}),
      };

      console.log("Dispatching registration:", registerPayload);
      const result = await dispatch(registerUser(registerPayload));
      console.log("Registration dispatch result:", result);
    } else {
      const loginPayload: LoginRequest = {
        email: trimmedEmail,
        password: formValues.password,
        rememberMe: rememberMe,
      };
      console.log("Dispatching login:", loginPayload);
      const result = await dispatch(loginUser(loginPayload));
      console.log("Login dispatch result:", result);

      if (loginUser.rejected.match(result)) {
        console.error("Login failed:", result.payload);
        setToast({
          open: true,
          message: (result.payload as string) || "Login failed. Please check your credentials.",
          severity: "error",
        });
      }
    }
  };

  const handleGoogleAuth = useCallback(() => {
    if (!googleClientId || !googleClientId.trim()) {
      setToast({
        open: true,
        message: "Google sign-in is not configured. Please contact support.",
        severity: "error",
      });
      return;
    }

    if (!window.google?.accounts?.id || !isGoogleReady) {
      setToast({
        open: true,
        message: "Google authentication is still initializing. Please try again shortly.",
        severity: "info",
      });
      return;
    }

    setIsGoogleLoading(true);
    window.google.accounts.id.prompt((notification) => {
      if (notification.isDismissed?.()) {
        const dismissedReason = notification.getDismissedReason?.();
        console.warn(`Google prompt dismissed. Reason: ${dismissedReason}`);
        setIsGoogleLoading(false);

        // Only show a toast if the prompt was not displayed due to a browser issue.
        if (
          dismissedReason === "browser_not_supported" ||
          dismissedReason === "suppressed_by_user"
        ) {
          setToast({
            open: true,
            message:
              "Google sign-in could not be displayed. Please check your browser settings or pop-up blocker and try again.",
            severity: "warning",
          });
        }
        // For other dismiss reasons (e.g., user closed the prompt), we don't need to show a message.
      }
    });
  }, [googleClientId, isGoogleReady, setToast]);

  const handleFacebookAuth = () => {
    setToast({
      open: true,
      message: `Facebook ${authMode === "signup" ? "sign up" : "sign in"} not implemented yet`,
      severity: "info",
    });
  };

  const handleCloseToast = () => {
    setToast({ ...toast, open: false });
  };

  const isFormValid =
    authMode === "signup"
      ? Boolean(formValues.email && formValues.password && agreeTerms)
      : Boolean(formValues.email && formValues.password);

  const googleButtonLabel = isGoogleLoading ? "Processing..." : "Google";
  const googleButtonDisabled =
    isGoogleLoading || !isGoogleReady || !googleClientId || !googleClientId.trim();

  return (
    <div className="auth-page">
      <div className={`auth-container ${authMode === "signup" ? "signup-mode" : ""}`}>
        {error && (
          <div
            className="error-message"
            style={{
              color: "red",
              textAlign: "center",
              padding: "10px",
              marginBottom: "20px",
              backgroundColor: "#ffe6e6",
              border: "1px solid #ffcccc",
              borderRadius: "4px",
            }}
          >
            {error}
          </div>
        )}
        <div className="forms-container">
          <div className="signin-signup">
            <form className="sign-in-form" onSubmit={handleSubmit}>
              <div className="signin-header flex items-center flex-row justify-center gap-3 mb-5">
                <div
                  className="signin-logo"
                  style={{ backgroundImage: `url(${logoImg})`, marginBottom: 0 }}
                />
                <h2 className="title" style={{ marginBottom: 0 }}>
                  Sign in
                </h2>
              </div>
              <div className="input-field">
                <input
                  name="email"
                  type="text"
                  placeholder="Username or Email"
                  value={formValues.email}
                  onChange={handleInputChange}
                  autoComplete="username"
                  required
                />
              </div>
              <div className="input-field">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formValues.password}
                  onChange={handleInputChange}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                  maxWidth: "380px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    maxWidth: "380px",
                    marginBottom: "5px",
                    gap: "30px",
                  }}
                >
                  <div
                    className="remember-me-container"
                    style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0" }}
                  >
                    <input
                      type="checkbox"
                      id="remember-me"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={{ cursor: "pointer" }}
                    />
                    <label
                      htmlFor="remember-me"
                      style={{
                        cursor: "pointer",
                        fontSize: "14px",
                        color: "#666",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Remember me for 30 days
                    </label>
                  </div>
                  <a
                    href="#"
                    className="forgot-password"
                    style={{ margin: 0, whiteSpace: "nowrap", marginLeft: "auto" }}
                  >
                    Forgot your password?
                  </a>
                </div>
              </div>
              <input
                type="submit"
                value={isLoading ? "Signing in..." : "Login"}
                className={`btn solid ${isLoading ? "disabled" : ""}`}
                disabled={!isFormValid || isLoading}
              />

              <p className="social-text">Or Sign in with social platforms</p>
              <div className="social-media">
                <button
                  type="button"
                  className="social-icon"
                  onClick={handleGoogleAuth}
                  disabled={googleButtonDisabled}
                  aria-busy={isGoogleLoading}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 488 512"
                    width="26"
                    height="26"
                    style={{ marginRight: 8 }}
                  >
                    <path
                      fill="#EA4335"
                      d="M488 261.8c0-17.4-1.4-34-4.1-50.3H249v95.1h134c-5.8 30-23.2 55.4-49.2 72.4v59h79.3c46.5-42.8 74-106 74-176.2z"
                    ></path>
                    <path
                      fill="#34A853"
                      d="M249 492c66.3 0 121.8-21.9 162.5-59.1l-79.3-59c-22.1 14.9-50.2 23.8-83.2 23.8-63.9 0-118-43.1-137.4-101.1H30v63.4C70.9 437 153.6 492 249 492z"
                    ></path>
                    <path
                      fill="#4A90E2"
                      d="M111.6 296.6c-4.8-14.3-7.6-29.6-7.6-45.6s2.7-31.3 7.6-45.6V142H30c-15.6 31.3-24.6 66.7-24.6 108s9 76.7 24.6 108l81.6-61.4z"
                    ></path>
                    <path
                      fill="#FBBC05"
                      d="M249 97.8c36 0 68.1 12.4 93.6 36.6l70-70C370.8 25 315.3 0 249 0 153.6 0 70.9 55 30 142l81.6 63.4C131 140.9 185.1 97.8 249 97.8z"
                    ></path>
                  </svg>
                  Google
                </button>

                <button type="button" className="social-icon" onClick={handleFacebookAuth}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 320 512"
                    width="26"
                    height="26"
                    fill="#1877F2"
                    style={{ marginRight: 8 }}
                  >
                    <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06H293V6.26S259.5 0 225.36 0C141.09 0 89.09 54.42 89.09 153.31v68.03H0v92.66h89.09V512h107.83V288z"></path>
                  </svg>
                  Facebook
                </button>
              </div>
            </form>

            <form
              className="sign-up-form mt-10 overscroll-y-auto no-scrollbar"
              onSubmit={handleSubmit}
            >
              <div className="signup-header flex items-center flex-row justify-center gap-3 mt-30 mb-5">
                <div
                  className="signup-logo"
                  style={{ backgroundImage: `url(${logoImg})`, marginBottom: 0 }}
                />
                <h2 className="title" style={{ marginBottom: 0 }}>
                  Create account
                </h2>
              </div>
              <p className="subtitle">Join Brightness to track your wellness journey.</p>

              <div className="input-field">
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={formValues.email}
                  onChange={handleInputChange}
                  autoComplete="email"
                  required
                />
              </div>
              <div className="input-field">
                <input
                  name="fullName"
                  type="text"
                  placeholder="Full name"
                  value={formValues.fullName}
                  onChange={handleInputChange}
                  autoComplete="name"
                />
              </div>
              <div className="input-field">
                <input
                  name="userName"
                  type="text"
                  placeholder="Username"
                  value={formValues.userName}
                  onChange={handleInputChange}
                  autoComplete="username"
                />
              </div>
              <div className="input-field">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formValues.password}
                  onChange={handleInputChange}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <div className="flex justify-between gap-20">
                {/* Gender Field with shadcn/ui Select */}
                <div className="flex flex-col w-1/2">
                  <label htmlFor="gender" className="mb-1 text-sm font-medium text-gray-700">
                    Gender
                  </label>
                  <Select value={formValues.gender} onValueChange={handleGenderChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDER_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date of Birth Field */}
                <div className="flex flex-col w-1/2">
                  <label htmlFor="dateOfBirth" className="mb-1 text-sm font-medium text-gray-700">
                    Date of Birth
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal rounded-lg border-gray-300 hover:border-blue-500 hover:bg-white"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formValues.dateOfBirth ? (
                          format(new Date(formValues.dateOfBirth), "PPP")
                        ) : (
                          <span className="text-gray-500">Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2" align="start">
                      <Calendar
                        mode="single"
                        selected={formValues.dateOfBirth ? new Date(formValues.dateOfBirth) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            setFormValues((prev) => ({
                              ...prev,
                              dateOfBirth: format(date, "yyyy-MM-dd"),
                            }));
                          }
                        }}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                        captionLayout="dropdown"
                        fromYear={1900}
                        toYear={new Date().getFullYear()}
                        classNames={{
                          month: "space-y-2 w-full",
                          table: "w-full border-collapse",
                          head_cell: "text-muted-foreground rounded-md w-8 font-normal text-xs",
                          cell: "h-8 w-8 text-center text-sm p-0 relative",
                          day: "h-8 w-8 p-0 font-normal text-sm aria-selected:opacity-100",
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="terms-checkbox">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                <label htmlFor="terms">
                  By creating an account, I agree to our <a href="#">terms of use</a> and
                  <a href="#"> Privacy Policy</a>
                </label>
              </div>

              <input
                type="submit"
                value={isLoading ? "Signing up..." : "Sign up"}
                className={`btn ${isFormValid ? "solid" : "disabled"}`}
                disabled={!isFormValid || isLoading}
              />

              <div className="signin-divider">
                <span>OR</span>
              </div>

              <div className="social-media">
                <button
                  type="button"
                  className="social-icon"
                  onClick={handleGoogleAuth}
                  disabled={googleButtonDisabled}
                  aria-busy={isGoogleLoading}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 488 512"
                    width="26"
                    height="26"
                    style={{ marginRight: 8 }}
                  >
                    <path
                      fill="#EA4335"
                      d="M488 261.8c0-17.4-1.4-34-4.1-50.3H249v95.1h134c-5.8 30-23.2 55.4-49.2 72.4v59h79.3c46.5-42.8 74-106 74-176.2z"
                    ></path>
                    <path
                      fill="#34A853"
                      d="M249 492c66.3 0 121.8-21.9 162.5-59.1l-79.3-59c-22.1 14.9-50.2 23.8-83.2 23.8-63.9 0-118-43.1-137.4-101.1H30v63.4C70.9 437 153.6 492 249 492z"
                    ></path>
                    <path
                      fill="#4A90E2"
                      d="M111.6 296.6c-4.8-14.3-7.6-29.6-7.6-45.6s2.7-31.3 7.6-45.6V142H30c-15.6 31.3-24.6 66.7-24.6 108s9 76.7 24.6 108l81.6-61.4z"
                    ></path>
                    <path
                      fill="#FBBC05"
                      d="M249 97.8c36 0 68.1 12.4 93.6 36.6l70-70C370.8 25 315.3 0 249 0 153.6 0 70.9 55 30 142l81.6 63.4C131 140.9 185.1 97.8 249 97.8z"
                    ></path>
                  </svg>
                  Google
                </button>

                <button type="button" className="social-icon" onClick={handleFacebookAuth}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 320 512"
                    width="26"
                    height="26"
                    fill="#1877F2"
                    style={{ marginRight: 8 }}
                  >
                    <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06H293V6.26S259.5 0 225.36 0C141.09 0 89.09 54.42 89.09 153.31v68.03H0v92.66h89.09V512h107.83V288z"></path>
                  </svg>
                  Facebook
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="panels-container">
          <div className="panel left-panel">
            <div className="panel-blur">
              <div className="content">
                <h3>New here?</h3>
                <p>Join Brightness to track your goals and stay motivated.</p>
                <button className="btn transparent" onClick={() => switchMode("signup")}>
                  Sign up
                </button>
              </div>
            </div>
          </div>

          <div className="panel right-panel">
            <div className="panel-blur">
              <div className="content">
                <h3>One of us?</h3>
                <p>Sign in to continue your wellness journey.</p>
                <button className="btn transparent" onClick={() => switchMode("signin")}>
                  Sign in
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: "100%" }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AuthPage;
