"use client";

import { useMemo } from "react";
import { useGastos, gastoOcorreNoMes } from "@/state/expenses";
import {
  CATEGORIAS_GASTOS,
  categoriaGastoPorId,
} from "@/data/expense-categories";
import { formatBRL, classNames } from "@/utils/format";

export function GastosCharts() {
  const { estado } = useGastos();

  const mesAtualISO = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  // Agrupamento por categoria (mês atual, considerando recorrências)
  const dadosCategoria = useMemo(() => {
    const mapa: Record<string, number> = {};
    estado.gastos.forEach((g) => {
      if (gastoOcorreNoMes(g, mesAtualISO)) {
        mapa[g.categoria] = (mapa[g.categoria] ?? 0) + g.valor;
      }
    });
    const total = Object.values(mapa).reduce((a, b) => a + b, 0);
    return Object.entries(mapa)
      .map(([id, valor]) => {
        const cat = categoriaGastoPorId(id);
        return {
          id,
          valor,
          percent: total > 0 ? (valor / total) * 100 : 0,
          cor: cat.cor,
          nome: cat.nome,
          icone: cat.icone,
        };
      })
      .sort((a, b) => b.valor - a.valor);
  }, [estado.gastos, mesAtualISO]);

  // Últimos 6 meses + atual + próximos 6 meses (13 no total)
  // Permite visualizar o impacto de gastos recorrentes ao longo do tempo.
  // Meses futuros refletem apenas os gastos RECORRENTES (mensais/anuais) já
  // cadastrados — gastos únicos não se projetam.
  const dadosMensais = useMemo(() => {
    const hoje = new Date();
    const meses: {
      mesISO: string;
      label: string;
      total: number;
      tipo: "passado" | "atual" | "futuro";
    }[] = [];

    // De -6 a +6 (treze meses): atual no meio, passado à esquerda, futuro à direita
    for (let offset = -6; offset <= 6; offset++) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() + offset, 1);
      const mesISO = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("pt-BR", { month: "short" });
      const total = estado.gastos.reduce(
        (acc, g) => (gastoOcorreNoMes(g, mesISO) ? acc + g.valor : acc),
        0,
      );
      const tipo: "passado" | "atual" | "futuro" =
        offset === 0 ? "atual" : offset < 0 ? "passado" : "futuro";
      meses.push({ mesISO, label, total, tipo });
    }
    return meses;
  }, [estado.gastos]);

  const totalGeral = dadosCategoria.reduce((a, b) => a + b.valor, 0);
  const maxMensal = Math.max(...dadosMensais.map((m) => m.total), 1);

  // Média considerando apenas meses já vividos (6 passados + atual),
  // pra não distorcer com projeções futuras.
  const mediaMensalRealizada = useMemo(() => {
    const realizados = dadosMensais.filter((m) => m.tipo !== "futuro");
    if (realizados.length === 0) return 0;
    return realizados.reduce((a, b) => a + b.total, 0) / realizados.length;
  }, [dadosMensais]);

  if (estado.gastos.length === 0) {
    return (
      <div className="glass-card rounded-xl p-8 text-center">
        <div className="text-4xl mb-3">📊</div>
        <p className="text-sm text-ink-muted">
          Adicione gastos para visualizar os relatórios e gráficos.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Donut por categoria */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-base font-semibold mb-1">Por Categoria</h3>
        <p className="text-xs text-ink-muted mb-4">
          Distribuição percentual · mês atual (inclui recorrentes)
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-5">
          <DonutGastos dados={dadosCategoria} total={totalGeral} />
          <div className="flex-1 w-full space-y-2 max-h-[200px] overflow-y-auto pr-1">
            {dadosCategoria.map((c) => (
              <div key={c.id} className="flex items-center gap-2 text-xs">
                <span
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: c.cor }}
                />
                <span className="text-sm leading-none">{c.icone}</span>
                <span className="flex-1 truncate text-ink">{c.nome}</span>
                <span className="num text-ink-muted shrink-0">
                  {c.percent.toFixed(1)}%
                </span>
                <span className="num text-ink shrink-0 w-24 text-right">
                  {formatBRL(c.valor)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Barras por mês */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-base font-semibold mb-1">Gastos por Mês</h3>
        <p className="text-xs text-ink-muted mb-3">
          6 meses passados, atual e 6 meses futuros (projeção de recorrentes)
        </p>

        {/* Legenda de cores */}
        <div className="flex items-center gap-4 mb-4 text-[10px] text-ink-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-navy-600" />
            Passado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-r from-brand to-brand-soft" />
            Atual
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-brand/30 border border-brand/40" />
            Projeção
          </span>
        </div>

        <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
          {dadosMensais.map((m) => {
            const w = maxMensal > 0 ? (m.total / maxMensal) * 100 : 0;
            return (
              <div key={m.mesISO} className="flex items-center gap-3">
                <div
                  className={classNames(
                    "w-14 text-[11px] uppercase shrink-0",
                    m.tipo === "atual"
                      ? "text-brand font-semibold"
                      : m.tipo === "futuro"
                        ? "text-ink-muted italic"
                        : "text-ink-muted",
                  )}
                >
                  {m.label}
                </div>
                <div className="flex-1 h-6 bg-navy-800 rounded-md overflow-hidden relative">
                  <div
                    className={classNames(
                      "h-full transition-all duration-700",
                      m.tipo === "atual"
                        ? "bg-gradient-to-r from-brand to-brand-soft"
                        : m.tipo === "futuro"
                          ? "bg-brand/30 border-r border-brand/40"
                          : "bg-navy-600",
                    )}
                    style={{ width: `${w}%` }}
                  />
                  {m.total > 0 && (
                    <div className="absolute inset-0 flex items-center px-2 text-[10px] num font-medium text-ink">
                      {formatBRL(m.total)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 pt-4 border-t border-rule text-xs flex items-baseline justify-between">
          <span className="text-ink-muted">
            Média (últimos 6 + atual)
          </span>
          <span className="font-semibold num">
            {formatBRL(mediaMensalRealizada)}
          </span>
        </div>
      </div>
    </div>
  );
}

function DonutGastos({
  dados,
  total,
}: {
  dados: { id: string; valor: number; cor: string; percent: number }[];
  total: number;
}) {
  const tamanho = 160;
  const raio = 60;
  const strokeWidth = 22;
  const cx = tamanho / 2;
  const cy = tamanho / 2;
  const circ = 2 * Math.PI * raio;

  let acumulado = 0;
  const segmentos = dados.map((d) => {
    const offset = -circ * (acumulado / 100);
    const length = circ * (d.percent / 100);
    acumulado += d.percent;
    return {
      id: d.id,
      cor: d.cor,
      length,
      offset,
    };
  });

  return (
    <div className="relative shrink-0">
      <svg
        width={tamanho}
        height={tamanho}
        viewBox={`0 0 ${tamanho} ${tamanho}`}
      >
        <circle
          cx={cx}
          cy={cy}
          r={raio}
          fill="none"
          stroke="var(--bg-elev3)"
          strokeWidth={strokeWidth}
        />
        {segmentos.map((s) => (
          <circle
            key={s.id}
            cx={cx}
            cy={cy}
            r={raio}
            fill="none"
            stroke={s.cor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${s.length} ${circ}`}
            strokeDashoffset={s.offset}
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ transition: "stroke-dasharray 0.6s ease-out" }}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[10px] uppercase tracking-wider text-ink-muted">
          Total
        </div>
        <div className="text-sm font-bold num">{formatBRL(total)}</div>
      </div>
    </div>
  );
}
