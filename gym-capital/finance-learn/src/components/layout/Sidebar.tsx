"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/state/i18n";
import { classNames } from "@/utils/format";
import type { ChaveTraducao } from "@/data/translations";

interface SidebarItem {
  href: string;
  labelKey: ChaveTraducao;
  icon: React.ReactNode;
}

const itens: SidebarItem[] = [
  {
    href: "/",
    labelKey: "nav.dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="7" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    href: "/portfolio",
    labelKey: "nav.portfolio",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M3 7h18M3 7v12a1 1 0 001 1h16a1 1 0 001-1V7M3 7l2-4h14l2 4M9 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/mercados",
    labelKey: "nav.mercados",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M3 17l6-6 4 4 8-8M21 7v5h-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/biblioteca",
    labelKey: "nav.biblioteca",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/negociar",
    labelKey: "nav.negociar",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M7 17l-3-3m0 0l3-3m-3 3h13M17 7l3 3m0 0l-3 3m3-3H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/relatorios",
    labelKey: "nav.relatorios",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M9 2v6h6M9 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6H9zM9 15l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/gastos",
    labelKey: "nav.gastos",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/perfil",
    labelKey: "nav.perfil",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 21c0-4 4-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/configuracoes",
    labelKey: "nav.configuracoes",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3h0a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8v0a1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    href: "/ajuda",
    labelKey: "nav.ajuda",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9.5 9a2.5 2.5 0 015 0c0 1.5-2.5 2-2.5 4M12 17.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <aside className="w-[220px] shrink-0 bg-sidebar border-r border-rule flex flex-col">
      {/* Logo */}
      <Link href="/" className="px-6 py-6 border-b border-rule block">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-brand to-brand-soft flex items-center justify-center shadow-lg shadow-brand/20">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 3L4 8v8l8 5 8-5V8l-8-5z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
              <path d="M12 12l4-2.5M12 12v5M12 12L8 9.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-sm tracking-wide text-ink">GYM</div>
            <div className="text-[10px] text-ink-muted tracking-[0.15em] uppercase">
              Capital
            </div>
          </div>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {itens.map((item) => {
          const isAtivo =
            item.href === "/"
              ? pathname === "/"
              : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={classNames(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all",
                isAtivo
                  ? "bg-brand/15 text-brand border-l-2 border-brand"
                  : "text-ink-muted hover:text-ink hover:bg-navy-800/50 border-l-2 border-transparent",
              )}
            >
              <span className={isAtivo ? "text-brand" : ""}>{item.icon}</span>
              <span className="font-medium">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </nav>

      {/* Aviso educacional — fica em PT pois é mensagem fixa da plataforma */}
      <div className="m-3 p-3 rounded-md bg-navy-800/50 border border-rule">
        <div className="text-[10px] uppercase tracking-wider text-brand font-semibold mb-1">
          Ambiente Simulado
        </div>
        <p className="text-xs text-ink-muted leading-relaxed">
          Todo dinheiro aqui é fictício. Use para aprender sem riscos.
        </p>
      </div>
    </aside>
  );
}
