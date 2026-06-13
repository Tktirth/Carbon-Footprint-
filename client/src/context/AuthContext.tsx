import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  mockVerificationCode: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [mockVerificationCode, setMockVerificationCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const refreshedToken = await api.refreshToken();
      if (refreshedToken) {
        const { user: profile } = await api.getProfile();
        setUser(profile);
        setToken(refreshedToken);
      } else {
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      await api.logout();
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email: string, password: string) => {
    const result = await api.login(email, password);
    setUser(result.user);
    setToken(result.token);
    setMockVerificationCode(null);
  };

  const register = async (name: string, email: string, password: string) => {
    const result = await api.register(name, email, password);
    setUser(result.user);
    setToken(result.token);
    if (result.mockVerificationCode) {
      setMockVerificationCode(result.mockVerificationCode);
    } else {
      setMockVerificationCode(null);
    }
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    setToken(null);
    setMockVerificationCode(null);
  };

  const verifyEmail = async (code: string) => {
    if (!user) throw new Error('Not authenticated.');
    await api.verify(user.email, code);
    const { user: profile } = await api.getProfile();
    setUser(profile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        mockVerificationCode,
        login,
        register,
        logout,
        verifyEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
