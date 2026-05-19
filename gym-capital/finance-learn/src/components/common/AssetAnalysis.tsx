"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePortfolio } from "@/state/portfolio";
import {
  formatBRL,
  formatBRLNoCurrency,
  formatPercent,
  formatVolume,
  classNames,
} from "@/utils/format";
import type { Timeframe } from "@/types";
import { CandlestickChart } from "@/components/chart/CandlestickChart";
import { TradeModal } from "@/components/modals/TradeModal";
import { AlertModal } from "@/components/modals/AlertModal";

interface Props {
  ticker: string;
  abrirAlertaInicialmente?: boolean;
}

const timeframes: { key: Timeframe; label: string; dias: number | "tudo" }[] = [
  { key: "1S", label: "1S", dias: 7 },
  { key: "1M", label: "1M", dias: 30 },
  { key: "6M", label: "6M", dias: 180 },
  { key: "1A", label: "1A", dias: 365 },
  { key: "TUDO", label: "TUDO", dias: "tudo" },
];

export function AssetAnalysis({
  ticker,
  abrirAlertaInicialmente = false,
}: Props) {
  const router = useRouter();
  const { ativos, estado } = usePortfolio();
  const [tf, setTf] = useState<Timeframe>("6M");
  const [modal, setModal] = useState<{
    tipo: "compra" | "venda" | "alerta";
  } | null>(null);
  // Destaque visual do botão "Criar alerta" quando o usuário acabou de vir de Relatórios
  const [destacarBotaoAlerta, setDestacarBotaoAlerta] = useState(false);
  const abrirAlertaProcessadoRef = useRef(false);

  const ativo = ativos.find((a) => a.ticker === ticker);

  const candlesVisiveis = useMemo(() => {
    if (!ativo) return [];
    const cfg = timeframes.find((t) => t.key === tf) ?? timeframes[2];
    if (cfg.dias === "tudo") return ativo.historico;
    return ativo.historico.slice(-cfg.dias);
  }, [ativo, tf]);

  // Quando vem de Relatórios com ?abrirAlerta=1, abre o modal automaticamente
  // e remove o parâmetro da URL pra não reabrir em refresh.
  useEffect(() => {
    if (!abrirAlertaInicialmente || abrirAlertaProcessadoRef.current) return;
    abrirAlertaProcessadoRef.current = true;

    setDestacarBotaoAlerta(true);
    // Pequeno delay pra animação iniciar e o usuário enxergar o botão pulsando
    const t1 = setTimeout(() => setModal({ tipo: "alerta" }), 900);
    // Tira o destaque depois de um tempo
    const t2 = setTimeout(() => setDestacarBotaoAlerta(false), 3500);
    // Limpa a query string
    router.replace(`/negociar?ticker=${ticker}`, { scroll: false });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abrirAlertaInicialmente]);

  if (!ativo) return null;

  const positivo = ativo.variacaoDia >= 0;
  const alertasAtivosTicker = estado.alertas.filter(
    (a) => a.ticker === ticker && !a.atingido,
  );

  return (
    <>
      <div className="glass-card rounded-xl p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
          <div>
            <div className="flex items-baseline gap-3">
              <span className="text-xs text-ink-muted uppercase tracking-wider">
                Análise
              </span>
              <span className="text-sm font-semibold text-ink">
                {ativo.ticker}
              </span>
              <span className="text-sm text-ink-muted num">
                ({formatBRL(ativo.preco)})
              </span>
            </div>

            <div className="mt-2 flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl font-bold num text-ink">
                {formatBRL(ativo.preco)}
              </span>
              <span
                className={classNames(
                  "text-sm font-medium num",
                  positivo ? "text-up" : "text-down",
                )}
              >
                {formatPercent(ativo.variacaoDia)} /{" "}
                {ativo.variacaoAbs >= 0 ? "+" : ""}
                {formatBRL(ativo.variacaoAbs)}
              </span>
            </div>

            {alertasAtivosTicker.length > 0 && (
              <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-sell bg-sell/10 px-2 py-1 rounded">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                {alertasAtivosTicker.length}{" "}
                {alertasAtivosTicker.length === 1
                  ? "alerta ativo"
                  : "alertas ativos"}
              </div>
            )}
          </div>

          {/* Timeframes */}
          <div className="flex items-center gap-1 bg-navy-800/60 p-1 rounded-md border border-rule">
            <div className="text-ink-dim px-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 17l6-6 4 4 8-8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            {timeframes.map((t) => (
              <button
                key={t.key}
                onClick={() => setTf(t.key)}
                className={classNames(
                  "px-3 py-1 text-xs font-medium rounded transition-colors",
                  tf === t.key
                    ? "bg-brand text-white"
                    : "text-ink-muted hover:text-ink",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Layout em grid: gráfico + sidebar de ação */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-5">
          <div className="min-w-0">
            <CandlestickChart candles={candlesVisiveis} ticker={ticker} />
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setModal({ tipo: "compra" })}
              className="w-full bg-buy hover:bg-buy-hover transition-colors text-white font-semibold py-2.5 rounded-md text-sm flex items-center justify-center gap-2 shadow-lg shadow-buy/20"
            >
              <span>COMPRAR</span>
              <span className="text-xs opacity-80 num">
                ({formatBRL(ativo.preco)})
              </span>
            </button>

            <button
              onClick={() => setModal({ tipo: "venda" })}
              className="w-full bg-sell hover:bg-sell-hover transition-colors text-white font-semibold py-2.5 rounded-md text-sm flex items-center justify-center gap-2 shadow-lg shadow-sell/20"
            >
              <span>VENDER</span>
              <span className="text-xs opacity-80 num">
                ({formatBRL(ativo.preco)})
              </span>
            </button>

            <button
              onClick={() => setModal({ tipo: "alerta" })}
              className={classNames(
                "w-full border transition-all font-medium py-2 rounded-md text-xs flex items-center justify-center gap-2 relative",
                destacarBotaoAlerta
                  ? "border-brand text-brand bg-brand/10 ring-2 ring-brand/50 animate-pulse"
                  : "border-rule hover:border-brand hover:text-brand text-ink-muted",
              )}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Criar alerta de preço
              {destacarBotaoAlerta && (
                <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-brand text-white text-[9px] font-bold rounded-full uppercase tracking-wider animate-bounce">
                  Aqui!
                </span>
              )}
            </button>

            {/* Detalhes */}
            <div className="mt-4 p-3 bg-navy-800/40 border border-rule rounded-md space-y-2.5">
              <div className="font-semibold text-sm text-ink pb-1.5 border-b border-rule">
                {ativo.ticker}
              </div>
              <DetailRow label="Preço Atual" valor={formatBRL(ativo.preco)} />
              <DetailRow
                label="Variação"
                valor={formatPercent(ativo.variacaoDia)}
                positivo={positivo}
              />
              <DetailRow label="Volume" valor={formatVolume(ativo.volume)} />
              <DetailRow
                label="Alta/Baixa"
                valor={`R$ ${formatBRLNoCurrency(
                  ativo.maxima,
                )}/${formatBRLNoCurrency(ativo.minima)}`}
              />
            </div>
          </div>
        </div>
      </div>

      {modal?.tipo === "compra" && (
        <TradeModal
          ticker={ticker}
          tipo="compra"
          onClose={() => setModal(null)}
        />
      )}
      {modal?.tipo === "venda" && (
        <TradeModal
          ticker={ticker}
          tipo="venda"
          onClose={() => setModal(null)}
        />
      )}
      {modal?.tipo === "alerta" && (
        <AlertModal ticker={ticker} onClose={() => setModal(null)} />
      )}
    </>
  );
}

function DetailRow({
  label,
  valor,
  positivo,
}: {
  label: string;
  valor: string;
  positivo?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-ink-muted">{label}</span>
      <span
        className={classNames(
          "font-medium num",
          positivo === true && "text-up",
          positivo === false && "text-down",
          positivo === undefined && "text-ink",
        )}
      >
        {valor}
      </span>
    </div>
  );
}
