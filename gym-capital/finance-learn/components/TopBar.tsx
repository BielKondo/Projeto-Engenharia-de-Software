"use client";

import { usePathname } from "next/navigation";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { MessagesDropdown } from "./MessagesDropdown";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { ThemeToggle } from "./ThemeToggle";

const titulosPorRota: Record<
  string,
  { titulo: string; subtitulo: string }
> = {
  "/": {
    titulo: "Sua Carteira de Investimentos",
    subtitulo: "Bem-vindo, Arthur S. · Status: Investidor Qualificado",
  },
  "/portfolio": {
    titulo: "Portfólio Detalhado",
    subtitulo: "Acompanhe a alocação e performance de cada posição",
  },
  "/mercados": {
    titulo: "Mercados",
    subtitulo: "Explore todos os ativos disponíveis na plataforma",
  },
  "/biblioteca": {
    titulo: "Biblioteca",
    subtitulo: "Vídeos, artigos e cursos sobre finanças e investimentos",
  },
  "/negociar": {
    titulo: "Negociar",
    subtitulo: "Compre ou venda ativos para sua carteira simulada",
  },
  "/relatorios": {
    titulo: "Relatórios",
    subtitulo: "Histórico de operações, metas e performance",
  },
  "/gastos": {
    titulo: "Controle de Gastos",
    subtitulo: "Registre receitas e despesas para acompanhar seu fluxo",
  },
  "/perfil": {
    titulo: "Perfil do Investidor",
    subtitulo: "Suas informações e estilo de investimento",
  },
  "/configuracoes": {
    titulo: "Configurações",
    subtitulo: "Personalize sua experiência na plataforma",
  },
  "/ajuda": {
    titulo: "Central de Ajuda",
    subtitulo: "Tire dúvidas sobre a plataforma",
  },
};

export function TopBar() {
  const pathname = usePathname() ?? "/";
  const { resetar, estado } = usePortfolio();

  const meta = titulosPorRota[pathname] ?? titulosPorRota["/"];

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
        <p className="text-sm text-ink-muted mt-0.5">{meta.subtitulo}</p>
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

        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand to-brand-soft flex items-center justify-center font-semibold text-sm text-white">
          AS
        </div>
      </div>
    </header>
  );
}
