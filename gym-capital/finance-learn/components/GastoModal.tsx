"use client";

import { useEffect, useState } from "react";
import { useGastos } from "@/contexts/GastosContext";
import { CATEGORIAS_GASTOS } from "@/lib/mockGastos";
import { classNames } from "@/lib/formatters";
import type { Gasto, Recorrencia, TipoGasto } from "@/lib/types";
import { Portal } from "./Portal";

interface Props {
  gastoInicial?: Gasto;
  onClose: () => void;
}

export function GastoModal({ gastoInicial, onClose }: Props) {
  const { adicionarGasto, editarGasto } = useGastos();
  const ehEdicao = !!gastoInicial;

  const hoje = new Date().toISOString().slice(0, 10);

  const [titulo, setTitulo] = useState(gastoInicial?.titulo ?? "");
  const [valor, setValor] = useState(
    gastoInicial ? String(gastoInicial.valor) : "",
  );
  const [categoria, setCategoria] = useState(
    gastoInicial?.categoria ?? CATEGORIAS_GASTOS[0].id,
  );
  const [data, setData] = useState(gastoInicial?.data ?? hoje);
  const [tipo, setTipo] = useState<TipoGasto>(gastoInicial?.tipo ?? "unico");
  const [recorrencia, setRecorrencia] = useState<Recorrencia>(
    gastoInicial?.recorrencia ?? "mensal",
  );
  const [observacao, setObservacao] = useState(gastoInicial?.observacao ?? "");
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const confirmar = () => {
    setErro(null);
    const v = parseFloat(valor.replace(/\./g, "").replace(",", "."));
    if (!titulo.trim()) return setErro("Dê um título ao gasto");
    if (!v || isNaN(v) || v <= 0) return setErro("Digite um valor válido");
    if (!data) return setErro("Selecione uma data");

    const dadosGasto: Omit<Gasto, "id"> = {
      titulo: titulo.trim(),
      valor: v,
      categoria,
      data,
      tipo,
      recorrencia: tipo === "recorrente" ? recorrencia : undefined,
      observacao: observacao.trim() || undefined,
    };

    if (ehEdicao && gastoInicial) {
      editarGasto(gastoInicial.id, dadosGasto);
    } else {
      adicionarGasto(dadosGasto);
    }
    onClose();
  };

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[100] modal-backdrop flex items-center justify-center p-4 animate-fade-in"
        onClick={onClose}
      >
      <div
        className="glass-card rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-rule flex items-center justify-between sticky top-0 bg-navy-800 z-10">
          <div>
            <div className="text-xs uppercase tracking-wider text-ink-muted">
              {ehEdicao ? "Editar gasto" : "Novo gasto"}
            </div>
            <div className="text-lg font-semibold mt-0.5">
              {ehEdicao ? "Atualize os dados" : "Registre uma despesa"}
            </div>
          </div>
          <button onClick={onClose} className="text-ink-muted hover:text-ink p-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          <Field label="Título">
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Aluguel, Almoço, Netflix..."
              autoFocus
              className="w-full bg-navy-800 border border-rule rounded-md px-3 py-2.5 text-sm focus:border-brand focus:outline-none"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Valor (R$)">
              <input
                type="text"
                inputMode="decimal"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0,00"
                className="w-full bg-navy-800 border border-rule rounded-md px-3 py-2.5 text-sm num focus:border-brand focus:outline-none"
              />
            </Field>

            <Field label="Data">
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full bg-navy-800 border border-rule rounded-md px-3 py-2.5 text-sm focus:border-brand focus:outline-none"
              />
            </Field>
          </div>

          <Field label="Categoria">
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {CATEGORIAS_GASTOS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategoria(c.id)}
                  className={classNames(
                    "p-2 rounded-md text-[10px] font-medium border transition-all flex flex-col items-center gap-0.5",
                    categoria === c.id
                      ? "bg-navy-700 text-ink"
                      : "bg-navy-800 text-ink-muted hover:text-ink border-rule",
                  )}
                  style={
                    categoria === c.id
                      ? { borderColor: c.cor, color: c.cor }
                      : {}
                  }
                >
                  <span className="text-lg leading-none">{c.icone}</span>
                  <span>{c.nome}</span>
                </button>
              ))}
            </div>
          </Field>

          <Field label="Tipo">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTipo("unico")}
                className={classNames(
                  "py-2.5 rounded-md text-sm font-medium border transition-all",
                  tipo === "unico"
                    ? "bg-brand/15 border-brand text-brand"
                    : "bg-navy-800 border-rule text-ink-muted",
                )}
              >
                Gasto único
              </button>
              <button
                onClick={() => setTipo("recorrente")}
                className={classNames(
                  "py-2.5 rounded-md text-sm font-medium border transition-all",
                  tipo === "recorrente"
                    ? "bg-brand/15 border-brand text-brand"
                    : "bg-navy-800 border-rule text-ink-muted",
                )}
              >
                Recorrente
              </button>
            </div>
          </Field>

          {tipo === "recorrente" && (
            <Field label="Frequência">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setRecorrencia("mensal")}
                  className={classNames(
                    "py-2 rounded-md text-xs font-medium border transition-all",
                    recorrencia === "mensal"
                      ? "bg-navy-700 border-brand/40 text-ink"
                      : "bg-navy-800 border-rule text-ink-muted",
                  )}
                >
                  Mensal
                </button>
                <button
                  onClick={() => setRecorrencia("anual")}
                  className={classNames(
                    "py-2 rounded-md text-xs font-medium border transition-all",
                    recorrencia === "anual"
                      ? "bg-navy-700 border-brand/40 text-ink"
                      : "bg-navy-800 border-rule text-ink-muted",
                  )}
                >
                  Anual
                </button>
              </div>
            </Field>
          )}

          <Field label="Observação (opcional)">
            <textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Notas adicionais..."
              rows={2}
              className="w-full bg-navy-800 border border-rule rounded-md px-3 py-2.5 text-sm focus:border-brand focus:outline-none resize-none"
            />
          </Field>

          {erro && (
            <div className="text-xs text-down bg-down/10 border border-down/30 rounded-md p-2.5">
              {erro}
            </div>
          )}

          <button
            onClick={confirmar}
            className="w-full py-3 rounded-md font-semibold text-sm bg-brand hover:bg-brand-hover text-white transition-colors"
          >
            {ehEdicao ? "Salvar alterações" : "Adicionar gasto"}
          </button>
        </div>
      </div>
    </div>
    </Portal>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs text-ink-muted block mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}
