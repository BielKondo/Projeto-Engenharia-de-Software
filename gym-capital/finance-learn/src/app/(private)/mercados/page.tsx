"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { usePortfolio } from "@/state/portfolio";
import type { Asset, AssetCategory } from "@/types";
import {
  formatBRL,
  formatPercent,
  formatVolume,
  classNames,
  categoriaLabel,
  riscoLabel,
} from "@/utils/format";

type Filtro = "todos" | AssetCategory;

const filtros: { key: Filtro; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "acao", label: "Ações" },
  { key: "etf", label: "ETFs" },
  { key: "fii", label: "FIIs" },
  { key: "tesouro", label: "Tesouro" },
  { key: "cripto", label: "Cripto" },
];

type OrdemKey = "ticker" | "preco" | "variacaoDia" | "volume";

export default function MercadosPage() {
  const { ativos } = usePortfolio();
  const [filtroAtivo, setFiltroAtivo] = useState<Filtro>("todos");
  const [busca, setBusca] = useState("");
  const [ordemPor, setOrdemPor] = useState<OrdemKey>("ticker");
  const [ordemAsc, setOrdemAsc] = useState(true);

  const lista = useMemo(() => {
    let result: Asset[] = ativos;

    if (filtroAtivo !== "todos") {
      result = result.filter((a) => a.categoria === filtroAtivo);
    }

    if (busca.trim()) {
      const q = busca.toLowerCase();
      result = result.filter(
        (a) =>
          a.ticker.toLowerCase().includes(q) ||
          a.nome.toLowerCase().includes(q) ||
          a.setor.toLowerCase().includes(q),
      );
    }

    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (ordemPor === "ticker") cmp = a.ticker.localeCompare(b.ticker);
      else if (ordemPor === "preco") cmp = a.preco - b.preco;
      else if (ordemPor === "variacaoDia") cmp = a.variacaoDia - b.variacaoDia;
      else if (ordemPor === "volume") cmp = a.volume - b.volume;
      return ordemAsc ? cmp : -cmp;
    });

    return result;
  }, [ativos, filtroAtivo, busca, ordemPor, ordemAsc]);

  const alternarOrdem = (key: OrdemKey) => {
    if (ordemPor === key) setOrdemAsc(!ordemAsc);
    else {
      setOrdemPor(key);
      setOrdemAsc(true);
    }
  };

  return (
    <div className="space-y-6 stagger">
      {/* Filtros + busca */}
      <div className="glass-card rounded-xl p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="flex gap-1.5 flex-wrap">
          {filtros.map((f) => (
            <button
              key={f.key}
              onClick={() => setFiltroAtivo(f.key)}
              className={classNames(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                filtroAtivo === f.key
                  ? "bg-brand text-white"
                  : "bg-navy-800 text-ink-muted hover:text-ink border border-rule",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex-1 md:ml-auto md:max-w-xs relative">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-dim"
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Buscar ticker, nome ou setor..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-navy-800 border border-rule rounded-md pl-9 pr-3 py-2 text-sm placeholder:text-ink-dim focus:border-brand focus:outline-none"
          />
        </div>
      </div>

      {/* Tabela */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-rule">
          <h3 className="text-base font-semibold">
            {lista.length} {lista.length === 1 ? "ativo" : "ativos"}
          </h3>
          <p className="text-xs text-ink-muted mt-0.5">
            Cotações simuladas atualizadas em tempo real
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-ink-muted uppercase tracking-wider border-b border-rule">
                <ThSort
                  label="Ativo"
                  ativo={ordemPor === "ticker"}
                  asc={ordemAsc}
                  onClick={() => alternarOrdem("ticker")}
                  align="left"
                />
                <th className="text-left px-3 py-3 font-medium">Categoria</th>
                <th className="text-left px-3 py-3 font-medium">Setor</th>
                <ThSort
                  label="Preço"
                  ativo={ordemPor === "preco"}
                  asc={ordemAsc}
                  onClick={() => alternarOrdem("preco")}
                  align="right"
                />
                <ThSort
                  label="Variação"
                  ativo={ordemPor === "variacaoDia"}
                  asc={ordemAsc}
                  onClick={() => alternarOrdem("variacaoDia")}
                  align="right"
                />
                <ThSort
                  label="Volume"
                  ativo={ordemPor === "volume"}
                  asc={ordemAsc}
                  onClick={() => alternarOrdem("volume")}
                  align="right"
                />
                <th className="text-center px-3 py-3 font-medium">Risco</th>
                <th className="text-right px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule-soft">
              {lista.map((a) => {
                const positivo = a.variacaoDia >= 0;
                return (
                  <tr
                    key={a.ticker}
                    className="hover:bg-navy-800/30 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-md bg-gradient-to-br from-navy-700 to-navy-800 border border-rule flex items-center justify-center font-bold text-[10px]">
                          {a.ticker.slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold">{a.ticker}</div>
                          <div className="text-xs text-ink-muted truncate max-w-[180px]">
                            {a.nome}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-xs px-2 py-0.5 rounded bg-navy-800 border border-rule text-ink-muted">
                        {categoriaLabel(a.categoria)}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-ink-muted">
                      {a.setor}
                    </td>
                    <td className="text-right px-3 py-3 num font-medium">
                      {formatBRL(a.preco)}
                    </td>
                    <td
                      className={classNames(
                        "text-right px-3 py-3 num font-medium",
                        positivo ? "text-up" : "text-down",
                      )}
                    >
                      {formatPercent(a.variacaoDia)}
                    </td>
                    <td className="text-right px-3 py-3 num text-ink-muted">
                      {formatVolume(a.volume)}
                    </td>
                    <td className="text-center px-3 py-3">
                      <RiscoBadge risco={a.risco} />
                    </td>
                    <td className="text-right px-5 py-3">
                      <Link
                        href={`/negociar?ticker=${a.ticker}`}
                        className="text-xs px-3 py-1.5 bg-navy-800 border border-rule hover:border-brand hover:text-brand rounded-md transition-colors"
                      >
                        Negociar
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {lista.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-10 text-sm text-ink-muted"
                  >
                    Nenhum ativo encontrado com esses filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ThSort({
  label,
  ativo,
  asc,
  onClick,
  align,
}: {
  label: string;
  ativo: boolean;
  asc: boolean;
  onClick: () => void;
  align: "left" | "right";
}) {
  return (
    <th
      className={classNames(
        "px-3 py-3 font-medium cursor-pointer hover:text-ink",
        align === "left" ? "text-left pl-5" : "text-right",
      )}
      onClick={onClick}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {ativo && (
          <svg
            width="10"
            height="10"
            viewBox="0 0 12 12"
            fill="currentColor"
            className={asc ? "" : "rotate-180"}
          >
            <path d="M6 3l4 5H2z" />
          </svg>
        )}
      </span>
    </th>
  );
}

function RiscoBadge({ risco }: { risco: string }) {
  const cores: Record<string, string> = {
    conservador: "bg-up/15 text-up border-up/30",
    moderado: "bg-brand/15 text-brand border-brand/30",
    arrojado: "bg-sell/15 text-sell border-sell/30",
  };
  return (
    <span
      className={classNames(
        "text-[10px] px-2 py-0.5 rounded-full border font-medium uppercase tracking-wider",
        cores[risco] ?? "bg-navy-800 text-ink-muted border-rule",
      )}
    >
      {riscoLabel(risco)}
    </span>
  );
}
