import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Train, ShieldCheck, User, LogOut, LayoutDashboard } from 'lucide-react';

export const Navbar = ({ currentView, setCurrentView }) => {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="brand-logo" onClick={() => setCurrentView(user?.role === 'Administrator' ? 'admin' : 'passenger')}>
          <div className="brand-icon-box">
            <Train size={22} />
          </div>
          <div>
            <div>RailPass</div>
            <div className="brand-sub">Express & High-Speed Rail</div>
          </div>
        </div>

        {user && (
          <div className="nav-links">
            {/* View navigation based on role */}
            {user.role === 'Administrator' ? (
              <button 
                className={`nav-link-btn ${currentView === 'admin' ? 'active' : ''}`}
                onClick={() => setCurrentView('admin')}
              >
                <ShieldCheck size={18} />
                Admin Console
              </button>
            ) : (
              <button 
                className={`nav-link-btn ${currentView === 'passenger' ? 'active' : ''}`}
                onClick={() => setCurrentView('passenger')}
              >
                <LayoutDashboard size={18} />
                Passenger Portal
              </button>
            )}

            {/* User Profile Badge */}
            <div className="user-profile-badge">
              <div className="user-avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{user.name}</div>
                <div style={{ fontSize: '0.72rem', color: user.role === 'Administrator' ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                  {user.role}
                </div>
              </div>
            </div>

            {/* Logout button */}
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={logout} 
              title="Sign Out"
              style={{ color: '#EF4444' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
