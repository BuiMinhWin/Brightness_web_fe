import React, { useState } from "react";
import "./SignInPage.css";
import { useNavigate } from "react-router-dom";
import yogaImg from "/assets/yoga_register.png";
import { motion } from "framer-motion";
import { authService } from "../../services";
import type { LoginRequest } from "../../models";

const SignInPage: React.FC = () => {
  const [formValues, setFormValues] = useState<LoginRequest>({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formValues.email || !formValues.password) return;

    try {
      setIsSubmitting(true);
      const response = await authService.login(formValues);
      if (response.flag) {
        localStorage.setItem("auth_token", response.message);
        navigate("/dashboard");
      } else {
        alert(response.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error", error);
      alert((error as Error).message || "Unable to sign in");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signin-page">
      <div className="signin-content">
        <div className="signin-top-nav">
          <span className="signin-nav-text">Don't have an account?</span>
          <button className="signin-signup-btn" onClick={() => navigate("/signup")}>
            Sign Up
          </button>
        </div>

        <div className="signin-form-container">
          <div className="signin-form-card">
            <h1 className="signin-title">Sign in</h1>

            <form onSubmit={handleSubmit}>
              <div className="signin-field">
                <label className="signin-label">User name or email address</label>
                <input
                  name="email"
                  type="text"
                  className="signin-input"
                  value={formValues.email}
                  onChange={handleChange}
                  placeholder=""
                  autoComplete="username"
                  required
                />
              </div>

              <div className="signin-field">
                <label className="signin-label">Your password</label>
                <div className="signin-password-container">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className="signin-input"
                    value={formValues.password}
                    onChange={handleChange}
                    placeholder=""
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="signin-password-toggle"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    <span className="hide-text">{showPassword ? "Hide" : "Show"}</span>
                  </button>
                </div>
                <div className="signin-forgot">
                  <a href="#" className="signin-forgot-link">
                    Forget your password
                  </a>
                </div>
              </div>

              <button type="submit" className="signin-btn" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <div className="signin-divider">
              <span>OR</span>
            </div>

            <div className="signin-social">
              <button
                type="button"
                className="signin-social-btn signin-google"
                onClick={() => alert("Google sign-in not implemented")}
              >
                Google
              </button>
              <button
                type="button"
                className="signin-social-btn signin-facebook"
                onClick={() => alert("Facebook sign-in not implemented")}
              >
                Facebook
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="signin-bg-image">
        <motion.img
          src={yogaImg}
          alt="Yoga"
          className="signin-img"
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
};

export default SignInPage;
