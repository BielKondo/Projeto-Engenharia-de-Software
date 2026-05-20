"use client";

import { useState, useEffect } from "react";
import { useGastos } from "@/state/expenses";
import { useI18n } from "@/state/i18n";
import { formatBRL, classNames } from "@/utils/format";

/**
 * Converte string digitada em número, aceitando vírgula OU ponto como decimal.
 * Exemplos: "1234.5" → 1234.5  ·  "1.234,50" → 1234.5  ·  "10000" → 10000
 */
function parseValor(s: string): number {
  if (!s) return 0;
  // Mantém só dígitos, vírgula e ponto
  let limpo = s.replace(/[^\d.,]/g, "");
  // Se tem vírgula E ponto, o último é o decimal (remove o outro)
  const ultimaVirgula = limpo.lastIndexOf(",");
  const ultimoPonto = limpo.lastIndexOf(".");
  if (ultimaVirgula >= 0 && ultimoPonto >= 0) {
    const indexMaisAntigo = Math.min(ultimaVirgula, ultimoPonto);
    limpo = limpo.slice(0, indexMaisAntigo) + limpo.slice(indexMaisAntigo + 1);
  }
  return parseFloat(limpo.replace(",", ".")) || 0;
}

export function SalarioCard() {
  const {
    estado,
    definirSalario,
    definirOutrasRendas,
    hidratado,
  } = useGastos();
  const { formatarMoeda } = useI18n();

  const [editandoSalario, setEditandoSalario] = useState(false);
  const [editandoRendas, setEditandoRendas] = useState(false);
  const [salarioTemp, setSalarioTemp] = useState("");
  const [rendasTemp, setRendasTemp] = useState("");

  useEffect(() => {
    setSalarioTemp(String(estado.salario || ""));
    setRendasTemp(String(estado.outrasRendas || ""));
  }, [estado.salario, estado.outrasRendas]);

  const salvarSalario = () => {
    const v = parseValor(salarioTemp);
    if (v >= 0) definirSalario(v);
    setEditandoSalario(false);
  };

  const salvarRendas = () => {
    const v = parseValor(rendasTemp);
    if (v >= 0) definirOutrasRendas(v);
    setEditandoRendas(false);
  };

  if (!hidratado) return null;

  return (
    <div className="glass-card glow-card rounded-xl p-5">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold">Receita Mensal</h3>
          <p className="text-xs text-ink-muted mt-0.5">
            Configure suas fontes de renda para acompanhar seu fluxo
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-ink-muted uppercase tracking-wider">
            Total
          </div>
          <div className="text-xl font-bold text-up num">
            {formatBRL(estado.salario + estado.outrasRendas)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Salário */}
        <div className="bg-navy-800/50 border border-rule rounded-md p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
              💼 Salário
            </div>
            {!editandoSalario && (
              <button
                onClick={() => setEditandoSalario(true)}
                className="text-[10px] text-brand hover:underline"
              >
                {estado.salario > 0 ? "Alterar" : "+ Adicionar"}
              </button>
            )}
          </div>
          {editandoSalario ? (
            <>
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1 bg-navy-900 border border-brand rounded-md px-2 py-1.5 flex-1">
                  <span className="text-ink-muted text-xs">R$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={salarioTemp}
                    onChange={(e) => setSalarioTemp(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") salvarSalario();
                      if (e.key === "Escape") setEditandoSalario(false);
                    }}
                    autoFocus
                    className="flex-1 bg-transparent outline-none num text-sm min-w-0"
                    placeholder="0,00"
                  />
                </div>
                <button
                  onClick={salvarSalario}
                  className="text-xs px-2.5 py-1.5 bg-brand hover:bg-brand-hover text-white rounded-md transition-colors"
                >
                  OK
                </button>
              </div>
              {/* Preview formatado conforme idioma/moeda */}
              {parseValor(salarioTemp) > 0 && (
                <div className="text-[11px] text-brand mt-1.5 font-medium">
                  = {formatarMoeda(parseValor(salarioTemp))}
                </div>
              )}
            </>
          ) : (
            <div className="text-xl font-bold num text-ink">
              {estado.salario > 0 ? formatBRL(estado.salario) : "—"}
            </div>
          )}
        </div>

        {/* Outras Rendas */}
        <div className="bg-navy-800/50 border border-rule rounded-md p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
              💰 Outras Rendas
            </div>
            {!editandoRendas && (
              <button
                onClick={() => setEditandoRendas(true)}
                className="text-[10px] text-brand hover:underline"
              >
                {estado.outrasRendas > 0 ? "Alterar" : "+ Adicionar"}
              </button>
            )}
          </div>
          {editandoRendas ? (
            <>
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1 bg-navy-900 border border-brand rounded-md px-2 py-1.5 flex-1">
                  <span className="text-ink-muted text-xs">R$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={rendasTemp}
                    onChange={(e) => setRendasTemp(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") salvarRendas();
                      if (e.key === "Escape") setEditandoRendas(false);
                    }}
                    autoFocus
                    className="flex-1 bg-transparent outline-none num text-sm min-w-0"
                    placeholder="0,00"
                  />
                </div>
                <button
                  onClick={salvarRendas}
                  className="text-xs px-2.5 py-1.5 bg-brand hover:bg-brand-hover text-white rounded-md transition-colors"
                >
                  OK
                </button>
              </div>
              {/* Preview formatado conforme idioma/moeda */}
              {parseValor(rendasTemp) > 0 && (
                <div className="text-[11px] text-brand mt-1.5 font-medium">
                  = {formatarMoeda(parseValor(rendasTemp))}
                </div>
              )}
            </>
          ) : (
            <div className="text-xl font-bold num text-ink">
              {estado.outrasRendas > 0
                ? formatBRL(estado.outrasRendas)
                : "—"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
