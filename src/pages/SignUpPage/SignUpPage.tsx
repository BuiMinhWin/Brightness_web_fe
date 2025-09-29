import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignUpPage.css";
import yogaImg from "/assets/yoga_register.png";
import logoImg from "/assets/logo_color.png";
import { motion } from "framer-motion";
import { authService } from "../../services";
import type { RegisterRequest } from "../../models";

const SignUpPage: React.FC = () => {
  const [formValues, setFormValues] = useState<RegisterRequest>({
    email: "",
    userName: "",
    password: "",
    role: "user",
    status: "active",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormValues((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!agreeTerms) {
      alert("You must agree to the terms to continue");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: RegisterRequest = {
        ...formValues,
        email: formValues.email.trim(),
        userName: formValues.userName.trim(),
      };

      const response = await authService.register(payload);
      if (response.flag) {
        alert("Registration successful. Please sign in.");
        navigate("/signin");
      } else {
        alert(response.message || "Registration failed.");
      }
    } catch (error) {
      console.error("Registration error", error);
      alert((error as Error).message || "Unable to sign up");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = Boolean(
    formValues.email && formValues.userName && formValues.password && agreeTerms
  );

  return (
    <div className="signup-page">
      <div className="signup-bg-image">
        <motion.img
          src={yogaImg}
          alt="Yoga"
          className="signup-img"
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />
      </div>

      <div className="signup-content">
        <div className="signup-top-nav">
          <span className="signup-nav-text">Already have an account?</span>
          <button className="signup-signin-btn" onClick={() => navigate("/signin")}>
            Sign In
          </button>
        </div>

        <div className="signup-form-container">
          <div className="signup-form-card">
            <div className="signup-header">
              <div className="signup-logo" style={{ backgroundImage: `url(${logoImg})` }} />
              <h1 className="signup-title">Create an account</h1>
            </div>

            <p className="signup-subtitle">Join Brightness to track your wellness journey.</p>

            <form onSubmit={handleSubmit}>
              <div className="signup-field">
                <label className="signup-label">Email</label>
                <input
                  name="email"
                  type="email"
                  className="signup-input"
                  value={formValues.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="signup-field">
                <label className="signup-label">Username</label>
                <input
                  name="userName"
                  type="text"
                  className="signup-input"
                  value={formValues.userName}
                  onChange={handleChange}
                  autoComplete="username"
                  required
                />
              </div>

              <div className="signup-field">
                <label className="signup-label">Password</label>
                <div className="signup-password-container">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className="signup-input"
                    value={formValues.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="signup-password-toggle"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    <span>{showPassword ? "Hide" : "Show"}</span>
                  </button>
                </div>
              </div>

              <div className="signup-terms">
                <input
                  type="checkbox"
                  id="terms"
                  className="signup-checkbox"
                  checked={agreeTerms}
                  onChange={() => setAgreeTerms((prev) => !prev)}
                />
                <label htmlFor="terms" className="signup-terms-text">
                  By creating an account, I agree to the
                  <a href="#" className="signup-terms-link">
                    {" "}
                    terms of use{" "}
                  </a>
                  and
                  <a href="#" className="signup-terms-link">
                    {" "}
                    privacy policy
                  </a>
                  .
                </label>
              </div>

              <button
                type="submit"
                className={`signup-btn ${isFormValid ? "enabled" : ""}`}
                disabled={!isFormValid}
              >
                {isSubmitting ? "Signing up..." : "Sign up"}
              </button>
            </form>

            <div className="signup-divider">
              <span>OR</span>
            </div>

            <div className="signup-social">
              <button
                type="button"
                className="signup-social-btn signup-google"
                onClick={() => alert("Google sign-up not implemented")}
              >
                Google
              </button>
              <button
                type="button"
                className="signup-social-btn signup-facebook"
                onClick={() => alert("Facebook sign-up not implemented")}
              >
                Facebook
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
