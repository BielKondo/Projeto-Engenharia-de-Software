"use client";

import { useEffect, useState } from "react";
import { usePortfolio } from "@/state/portfolio";
import {
  formatBRL,
  classNames,
} from "@/utils/format";
import { Portal } from "./Portal";

interface Props {
  ticker: string;
  onClose: () => void;
}

export function AlertModal({ ticker, onClose }: Props) {
  const { ativos, criarAlerta } = usePortfolio();
  const ativo = ativos.find((a) => a.ticker === ticker);

  const [precoAlvo, setPrecoAlvo] = useState("");
  const [direcao, setDirecao] = useState<"acima" | "abaixo">("acima");
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!ativo) return null;

  const valor = parseFloat(precoAlvo.replace(/\./g, "").replace(",", "."));

  const sugestoes = [
    { label: "+5%", valor: ativo.preco * 1.05, dir: "acima" as const },
    { label: "+10%", valor: ativo.preco * 1.1, dir: "acima" as const },
    { label: "-5%", valor: ativo.preco * 0.95, dir: "abaixo" as const },
    { label: "-10%", valor: ativo.preco * 0.9, dir: "abaixo" as const },
  ];

  const aplicarSugestao = (s: (typeof sugestoes)[number]) => {
    setPrecoAlvo(
      s.valor
        .toFixed(2)
        .replace(".", ","),
    );
    setDirecao(s.dir);
    setErro(null);
  };

  const confirmar = () => {
    setErro(null);
    if (!valor || isNaN(valor) || valor <= 0) {
      setErro("Digite um preço válido");
      return;
    }
    const res = criarAlerta(ticker, valor, direcao);
    if (res.ok) onClose();
    else setErro(res.erro ?? "Falha ao criar alerta");
  };

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[100] modal-backdrop flex items-center justify-center p-4 animate-fade-in"
        onClick={onClose}
      >
      <div
        className="glass-card rounded-xl w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-rule bg-brand/10 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-ink-muted">
              Criar alerta de preço
            </div>
            <div className="text-lg font-semibold mt-0.5">
              {ticker}{" "}
              <span className="text-ink-muted font-normal text-sm">
                · {ativo.nome}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-ink-muted hover:text-ink p-1">
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

        <div className="p-5 space-y-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-ink-muted">Preço atual</span>
            <span className="text-xl font-bold num">
              {formatBRL(ativo.preco)}
            </span>
          </div>

          {/* Direção */}
          <div>
            <label className="text-xs text-ink-muted block mb-2">
              Notificar quando o preço:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDirecao("acima")}
                className={classNames(
                  "py-2.5 rounded-md text-sm font-medium border transition-all",
                  direcao === "acima"
                    ? "bg-up/15 border-up text-up"
                    : "bg-navy-800 border-rule text-ink-muted hover:text-ink",
                )}
              >
                ▲ Subir até / acima
              </button>
              <button
                onClick={() => setDirecao("abaixo")}
                className={classNames(
                  "py-2.5 rounded-md text-sm font-medium border transition-all",
                  direcao === "abaixo"
                    ? "bg-down/15 border-down text-down"
                    : "bg-navy-800 border-rule text-ink-muted hover:text-ink",
                )}
              >
                ▼ Cair até / abaixo
              </button>
            </div>
          </div>

          {/* Preço alvo */}
          <div>
            <label className="text-xs text-ink-muted block mb-2">
              Preço alvo (R$)
            </label>
            <div className="flex items-center gap-2 bg-navy-800 border border-rule rounded-md px-3 py-2.5 focus-within:border-brand">
              <span className="text-ink-muted text-sm">R$</span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={precoAlvo}
                onChange={(e) => {
                  setPrecoAlvo(e.target.value);
                  setErro(null);
                }}
                className="flex-1 bg-transparent outline-none num text-lg"
                autoFocus
              />
            </div>
          </div>

          {/* Sugestões rápidas */}
          <div>
            <div className="text-xs text-ink-muted mb-2">Sugestões rápidas:</div>
            <div className="grid grid-cols-4 gap-2">
              {sugestoes.map((s, i) => (
                <button
                  key={i}
                  onClick={() => aplicarSugestao(s)}
                  className={classNames(
                    "px-2 py-2 rounded-md text-xs font-medium border transition-all",
                    s.dir === "acima"
                      ? "bg-navy-800 border-rule hover:border-up hover:text-up"
                      : "bg-navy-800 border-rule hover:border-down hover:text-down",
                  )}
                >
                  <div className="num">{s.label}</div>
                  <div className="text-[9px] text-ink-dim mt-0.5 num">
                    {formatBRL(s.valor)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Resumo */}
          {valor > 0 && (
            <div className="bg-navy-800/50 border border-rule rounded-md p-3 text-xs">
              Você será notificado quando o preço de{" "}
              <strong>{ticker}</strong>{" "}
              {direcao === "acima"
                ? "subir para ou acima de"
                : "cair para ou abaixo de"}{" "}
              <strong className="num">{formatBRL(valor)}</strong>.
            </div>
          )}

          {erro && (
            <div className="text-xs text-down bg-down/10 border border-down/30 rounded-md p-2.5">
              {erro}
            </div>
          )}

          <button
            onClick={confirmar}
            disabled={!valor || valor <= 0}
            className="w-full py-3 rounded-md font-semibold text-sm transition-colors bg-brand hover:bg-brand-hover disabled:opacity-40 disabled:cursor-not-allowed text-white"
          >
            Criar alerta
          </button>
        </div>
      </div>
    </div>
    </Portal>
  );
}
