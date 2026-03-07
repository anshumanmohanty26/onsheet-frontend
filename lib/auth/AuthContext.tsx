"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { userService, type User } from "@/services/userService";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (body: { email: string; password: string }) => Promise<void>;
  register: (body: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const me = await userService.me();
      setUser(me);
    } catch {
      setUser(null);
    }
  }, []);

  const login = useCallback(async (body: { email: string; password: string }) => {
    await userService.login(body);
    await refresh();
  }, [refresh]);

  const register = useCallback(async (body: { name: string; email: string; password: string }) => {
    await userService.register(body);
    await refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    try {
      await userService.logout();
    } finally {
      setUser(null);
      window.location.href = "/login";
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
