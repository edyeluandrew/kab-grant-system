import { createContext, useContext, useState, useEffect } from 'react';
import { ROLE_DASHBOARD_PATHS, ROLES } from '../constants/roles';

const AuthContext = createContext(null);

const AUTH_KEY = 'kab_auth_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load, restore user from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      localStorage.removeItem(AUTH_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData) => {
    // userData shape: { id, first_name, surname, email, role, access_token, refresh_token }
    localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
    // Also store token separately for axiosClient interceptor
    localStorage.setItem('authToken', userData.access_token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const isAuthenticated = !!user;

  const redirectPathForRole = (role) => {
    // Use centralized role dashboard paths
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