// src/state/auth.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { FrontUser, LoginResponse } from "../services/auth";

type AuthState = { user: FrontUser; token?: string | null } | null;

type AuthContextType = {
  auth: AuthState;
  login: (data: LoginResponse) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(null);

  useEffect(() => {
    const raw = localStorage.getItem("auth");
    if (raw) {
      try { setAuth(JSON.parse(raw)); } catch {}
    }
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    auth,
    login: (data: LoginResponse) => {
      const normalized: AuthState = { user: data.user, token: data.token ?? null };
      setAuth(normalized);
      localStorage.setItem("auth", JSON.stringify(normalized));
    },
    logout: () => {
      setAuth(null);
      localStorage.removeItem("auth");
    },
  }), [auth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
