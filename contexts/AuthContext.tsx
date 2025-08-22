// contexts/AuthContext.tsx

'use client';

import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { authManager } from '../lib/services/auth';
import swell from "lib/commerce/swell/client";

interface SwellUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  session_token?: string;
  shipping?: {
    address1?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
}

interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

interface ErrorResponse {
  errors?: Array<{ message: string }>;
  error?: string;
  message?: string;
}

type AccountResult = SwellUser & ErrorResponse;

interface AuthContextType {
  user: SwellUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<SwellUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;

    const initializeAuth = async () => {
      try {
        if (typeof window === 'undefined') {
          setLoading(false);
          setInitialized(true);
          return;
        }

        const storedUser = authManager.getCurrentUser();
        const storedToken = localStorage.getItem('swell_session_token');

        if (storedUser && storedToken) {
          setUser(storedUser);
          setLoading(false);
        }

        try {
          const authenticatedUser = await authManager.initAuth();

          if (authenticatedUser) {
            setUser(authenticatedUser);
          } else if (!storedUser) {
            setUser(null);
          }
        } catch (serverError) {
          if (storedUser) {
            setUser(storedUser);
          }
        }
      } catch (error) {
        const storedUser = authManager.getCurrentUser();
        if (storedUser) {
          setUser(storedUser);
        }
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initializeAuth();
  }, [initialized]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'swell_session_token' || e.key === 'swell_user') {
        const storedUser = authManager.getCurrentUser();
        const storedToken = localStorage.getItem('swell_session_token');

        if (!storedUser || !storedToken) {
          setUser(null);
        } else if (!user || user.email !== storedUser.email) {
          setUser(storedUser);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await authManager.login(email, password);

      if (result.success && result.user) {
        setUser(result.user);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setLoading(true);
    try {
      const result = (await swell.account.create(userData)) as AccountResult;

      if (result && !('errors' in result && result.errors)) {
        const loginResult = await authManager.login(userData.email, userData.password);

        if (loginResult.success && loginResult.user) {
          setUser(loginResult.user);
          return { success: true };
        } else {
          return { success: false, error: loginResult.error };
        }
      } else {
        const errorResult = result as ErrorResponse;
        return {
          success: false,
          error: errorResult?.errors?.[0]?.message || 'Registration failed'
        };
      }
    } catch (error) {
      return { success: false, error: 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authManager.logout();
      setUser(null);
    } catch (error) {
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
