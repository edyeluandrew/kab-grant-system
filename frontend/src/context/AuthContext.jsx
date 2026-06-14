import { createContext, useContext, useState, useEffect } from 'react';
import { ROLE_DASHBOARD_PATHS } from '../constants/roles';

const AuthContext = createContext(null);

const AUTH_KEY = 'kab_auth_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      if (stored) {
        const userData = JSON.parse(stored);
        setUser(userData);
        if (userData.access_token) {
          localStorage.setItem('authToken', userData.access_token);
        }
      }
    } catch (error) {
      console.error('AuthContext: Error restoring user:', error);
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem('authToken');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData) => {
    localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
    if (userData.access_token) {
      localStorage.setItem('authToken', userData.access_token);
    }
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const isAuthenticated = !!user;

  const redirectPathForRole = (role) => {
    return ROLE_DASHBOARD_PATHS[role] || '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, loading, redirectPathForRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
