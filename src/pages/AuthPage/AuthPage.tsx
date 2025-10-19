import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./AuthPage.css";
// import yogaImg from "/assets/yoga_register.png";
import logoImg from "/assets/logo_color.png";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { loginUser, registerUser, loginWithExternalProvider } from "../../store/slices/authSlice";
import type { LoginRequest, RegisterRequest } from "../../models";
import { Snackbar, Alert } from "@mui/material";

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
  { value: "", label: "Select gender" },
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
  isNotDisplayed?: () => boolean;
  getNotDisplayedReason?: () => string;
  isSkippedMoment?: () => boolean;
  getSkippedReason?: () => string;
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

  // Handle navigation after successful login
  useEffect(() => {
    console.log("🔐 Auth state changed:", { isAuthenticated, userRole, isLoading, error });
    if (isAuthenticated && userRole && !isLoading) {
      if (authMode === "signup") {
        navigate("/fitness", { replace: true });
      } else {
        console.log("✅ Navigating to:", userRole === "admin" ? "/admin" : "/home");
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

    const existingScript = document.getElementById("google-identity-services") as HTMLScriptElement | null;
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

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
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
      // Sign in
      const loginPayload: LoginRequest = {
        email: trimmedEmail,
        password: formValues.password,
        rememberMe: rememberMe,
      };
      console.log("Dispatching login:", loginPayload);
      const result = await dispatch(loginUser(loginPayload));
      console.log("Login dispatch result:", result);

      // Check if login failed
      if (loginUser.rejected.match(result)) {
        console.error(" Login failed:", result.payload);
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
      if (notification?.isNotDisplayed?.()) {
        console.warn("Google prompt not displayed:", notification.getNotDisplayedReason?.());
        setIsGoogleLoading(false);
        setToast({
          open: true,
          message: "Google sign-in could not be displayed. Please check your pop-up blocker and try again.",
          severity: "error",
        });
      } else if (notification?.isSkippedMoment?.()) {
        console.warn("Google prompt skipped:", notification.getSkippedReason?.());
        setIsGoogleLoading(false);
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
              <h2 className="title">Sign in</h2>
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
              <div className="remember-me-container" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <label htmlFor="remember-me" style={{ cursor: 'pointer', fontSize: '14px', color: '#666' }}>
                  Keep me logged in for 30 days
                </label>
              </div>
              <a href="#" className="forgot-password">
                Forgot your password?
              </a>
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
                  {googleButtonLabel}
                </button>
                <button type="button" className="social-icon" onClick={handleFacebookAuth}>
                  Facebook
                </button>
              </div>
            </form>

            <form
              className="sign-up-form mt-10 overscroll-y-auto no-scrollbar"
              onSubmit={handleSubmit}
            >
              <div className="signup-header flex items-center flex-col mt-65 ">
                <div className="signup-logo" style={{ backgroundImage: `url(${logoImg})` }} />
                <h2 className="title">Create account</h2>
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
                {/* Gender Field */}
                <div className="flex flex-col w-1/2">
                  <label htmlFor="gender" className="mb-1 text-sm font-medium text-gray-700">
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formValues.gender}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  >
                    {GENDER_OPTIONS.map((option) => (
                      <option
                        key={option.value || "gender-placeholder"}
                        value={option.value}
                        disabled={option.value === ""}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date of Birth Field */}
                <div className="flex flex-col w-1/2">
                  <label htmlFor="dateOfBirth" className="mb-1 text-sm font-medium text-gray-700">
                    Date of Birth
                  </label>
                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    placeholder="Date of birth"
                    value={formValues.dateOfBirth}
                    onChange={handleInputChange}
                    autoComplete="bday"
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  />
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
                  {googleButtonLabel}
                </button>
                <button type="button" className="social-icon" onClick={handleFacebookAuth}>
                  Facebook
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="panels-container">
          <div className="panel left-panel">
            <div className="content">
              <h3>New here?</h3>
              <p>Join Brightness to track your goals and stay motivated.</p>
              <button className="btn transparent" onClick={() => switchMode("signup")}>
                Sign up
              </button>
            </div>
            {/* <img src={yogaImg} className="image" alt="Yoga" /> */}
          </div>
          <div className="panel right-panel">
            <div className="content">
              <h3>One of us?</h3>
              <p>Sign in to access your personalized fitness dashboard.</p>
              <button className="btn transparent" onClick={() => switchMode("signin")}>
                Sign in
              </button>
            </div>
            {/* <img src={yogaImg} className="image" alt="Yoga" /> */}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
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
