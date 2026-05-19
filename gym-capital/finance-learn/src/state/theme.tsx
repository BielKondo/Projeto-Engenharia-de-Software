/**
 * ESTADO DO TEMA (CLARO / ESCURO)
 * ============================================================
 * Controla qual tema visual o app está usando.
 * A escolha do usuário é salva no localStorage e persiste entre sessões.
 *
 * Use em qualquer componente:
 *   const { tema, alternar } = useTheme();
 *
 * Sob o capô, o tema é aplicado via `data-theme="dark|light"` no <html>,
 * e o CSS em globals.css define variáveis diferentes para cada tema.
 */
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Tema } from "../types";

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

  // Ao montar, carrega tema salvo no localStorage
  useEffect(() => {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY) as Tema | null;
      if (salvo === "light" || salvo === "dark") setTema(salvo);
    } catch {}
    setHidratado(true);
  }, []);

  // Quando o tema muda, atualiza o atributo no <html>
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", tema);
    }
  }, [tema]);

  // Salva no localStorage
  useEffect(() => {
    if (!hidratado) return;
    try {
      localStorage.setItem(STORAGE_KEY, tema);
    } catch {}
  }, [tema, hidratado]);

  const alternar = useCallback(() => {
    setTema((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  const definir = useCallback((t: Tema) => setTema(t), []);

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

/**
 * Script inline que roda ANTES do React montar, definindo o tema
 * pelo atributo data-theme no <html>. Isso evita o "flash" branco
 * que aconteceria se o tema escuro só fosse aplicado depois do React.
 */
export const themeInitScript = `
(function() {
  try {
    var t = localStorage.getItem('${STORAGE_KEY}');
    document.documentElement.setAttribute(
      'data-theme',
      (t === 'light' || t === 'dark') ? t : 'dark'
    );
  } catch(e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`;
