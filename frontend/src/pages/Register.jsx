import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Train, ShieldCheck, Zap, ArrowRight, AlertCircle, Sparkles, Eye, EyeOff } from 'lucide-react';

export const Register = ({ onSwitchToLogin }) => {
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    gender: 'Male',
    address: '',
    role: 'Passenger'
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    const res = await register(formData);
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="auth-split-wrapper">
      {/* Left Panel: Hero Illustration & Copy */}
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

      {/* Right Panel: Registration Form */}
      <div className="auth-right-panel">
        <div className="auth-form-card">
          <div className="auth-header-text">
            <h2>Create an account</h2>
            <p>Join RailPass to book tickets or manage railway schedules</p>
          </div>

          {errorMessage && (
            <div className="alert-box alert-error">
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full Name</label>
              <input
                id="reg-name"
                name="name"
                type="text"
                required
                className="input-box"
                placeholder="Jane Doe"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email Address</label>
              <input
                id="reg-email"
                name="email"
                type="email"
                required
                className="input-box"
                placeholder="jane@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  id="reg-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="input-box"
                  style={{ paddingRight: '2.5rem' }}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
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

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-age">Age</label>
                <input
                  id="reg-age"
                  name="age"
                  type="number"
                  min="5"
                  max="120"
                  className="input-box"
                  placeholder="28"
                  value={formData.age}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-gender">Gender</label>
                <select
                  id="reg-gender"
                  name="gender"
                  className="input-box"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-address">City / Address</label>
                <input
                  id="reg-address"
                  name="address"
                  type="text"
                  className="input-box"
                  placeholder="e.g. New York, NY"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-role">Account Type</label>
                <select
                  id="reg-role"
                  name="role"
                  className="input-box"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="Passenger">Passenger</option>
                  <option value="Administrator">Administrator</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '0.5rem', marginBottom: '1.5rem' }}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
              {!loading && <ArrowRight size={16} />}
            </button>

            <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
              Already have an account?{' '}
              <a 
                href="#login" 
                onClick={(e) => { e.preventDefault(); onSwitchToLogin(); }}
                style={{ fontWeight: 700 }}
              >
                Sign in
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
