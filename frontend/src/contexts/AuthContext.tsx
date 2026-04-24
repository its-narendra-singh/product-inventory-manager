import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { setToken } from '../api/tokenStore';
import { loginApi, registerApi, refreshApi, logoutApi, type User } from '../services/auth.service';
import { AuthContext } from './auth.types';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  function applyToken(token: string | null) {
    setToken(token);
    setAccessToken(token);
    if (!token) setUser(null);
  }

  useEffect(() => {
    refreshApi()
      .then((token) => applyToken(token))
      .catch(() => applyToken(null))
      .finally(() => setIsInitializing(false));
  }, []);

  useEffect(() => {
    function handleForceLogout() {
      applyToken(null);
    }
    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginApi(email, password);
    setToken(result.accessToken);
    setAccessToken(result.accessToken);
    setUser(result.user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const result = await registerApi(name, email, password);
    setToken(result.accessToken);
    setAccessToken(result.accessToken);
    setUser(result.user);
  }, []);

  const logout = useCallback(async () => {
    await logoutApi().catch(() => {});
    applyToken(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!accessToken,
        isInitializing,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
