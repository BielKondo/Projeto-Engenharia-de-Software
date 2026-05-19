"use client";

import Link from "next/link";
import { usePortfolio } from "@/state/portfolio";
import {
  formatBRL,
  formatPercent,
  classNames,
  categoriaLabel,
} from "@/utils/format";
import type { Asset } from "@/types";

interface Props {
  onNegociar?: (ticker: string) => void;
}

export function ActivitiesTrends({ onNegociar }: Props) {
  const { ativos, estado, precoAtual } = usePortfolio();

  const minhasPosicoes = estado.posicoes
    .map((p) => {
      const ativo = ativos.find((a) => a.ticker === p.ticker);
      if (!ativo) return null;
      const valor = p.quantidade * precoAtual(p.ticker);
      const investido = p.precoMedio * p.quantidade;
      const rendimento = valor - investido;
      const rendimentoPct = (rendimento / investido) * 100;
      return { ativo, posicao: p, valor, rendimento, rendimentoPct };
    })
    .filter(Boolean) as {
      ativo: Asset;
      posicao: { ticker: string; quantidade: number; precoMedio: number };
      valor: number;
      rendimento: number;
      rendimentoPct: number;
    }[];

  return (
    <div className="glass-card rounded-xl">
      <div className="px-5 py-4 border-b border-rule flex items-center justify-between">
        <h3 className="text-base font-semibold">
          Minhas Atividades & Tendências
        </h3>
        <button className="text-xs text-ink-muted hover:text-ink">
          Ver histórico
        </button>
      </div>

      {minhasPosicoes.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-navy-800 mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 17l6-6 4 4 8-8M21 7v5h-5"
                stroke="#3B82F6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="text-sm text-ink mb-1">
            Você ainda não tem ativos em carteira
          </div>
          <p className="text-xs text-ink-muted max-w-sm mx-auto">
            Use os botões COMPRAR no painel de análise para fazer sua primeira
            operação simulada.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-rule-soft">
          {minhasPosicoes.map(({ ativo, posicao, valor, rendimentoPct }) => {
            const positivo = rendimentoPct >= 0;
            return (
              <div
                key={ativo.ticker}
                className="px-5 py-3 flex items-center gap-4"
              >
                {/* Ícone do ativo */}
                <div className="w-9 h-9 rounded-md bg-gradient-to-br from-navy-700 to-navy-800 border border-rule flex items-center justify-center shrink-0 font-bold text-xs">
                  {ativo.ticker.slice(0, 2)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">
                      {ativo.ticker}
                    </span>
                    <span className="text-xs text-ink-muted">
                      {categoriaLabel(ativo.categoria)}
                    </span>
                  </div>
                  <div className="text-xs text-ink-muted mt-0.5">
                    {posicao.quantidade}{" "}
                    {posicao.quantidade === 1 ? "cota" : "cotas"} · PM{" "}
                    {formatBRL(posicao.precoMedio)}
                  </div>
                </div>

                {/* Mini sparkline */}
                <Sparkline
                  data={ativo.historico.slice(-30).map((c) => c.fechamento)}
                  positivo={positivo}
                />

                {/* Valor e variação */}
                <div className="text-right shrink-0 w-28">
                  <div className="text-sm font-semibold num">
                    {formatBRL(valor)}
                  </div>
                  <div
                    className={classNames(
                      "text-xs num",
                      positivo ? "text-up" : "text-down",
                    )}
                  >
                    {formatPercent(rendimentoPct)}
                  </div>
                </div>

                {/* Ação */}
                <Link
                  href={`/negociar?ticker=${ativo.ticker}`}
                  onClick={() => onNegociar?.(ativo.ticker)}
                  className="text-xs px-3 py-1.5 bg-navy-800 border border-rule text-ink hover:border-brand hover:text-brand rounded-md transition-colors shrink-0"
                >
                  Negociar
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Sparkline({
  data,
  positivo,
}: {
  data: number[];
  positivo: boolean;
}) {
  if (data.length === 0) return null;
  const w = 80;
  const h = 28;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);

  const path = data
    .map((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / range) * h;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  const cor = positivo ? "#10B981" : "#EF4444";

  return (
    <svg width={w} height={h} className="shrink-0">
      <path
        d={path}
        fill="none"
        stroke={cor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
