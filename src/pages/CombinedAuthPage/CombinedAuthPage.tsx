import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./CombinedAuthPage.css";
import yogaSignInImg from "/assets/yoga.png";
import yogaSignUpImg from "/assets/yoga_register.png";
import logoImg from "/assets/logo_color.png";

const CombinedAuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check URL params on mount
  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "signup") {
      setIsSignUp(true);
    }
  }, [searchParams]);

  const handleModeSwitch = (toSignUp: boolean) => {
    if (isAnimating || toSignUp === isSignUp) return;

    setIsAnimating(true);
    setIsSignUp(toSignUp);

    // Reset form
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setAgreeTerms(false);

    // Update URL
    const newMode = toSignUp ? "signup" : "signin";
    navigate(`/auth?mode=${newMode}`, { replace: true });

    // Reset animation state
    setTimeout(() => setIsAnimating(false), 600);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true); // Bắt đầu loading khi submit

    try {
      if (isSignUp) {
        if (agreeTerms && email && password) {
          console.log("Sign up attempt:", { email, password });
          // TODO: Handle sign up logic
          // await signUpAPI({ email, password });
        }
      } else {
        console.log("Sign in attempt:", { email, password });
        // TODO: Handle sign in logic
        // await signInAPI({ email, password });
      }
    } catch (error) {
      console.error("Auth error:", error);
    } finally {
      setIsLoading(false); // Kết thúc loading
    }
  };

  const handleGoogleAuth = () => {
    console.log(`Google ${isSignUp ? "sign up" : "sign in"} clicked`);
    // TODO: Handle Google OAuth
  };

  const handleFacebookAuth = () => {
    console.log(`Facebook ${isSignUp ? "sign up" : "sign in"} clicked`);
    // TODO: Handle Facebook OAuth
  };

  const isFormValid = isSignUp ? email && password && agreeTerms : email && password;

  // Animation variants
  const imageVariants = {
    enterLeft: {
      x: -100,
      opacity: 0,
    },
    enterRight: {
      x: 100,
      opacity: 0,
    },
    center: {
      x: 0,
      opacity: 1,
    },
    exitLeft: {
      x: -100,
      opacity: 0,
    },
    exitRight: {
      x: 100,
      opacity: 0,
    },
  };

  const formVariants = {
    enterLeft: {
      x: -50,
      opacity: 0,
    },
    enterRight: {
      x: 50,
      opacity: 0,
    },
    center: {
      x: 0,
      opacity: 1,
    },
    exitLeft: {
      x: -50,
      opacity: 0,
    },
    exitRight: {
      x: 50,
      opacity: 0,
    },
  };

  return (
    <div className="combined-auth-page">
      {/* Dynamic Image Section */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`image-${isSignUp ? "signup" : "signin"}`}
          className={`auth-bg-image ${isSignUp ? "left" : "right"}`}
          variants={imageVariants}
          initial={isSignUp ? "enterLeft" : "enterRight"}
          animate="center"
          exit={isSignUp ? "exitRight" : "exitLeft"}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <img src={isSignUp ? yogaSignUpImg : yogaSignInImg} alt="Yoga" className="auth-img" />
        </motion.div>
      </AnimatePresence>

      {/* Dynamic Form Section */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`form-${isSignUp ? "signup" : "signin"}`}
          className={`auth-content ${isSignUp ? "right" : "left"}`}
          variants={formVariants}
          initial={isSignUp ? "enterRight" : "enterLeft"}
          animate="center"
          exit={isSignUp ? "exitLeft" : "exitRight"}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {/* Top navigation */}
          <div className="auth-top-nav">
            <span className="auth-nav-text">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
            </span>
            <button
              className="auth-nav-btn"
              onClick={() => handleModeSwitch(!isSignUp)}
              disabled={isAnimating}
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </div>

          {/* Form container */}
          <div className="auth-form-container">
            <div className="auth-form-card">
              {/* Header */}
              <div className="auth-header">
                {isSignUp && (
                  <div className="auth-logo" style={{ backgroundImage: `url(${logoImg})` }}></div>
                )}
                <h1 className="auth-title">{isSignUp ? "Create an account" : "Sign in"}</h1>
              </div>

              {isSignUp && (
                <p className="auth-subtitle">
                  Lorem ipsum dolor sit amet, consectetur
                  <br />
                </p>
              )}

              <form onSubmit={handleSubmit}>
                <div className="auth-field">
                  <label className="auth-label">
                    {isSignUp ? "Email" : "User name or email address"}
                  </label>
                  <input
                    type={isSignUp ? "email" : "text"}
                    className="auth-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder=""
                    required={isSignUp}
                  />
                </div>

                <div className="auth-field">
                  <label className="auth-label">{isSignUp ? "Password" : "Your password"}</label>
                  <div className="auth-password-container">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="auth-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder=""
                      required={isSignUp}
                    />
                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
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
                      By creating an account, I agree to our{" "}
                      <a href="#" className="auth-terms-link">
                        terms of use
                      </a>{" "}
                      and{" "}
                      <a href="#" className="auth-terms-link">
                        Privacy Policy
                      </a>
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
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="auth-social-text">Google</span>
                </button>

                <button
                  type="button"
                  className="auth-social-btn"
                  onClick={handleFacebookAuth}
                  title={`${isSignUp ? "Sign up" : "Sign in"} with Facebook`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path
                      fill="#1877F2"
                      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                    />
                  </svg>
                  <span className="auth-social-text">Facebook</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CombinedAuthPage;
