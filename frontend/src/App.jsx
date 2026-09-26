import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { PassengerDashboard } from './pages/PassengerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

export function App() {
  const { user, loading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [currentView, setCurrentView] = useState('passenger'); // 'passenger' | 'admin'

  // Sync default view with user role once loaded
  React.useEffect(() => {
    if (user) {
      setCurrentView(user.role === 'Administrator' ? 'admin' : 'passenger');
    }
  }, [user]);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
            RailPass
          </div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Connecting high-speed rail network...
          </div>
        </div>
      </div>
    );
  }

  // Not logged in: show Split-Screen Auth
  if (!user) {
    return authView === 'login' ? (
      <Login onSwitchToRegister={() => setAuthView('register')} />
    ) : (
      <Register onSwitchToLogin={() => setAuthView('login')} />
    );
  }

  // Logged in: show Main Application Layout
  return (
    <div className="app-container">
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />
      
      {currentView === 'admin' && user.role === 'Administrator' ? (
        <AdminDashboard />
      ) : (
        <PassengerDashboard />
      )}
    </div>
  );
}

export default App;
