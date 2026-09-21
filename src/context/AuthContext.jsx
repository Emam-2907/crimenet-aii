import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [status, setStatus] = useState('INITIALIZING'); // INITIALIZING | AUTHENTICATED | UNAUTHENTICATED | EXPIRED
  const [error, setError] = useState(null);

  // Clear all station storage keys and in-memory caches
  const purgeLocalCaches = useCallback(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('crimenet_user');
      localStorage.removeItem('crimenet_token');
      localStorage.removeItem('crimenet_custom_cases');
      localStorage.removeItem('crimenet_custom_evidence');
      localStorage.removeItem('crimenet_gemini_key');
      localStorage.removeItem('crimenet_explicit_logout');
    }
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }
  }, []);

  // Authoritative session verification against /api/auth/me
  const checkSession = useCallback(async () => {
    try {
      const profile = await api.getProfile();
      if (profile && profile.email) {
        setCurrentUser(profile);
        setStatus('AUTHENTICATED');
        setError(null);
        return profile;
      } else {
        setCurrentUser(null);
        setStatus('UNAUTHENTICATED');
        return null;
      }
    } catch (err) {
      if (err.status === 401) {
        setStatus('UNAUTHENTICATED');
      } else if (err.status === 403) {
        setStatus('EXPIRED');
      } else {
        // Offline or connection refused
        setStatus('UNAUTHENTICATED');
      }
      setCurrentUser(null);
      return null;
    }
  }, []);

  // Validate session on mount
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Standard credential login
  const login = useCallback(async (identifier, password) => {
    setError(null);
    try {
      const data = await api.login(identifier, password);
      if (data && data.user) {
        setCurrentUser(data.user);
        setStatus('AUTHENTICATED');
        return data.user;
      }
      throw new Error('Invalid authentication response structure.');
    } catch (err) {
      setError(err.message || 'Authentication failed.');
      setStatus('UNAUTHENTICATED');
      throw err;
    }
  }, []);

  // Demo persona switching (server-authenticated)
  const demoLogin = useCallback(async (email) => {
    setError(null);
    try {
      const data = await api.demoLogin(email);
      if (data && data.user) {
        // Purge previous persona's custom caches to prevent state bleeding
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('crimenet_custom_cases');
          localStorage.removeItem('crimenet_custom_evidence');
        }
        setCurrentUser(data.user);
        setStatus('AUTHENTICATED');
        return data.user;
      }
      throw new Error('Failed to switch persona.');
    } catch (err) {
      setError(err.message || 'Demo persona authentication failed.');
      throw err;
    }
  }, []);

  // Complete, clean logout with server-side revocation
  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch (err) {
      console.warn('Logout network error (proceeding with local purge):', err);
    } finally {
      purgeLocalCaches();
      setCurrentUser(null);
      setStatus('UNAUTHENTICATED');
      setError(null);
    }
  }, [purgeLocalCaches]);

  return (
    <AuthContext.Provider value={{
      currentUser,
      status,
      error,
      isSessionLoading: status === 'INITIALIZING',
      isAuthenticated: status === 'AUTHENTICATED',
      login,
      demoLogin,
      logout,
      checkSession,
      purgeLocalCaches
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
