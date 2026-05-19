"use client";

import { useState } from "react";
import { usePortfolio } from "@/state/portfolio";
import { VALORES_SUGERIDOS } from "@/data/assets";
import { formatBRL, classNames } from "@/utils/format";

export function SetupPortfolio() {
  const { configurarSaldoInicial } = usePortfolio();
  const [valorSelecionado, setValorSelecionado] = useState<number | null>(null);
  const [custom, setCustom] = useState("");
  const [usandoCustom, setUsandoCustom] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const valorFinal = usandoCustom
    ? parseFloat(custom.replace(/\./g, "").replace(",", "."))
    : valorSelecionado;

  const confirmar = () => {
    setErro(null);
    if (!valorFinal || isNaN(valorFinal) || valorFinal <= 0) {
      setErro("Selecione ou digite um valor válido");
      return;
    }
    const res = configurarSaldoInicial(valorFinal);
    if (!res.ok) setErro(res.erro ?? "Falha ao configurar");
  };

  return (
    <div className="glass-card glow-card rounded-xl p-8 lg:p-10 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand/15 border border-brand/30 mb-4">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2v20M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6"
              stroke="#3B82F6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold mb-2">
          Configure seu Simulador
        </h2>
        <p className="text-sm text-ink-muted max-w-lg mx-auto">
          Escolha quanto dinheiro fictício você quer ter na sua carteira para
          começar a simular investimentos. Você poderá reiniciar a qualquer
          momento.
        </p>
      </div>

      {/* Valores sugeridos */}
      <div>
        <div className="text-xs uppercase tracking-wider text-ink-muted mb-3">
          Escolha um valor sugerido
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {VALORES_SUGERIDOS.map((v) => {
            const selecionado = valorSelecionado === v && !usandoCustom;
            return (
              <button
                key={v}
                onClick={() => {
                  setValorSelecionado(v);
                  setUsandoCustom(false);
                  setErro(null);
                }}
                className={classNames(
                  "px-4 py-3 rounded-md border text-sm font-medium transition-all",
                  selecionado
                    ? "bg-brand/15 border-brand text-brand"
                    : "bg-navy-800/50 border-rule text-ink hover:border-brand/40",
                )}
              >
                <div className="num">{formatBRL(v)}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Valor personalizado */}
      <div className="mt-6">
        <div className="text-xs uppercase tracking-wider text-ink-muted mb-3">
          Ou digite um valor personalizado
        </div>
        <div
          className={classNames(
            "flex items-center gap-2 bg-navy-800/50 border rounded-md px-3 py-2.5 transition-colors",
            usandoCustom ? "border-brand" : "border-rule",
          )}
        >
          <span className="text-ink-muted text-sm">R$</span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="0,00"
            value={custom}
            onChange={(e) => {
              setCustom(e.target.value);
              setUsandoCustom(true);
              setErro(null);
            }}
            onFocus={() => setUsandoCustom(true)}
            className="flex-1 bg-transparent outline-none num text-lg"
          />
        </div>
      </div>

      {erro && (
        <div className="mt-4 text-xs text-down bg-down/10 border border-down/30 rounded-md p-3">
          {erro}
        </div>
      )}

      {/* Resumo + botão */}
      {valorFinal && valorFinal > 0 && (
        <div className="mt-6 p-4 bg-navy-800/40 border border-rule rounded-md">
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-muted">Você começará com</span>
            <span className="text-xl font-bold text-brand num">
              {formatBRL(valorFinal)}
            </span>
          </div>
        </div>
      )}

      <button
        onClick={confirmar}
        disabled={!valorFinal || valorFinal <= 0}
        className="w-full mt-6 py-3 bg-brand hover:bg-brand-hover disabled:bg-navy-700 disabled:text-ink-dim disabled:cursor-not-allowed text-white font-semibold rounded-md transition-colors"
      >
        Começar a investir
      </button>

      <p className="text-xs text-ink-dim text-center mt-4">
        💡 Lembre-se: todo dinheiro aqui é fictício. Nenhum valor real é
        depositado ou cobrado.
      </p>
    </div>
  );
}
