import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Train, ShieldCheck, Zap, ArrowRight, AlertCircle, Sparkles, Eye, EyeOff } from 'lucide-react';

export const Login = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="auth-split-wrapper">
      {/* Left Panel: Hero Illustration & Copy (image_6.png style) */}
      <div className="auth-left-panel">
        <div className="auth-left-content">
          <div className="auth-brand">
            <div className="brand-icon-box" style={{ background: '#3B82F6' }}>
              <Train size={24} color="white" />
            </div>
            <span>RailPass</span>
          </div>

          <h1 className="auth-hero-title">
            Verified Train Seats & Instant PNR
          </h1>
          <p className="auth-hero-subtitle">
            Express & High-Speed Rail
          </p>

          <div className="auth-badges-list">
            <div className="auth-badge-item">
              <ShieldCheck size={20} color="#60A5FA" />
              <span>Real-Time Seat Reservation & Verification</span>
            </div>
            <div className="auth-badge-item">
              <Zap size={20} color="#FBBF24" />
              <span>Administrator Ticket Issuance & PNR Tracking</span>
            </div>
            <div className="auth-badge-item">
              <Sparkles size={20} color="#34D399" />
              <span>Instant Passenger Cancellations & Refund Logs</span>
            </div>
          </div>

          <div className="auth-illustration-container">
            <img 
              src="/assets/platform-hero.jpg" 
              alt="Passenger on High-Speed Rail Platform" 
            />
          </div>
        </div>

        <div className="auth-left-footer">
          © 2026 RailPass Transportation Systems Inc. Standard Client-Server Railway Architecture.
        </div>
      </div>

      {/* Right Panel: Clean Modern SaaS Form */}
      <div className="auth-right-panel">
        <div className="auth-form-card">
          <div className="auth-header-text">
            <h2>Welcome back</h2>
            <p>Enter your credentials to access your booking dashboard</p>
          </div>

          {errorMessage && (
            <div className="alert-box alert-error">
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email-input">Email address</label>
              <input
                id="email-input"
                type="email"
                required
                className="input-box"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password-input">Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="input-box"
                  style={{ paddingRight: '2.5rem' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    color: 'var(--color-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer'
                  }}
                  title={showPassword ? 'Hide password' : 'View password'}
                  aria-label={showPassword ? 'Hide password' : 'View password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-actions-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>

              <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Demo password reset: Use pass123 or admin123'); }}>
                Forgot password?
              </a>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginBottom: '1.5rem' }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Login'}
              {!loading && <ArrowRight size={16} />}
            </button>

            <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
              Don't have an account?{' '}
              <a 
                href="#register" 
                onClick={(e) => { e.preventDefault(); onSwitchToRegister(); }}
                style={{ fontWeight: 700 }}
              >
                Sign up
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
