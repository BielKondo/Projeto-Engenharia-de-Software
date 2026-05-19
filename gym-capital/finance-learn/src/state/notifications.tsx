/**
 * ESTADO DAS NOTIFICAÇÕES
 * ============================================================
 * Notificações exibidas no sino do canto superior direito.
 * São persistidas no localStorage (não vão pro banco — são só do navegador).
 *
 * Tipos possíveis:
 *   - conquista, mercado, lembrete, biblioteca, alerta
 *
 * Outros lugares do código adicionam notificações via adicionar(),
 * como o PortfolioContext quando um alerta de preço é atingido.
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
import type { Notificacao, TipoNotif } from "../types";

const STORAGE_KEY = "gym-capital:notificacoes:v1";

const notificacoesIniciais: Notificacao[] = [
  {
    id: "init-1",
    tipo: "biblioteca",
    titulo: "Novo conteúdo na Biblioteca",
    texto: "Curso 'Diversificação de Carteira' está disponível.",
    criadaEm: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    naoLida: true,
  },
  {
    id: "init-2",
    tipo: "conquista",
    titulo: "Bem-vindo ao GYM Capital",
    texto: "Configure seu simulador no Portfólio para começar.",
    criadaEm: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    naoLida: true,
  },
  {
    id: "init-3",
    tipo: "lembrete",
    titulo: "Dica do dia",
    texto: "Diversifique sua carteira em pelo menos 3 ativos diferentes.",
    criadaEm: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    naoLida: false,
  },
];

interface NotificationsContextValue {
  notificacoes: Notificacao[];
  naoLidas: number;
  adicionar: (
    n: Omit<Notificacao, "id" | "criadaEm" | "naoLida"> &
      Partial<Pick<Notificacao, "naoLida">>,
  ) => void;
  marcarComoLida: (id: string) => void;
  marcarTodasComoLidas: () => void;
  remover: (id: string) => void;
  limparTodas: () => void;
}

const NotificationsContext =
  createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [hidratado, setHidratado] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setNotificacoes(JSON.parse(raw));
      } else {
        setNotificacoes(notificacoesIniciais);
      }
    } catch {
      setNotificacoes(notificacoesIniciais);
    }
    setHidratado(true);
  }, []);

  useEffect(() => {
    if (!hidratado) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notificacoes));
    } catch {}
  }, [notificacoes, hidratado]);

  const adicionar = useCallback(
    (n: Omit<Notificacao, "id" | "criadaEm" | "naoLida"> &
      Partial<Pick<Notificacao, "naoLida">>) => {
      const nova: Notificacao = {
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : String(Date.now() + Math.random()),
        criadaEm: new Date().toISOString(),
        naoLida: n.naoLida ?? true,
        tipo: n.tipo,
        titulo: n.titulo,
        texto: n.texto,
      };
      setNotificacoes((prev) => [nova, ...prev]);
    },
    [],
  );

  const marcarComoLida = useCallback((id: string) => {
    setNotificacoes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, naoLida: false } : n)),
    );
  }, []);

  const marcarTodasComoLidas = useCallback(() => {
    setNotificacoes((prev) => prev.map((n) => ({ ...n, naoLida: false })));
  }, []);

  const remover = useCallback((id: string) => {
    setNotificacoes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const limparTodas = useCallback(() => {
    setNotificacoes([]);
  }, []);

  const naoLidas = notificacoes.filter((n) => n.naoLida).length;

  return (
    <NotificationsContext.Provider
      value={{
        notificacoes,
        naoLidas,
        adicionar,
        marcarComoLida,
        marcarTodasComoLidas,
        remover,
        limparTodas,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx)
    throw new Error(
      "useNotifications precisa estar dentro de NotificationsProvider",
    );
  return ctx;
}

// Helper de formato de tempo relativo
export function tempoRelativo(iso: string): string {
  const agora = Date.now();
  const ts = new Date(iso).getTime();
  const diffMs = agora - ts;
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `${min}min atrás`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h atrás`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d atrás`;
  const semanas = Math.floor(d / 7);
  if (semanas < 4) return `${semanas}sem atrás`;
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}
