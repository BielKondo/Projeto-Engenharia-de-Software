"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePortfolio } from "@/contexts/PortfolioContext";
import {
  formatBRL,
  formatPercent,
  classNames,
  categoriaLabel,
} from "@/lib/formatters";
import { AssetAnalysis } from "@/components/AssetAnalysis";
import type { AssetCategory } from "@/lib/types";

function NegociarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tickerInicial = searchParams.get("ticker") ?? "PETR4";

  const { ativos } = usePortfolio();
  const [ticker, setTicker] = useState(tickerInicial);

  // Sincroniza ticker com query string
  useEffect(() => {
    const q = searchParams.get("ticker");
    if (q && q !== ticker) setTicker(q);
  }, [searchParams]);

  const ativo = ativos.find((a) => a.ticker === ticker);

  const trocarTicker = (novoTicker: string) => {
    setTicker(novoTicker);
    router.replace(`/negociar?ticker=${novoTicker}`, { scroll: false });
  };

  return (
    <div className="space-y-6 stagger">
      {/* Seletor de ativo */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-xs text-ink-muted uppercase tracking-wider">
            Selecionar ativo:
          </label>
          <select
            value={ticker}
            onChange={(e) => trocarTicker(e.target.value)}
            className="bg-navy-800 border border-rule rounded-md px-3 py-2 text-sm font-medium min-w-[200px] focus:border-brand focus:outline-none"
          >
            {ativos.map((a) => (
              <option key={a.ticker} value={a.ticker}>
                {a.ticker} — {a.nome}
              </option>
            ))}
          </select>

          {ativo && (
            <div className="flex items-center gap-3 ml-auto">
              <span className="text-xs px-2 py-1 rounded bg-navy-800 border border-rule text-ink-muted">
                {categoriaLabel(ativo.categoria)}
              </span>
              <span className="text-sm text-ink-muted">{ativo.setor}</span>
            </div>
          )}
        </div>
      </div>

      {/* Análise do ativo */}
      <AssetAnalysis ticker={ticker} />

      {/* Atalhos para outros ativos */}
      <RelatedAssets atual={ticker} onSelecionar={trocarTicker} />
    </div>
  );
}

function RelatedAssets({
  atual,
  onSelecionar,
}: {
  atual: string;
  onSelecionar: (t: string) => void;
}) {
  const { ativos } = usePortfolio();
  const [filtroCat, setFiltroCat] = useState<"todos" | AssetCategory>("todos");
  const [busca, setBusca] = useState("");

  const filtros: { key: "todos" | AssetCategory; label: string }[] = [
    { key: "todos", label: "Todos" },
    { key: "acao", label: "Ações" },
    { key: "etf", label: "ETFs" },
    { key: "fii", label: "FIIs" },
    { key: "tesouro", label: "Tesouro" },
    { key: "cripto", label: "Cripto" },
  ];

  // TODOS os ativos disponíveis (mesma fonte da aba Mercados)
  const lista = useMemo(() => {
    let result = ativos;
    if (filtroCat !== "todos")
      result = result.filter((a) => a.categoria === filtroCat);
    if (busca.trim()) {
      const q = busca.toLowerCase();
      result = result.filter(
        (a) =>
          a.ticker.toLowerCase().includes(q) ||
          a.nome.toLowerCase().includes(q) ||
          a.setor.toLowerCase().includes(q),
      );
    }
    return result;
  }, [ativos, filtroCat, busca]);

  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold">
            Todos os ativos disponíveis
          </h3>
          <p className="text-xs text-ink-muted mt-0.5">
            Mesma lista da aba Mercados · clique para analisar
          </p>
        </div>
        <span className="text-xs text-ink-muted">
          {lista.length} de {ativos.length}
        </span>
      </div>

      {/* Filtros + busca */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex flex-wrap gap-1.5">
          {filtros.map((f) => (
            <button
              key={f.key}
              onClick={() => setFiltroCat(f.key)}
              className={classNames(
                "px-2.5 py-1 text-xs font-medium rounded-md transition-colors",
                filtroCat === f.key
                  ? "bg-brand text-white"
                  : "bg-navy-800 text-ink-muted hover:text-ink border border-rule",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex-1 md:max-w-xs md:ml-auto relative">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-dim"
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Buscar ticker, nome ou setor..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-navy-800 border border-rule rounded-md pl-8 pr-3 py-1.5 text-xs focus:border-brand focus:outline-none"
          />
        </div>
      </div>

      {lista.length === 0 ? (
        <div className="text-center py-8 text-sm text-ink-muted">
          Nenhum ativo encontrado com esses filtros.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
          {lista.map((a) => {
            const positivo = a.variacaoDia >= 0;
            const ehAtual = a.ticker === atual;
            return (
              <button
                key={a.ticker}
                onClick={() => onSelecionar(a.ticker)}
                className={classNames(
                  "text-left px-3 py-3 border rounded-md transition-colors",
                  ehAtual
                    ? "bg-brand/15 border-brand"
                    : "bg-navy-800/50 border-rule hover:border-brand",
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div
                    className={classNames(
                      "font-semibold text-sm",
                      ehAtual && "text-brand",
                    )}
                  >
                    {a.ticker}
                    {ehAtual && (
                      <span className="ml-1 text-[9px] uppercase tracking-wider text-brand">
                        atual
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] uppercase tracking-wider text-ink-dim">
                    {categoriaLabel(a.categoria)}
                  </span>
                </div>
                <div className="text-xs num text-ink-muted truncate">
                  {formatBRL(a.preco)}
                </div>
                <div
                  className={classNames(
                    "text-xs num font-medium mt-0.5",
                    positivo ? "text-up" : "text-down",
                  )}
                >
                  {formatPercent(a.variacaoDia)}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function NegociarPage() {
  return (
    <Suspense fallback={<div className="text-ink-muted">Carregando...</div>}>
      <NegociarContent />
    </Suspense>
  );
}
