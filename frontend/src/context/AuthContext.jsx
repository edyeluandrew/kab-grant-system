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
        const userData = JSON.parse(stored);
        console.log('📍 AuthContext: Restored user from localStorage:', userData);
        setUser(userData);
      } else {
        console.log('📍 AuthContext: No stored user found');
      }
    } catch (error) {
      console.error('❌ AuthContext: Error restoring user:', error);
      localStorage.removeItem(AUTH_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData) => {
    // userData shape: { id, first_name, surname, email, role, access_token, refresh_token }
    console.log('✅ AuthContext: Logging in user:', { id: userData.id, email: userData.email, role: userData.role });
    localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
    // Also store token separately for axiosClient interceptor
    localStorage.setItem('authToken', userData.access_token);
    setUser(userData);
  };

  const logout = () => {
    console.log('🚪 AuthContext: Logging out user');
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const isAuthenticated = !!user;

  const redirectPathForRole = (role) => {
    // Use centralized role dashboard paths
    const path = ROLE_DASHBOARD_PATHS[role] || '/login';
    console.log(`📍 AuthContext: redirectPathForRole("${role}") = "${path}"`);
    return path;
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