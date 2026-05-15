"use client";

import { useEffect, useRef, useState } from "react";
import {
  tempoRelativo,
  useNotifications,
} from "@/contexts/NotificationsContext";
import type { TipoNotif } from "@/lib/types";
import { classNames } from "@/lib/formatters";

const iconesPorTipo: Record<TipoNotif, React.ReactNode> = {
  conquista: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 15a7 7 0 100-14 7 7 0 000 14zM8.21 13.89L7 22l5-3 5 3-1.21-8.12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  mercado: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 17l6-6 4 4 8-8M21 7v5h-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  lembrete: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 7v5l3 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  biblioteca: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  alerta: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

const coresPorTipo: Record<TipoNotif, string> = {
  conquista: "bg-up/15 text-up",
  mercado: "bg-brand/15 text-brand",
  lembrete: "bg-sell/15 text-sell",
  biblioteca: "bg-[#8B5CF6]/15 text-[#8B5CF6]",
  alerta: "bg-sell/15 text-sell",
};

export function NotificationsDropdown() {
  const [aberto, setAberto] = useState(false);
  const {
    notificacoes,
    naoLidas,
    marcarComoLida,
    marcarTodasComoLidas,
    remover,
  } = useNotifications();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAberto(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [aberto]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setAberto(!aberto)}
        className={classNames(
          "relative w-9 h-9 flex items-center justify-center rounded-md transition-colors",
          aberto
            ? "bg-navy-800 text-ink"
            : "text-ink-muted hover:text-ink hover:bg-navy-800",
        )}
        title="Notificações"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {naoLidas > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sell" />
        )}
      </button>

      {aberto && (
        <div className="absolute right-0 top-12 w-[380px] glass-card rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
          <div className="px-4 py-3 border-b border-rule flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Notificações</h3>
              {naoLidas > 0 && (
                <p className="text-xs text-ink-muted mt-0.5">
                  {naoLidas} {naoLidas === 1 ? "nova" : "novas"}
                </p>
              )}
            </div>
            {naoLidas > 0 && (
              <button
                onClick={marcarTodasComoLidas}
                className="text-xs text-brand hover:underline"
              >
                Marcar todas
              </button>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto divide-y divide-rule-soft">
            {notificacoes.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-ink-muted">
                Nenhuma notificação.
              </div>
            ) : (
              notificacoes.map((n) => (
                <div
                  key={n.id}
                  className={classNames(
                    "px-4 py-3 hover:bg-navy-800/40 transition-colors flex items-start gap-3 group",
                    n.naoLida && "bg-brand/5",
                  )}
                >
                  <div
                    className={classNames(
                      "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
                      coresPorTipo[n.tipo],
                    )}
                  >
                    {iconesPorTipo[n.tipo]}
                  </div>
                  <button
                    onClick={() => marcarComoLida(n.id)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span
                        className={classNames(
                          "text-sm truncate",
                          n.naoLida ? "font-semibold" : "font-medium",
                        )}
                      >
                        {n.titulo}
                      </span>
                      <span className="text-[10px] text-ink-dim shrink-0">
                        {tempoRelativo(n.criadaEm)}
                      </span>
                    </div>
                    <p className="text-xs text-ink-muted mt-0.5 line-clamp-2">
                      {n.texto}
                    </p>
                  </button>
                  {n.naoLida ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-brand mt-1.5 shrink-0" />
                  ) : (
                    <button
                      onClick={() => remover(n.id)}
                      className="opacity-0 group-hover:opacity-100 text-ink-dim hover:text-down transition-opacity"
                      title="Remover"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M6 6l12 12M18 6L6 18"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="px-4 py-2.5 border-t border-rule bg-navy-800/30">
            <button className="text-xs text-brand hover:underline w-full text-center">
              Ver todas as notificações
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
