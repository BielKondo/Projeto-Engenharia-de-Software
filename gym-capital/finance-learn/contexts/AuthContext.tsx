"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

export interface Usuario {
  id: string;
  email: string;
  nome: string;
  dataNascimento?: string;
}

interface AuthContextValue {
  usuario: Usuario | null;
  carregando: boolean;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  usuarioInicial,
}: {
  children: ReactNode;
  usuarioInicial: Usuario | null;
}) {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(usuarioInicial);
  const [carregando, setCarregando] = useState(false);

  const refresh = useCallback(async () => {
    setCarregando(true);
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();
      setUsuario(data.usuario ?? null);
    } catch {
      setUsuario(null);
    } finally {
      setCarregando(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUsuario(null);
      router.push("/login");
      router.refresh();
    }
  }, [router]);

  // Atualiza usuário sempre que a janela volta pra foco (cobre login em outra aba)
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ usuario, carregando, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de AuthProvider");
  return ctx;
}
