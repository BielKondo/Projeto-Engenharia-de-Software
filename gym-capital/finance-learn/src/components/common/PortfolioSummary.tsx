"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePortfolio } from "@/state/portfolio";
import { formatBRL, formatPercent, classNames } from "@/utils/format";

export function PortfolioSummary() {
  const {
    patrimonioTotal,
    rendimentoPercentual,
    estado,
    hidratado,
  } = usePortfolio();

  const positivo = rendimentoPercentual >= 0;

  // Constrói série de patrimônio: histórico + ponto atual
  const serie = useMemo(() => {
    if (estado.historico.length === 0) return [];
    const base = estado.historico.map((h) => h.patrimonio);
    return [...base.slice(0, -1), patrimonioTotal];
  }, [estado.historico, patrimonioTotal]);

  // Se não tem saldo configurado, mostra CTA
  if (hidratado && !estado.configurado) {
    return (
      <div className="glass-card glow-card rounded-xl p-6 relative">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-ink-muted uppercase tracking-wider mb-1">
              Simulador não configurado
            </div>
            <div className="text-2xl font-semibold mb-1">
              Comece sua jornada de investidor
            </div>
            <p className="text-sm text-ink-muted max-w-xl">
              Configure seu saldo inicial para começar a simular operações.
              Todo dinheiro é fictício — ideal para aprender sem riscos.
            </p>
          </div>
          <Link
            href="/portfolio"
            className="shrink-0 px-5 py-2.5 bg-brand hover:bg-brand-hover text-white font-semibold rounded-md text-sm transition-colors"
          >
            Configurar agora →
          </Link>
        </div>
      </div>
    );
  }

  // Geometria do gráfico
  const w = 520;
  const h = 130;
  const padding = 4;

  if (serie.length === 0) {
    return (
      <div className="glass-card glow-card rounded-xl p-6 relative">
        <div className="text-sm text-ink-muted">Carregando...</div>
      </div>
    );
  }

  const min = Math.min(...serie);
  const max = Math.max(...serie);
  const range = max - min || 1;
  const stepX = (w - padding * 2) / Math.max(1, serie.length - 1);

  const pontos = serie.map((v, i) => {
    const x = padding + i * stepX;
    const y = padding + (h - padding * 2) * (1 - (v - min) / range);
    return { x, y };
  });

  const linhaPath = pontos
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const areaPath = `${linhaPath} L ${pontos[pontos.length - 1].x} ${h - padding} L ${pontos[0].x} ${h - padding} Z`;

  return (
    <div className="glass-card glow-card rounded-xl p-6 relative">
      <div className="flex items-start justify-between gap-6">
        <div className="space-y-1 z-10">
          <div className="text-xs text-ink-muted uppercase tracking-wider">
            Resumo do Portfólio
          </div>
          <div className="text-3xl font-bold tracking-tight num">
            {hidratado ? formatBRL(patrimonioTotal) : "R$ —"}
          </div>
          <div className="text-xs text-ink-muted">
            Gráfico de desempenho mensal/anual
          </div>
        </div>

        <div className="space-y-1 text-right z-10">
          <div className="text-xs text-ink-muted uppercase tracking-wider">
            Total
          </div>
          <div
            className={classNames(
              "text-2xl font-semibold num",
              positivo ? "text-up" : "text-down",
            )}
          >
            {formatPercent(rendimentoPercentual)} hoje
          </div>
        </div>
      </div>

      <div className="mt-4 -mx-2">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="w-full h-[130px]"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={positivo ? "#10B981" : "#EF4444"}
                stopOpacity="0.35"
              />
              <stop
                offset="100%"
                stopColor={positivo ? "#10B981" : "#EF4444"}
                stopOpacity="0"
              />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#area-grad)" />
          <path
            d={linhaPath}
            fill="none"
            stroke={positivo ? "#10B981" : "#EF4444"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {pontos.length > 0 && (
            <>
              <circle
                cx={pontos[pontos.length - 1].x}
                cy={pontos[pontos.length - 1].y}
                r="4"
                fill={positivo ? "#10B981" : "#EF4444"}
              />
              <circle
                cx={pontos[pontos.length - 1].x}
                cy={pontos[pontos.length - 1].y}
                r="8"
                fill={positivo ? "#10B981" : "#EF4444"}
                opacity="0.2"
              />
            </>
          )}
        </svg>
      </div>
    </div>
  );
}
