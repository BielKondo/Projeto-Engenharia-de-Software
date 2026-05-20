"use client";

import { useMemo, useState } from "react";
import { useGastos, gastoOcorreNoMes } from "@/state/expenses";
import {
  CATEGORIAS_GASTOS,
  categoriaGastoPorId,
} from "@/data/expense-categories";
import {
  formatBRL,
  formatDateShort,
  classNames,
} from "@/utils/format";
import { SalarioCard } from "@/components/common/SalarioCard";
import { GastoModal } from "@/components/modals/GastoModal";
import { GastosCharts } from "@/components/common/GastosCharts";
import type { Gasto } from "@/types";

type FiltroTipo = "todos" | "unico" | "recorrente";

export default function GastosPage() {
  const {
    estado,
    removerGasto,
    totalGastosMes,
    totalRenda,
  } = useGastos();

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Gasto | undefined>(undefined);
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>("todos");
  const [busca, setBusca] = useState("");

  // Mês atual no formato YYYY-MM (fuso local, não UTC)
  const agora = new Date();
  const hojeISO = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}`;
  const gastosDoMes = totalGastosMes(hojeISO);
  const sobra = totalRenda - gastosDoMes;
  const taxaGasto = totalRenda > 0 ? (gastosDoMes / totalRenda) * 100 : 0;

  const gastosFiltrados = useMemo(() => {
    let lista = [...estado.gastos];
    if (filtroCategoria !== "todas")
      lista = lista.filter((g) => g.categoria === filtroCategoria);
    if (filtroTipo !== "todos")
      lista = lista.filter((g) => g.tipo === filtroTipo);
    if (busca.trim()) {
      const q = busca.toLowerCase();
      lista = lista.filter(
        (g) =>
          g.titulo.toLowerCase().includes(q) ||
          g.observacao?.toLowerCase().includes(q),
      );
    }
    return lista;
  }, [estado.gastos, filtroCategoria, filtroTipo, busca]);

  const abrirNovo = () => {
    setEditando(undefined);
    setModalAberto(true);
  };

  const abrirEdicao = (g: Gasto) => {
    setEditando(g);
    setModalAberto(true);
  };

  return (
    <div className="space-y-5 stagger">
      <SalarioCard />

      {/* KPIs do mês */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          label="Renda do Mês"
          valor={formatBRL(totalRenda)}
          cor="text-up"
          desc={totalRenda > 0 ? "Salário + outras rendas" : "Configure no card acima"}
        />
        <KpiCard
          label="Gastos do Mês"
          valor={formatBRL(gastosDoMes)}
          cor="text-down"
          desc={`${taxaGasto.toFixed(1)}% da renda mensal`}
        />
        <KpiCard
          label={sobra >= 0 ? "Sobra do Mês" : "Déficit do Mês"}
          valor={formatBRL(Math.abs(sobra))}
          cor={sobra >= 0 ? "text-brand" : "text-sell"}
          desc={
            sobra >= 0
              ? totalRenda > 0
                ? `${((sobra / totalRenda) * 100).toFixed(1)}% poupado`
                : "Configure sua renda"
              : "Gastos acima da renda"
          }
        />
      </div>

      {/* Gráficos */}
      <GastosCharts />

      {/* Lista de gastos */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-rule">
          <div className="flex items-baseline justify-between mb-3 flex-wrap gap-3">
            <div>
              <h3 className="text-base font-semibold">Gastos Registrados</h3>
              <p className="text-xs text-ink-muted mt-0.5">
                {gastosFiltrados.length}{" "}
                {gastosFiltrados.length === 1 ? "registro" : "registros"}
              </p>
            </div>
            <button
              onClick={abrirNovo}
              className="text-xs px-3 py-2 bg-brand hover:bg-brand-hover text-white rounded-md font-medium transition-colors flex items-center gap-1.5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Adicionar gasto
            </button>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="bg-navy-800 border border-rule rounded-md px-2.5 py-1.5 text-xs focus:border-brand focus:outline-none"
            >
              <option value="todas">Todas as categorias</option>
              {CATEGORIAS_GASTOS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icone} {c.nome}
                </option>
              ))}
            </select>

            <div className="flex gap-1">
              {(["todos", "unico", "recorrente"] as FiltroTipo[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setFiltroTipo(t)}
                  className={classNames(
                    "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                    filtroTipo === t
                      ? "bg-brand text-white"
                      : "bg-navy-800 text-ink-muted hover:text-ink border border-rule",
                  )}
                >
                  {t === "todos" ? "Todos" : t === "unico" ? "Únicos" : "Recorrentes"}
                </button>
              ))}
            </div>

            <div className="flex-1 md:max-w-xs md:ml-auto relative">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-dim"
              >
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="Buscar..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full bg-navy-800 border border-rule rounded-md pl-8 pr-3 py-1.5 text-xs focus:border-brand focus:outline-none"
              />
            </div>
          </div>
        </div>

        {gastosFiltrados.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="text-4xl mb-3">💸</div>
            <p className="text-sm text-ink-muted mb-4 max-w-md mx-auto">
              {estado.gastos.length === 0
                ? "Você ainda não registrou nenhum gasto. Comece adicionando um para ter visibilidade do seu fluxo de caixa."
                : "Nenhum gasto encontrado com esses filtros."}
            </p>
            {estado.gastos.length === 0 && (
              <button
                onClick={abrirNovo}
                className="text-xs px-4 py-2 border border-brand text-brand hover:bg-brand/10 rounded-md font-medium transition-colors"
              >
                Adicionar primeiro gasto
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-ink-muted border-b border-rule">
                  <th className="text-left px-5 py-2.5 font-medium">Título</th>
                  <th className="text-left px-3 py-2.5 font-medium">
                    Categoria
                  </th>
                  <th className="text-left px-3 py-2.5 font-medium">Data</th>
                  <th className="text-left px-3 py-2.5 font-medium">Tipo</th>
                  <th className="text-right px-3 py-2.5 font-medium">Valor</th>
                  <th className="w-12" />
                </tr>
              </thead>
              <tbody>
                {gastosFiltrados.map((g) => {
                  const cat = categoriaGastoPorId(g.categoria);
                  const contaNoMesAtual = gastoOcorreNoMes(g, hojeISO);
                  return (
                    <tr
                      key={g.id}
                      className="border-b border-rule-soft hover:bg-navy-800/30 transition-colors group"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm text-ink">
                            {g.titulo}
                          </span>
                          {/* Tag visual quando o gasto recorrente ainda não começou
                              a ser contabilizado no mês atual (data de início futura) */}
                          {!contaNoMesAtual && g.tipo === "recorrente" && (
                            <span
                              className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-md bg-ink-muted/15 text-ink-muted border border-ink-muted/20 uppercase tracking-wider"
                              title="Este gasto recorrente começa em um mês futuro e ainda não está contabilizado no mês atual."
                            >
                              Inicia em {formatarMesCurto(g.data)}
                            </span>
                          )}
                        </div>
                        {g.observacao && (
                          <div className="text-[10px] text-ink-muted mt-0.5 line-clamp-1">
                            {g.observacao}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md"
                          style={{
                            backgroundColor: `${cat.cor}1F`,
                            color: cat.cor,
                          }}
                        >
                          <span>{cat.icone}</span>
                          {cat.nome}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs text-ink-muted">
                        {formatDateShort(g.data + "T00:00:00")}
                      </td>
                      <td className="px-3 py-3 text-xs">
                        {g.tipo === "recorrente" ? (
                          <span className="text-brand">
                            🔁 {g.recorrencia === "mensal" ? "Mensal" : "Anual"}
                          </span>
                        ) : (
                          <span className="text-ink-muted">Único</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right num font-medium text-sm">
                        {formatBRL(g.valor)}
                      </td>
                      <td className="px-3 py-3">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 justify-end">
                          <button
                            onClick={() => abrirEdicao(g)}
                            className="text-ink-dim hover:text-brand p-1 rounded transition-colors"
                            title="Editar"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              if (
                                typeof window !== "undefined" &&
                                window.confirm(`Remover "${g.titulo}"?`)
                              )
                                removerGasto(g.id);
                            }}
                            className="text-ink-dim hover:text-down p-1 rounded transition-colors"
                            title="Remover"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalAberto && (
        <GastoModal
          gastoInicial={editando}
          onClose={() => setModalAberto(false)}
        />
      )}
    </div>
  );
}

function KpiCard({
  label,
  valor,
  cor,
  desc,
}: {
  label: string;
  valor: string;
  cor: string;
  desc: string;
}) {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="text-xs text-ink-muted uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className={classNames("text-2xl font-bold num", cor)}>{valor}</div>
      <div className="text-[10px] text-ink-dim mt-1">{desc}</div>
    </div>
  );
}

/**
 * Formata uma data ISO (YYYY-MM-DD) como nome curto do mês.
 * Exemplo: "2026-06-01" → "jun. 2026"
 */
function formatarMesCurto(iso: string): string {
  const [ano, mes] = iso.split("-");
  const data = new Date(Number(ano), Number(mes) - 1, 1);
  const label = data.toLocaleDateString("pt-BR", { month: "short" });
  return `${label} ${ano}`;
}
