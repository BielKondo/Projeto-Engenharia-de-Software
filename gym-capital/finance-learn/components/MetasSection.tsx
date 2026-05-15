"use client";

import { useState } from "react";
import { usePortfolio } from "@/contexts/PortfolioContext";
import {
  formatBRL,
  formatPercent,
  classNames,
} from "@/lib/formatters";
import type { CategoriaMeta, Meta } from "@/lib/types";
import { MetaModal } from "./MetaModal";

const iconePorCategoria: Record<CategoriaMeta, string> = {
  reserva: "🛡️",
  compra: "🛒",
  viagem: "✈️",
  aposentadoria: "🌴",
  educacao: "🎓",
  outro: "🎯",
};

export function MetasSection() {
  const {
    estado,
    patrimonioTotal,
    valorInvestido,
    removerMeta,
  } = usePortfolio();

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Meta | undefined>(undefined);

  const valorAtualDe = (meta: Meta): number => {
    if (meta.vincular === "patrimonio") return patrimonioTotal;
    if (meta.vincular === "investido") return valorInvestido;
    if (meta.vincular === "caixa") return estado.caixa;
    return meta.valorAtualManual ?? 0;
  };

  const abrirNova = () => {
    setEditando(undefined);
    setModalAberto(true);
  };

  const abrirEdicao = (meta: Meta) => {
    setEditando(meta);
    setModalAberto(true);
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-rule flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">Minhas Metas Financeiras</h3>
          <p className="text-xs text-ink-muted mt-0.5">
            {estado.metas.length}{" "}
            {estado.metas.length === 1 ? "meta ativa" : "metas ativas"} ·
            Progresso calculado em tempo real
          </p>
        </div>
        <button
          onClick={abrirNova}
          className="text-xs px-3 py-2 bg-brand hover:bg-brand-hover text-white rounded-md font-medium transition-colors flex items-center gap-1.5"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          Nova Meta
        </button>
      </div>

      {estado.metas.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <div className="text-4xl mb-3">🎯</div>
          <p className="text-sm text-ink-muted mb-4 max-w-md mx-auto">
            Você ainda não criou nenhuma meta. Defina objetivos financeiros
            para visualizar seu progresso e ficar motivado.
          </p>
          <button
            onClick={abrirNova}
            className="text-xs px-4 py-2 border border-brand text-brand hover:bg-brand/10 rounded-md font-medium transition-colors"
          >
            Criar primeira meta
          </button>
        </div>
      ) : (
        <div className="divide-y divide-rule-soft">
          {estado.metas.map((m) => {
            const atual = valorAtualDe(m);
            const progresso = m.valorAlvo > 0 ? (atual / m.valorAlvo) * 100 : 0;
            const progressoClampado = Math.min(100, Math.max(0, progresso));
            const completa = progresso >= 100;
            const diasRestantes = Math.ceil(
              (new Date(m.prazo).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
            );
            const atrasada = diasRestantes < 0;

            return (
              <MetaCard
                key={m.id}
                meta={m}
                atual={atual}
                progresso={progresso}
                progressoClampado={progressoClampado}
                completa={completa}
                diasRestantes={diasRestantes}
                atrasada={atrasada}
                onEditar={() => abrirEdicao(m)}
                onRemover={() => {
                  if (
                    typeof window !== "undefined" &&
                    window.confirm(`Remover a meta "${m.titulo}"?`)
                  ) {
                    removerMeta(m.id);
                  }
                }}
              />
            );
          })}
        </div>
      )}

      {modalAberto && (
        <MetaModal
          metaInicial={editando}
          onClose={() => setModalAberto(false)}
        />
      )}
    </div>
  );
}

function MetaCard({
  meta,
  atual,
  progresso,
  progressoClampado,
  completa,
  diasRestantes,
  atrasada,
  onEditar,
  onRemover,
}: {
  meta: Meta;
  atual: number;
  progresso: number;
  progressoClampado: number;
  completa: boolean;
  diasRestantes: number;
  atrasada: boolean;
  onEditar: () => void;
  onRemover: () => void;
}) {
  return (
    <div className="px-5 py-4 hover:bg-navy-800/30 transition-colors group">
      <div className="flex items-start gap-3 mb-3">
        <div
          className={classNames(
            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-lg",
            completa
              ? "bg-up/15"
              : atrasada
                ? "bg-down/15"
                : "bg-navy-800",
          )}
        >
          {iconePorCategoria[meta.categoria]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <div className="font-semibold text-sm truncate">
              {meta.titulo}
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button
                onClick={onEditar}
                className="text-ink-dim hover:text-brand p-1 rounded transition-colors"
                title="Editar"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 20h9M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                onClick={onRemover}
                className="text-ink-dim hover:text-down p-1 rounded transition-colors"
                title="Remover"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
          {meta.descricao && (
            <p className="text-xs text-ink-muted mt-0.5 line-clamp-1">
              {meta.descricao}
            </p>
          )}
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between text-xs">
          <span className="num text-ink">
            <span className="font-semibold">{formatBRL(atual)}</span>{" "}
            <span className="text-ink-muted">de {formatBRL(meta.valorAlvo)}</span>
          </span>
          <span
            className={classNames(
              "font-semibold num",
              completa
                ? "text-up"
                : progresso >= 50
                  ? "text-brand"
                  : "text-ink-muted",
            )}
          >
            {progresso.toFixed(1)}%
          </span>
        </div>

        <div className="h-2 bg-navy-800 rounded-full overflow-hidden">
          <div
            className={classNames(
              "h-full rounded-full transition-all duration-700",
              completa
                ? "bg-up"
                : atrasada
                  ? "bg-down/70"
                  : "bg-gradient-to-r from-brand to-brand-soft",
            )}
            style={{ width: `${progressoClampado}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] mt-1">
          <span className="text-ink-muted">
            Vinculado a{" "}
            <span className="text-ink">
              {meta.vincular === "patrimonio"
                ? "patrimônio"
                : meta.vincular === "investido"
                  ? "investimentos"
                  : meta.vincular === "caixa"
                    ? "caixa"
                    : "valor manual"}
            </span>
          </span>
          <span
            className={classNames(
              completa
                ? "text-up font-semibold"
                : atrasada
                  ? "text-down"
                  : diasRestantes <= 30
                    ? "text-sell"
                    : "text-ink-muted",
            )}
          >
            {completa
              ? "✓ Meta atingida!"
              : atrasada
                ? `Atrasada há ${Math.abs(diasRestantes)}d`
                : diasRestantes === 0
                  ? "Vence hoje"
                  : `Faltam ${diasRestantes}d`}
          </span>
        </div>
      </div>
    </div>
  );
}
