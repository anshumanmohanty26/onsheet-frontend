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
      document.cookie = "session=; path=/; max-age=0";
    }
  }, []);

  const login = useCallback(async (body: { email: string; password: string }) => {
    const user = await userService.login(body);
    setUser(user);
    // Set a lightweight marker cookie on the frontend domain so the
    // Next.js middleware can detect the authenticated session.
    // The real httpOnly accessToken lives on the API domain and is
    // invisible to middleware running on the frontend origin.
    document.cookie = "session=1; path=/; max-age=604800; SameSite=Lax";
  }, []);

  const register = useCallback(async (body: { name: string; email: string; password: string }) => {
    const user = await userService.register(body);
    setUser(user);
    document.cookie = "session=1; path=/; max-age=604800; SameSite=Lax";
  }, []);

  const logout = useCallback(async () => {
    try {
      await userService.logout();
    } finally {
      setUser(null);
      document.cookie = "session=; path=/; max-age=0";
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
