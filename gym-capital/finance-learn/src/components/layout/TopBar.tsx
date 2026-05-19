/**
 * TOPBAR
 * ============================================================
 * Barra superior com:
 *   - Título e subtítulo da página atual (traduzidos)
 *   - Botão de reiniciar simulação (se já configurado)
 *   - Tema toggle
 *   - Notificações e mensagens
 *   - Avatar do usuário com dropdown (perfil, configurações, sair)
 */
"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { usePortfolio } from "@/state/portfolio";
import { useAuth } from "@/state/auth";
import { useI18n } from "@/state/i18n";
import { MessagesDropdown } from "./MessagesDropdown";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { ThemeToggle } from "./ThemeToggle";
import { UserAvatar } from "@/components/common/UserAvatar";
import { classNames } from "@/utils/format";
import type { ChaveTraducao } from "@/data/translations";

const TITULOS_POR_ROTA: Record<
  string,
  { titulo: ChaveTraducao; subtitulo: ChaveTraducao }
> = {
  "/": { titulo: "page.dashboard.title", subtitulo: "page.dashboard.subtitle" },
  "/portfolio": { titulo: "page.portfolio.title", subtitulo: "page.portfolio.subtitle" },
  "/mercados": { titulo: "page.mercados.title", subtitulo: "page.mercados.subtitle" },
  "/biblioteca": { titulo: "page.biblioteca.title", subtitulo: "page.biblioteca.subtitle" },
  "/negociar": { titulo: "page.negociar.title", subtitulo: "page.negociar.subtitle" },
  "/relatorios": { titulo: "page.relatorios.title", subtitulo: "page.relatorios.subtitle" },
  "/gastos": { titulo: "page.gastos.title", subtitulo: "page.gastos.subtitle" },
  "/perfil": { titulo: "page.perfil.title", subtitulo: "page.perfil.subtitle" },
  "/configuracoes": { titulo: "page.configuracoes.title", subtitulo: "page.configuracoes.subtitle" },
  "/ajuda": { titulo: "page.ajuda.title", subtitulo: "page.ajuda.subtitle" },
};

function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? "";
}

export function TopBar() {
  const pathname = usePathname() ?? "/";
  const { resetar, estado } = usePortfolio();
  const { usuario, logout } = useAuth();
  const { t } = useI18n();

  const meta = TITULOS_POR_ROTA[pathname] ?? TITULOS_POR_ROTA["/"];
  const nomeCompleto = usuario?.nome ?? "Investidor";
  const subtituloKey = meta.subtitulo;
  const subtitulo = t(subtituloKey, { nome: primeiroNome(nomeCompleto) });

  const confirmarReset = () => {
    if (
      typeof window !== "undefined" &&
      window.confirm(
        "Zerar carteira? Isso vai apagar todas as transações, alertas, metas e voltar ao estado não configurado.",
      )
    ) {
      resetar();
    }
  };

  return (
    <header className="flex items-center justify-between px-8 py-5 border-b border-rule">
      <div>
        <h1 className="text-2xl font-semibold text-ink leading-tight">
          {t(meta.titulo)}
        </h1>
        <p className="text-sm text-ink-muted mt-0.5">{subtitulo}</p>
      </div>

      <div className="flex items-center gap-3">
        {estado.configurado && (
          <button
            onClick={confirmarReset}
            className="text-xs text-ink-muted hover:text-down border border-rule hover:border-down/50 px-3 py-2 rounded-md transition-colors"
          >
            {t("btn.reiniciar")}
          </button>
        )}

        <ThemeToggle />
        <MessagesDropdown />
        <NotificationsDropdown />

        <UserDropdown
          nome={nomeCompleto}
          email={usuario?.email ?? ""}
          avatarUrl={usuario?.avatarUrl ?? null}
          onLogout={logout}
        />
      </div>
    </header>
  );
}

function UserDropdown({
  nome,
  email,
  avatarUrl,
  onLogout,
}: {
  nome: string;
  email: string;
  avatarUrl: string | null;
  onLogout: () => Promise<void>;
}) {
  const { t } = useI18n();
  const [aberto, setAberto] = useState(false);
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
          "rounded-full transition-shadow",
          aberto && "ring-2 ring-brand/40",
        )}
      >
        <UserAvatar nome={nome} avatarUrl={avatarUrl} tamanho={36} />
      </button>

      {aberto && (
        <div className="absolute right-0 top-12 w-64 glass-card rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
          <div className="px-4 py-3 border-b border-rule flex items-center gap-3">
            <UserAvatar nome={nome} avatarUrl={avatarUrl} tamanho={40} />
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{nome}</div>
              <div className="text-[11px] text-ink-muted truncate">{email}</div>
            </div>
          </div>

          <div className="py-1">
            <Link
              href="/perfil"
              onClick={() => setAberto(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-navy-800/60 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-ink-muted">
                <path
                  d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {t("menu.meuPerfil")}
            </Link>

            <Link
              href="/configuracoes"
              onClick={() => setAberto(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-navy-800/60 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-ink-muted">
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
                <path
                  d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
              {t("menu.configuracoes")}
            </Link>
          </div>

          <div className="border-t border-rule py-1">
            <button
              onClick={onLogout}
              className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-down/10 text-down transition-colors w-full text-left"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {t("menu.sair")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
