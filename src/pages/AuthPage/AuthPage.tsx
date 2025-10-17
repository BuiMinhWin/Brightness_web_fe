import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./AuthPage.css";
// import yogaImg from "/assets/yoga_register.png";
import logoImg from "/assets/logo_color.png";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { loginUser, registerUser } from "../../store/slices/authSlice";
import { authService } from "../../services";
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
  const navigate = useNavigate();

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

  const switchMode = (mode: AuthMode) => {
    if (mode === authMode) return;
    setAuthMode(mode);
    setSearchParams({ mode });
    setFormValues({ ...INITIAL_FORM_VALUES });
    setShowPassword(false);
    setAgreeTerms(false);
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
        role: "user",
        status: "active",
      };

      console.log("Dispatching registration:", registerPayload);
      const result = await dispatch(registerUser(registerPayload));
      console.log("Registration dispatch result:", result);
    } else {
      // Sign in
      const loginPayload: LoginRequest = {
        email: trimmedEmail,
        password: formValues.password,
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

  const handleGoogleAuth = () => {
    setToast({
      open: true,
      message: `Google ${authMode === "signup" ? "sign up" : "sign in"} not implemented yet`,
      severity: "info",
    });
  };

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
                <button type="button" className="social-icon" onClick={handleGoogleAuth}>
                  Google
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
                <button type="button" className="social-icon" onClick={handleGoogleAuth}>
                  Google
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
