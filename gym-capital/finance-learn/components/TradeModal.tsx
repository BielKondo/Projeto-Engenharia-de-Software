"use client";

import { useEffect, useMemo, useState } from "react";
import { usePortfolio } from "@/contexts/PortfolioContext";
import {
  formatBRL,
  formatPercent,
  classNames,
} from "@/lib/formatters";
import { Portal } from "./Portal";
import type { Asset, AssetCategory } from "@/lib/types";

interface Props {
  ticker: string;
  tipo: "compra" | "venda";
  onClose: () => void;
}

// Limites razoáveis para o retorno anual estimado por categoria
const LIMITES_RETORNO: Record<AssetCategory, [number, number]> = {
  acao: [-15, 30],
  etf: [-10, 25],
  fii: [-5, 18],
  tesouro: [5, 18],
  cripto: [-40, 80],
};

const RETORNO_FALLBACK: Record<AssetCategory, number> = {
  acao: 11,
  etf: 12,
  fii: 9,
  tesouro: 12,
  cripto: 25,
};

// Calcula retorno anualizado baseado no histórico (~365 dias atrás vs hoje)
function calcularRetornoEsperado(ativo: Asset): number {
  if (!ativo.historico || ativo.historico.length < 30) {
    return RETORNO_FALLBACK[ativo.categoria];
  }

  const idxAntigo = Math.max(0, ativo.historico.length - 365);
  const precoAntigo = ativo.historico[idxAntigo].fechamento;
  if (precoAntigo <= 0) return RETORNO_FALLBACK[ativo.categoria];

  const variacao = (ativo.preco / precoAntigo - 1) * 100;
  const [min, max] = LIMITES_RETORNO[ativo.categoria];
  return Math.max(min, Math.min(max, variacao));
}

type Etapa = "form" | "processando" | "sucesso";

