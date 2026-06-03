/**
 * @file AuthContext.jsx
 * Authentication state provider. Exposes the current user, login/register/
 * logout actions and a role helper used by route guards and the UI.
 */
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, tokenStore, refreshSession } from '../lib/api.js';

const AuthContext = createContext(null);

/** Provider component. */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On boot, restore session (refresh if access token expired).
  useEffect(() => {
    let active = true;
    async function bootstrap() {
      try {
        if (!tokenStore.access && tokenStore.refresh) {
          await refreshSession();
        }
        if (!tokenStore.access) {
          if (active) setLoading(false);
          return;
        }
        const { data } = await api.get('/auth/profile');
        if (active) setUser(data.data);
      } catch {
        if (tokenStore.refresh) {
          try {
            await refreshSession();
            const { data } = await api.get('/auth/profile');
            if (active) setUser(data.data);
            if (active) setLoading(false);
            return;
          } catch {
            /* fall through */
          }
        }
        tokenStore.clear();
      } finally {
        if (active) setLoading(false);
      }
    }
    bootstrap();
    return () => { active = false; };
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    tokenStore.set(data.data);
    setUser(data.data.user);
    return { user: data.data.user, isFirstLogin: !!data.data.isFirstLogin };
  }, []);

  /** Register after OTP — does not auto-login; user signs in separately. */
  const completeRegistration = useCallback(async (payload) => {
    await api.post('/auth/register', payload);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout', tokenStore.refresh ? { refreshToken: tokenStore.refresh } : {});
    } catch {
      /* ignore network errors on logout */
    }
    tokenStore.clear();
    setUser(null);
  }, []);

  const value = {
    user,
    setUser,
    loading,
    login,
    completeRegistration,
    logout,
    isAuthenticated: !!user,
    hasRole: (...roles) => !!user && roles.includes(user.role),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Hook to access auth state/actions. */
export function useAuth() {
  return useContext(AuthContext);
}
