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
  const abrirAlertaInicial = searchParams.get("abrirAlerta") === "1";

  const { ativos } = usePortfolio();
  const [ticker, setTicker] = useState(tickerInicial);

  // Sincroniza ticker com query string
  useEffect(() => {
    const q = searchParams.get("ticker");
    if (q && q !== ticker) setTicker(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const trocarTicker = (novoTicker: string) => {
    setTicker(novoTicker);
    router.replace(`/negociar?ticker=${novoTicker}`, { scroll: false });
  };

  return (
    <div className="stagger">
      {/* Layout 70/30: gráfico + lista lateral */}
      <div className="grid grid-cols-1 xl:grid-cols-[7fr_3fr] gap-4">
        <div className="min-w-0">
          <AssetAnalysis ticker={ticker} abrirAlertaInicialmente={abrirAlertaInicial} />
        </div>
        <AssetSidebarList atual={ticker} onSelecionar={trocarTicker} />
      </div>
    </div>
  );
}

function AssetSidebarList({
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
    <aside className="glass-card rounded-xl flex flex-col xl:max-h-[calc(100vh-150px)] xl:sticky xl:top-4">
      {/* Header */}
      <div className="px-4 py-3 border-b border-rule">
        <h3 className="text-sm font-semibold">Ativos disponíveis</h3>
        <p className="text-[11px] text-ink-muted mt-0.5">
          {lista.length} de {ativos.length} · clique para analisar
        </p>
      </div>

      {/* Busca */}
      <div className="px-4 pt-3">
        <div className="relative">
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
            placeholder="Buscar ticker, nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-navy-800 border border-rule rounded-md pl-8 pr-3 py-1.5 text-xs focus:border-brand focus:outline-none"
          />
        </div>
      </div>

      {/* Filtros por categoria */}
      <div className="px-4 py-3 flex flex-wrap gap-1.5">
        {filtros.map((f) => (
          <button
            key={f.key}
            onClick={() => setFiltroCat(f.key)}
            className={classNames(
              "px-2 py-0.5 text-[11px] font-medium rounded-md transition-colors",
              filtroCat === f.key
                ? "bg-brand text-white"
                : "bg-navy-800 text-ink-muted hover:text-ink border border-rule",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista scrollável */}
      <div className="flex-1 overflow-y-auto px-2 pb-3 min-h-0">
        {lista.length === 0 ? (
          <div className="text-center py-6 text-xs text-ink-muted">
            Nenhum ativo encontrado.
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {lista.map((a) => {
              const positivo = a.variacaoDia >= 0;
              const ehAtual = a.ticker === atual;
              return (
                <button
                  key={a.ticker}
                  onClick={() => onSelecionar(a.ticker)}
                  className={classNames(
                    "text-left px-3 py-2.5 border rounded-md transition-colors flex items-center gap-3",
                    ehAtual
                      ? "bg-brand/15 border-brand"
                      : "bg-transparent border-transparent hover:bg-navy-800/50 hover:border-rule",
                  )}
                >
                  {/* Ticker e categoria */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5">
                      <span
                        className={classNames(
                          "font-semibold text-sm",
                          ehAtual && "text-brand",
                        )}
                      >
                        {a.ticker}
                      </span>
                      {ehAtual && (
                        <span className="text-[9px] uppercase tracking-wider text-brand font-medium">
                          atual
                        </span>
                      )}
                      <span className="text-[9px] uppercase tracking-wider text-ink-dim ml-auto">
                        {categoriaLabel(a.categoria)}
                      </span>
                    </div>
                    <div className="text-[10px] text-ink-muted truncate mt-0.5">
                      {a.nome}
                    </div>
                  </div>

                  {/* Preço e variação */}
                  <div className="text-right shrink-0">
                    <div className="text-xs num text-ink font-medium">
                      {formatBRL(a.preco)}
                    </div>
                    <div
                      className={classNames(
                        "text-[10px] num font-semibold mt-0.5",
                        positivo ? "text-up" : "text-down",
                      )}
                    >
                      {formatPercent(a.variacaoDia)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}

export default function NegociarPage() {
  return (
    <Suspense fallback={<div className="text-ink-muted">Carregando...</div>}>
      <NegociarContent />
    </Suspense>
  );
}
