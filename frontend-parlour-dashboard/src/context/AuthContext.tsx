'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { fetchWithRetry } from "../utils/api";
import { toast } from "sonner";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const stored = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (stored && token) {
          setUser(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear potentially corrupted data
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      } finally {
        setInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  const handleAuthError = (error: Error) => {
    setError(error.message);
    toast.error(error.message);

    // Handle specific error cases
    if (error.message.includes('locked')) {
      // Account is locked
      toast.error('Account is locked. Please try again later.');
    } else if (error.message.includes('Rate limit')) {
      // Rate limit exceeded
      toast.error('Too many attempts. Please try again later.');
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithRetry<{ data: { user: User; token: string } }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (!res.success) {
        throw new Error(res.message || 'Login failed');
      }

      const { user, token } = (res as any).data?.data ?? (res as any);
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
      toast.success('Login successful');
    } catch (e) {
      if (e instanceof Error) {
        handleAuthError(e);
      } else {
        handleAuthError(new Error('An unexpected error occurred'));
      }
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithRetry<{ data: { user: User; token: string } }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password, role }),
      });

      if (!res.success) {
        throw new Error(res.message || 'Registration failed');
      }

      const { user, token } = (res as any).data?.data ?? (res as any);
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
      toast.success('Registration successful');
    } catch (e) {
      if (e instanceof Error) {
        handleAuthError(e);
      } else {
        handleAuthError(new Error('An unexpected error occurred'));
      }
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, error, initialized }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
} 