import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('railpass_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize and check token
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('railpass_token');
      const storedUser = localStorage.getItem('railpass_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Verify with server in background
          const res = await api.getCurrentUser();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('railpass_user', JSON.stringify(res.user));
          } else {
            logout();
          }
        } catch (err) {
          console.warn('Token validation failed, logging out');
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success) {
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('railpass_token', res.token);
      localStorage.setItem('railpass_user', JSON.stringify(res.user));
      return { success: true };
    }
    return { success: false, message: res.message || 'Login failed' };
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res.success) {
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('railpass_token', res.token);
      localStorage.setItem('railpass_user', JSON.stringify(res.user));
      return { success: true };
    }
    return { success: false, message: res.message || 'Registration failed' };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('railpass_token');
    localStorage.removeItem('railpass_user');
  };

  // Quick switcher for instant pair testing
  const switchRole = async (targetRole) => {
    if (targetRole === 'Administrator') {
      return await login('admin@railway.gov', 'admin123');
    } else {
      return await login('alex@example.com', 'pass123');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
