"use client";

import { useEffect } from "react";
import type { Candle } from "@/lib/types";
import {
  formatBRL,
  formatPercent,
  formatVolume,
  classNames,
} from "@/lib/formatters";
import { Portal } from "./Portal";

interface Props {
  candle: Candle;
  candleAnterior?: Candle;
  ticker: string;
  onClose: () => void;
}

export function CandleDetailsModal({
  candle,
  candleAnterior,
  ticker,
  onClose,
}: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const variacaoDia = candle.fechamento - candle.abertura;
  const variacaoDiaPct = (variacaoDia / candle.abertura) * 100;

  const variacaoVsAnterior = candleAnterior
    ? candle.fechamento - candleAnterior.fechamento
    : 0;
  const variacaoVsAnteriorPct = candleAnterior
    ? (variacaoVsAnterior / candleAnterior.fechamento) * 100
    : 0;

  const amplitude = candle.maxima - candle.minima;
  const amplitudePct = (amplitude / candle.minima) * 100;

  const positivoDia = variacaoDia >= 0;
  const positivoAnterior = variacaoVsAnterior >= 0;

  const dataFmt = new Date(candle.data + "T00:00:00").toLocaleDateString(
    "pt-BR",
    {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    },
  );

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[110] modal-backdrop flex items-center justify-center p-4 animate-fade-in"
        onClick={onClose}
      >
      <div
        className="glass-card rounded-xl w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={classNames(
            "px-5 py-4 border-b border-rule",
            positivoDia ? "bg-up/10" : "bg-down/10",
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-ink-muted">
                Detalhes do dia
              </div>
              <div className="text-lg font-semibold mt-0.5">
                {ticker}{" "}
                <span className="text-ink-muted font-normal text-sm">
                  · {dataFmt}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-ink-muted hover:text-ink p-1"
              aria-label="Fechar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Resumo do fechamento */}
        <div className="px-5 py-4 border-b border-rule">
          <div className="text-xs text-ink-muted">Preço de fechamento</div>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-2xl font-bold num">
              {formatBRL(candle.fechamento)}
            </span>
            <span
              className={classNames(
                "text-sm font-medium num",
                positivoDia ? "text-up" : "text-down",
              )}
            >
              {variacaoDia >= 0 ? "+" : ""}
              {formatBRL(variacaoDia)} ({formatPercent(variacaoDiaPct)})
            </span>
          </div>
          <div className="text-xs text-ink-muted mt-1">
            Variação no dia (abertura → fechamento)
          </div>
        </div>

        {/* OHLC + Volume */}
        <div className="px-5 py-4 space-y-3 border-b border-rule">
          <Linha label="Abertura" valor={formatBRL(candle.abertura)} />
          <Linha label="Fechamento" valor={formatBRL(candle.fechamento)} />
          <Linha
            label="Máxima"
            valor={formatBRL(candle.maxima)}
            accent="up"
          />
          <Linha
            label="Mínima"
            valor={formatBRL(candle.minima)}
            accent="down"
          />
          <Linha
            label="Amplitude"
            valor={`${formatBRL(amplitude)} (${formatPercent(amplitudePct)})`}
          />
          <Linha label="Volume" valor={formatVolume(candle.volume)} />
        </div>

        {/* Vs dia anterior */}
        {candleAnterior && (
          <div className="px-5 py-4 border-b border-rule">
            <div className="text-xs text-ink-muted mb-2">
              Comparado ao dia anterior
            </div>
            <Linha
              label="Fechamento anterior"
              valor={formatBRL(candleAnterior.fechamento)}
            />
            <Linha
              label="Variação"
              valor={`${variacaoVsAnterior >= 0 ? "+" : ""}${formatBRL(
                variacaoVsAnterior,
              )} (${formatPercent(variacaoVsAnteriorPct)})`}
              accent={positivoAnterior ? "up" : "down"}
            />
          </div>
        )}

        <div className="px-5 py-3 bg-navy-800/30 text-xs text-ink-muted text-center">
          💡 Esses dados são simulados para fins educacionais.
        </div>
      </div>
    </div>
    </Portal>
  );
}

function Linha({
  label,
  valor,
  accent,
}: {
  label: string;
  valor: string;
  accent?: "up" | "down";
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-ink-muted">{label}</span>
      <span
        className={classNames(
          "font-medium num",
          accent === "up" && "text-up",
          accent === "down" && "text-down",
          !accent && "text-ink",
        )}
      >
        {valor}
      </span>
    </div>
  );
}
