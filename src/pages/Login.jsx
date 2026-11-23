
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import "../styles/Auth.css";

export default function Login({ onSwitchToSignup }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    const data = await login({
      email: form.email,
      password: form.password,
    });
    setLoading(false);

    if (!data.success) {
      setError(data.error || "Login failed. Please try again.");
    }
  };

  return (
    <div className="auth-page">
      {/* Left branding panel */}
      <div className="auth-brand-panel">
        <div className="auth-brand-content">
          <div className="auth-brand-icon">💪</div>
          <h1 className="auth-brand-title">
            Workout<br />Tracker
          </h1>
          <p className="auth-brand-tagline">
            Track your lifts, crush your PRs,<br />
            and dominate your goals.
          </p>

          <div className="auth-brand-features">
            <div className="auth-feature-item">
              <span className="auth-feature-icon">📊</span>
              <span>Detailed workout analytics</span>
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-icon">🏆</span>
              <span>Personal record tracking</span>
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-icon">🎮</span>
              <span>Mini games to stay motivated</span>
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
            <h2>Welcome back</h2>
            <p>Sign in to continue your fitness journey</p>
          </div>

          {error && (
            <div className="auth-error-banner">
              <span className="auth-error-icon">⚠️</span>
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
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
                  placeholder="Enter your password"
                  autoComplete="current-password"
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
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="auth-spinner" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="auth-switch">
            <span>Don't have an account?</span>
            <button
              onClick={onSwitchToSignup}
              className="auth-switch-btn"
            >
              Create account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
