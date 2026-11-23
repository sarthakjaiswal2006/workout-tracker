import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import "../styles/Auth.css";

export default function Signup({ onSwitchToLogin }) {
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const validate = () => {
    if (!form.name.trim()) return "Full name is required.";
    if (!form.email) return "Email is required.";
    if (!form.email.includes("@")) return "Please enter a valid email.";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    if (form.password !== form.confirmPassword) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    const data = await signup({
      name: form.name.trim(),
      email: form.email,
      password: form.password,
    });
    setLoading(false);
    if (!data.success) {
      setError(data.error || "Signup failed. Please try again.");
    }
  };

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6) return { label: "Too short", level: 0 };
    if (p.length < 8) return { label: "Weak", level: 1 };
    if (/[A-Z]/.test(p) && /[0-9]/.test(p)) return { label: "Strong", level: 3 };
    return { label: "Fair", level: 2 };
  };
  const strength = passwordStrength();

  return (
    <div className="auth-page">
      {/* Left branding panel */}
      <div className="auth-brand-panel">
        <div className="auth-brand-content">
          <div className="auth-brand-icon">💪</div>
          <h1 className="auth-brand-title">Join the<br />Community</h1>
          <p className="auth-brand-tagline">
            Start your fitness journey today.<br />Every rep counts.
          </p>
          <div className="auth-brand-features">
            <div className="auth-feature-item">
              <span className="auth-feature-icon">🚀</span>
              <span>Free to get started</span>
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-icon">📱</span>
              <span>Works on all devices</span>
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-icon">🔒</span>
              <span>Your data stays private</span>
            </div>
          </div>
        </div>
        <div className="auth-brand-bg-circles">
          <div className="auth-circle auth-circle-1" />
          <div className="auth-circle auth-circle-2" />
          <div className="auth-circle auth-circle-3" />
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2>Create your account</h2>
            <p>Start tracking your workouts for free</p>
          </div>

          {error && (
            <div className="auth-error-banner">
              <span className="auth-error-icon">⚠️</span>
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label htmlFor="name">Full name</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">👤</span>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  autoComplete="name"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="email">Email address</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">✉️</span>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">🔒</span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {strength && (
                <div className="auth-password-strength">
                  <div className="auth-strength-bars">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className={`auth-strength-bar ${i < strength.level ? `level-${strength.level}` : ""}`}
                      />
                    ))}
                  </div>
                  <span className={`auth-strength-label level-${strength.level}`}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            <div className="auth-field">
              <label htmlFor="confirmPassword">Confirm password</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">🔑</span>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  disabled={loading}
                />
                {form.confirmPassword && (
                  <span className="auth-match-icon">
                    {form.password === form.confirmPassword ? "✅" : "❌"}
                  </span>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? <span className="auth-spinner" /> : "Create Account"}
            </button>
          </form>

          <div className="auth-switch">
            <span>Already have an account?</span>
            <button onClick={onSwitchToLogin} className="auth-switch-btn">
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
