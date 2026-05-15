"use client";

import { useEffect, useRef, useState } from "react";
import { classNames } from "@/lib/formatters";

interface Mensagem {
  id: string;
  remetente: string;
  iniciais: string;
  preview: string;
  tempo: string;
  naoLida: boolean;
}

const mensagensMock: Mensagem[] = [
  {
    id: "1",
    remetente: "Equipe G.Y.M",
    iniciais: "GY",
    preview:
      "Bem-vindo ao GYM Capital! Confira a Biblioteca para começar sua jornada.",
    tempo: "agora",
    naoLida: true,
  },
  {
    id: "2",
    remetente: "Suporte",
    iniciais: "SP",
    preview:
      "Dica do dia: diversifique sua carteira entre pelo menos 3 ativos diferentes.",
    tempo: "2h atrás",
    naoLida: true,
  },
  {
    id: "3",
    remetente: "Felipe Haddad",
    iniciais: "FH",
    preview:
      "Novo artigo publicado: 'Estratégias de Dividendos'. Vale a leitura!",
    tempo: "1d atrás",
    naoLida: false,
  },
  {
    id: "4",
    remetente: "Resumo Semanal",
    iniciais: "RS",
    preview: "Confira o desempenho do seu portfólio nesta semana.",
    tempo: "3d atrás",
    naoLida: false,
  },
];

export function MessagesDropdown() {
  const [aberto, setAberto] = useState(false);
  const [mensagens, setMensagens] = useState(mensagensMock);
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

  const naoLidas = mensagens.filter((m) => m.naoLida).length;

  const marcarTodasComoLidas = () =>
    setMensagens((prev) => prev.map((m) => ({ ...m, naoLida: false })));

  const marcarComoLida = (id: string) =>
    setMensagens((prev) =>
      prev.map((m) => (m.id === id ? { ...m, naoLida: false } : m)),
    );

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
        title="Mensagens"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 6h16v12H4z M4 6l8 7 8-7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
        {naoLidas > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center">
            {naoLidas}
          </span>
        )}
      </button>

      {aberto && (
        <div className="absolute right-0 top-12 w-[360px] glass-card rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
          <div className="px-4 py-3 border-b border-rule flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Mensagens</h3>
              {naoLidas > 0 && (
                <p className="text-xs text-ink-muted mt-0.5">
                  {naoLidas} {naoLidas === 1 ? "não lida" : "não lidas"}
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

          <div className="max-h-[400px] overflow-y-auto divide-y divide-rule-soft">
            {mensagens.map((m) => (
              <button
                key={m.id}
                onClick={() => marcarComoLida(m.id)}
                className={classNames(
                  "w-full text-left px-4 py-3 hover:bg-navy-800/40 transition-colors flex items-start gap-3",
                  m.naoLida && "bg-brand/5",
                )}
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-navy-700 to-navy-800 border border-rule flex items-center justify-center font-bold text-[10px] shrink-0">
                  {m.iniciais}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span
                      className={classNames(
                        "text-sm truncate",
                        m.naoLida ? "font-semibold" : "font-medium",
                      )}
                    >
                      {m.remetente}
                    </span>
                    <span className="text-[10px] text-ink-dim shrink-0">
                      {m.tempo}
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted mt-0.5 line-clamp-2">
                    {m.preview}
                  </p>
                </div>
                {m.naoLida && (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand mt-1.5 shrink-0" />
                )}
              </button>
            ))}
          </div>

          <div className="px-4 py-2.5 border-t border-rule bg-navy-800/30">
            <button className="text-xs text-brand hover:underline w-full text-center">
              Ver todas as mensagens
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
