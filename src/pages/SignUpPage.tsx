import React, { useState } from "react";
import "./SignUpPage.css";


interface SignUpPageProps {
  onNavigateToSignIn?: () => void;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ onNavigateToSignIn }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (agreeTerms && email && password) {
      console.log("Sign up attempt:", { email, password });
      // TODO: Handle sign up logic
    }
  };

  const handleGoogleSignUp = () => {
    console.log("Google sign up clicked");
    // TODO: Handle Google OAuth
  };

  const handleFacebookSignUp = () => {
    console.log("Facebook sign up clicked");
    // TODO: Handle Facebook OAuth
  };

  const isFormValid = email && password && agreeTerms;

  return (
    <div className="signup-page">
      {/* Left: Yoga background image */}
      <div className="signup-bg-image"></div>

      {/* Right: Form content */}
      <div className="signup-content">
        {/* Top navigation */}
        <div className="signup-top-nav">
          <span className="signup-nav-text">Already have an account?</span>
          <button 
            className="signup-signin-btn"
            onClick={onNavigateToSignIn}
          >
            Sign In
          </button>
        </div>

        {/* Sign up form */}
        <div className="signup-form-container">
          <div className="signup-form-card">
            {/* Header with Logo and Title */}
            <div className="signup-header">
              <div className="signup-logo"></div>
              <h1 className="signup-title">Create an account</h1>
            </div>

            <p className="signup-subtitle">
              Lorem ipsum dolor sit amet, consectetur<br />
            </p>

            <form onSubmit={handleSubmit}>
              <div className="signup-field">
                <label className="signup-label">Email</label>
                <input
                  type="email"
                  className="signup-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=""
                  required
                />
              </div>

              <div className="signup-field">
                <label className="signup-label">Password</label>
                <div className="signup-password-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="signup-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder=""
                    required
                  />
                  <button
                    type="button"
                    className="signup-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span>
                      {showPassword ? "Hide" : "Show"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="signup-terms">
                <input
                  type="checkbox"
                  id="terms"
                  className="signup-checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                <label htmlFor="terms" className="signup-terms-text">
                  By creating an account, I agree to our{" "}
                  <a href="#" className="signup-terms-link">terms of use</a>{" "}
                  and{" "}
                  <a href="#" className="signup-terms-link">Privacy Policy</a>
                </label>
              </div>

              <button 
                type="submit" 
                className={`signup-btn ${isFormValid ? 'enabled' : ''}`}
                disabled={!isFormValid}
              >
                Sign up
              </button>
            </form>

            <div className="signup-divider">
              <span>OR</span>
            </div>

            <div className="signup-social">
              <button
                type="button"
                className="signup-social-btn signup-google"
                onClick={handleGoogleSignUp}
                title="Sign up with Google"
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
                <span className="signup-social-text">Google</span>
              </button>

              <button
                type="button"
                className="signup-social-btn signup-facebook"
                onClick={handleFacebookSignUp}
                title="Sign up with Facebook"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path
                    fill="#1877F2"
                    d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                  />
                </svg>
                <span className="signup-social-text">Facebook</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;