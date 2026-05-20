"use client";

import { useEffect, useState } from "react";
import { usePortfolio } from "@/state/portfolio";
import { SUGESTOES_METAS } from "@/data/expense-categories";
import { formatBRL, classNames } from "@/utils/format";
import type { CategoriaMeta, VincularMeta, Meta } from "@/types";
import { Portal } from "./Portal";
import { MoneyInput } from "@/components/common/MoneyInput";

interface Props {
  metaInicial?: Meta;
  onClose: () => void;
}

const categorias: { key: CategoriaMeta; label: string; icone: string }[] = [
  { key: "reserva", label: "Reserva", icone: "🛡️" },
  { key: "compra", label: "Compra", icone: "🛒" },
  { key: "viagem", label: "Viagem", icone: "✈️" },
  { key: "aposentadoria", label: "Aposentadoria", icone: "🌴" },
  { key: "educacao", label: "Educação", icone: "🎓" },
  { key: "outro", label: "Outro", icone: "🎯" },
];

const vinculos: {
  key: VincularMeta;
  label: string;
  descricao: string;
}[] = [
  {
    key: "patrimonio",
    label: "Patrimônio total",
    descricao: "Vincula ao seu patrimônio (caixa + investimentos)",
  },
  {
    key: "investido",
    label: "Valor investido",
    descricao: "Vincula apenas ao valor aplicado em ativos",
  },
  {
    key: "caixa",
    label: "Caixa",
    descricao: "Vincula ao caixa disponível na conta",
  },
  {
    key: "manual",
    label: "Manual",
    descricao: "Você atualiza o progresso manualmente",
  },
];

export function MetaModal({ metaInicial, onClose }: Props) {
  const { criarMeta, atualizarMeta } = usePortfolio();
  const ehEdicao = !!metaInicial;

  const [titulo, setTitulo] = useState(metaInicial?.titulo ?? "");
  const [valorAlvo, setValorAlvo] = useState(
    metaInicial ? String(metaInicial.valorAlvo) : "",
  );
  const [prazo, setPrazo] = useState(
    metaInicial?.prazo ?? somarMeses(new Date(), 12).toISOString().slice(0, 10),
  );
  const [categoria, setCategoria] = useState<CategoriaMeta>(
    metaInicial?.categoria ?? "outro",
  );
  const [vincular, setVincular] = useState<VincularMeta>(
    metaInicial?.vincular ?? "patrimonio",
  );
  const [valorAtualManual, setValorAtualManual] = useState(
    metaInicial?.valorAtualManual ? String(metaInicial.valorAtualManual) : "",
  );
  const [descricao, setDescricao] = useState(metaInicial?.descricao ?? "");
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const aplicarSugestao = (s: (typeof SUGESTOES_METAS)[number]) => {
    setTitulo(s.titulo);
    setDescricao(s.descricao);
    setValorAlvo(String(s.valorSugerido));
    setCategoria(s.categoria);
    setPrazo(somarMeses(new Date(), s.prazoMeses).toISOString().slice(0, 10));
  };

  const confirmar = () => {
    setErro(null);
    const valor = parseFloat(valorAlvo.replace(/\./g, "").replace(",", "."));
    if (!titulo.trim()) return setErro("Dê um título para a meta");
    if (!valor || isNaN(valor) || valor <= 0)
      return setErro("Digite um valor alvo válido");
    if (!prazo) return setErro("Selecione um prazo");

    const dadosMeta = {
      titulo: titulo.trim(),
      descricao: descricao.trim() || undefined,
      valorAlvo: valor,
      prazo,
      categoria,
      vincular,
      valorAtualManual:
        vincular === "manual" && valorAtualManual
          ? parseFloat(valorAtualManual.replace(/\./g, "").replace(",", "."))
          : undefined,
    };

    if (ehEdicao && metaInicial) {
      atualizarMeta(metaInicial.id, dadosMeta);
    } else {
      criarMeta(dadosMeta);
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
        className="glass-card rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-rule bg-brand/10 flex items-center justify-between sticky top-0 backdrop-blur z-10">
          <div>
            <div className="text-xs uppercase tracking-wider text-ink-muted">
              {ehEdicao ? "Editar meta" : "Nova meta financeira"}
            </div>
            <div className="text-lg font-semibold mt-0.5">
              {ehEdicao ? metaInicial?.titulo : "Defina seu próximo objetivo"}
            </div>
          </div>
          <button onClick={onClose} className="text-ink-muted hover:text-ink p-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-5">
          {!ehEdicao && (
            <div>
              <div className="text-xs text-ink-muted uppercase tracking-wider mb-2">
                Sugestões prontas
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                {SUGESTOES_METAS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => aplicarSugestao(s)}
                    className="text-left p-3 bg-navy-800/50 border border-rule hover:border-brand rounded-md transition-colors"
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="text-base">{s.icone}</span>
                      <span className="text-sm font-medium">{s.titulo}</span>
                    </div>
                    <div className="text-[10px] text-ink-muted mt-1 num">
                      {formatBRL(s.valorSugerido)} · {s.prazoMeses}m
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Título da meta">
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Viagem para Europa"
                className="w-full bg-navy-800 border border-rule rounded-md px-3 py-2.5 text-sm focus:border-brand focus:outline-none"
              />
            </Field>

            <Field label="Valor alvo">
              <MoneyInput
                value={valorAlvo}
                onValueChange={setValorAlvo}
                placeholder="0,00"
              />
            </Field>

            <Field label="Prazo">
              <input
                type="date"
                value={prazo}
                onChange={(e) => setPrazo(e.target.value)}
                className="w-full bg-navy-800 border border-rule rounded-md px-3 py-2.5 text-sm focus:border-brand focus:outline-none"
              />
            </Field>

            <Field label="Categoria">
              <div className="grid grid-cols-3 gap-1">
                {categorias.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setCategoria(c.key)}
                    className={classNames(
                      "py-2 rounded-md text-xs font-medium border transition-all",
                      categoria === c.key
                        ? "bg-brand/15 border-brand text-brand"
                        : "bg-navy-800 border-rule text-ink-muted",
                    )}
                  >
                    <span className="mr-1">{c.icone}</span>
                    {c.label}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <Field label="Vincular progresso com">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {vinculos.map((v) => (
                <button
                  key={v.key}
                  onClick={() => setVincular(v.key)}
                  className={classNames(
                    "text-left p-3 rounded-md border transition-all",
                    vincular === v.key
                      ? "bg-brand/10 border-brand"
                      : "bg-navy-800 border-rule",
                  )}
                >
                  <div className="text-sm font-medium">{v.label}</div>
                  <div className="text-xs text-ink-muted mt-0.5">
                    {v.descricao}
                  </div>
                </button>
              ))}
            </div>
          </Field>

          {vincular === "manual" && (
            <Field label="Valor atual (manual)">
              <input
                type="text"
                inputMode="decimal"
                value={valorAtualManual}
                onChange={(e) => setValorAtualManual(e.target.value)}
                placeholder="0,00"
                className="w-full bg-navy-800 border border-rule rounded-md px-3 py-2.5 text-sm num focus:border-brand focus:outline-none"
              />
            </Field>
          )}

          <Field label="Descrição (opcional)">
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Detalhes sobre essa meta..."
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
            {ehEdicao ? "Salvar alterações" : "Criar meta"}
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

function somarMeses(d: Date, meses: number): Date {
  const r = new Date(d);
  r.setMonth(r.getMonth() + meses);
  return r;
}
