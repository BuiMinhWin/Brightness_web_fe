import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./AuthPage.css";
// import yogaImg from "/assets/yoga_register.png";
import logoImg from "/assets/logo_color.png";
import { authService } from "../../services";
import type { LoginRequest, RegisterRequest } from "../../models";

type AuthMode = "signin" | "signup";

type AuthFormValues = {
  email: string;
  userName: string;
  password: string;
};

const DEFAULT_ROLE = "user";
const DEFAULT_STATUS = "active";

const AuthPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [authMode, setAuthMode] = useState<AuthMode>(
    (searchParams.get("mode") as AuthMode) || "signin"
  );
  const [formValues, setFormValues] = useState<AuthFormValues>({
    email: "",
    userName: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const mode = searchParams.get("mode") as AuthMode;
    if (mode && (mode === "signin" || mode === "signup")) {
      setAuthMode(mode);
    }
  }, [searchParams]);

  const switchMode = (mode: AuthMode) => {
    if (mode === authMode) return;
    setAuthMode(mode);
    setSearchParams({ mode });
    setFormValues({ email: "", userName: "", password: "" });
    setShowPassword(false);
    setAgreeTerms(false);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);

      const trimmedEmail = formValues.email.trim();
      const trimmedUserName = formValues.userName.trim();

      if (authMode === "signup") {
        if (!agreeTerms) {
          alert("Please accept the terms to create an account");
          return;
        }

        const registerPayload: RegisterRequest = {
          email: trimmedEmail,
          userName: trimmedUserName || trimmedEmail,
          password: formValues.password,
          role: DEFAULT_ROLE,
          status: DEFAULT_STATUS,
        };

        const registerResponse = await authService.register(registerPayload);
        if (!registerResponse.flag) {
          throw new Error(registerResponse.message || "Registration failed");
        }

        const loginPayload: LoginRequest = {
          email: registerPayload.email,
          password: registerPayload.password,
        };
        const loginResponse = await authService.login(loginPayload);
        if (!loginResponse.flag) {
          throw new Error(loginResponse.message || "Auto-login failed after registration");
        }

        localStorage.setItem("auth", JSON.stringify(loginResponse));
        navigate("/", { replace: true });
      } else {
        const loginPayload: LoginRequest = {
          email: trimmedEmail,
          password: formValues.password,
        };
        const loginResponse = await authService.login(loginPayload);
        console.log("loginResponse", loginResponse.message);
        if (!loginResponse.flag) {
          throw new Error(loginResponse.message || "Login failed");
        }

        localStorage.setItem("auth", JSON.stringify(loginResponse));
        navigate("/home", { replace: true });
      }
    } catch (error) {
      console.error("Authentication error", error);
      const message = error instanceof Error ? error.message : "Authentication failed";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = () => {
    alert(`Google ${authMode === "signup" ? "sign up" : "sign in"} not implemented`);
  };

  const handleFacebookAuth = () => {
    alert(`Facebook ${authMode === "signup" ? "sign up" : "sign in"} not implemented`);
  };

  const isFormValid =
    authMode === "signup"
      ? Boolean(formValues.email && formValues.password && agreeTerms)
      : Boolean(formValues.email && formValues.password);

  return (
    <div className="auth-page">
      <div className={`auth-container ${authMode === "signup" ? "signup-mode" : ""}`}>
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
                value={isSubmitting ? "Signing in..." : "Login"}
                className={`btn solid ${isSubmitting ? "disabled" : ""}`}
                disabled={!isFormValid || isSubmitting}
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

            <form className="sign-up-form" onSubmit={handleSubmit}>
              <div className="signup-header">
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
                value={isSubmitting ? "Signing up..." : "Sign up"}
                className={`btn ${isFormValid ? "solid" : "disabled"}`}
                disabled={!isFormValid || isSubmitting}
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
    </div>
  );
};

export default AuthPage;
