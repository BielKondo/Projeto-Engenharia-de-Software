"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Tema } from "@/lib/types";

const STORAGE_KEY = "gym-capital:theme";

interface ThemeContextValue {
  tema: Tema;
  alternar: () => void;
  definir: (t: Tema) => void;
  hidratado: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>("dark");
  const [hidratado, setHidratado] = useState(false);

  // Carrega tema persistido
  useEffect(() => {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY) as Tema | null;
      if (salvo === "light" || salvo === "dark") {
        setTema(salvo);
      }
    } catch {}
    setHidratado(true);
  }, []);

  // Aplica o tema no document
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", tema);
  }, [tema]);

  // Persiste mudança
  useEffect(() => {
    if (!hidratado) return;
    try {
      localStorage.setItem(STORAGE_KEY, tema);
    } catch {}
  }, [tema, hidratado]);

  const alternar = useCallback(() => {
    setTema((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  const definir = useCallback((t: Tema) => {
    setTema(t);
  }, []);

  return (
    <ThemeContext.Provider value={{ tema, alternar, definir, hidratado }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme precisa estar dentro de ThemeProvider");
  return ctx;
}

// Script inline para evitar flash de tema errado antes da hidratação
export const themeInitScript = `
(function() {
  try {
    var t = localStorage.getItem('${STORAGE_KEY}');
    if (t === 'light' || t === 'dark') {
      document.documentElement.setAttribute('data-theme', t);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  } catch(e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`;
