"use client";

import { usePortfolio } from "@/state/portfolio";
import { formatPercent, classNames } from "@/utils/format";

interface Props {
  selecionado: string;
  onSelecionar: (ticker: string) => void;
}

export function MarketFavorites({ selecionado, onSelecionar }: Props) {
  const { ativos } = usePortfolio();

  // Mostra só ações + alguns destaques
  const lista = ativos
    .filter((a) => a.categoria === "acao")
    .slice(0, 8);

  return (
    <div className="glass-card rounded-xl">
      <div className="px-4 py-3 border-b border-rule flex items-center justify-between">
        <h3 className="text-sm font-semibold">Mercado & Favoritos</h3>
        <button className="text-xs text-ink-muted hover:text-ink">Ver tudo</button>
      </div>

      <div className="divide-y divide-rule-soft">
        {lista.map((a) => {
          const positivo = a.variacaoDia >= 0;
          const isSelected = a.ticker === selecionado;
          return (
            <button
              key={a.ticker}
              onClick={() => onSelecionar(a.ticker)}
              className={classNames(
                "w-full px-4 py-2.5 flex items-center justify-between text-left transition-colors hover:bg-navy-800/40",
                isSelected && "bg-brand/10",
              )}
            >
              <div className="flex items-center gap-2">
                <div
                  className={classNames(
                    "w-1 h-6 rounded-full",
                    isSelected ? "bg-brand" : "bg-transparent",
                  )}
                />
                <span className="font-medium text-sm">{a.ticker}</span>
              </div>
              <span
                className={classNames(
                  "text-sm font-medium num",
                  positivo ? "text-up" : "text-down",
                )}
              >
                {formatPercent(a.variacaoDia)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