export function TradeModal({ ticker, tipo, onClose }: Props) {
  const { ativos, comprar, vender, estado, posicaoDe } = usePortfolio();
  const [quantidade, setQuantidade] = useState<string>("1");
  const [erro, setErro] = useState<string | null>(null);
  const [etapa, setEtapa] = useState<Etapa>("form");

  const ativo = ativos.find((a) => a.ticker === ticker);
  const posicao = posicaoDe(ticker);
  const qty = parseInt(quantidade, 10) || 0;
  const total = ativo ? ativo.preco * qty : 0;
  const ehCompra = tipo === "compra";

  const retornoAnual = useMemo(
    () => (ativo ? calcularRetornoEsperado(ativo) : 0),
    [ativo],
  );

  // Projeção L/P estimada
  const projecao = useMemo(() => {
    const ganhoAno = total * (retornoAnual / 100);
    return {
      ganhoAno,
      ganhoMes: ganhoAno / 12,
      valorFinal1Ano: total + ganhoAno,
    };
  }, [total, retornoAnual]);

  // Fecha com ESC
  useEffect(() => {
    if (etapa !== "form") return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, etapa]);

  if (!ativo) return null;

  const confirmar = () => {
    setErro(null);
    // 1. Mostra spinner brevemente
    setEtapa("processando");
    // 2. Após pequeno delay realista, executa a operação
    setTimeout(() => {
      const res = ehCompra ? comprar(ticker, qty) : vender(ticker, qty);
      if (!res.ok) {
        setErro(res.erro ?? "Operação falhou");
        setEtapa("form");
        return;
      }
      // 3. Tela de sucesso
      setEtapa("sucesso");
      // 4. Fecha sozinho após 1.6s
      setTimeout(() => onClose(), 1600);
    }, 600);
  };

  const maxQty = ehCompra
    ? Math.floor(estado.caixa / ativo.preco)
    : posicao?.quantidade ?? 0;

  return (
    <Portal>
      <div
        className={classNames(
          "fixed inset-0 z-[100] modal-backdrop flex items-center justify-center p-4 animate-fade-in",
          etapa !== "form" && "pointer-events-none",
        )}
        onClick={() => etapa === "form" && onClose()}
      >
        <div
          className="glass-card rounded-xl w-full max-w-md shadow-2xl pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Tela: processando */}
          {etapa === "processando" && (
            <div className="p-10 flex flex-col items-center justify-center min-h-[300px]">
              <div className="relative w-16 h-16 mb-5">
                <div className="absolute inset-0 rounded-full border-4 border-rule" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand animate-spin" />
              </div>
              <div className="text-base font-semibold">
                Processando ordem...
              </div>
              <div className="text-xs text-ink-muted mt-1">
                Conectando ao mercado simulado
              </div>
            </div>
          )}

          {/* Tela: sucesso */}
          {etapa === "sucesso" && (
            <div className="p-10 flex flex-col items-center justify-center min-h-[300px] animate-fade-in">
              <div className="relative">
                <div
                  className={classNames(
                    "w-20 h-20 rounded-full flex items-center justify-center",
                    ehCompra ? "bg-up/15" : "bg-sell/15",
                  )}
                >
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    className={ehCompra ? "text-up" : "text-sell"}
                  >
                    <path
                      d="M5 12l5 5L20 7"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        strokeDasharray: 30,
                        strokeDashoffset: 30,
                        animation: "checkmarkDraw 0.5s ease-out forwards",
                      }}
                    />
                  </svg>
                </div>
                <span
                  className={classNames(
                    "absolute inset-0 rounded-full animate-ping opacity-30",
                    ehCompra ? "bg-up" : "bg-sell",
                  )}
                />
              </div>
              <div className="text-base font-semibold mt-5">
                {ehCompra ? "Compra confirmada!" : "Venda concluída!"}
              </div>
              <div className="text-xs text-ink-muted mt-1 num">
                {qty} {qty === 1 ? "cota" : "cotas"} de{" "}
                <strong>{ativo.ticker}</strong> por {formatBRL(total)}
              </div>

              <style>{`
                @keyframes checkmarkDraw {
                  to { stroke-dashoffset: 0; }
                }
              `}</style>
            </div>
          )}

          {/* Tela: formulário */}
          {etapa === "form" && (
            <>
              {/* Header */}
              <div
                className={classNames(
                  "px-5 py-4 border-b border-rule flex items-center justify-between",
                  ehCompra ? "bg-buy/10" : "bg-sell/10",
                )}
              >
                <div>
                  <div className="text-xs uppercase tracking-wider text-ink-muted">
                    {ehCompra ? "Ordem de Compra" : "Ordem de Venda"}
                  </div>
                  <div className="text-lg font-semibold mt-0.5">
                    {ativo.ticker}{" "}
                    <span className="text-ink-muted font-normal text-sm">
                      · {ativo.nome}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-ink-muted hover:text-ink p-1 rounded"
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

              {/* Body */}
              <div className="p-5 space-y-4">
                {/* Preço atual */}
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-ink-muted">Preço atual</span>
                  <div className="text-right">
                    <div className="text-xl font-bold num">
                      {formatBRL(ativo.preco)}
                    </div>
                    <div
                      className={classNames(
                        "text-xs num",
                        ativo.variacaoDia >= 0 ? "text-up" : "text-down",
                      )}
                    >
                      {formatPercent(ativo.variacaoDia)} hoje
                    </div>
                  </div>
                </div>

                {/* Quantidade */}
                <div>
                  <label className="text-xs text-ink-muted block mb-1.5">
                    Quantidade
                  </label>
                  <div className="flex items-stretch gap-2">
                    <button
                      onClick={() => setQuantidade(String(Math.max(0, qty - 1)))}
                      className="px-3 bg-navy-800 hover:bg-navy-700 border border-rule rounded-md text-ink-muted transition-colors"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={quantidade}
                      onChange={(e) => setQuantidade(e.target.value)}
                      className="flex-1 bg-navy-800 border border-rule rounded-md px-3 py-2 text-center font-mono text-lg num focus:border-brand focus:outline-none"
                    />
                    <button
                      onClick={() => setQuantidade(String(qty + 1))}
                      className="px-3 bg-navy-800 hover:bg-navy-700 border border-rule rounded-md text-ink-muted transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-1.5 text-xs">
                    <button
                      onClick={() => setQuantidade(String(maxQty))}
                      className="text-brand hover:underline"
                    >
                      Usar máximo ({maxQty})
                    </button>
                    {posicao && (
                      <span className="text-ink-muted">
                        Em carteira: {posicao.quantidade}
                      </span>
                    )}
                  </div>
                </div>

                {/* Resumo */}
                <div className="bg-navy-800/50 border border-rule rounded-md p-3 space-y-2">
                  <Row label="Preço unitário" value={formatBRL(ativo.preco)} />
                  <Row label="Quantidade" value={String(qty)} />
                  <div className="h-px bg-rule" />
                  <Row
                    label={ehCompra ? "Total a pagar" : "Total a receber"}
                    value={formatBRL(total)}
                    strong
                  />
                </div>

                {/* Projeção / Rendimento esperado (só na compra) */}
                {ehCompra && qty > 0 && (
                  <div className="bg-up/5 border border-up/20 rounded-md p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="text-up"
                        >
                          <path
                            d="M3 17l6-6 4 4 8-8M21 7v5h-5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Rendimento esperado
                      </div>
                      <span
                        className={classNames(
                          "text-base font-bold num",
                          retornoAnual >= 0 ? "text-up" : "text-down",
                        )}
                      >
                        {formatPercent(retornoAnual)} a.a.
                      </span>
                    </div>
                    <div className="text-[10px] text-ink-muted -mt-1">
                      Estimativa baseada no retorno dos últimos 12 meses
                    </div>

                    <div className="h-px bg-up/10 my-1.5" />

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-[10px] text-ink-muted uppercase">
                          L/P em 1 ano (estimado)
                        </div>
                        <div
                          className={classNames(
                            "num font-bold mt-0.5",
                            projecao.ganhoAno >= 0 ? "text-up" : "text-down",
                          )}
                        >
                          {projecao.ganhoAno >= 0 ? "+" : ""}
                          {formatBRL(projecao.ganhoAno)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-ink-muted uppercase">
                          L/P %
                        </div>
                        <div
                          className={classNames(
                            "num font-bold mt-0.5",
                            retornoAnual >= 0 ? "text-up" : "text-down",
                          )}
                        >
                          {formatPercent(retornoAnual)}
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] text-ink-dim italic mt-1">
                      Valor patrimonial estimado em 1 ano:{" "}
                      <span className="num text-ink">
                        {formatBRL(projecao.valorFinal1Ano)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Caixa disponível */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ink-muted">Caixa disponível</span>
                  <span className="num font-medium">
                    {formatBRL(estado.caixa)}
                  </span>
                </div>

                {erro && (
                  <div className="text-xs text-down bg-down/10 border border-down/30 rounded-md p-2.5">
                    {erro}
                  </div>
                )}

                {/* Botão de ação */}
                <button
                  onClick={confirmar}
                  disabled={qty <= 0 || qty > maxQty}
                  className={classNames(
                    "w-full py-3 rounded-md font-semibold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
                    ehCompra
                      ? "bg-buy hover:bg-buy-hover text-white"
                      : "bg-sell hover:bg-sell-hover text-white",
                  )}
                >
                  Confirmar {ehCompra ? "compra" : "venda"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </Portal>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-ink-muted">{label}</span>
      <span
        className={classNames(
          "num",
          strong ? "font-bold text-ink text-base" : "text-ink",
        )}
      >
        {value}
      </span>
    </div>
  );
}
