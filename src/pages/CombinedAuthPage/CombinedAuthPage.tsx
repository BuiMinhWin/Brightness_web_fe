import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./CombinedAuthPage.css";
import yogaSignInImg from "/assets/yoga.png";
import yogaSignUpImg from "/assets/yoga_register.png";
import logoImg from "/assets/logo_color.png";
import { authService } from "../../services";
import type { LoginRequest, RegisterRequest } from "../../models";

const DEFAULT_ROLE = "user";
const DEFAULT_STATUS = "active";

const CombinedAuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "signup") {
      setIsSignUp(true);
    }
  }, [searchParams]);

  const resetForm = () => {
    setEmail("");
    setUserName("");
    setPassword("");
    setShowPassword(false);
    setAgreeTerms(false);
  };

  const handleModeSwitch = (toSignUp: boolean) => {
    if (isAnimating || toSignUp === isSignUp) return;

    setIsAnimating(true);
    setIsSignUp(toSignUp);
    resetForm();

    const newMode = toSignUp ? "signup" : "signin";
    navigate(`/auth?mode=${newMode}`, { replace: true });

    setTimeout(() => setIsAnimating(false), 600);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);

    try {
      const trimmedEmail = email.trim();

      if (isSignUp) {
        const registerPayload: RegisterRequest = {
          email: trimmedEmail,
          userName: userName.trim(),
          password,
          role: DEFAULT_ROLE,
          status: DEFAULT_STATUS,
        };

        const registerRes = await authService.register(registerPayload);
        if (!registerRes.flag) {
          throw new Error(registerRes.message || "Registration failed");
        }

        const loginPayload: LoginRequest = { email: registerPayload.email, password };
        const loginRes = await authService.login(loginPayload);
        if (!loginRes.flag) {
          throw new Error(loginRes.message || "Auto-login failed after registration");
        }

        localStorage.setItem("auth", JSON.stringify(loginRes));
        navigate("/", { replace: true });
      } else {
        const loginPayload: LoginRequest = { email: trimmedEmail, password };
        const loginRes = await authService.login(loginPayload);
        if (!loginRes.flag) {
          throw new Error(loginRes.message || "Login failed");
        }

        localStorage.setItem("auth", JSON.stringify(loginRes));
        navigate("/", { replace: true });
      }
    } catch (error) {
      console.error("Auth error:", error);
      const message =
        error instanceof Error ? error.message : "Authentication failed. Please try again.";
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    alert(`Google ${isSignUp ? "sign up" : "sign in"} not implemented`);
  };

  const handleFacebookAuth = () => {
    alert(`Facebook ${isSignUp ? "sign up" : "sign in"} not implemented`);
  };

  const isFormValid = isSignUp
    ? Boolean(email && userName && password && agreeTerms)
    : Boolean(email && password);

  const imageVariants = {
    enterLeft: { x: -100, opacity: 0 },
    enterRight: { x: 100, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exitLeft: { x: -100, opacity: 0 },
    exitRight: { x: 100, opacity: 0 },
  };

  const formVariants = {
    enterLeft: { x: -50, opacity: 0 },
    enterRight: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exitLeft: { x: -50, opacity: 0 },
    exitRight: { x: 50, opacity: 0 },
  };

  return (
    <div className="auth-page">
      <AnimatePresence initial={false} custom={isSignUp}>
        <motion.div
          key={isSignUp ? "signup" : "signin"}
          className="auth-image-container"
          custom={isSignUp}
          initial={isSignUp ? "enterRight" : "enterLeft"}
          animate="center"
          exit={isSignUp ? "exitLeft" : "exitRight"}
          variants={imageVariants}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <img src={isSignUp ? yogaSignUpImg : yogaSignInImg} alt="Yoga" className="auth-image" />
        </motion.div>

        <motion.div
          key={`form-${isSignUp ? "signup" : "signin"}`}
          className="auth-form-container"
          custom={isSignUp}
          initial={isSignUp ? "enterLeft" : "enterRight"}
          animate="center"
          exit={isSignUp ? "exitRight" : "exitLeft"}
          variants={formVariants}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <div className="auth-card">
            <div className="auth-header">
              <div className="auth-logo" style={{ backgroundImage: `url(${logoImg})` }} />
              <h1 className="auth-title">{isSignUp ? "Create an account" : "Sign in"}</h1>
              <p className="auth-subtitle">
                {isSignUp
                  ? "Join Brightness to track your wellness journey."
                  : "Welcome back! Please enter your details."}
              </p>
            </div>

            <div className="auth-mode-switch">
              <span className="auth-switch-text">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}
              </span>
              <button
                className="auth-switch-btn"
                onClick={() => handleModeSwitch(!isSignUp)}
                disabled={isAnimating}
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <label className="auth-label">Email</label>
                <input
                  type="email"
                  className="auth-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=""
                  autoComplete="email"
                  required
                />
              </div>

              {isSignUp && (
                <div className="auth-field">
                  <label className="auth-label">Username</label>
                  <input
                    type="text"
                    className="auth-input"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder=""
                    autoComplete="username"
                    required
                  />
                </div>
              )}

              <div className="auth-field">
                <label className="auth-label">{isSignUp ? "Password" : "Your password"}</label>
                <div className="auth-password-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="auth-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder=""
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                    required
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    <span>{showPassword ? "Hide" : "Show"}</span>
                  </button>
                </div>

                {!isSignUp && (
                  <div className="auth-forgot">
                    <a href="#" className="auth-forgot-link">
                      Forget your password
                    </a>
                  </div>
                )}
              </div>

              {isSignUp && (
                <div className="auth-terms">
                  <input
                    type="checkbox"
                    id="terms"
                    className="auth-checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                  />
                  <label htmlFor="terms" className="auth-terms-text">
                    By creating an account, I agree to the
                    <a href="#" className="auth-terms-link">
                      {" "}
                      terms of use{" "}
                    </a>
                    and
                    <a href="#" className="auth-terms-link">
                      {" "}
                      privacy policy
                    </a>
                    .
                  </label>
                </div>
              )}

              <button
                type="submit"
                className={`auth-btn ${isFormValid ? "enabled" : ""} ${isLoading ? "loading" : ""}`}
                disabled={!isFormValid || isLoading}
              >
                {isLoading
                  ? isSignUp
                    ? "Signing up..."
                    : "Signing in..."
                  : isSignUp
                    ? "Sign up"
                    : "Sign in"}
              </button>
            </form>

            <div className="auth-divider">
              <span>OR</span>
            </div>

            <div className="auth-social">
              <button
                type="button"
                className="auth-social-btn"
                onClick={handleGoogleAuth}
                title={`${isSignUp ? "Sign up" : "Sign in"} with Google`}
              >
                Google
              </button>
              <button
                type="button"
                className="auth-social-btn"
                onClick={handleFacebookAuth}
                title={`${isSignUp ? "Sign up" : "Sign in"} with Facebook`}
              >
                Facebook
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CombinedAuthPage;
