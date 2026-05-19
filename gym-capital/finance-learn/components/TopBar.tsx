"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { useAuth } from "@/contexts/AuthContext";
import { MessagesDropdown } from "./MessagesDropdown";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { ThemeToggle } from "./ThemeToggle";
import { classNames } from "@/lib/formatters";

const titulosPorRota: Record<
  string,
  { titulo: string; subtitulo: (nome: string) => string }
> = {
  "/": {
    titulo: "Sua Carteira de Investimentos",
    subtitulo: (nome) =>
      `Bem-vindo, ${nome} · Status: Investidor Qualificado`,
  },
  "/portfolio": {
    titulo: "Portfólio Detalhado",
    subtitulo: () => "Acompanhe a alocação e performance de cada posição",
  },
  "/mercados": {
    titulo: "Mercados",
    subtitulo: () => "Explore todos os ativos disponíveis na plataforma",
  },
  "/biblioteca": {
    titulo: "Biblioteca",
    subtitulo: () => "Vídeos, artigos e cursos sobre finanças e investimentos",
  },
  "/negociar": {
    titulo: "Negociar",
    subtitulo: () => "Compre ou venda ativos para sua carteira simulada",
  },
  "/relatorios": {
    titulo: "Relatórios",
    subtitulo: () => "Histórico de operações, metas e performance",
  },
  "/gastos": {
    titulo: "Controle de Gastos",
    subtitulo: () => "Registre receitas e despesas para acompanhar seu fluxo",
  },
  "/perfil": {
    titulo: "Perfil do Investidor",
    subtitulo: () => "Suas informações e estilo de investimento",
  },
  "/configuracoes": {
    titulo: "Configurações",
    subtitulo: () => "Personalize sua experiência na plataforma",
  },
  "/ajuda": {
    titulo: "Central de Ajuda",
    subtitulo: () => "Tire dúvidas sobre a plataforma",
  },
};

function gerarIniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? "";
}

export function TopBar() {
  const pathname = usePathname() ?? "/";
  const { resetar, estado } = usePortfolio();
  const { usuario, logout } = useAuth();

  const meta = titulosPorRota[pathname] ?? titulosPorRota["/"];
  const nomeCompleto = usuario?.nome ?? "Investidor";
  const subtitulo = meta.subtitulo(primeiroNome(nomeCompleto));
  const iniciais = gerarIniciais(nomeCompleto);

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
          {meta.titulo}
        </h1>
        <p className="text-sm text-ink-muted mt-0.5">{subtitulo}</p>
      </div>

      <div className="flex items-center gap-3">
        {estado.configurado && (
          <button
            onClick={confirmarReset}
            className="text-xs text-ink-muted hover:text-down border border-rule hover:border-down/50 px-3 py-2 rounded-md transition-colors"
            title="Zerar carteira"
          >
            Reiniciar simulação
          </button>
        )}

        <ThemeToggle />
        <MessagesDropdown />
        <NotificationsDropdown />

        <UserDropdown
          iniciais={iniciais}
          nome={nomeCompleto}
          email={usuario?.email ?? ""}
          onLogout={logout}
        />
      </div>
    </header>
  );
}

function UserDropdown({
  iniciais,
  nome,
  email,
  onLogout,
}: {
  iniciais: string;
  nome: string;
  email: string;
  onLogout: () => Promise<void>;
}) {
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
          "w-9 h-9 rounded-full bg-gradient-to-br from-brand to-brand-soft flex items-center justify-center font-semibold text-sm text-white transition-shadow",
          aberto && "ring-2 ring-brand/40",
        )}
        title="Menu da conta"
      >
        {iniciais}
      </button>

      {aberto && (
        <div className="absolute right-0 top-12 w-64 glass-card rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
          <div className="px-4 py-3 border-b border-rule flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-brand-soft flex items-center justify-center font-semibold text-sm text-white shrink-0">
              {iniciais}
            </div>
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
              Meu perfil
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
              Configurações
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
              Sair da conta
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
