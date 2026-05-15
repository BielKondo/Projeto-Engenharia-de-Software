"use client";

import { formatBRL, formatPercent, classNames } from "@/lib/formatters";

interface Fatia {
  label: string;
  valor: number;
  cor: string;
}

interface Props {
  fatias: Fatia[];
  total: number;
  tamanho?: number;
}

export function DonutChart({ fatias, total, tamanho = 200 }: Props) {
  if (total <= 0) return null;

  const raio = tamanho / 2;
  const espessura = tamanho * 0.18;
  const raioInterno = raio - espessura;
  const circunferencia = 2 * Math.PI * (raio - espessura / 2);

  let offsetAcumulado = 0;
  const arcos = fatias.map((f) => {
    const proporcao = f.valor / total;
    const comprimento = circunferencia * proporcao;
    const arco = {
      ...f,
      proporcao,
      dasharray: `${comprimento} ${circunferencia}`,
      dashoffset: -offsetAcumulado,
    };
    offsetAcumulado += comprimento;
    return arco;
  });

  return (
    <div className="flex items-center gap-6">
      <svg
        width={tamanho}
        height={tamanho}
        viewBox={`0 0 ${tamanho} ${tamanho}`}
        className="shrink-0 -rotate-90"
      >
        {/* Trilho */}
        <circle
          cx={raio}
          cy={raio}
          r={raio - espessura / 2}
          fill="none"
          stroke="#1A2B42"
          strokeWidth={espessura}
        />
        {arcos.map((a, i) => (
          <circle
            key={i}
            cx={raio}
            cy={raio}
            r={raio - espessura / 2}
            fill="none"
            stroke={a.cor}
            strokeWidth={espessura}
            strokeDasharray={a.dasharray}
            strokeDashoffset={a.dashoffset}
            strokeLinecap="butt"
          />
        ))}
      </svg>

      {/* Legenda */}
      <div className="flex-1 space-y-2">
        {arcos.map((a, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span
              className="w-2.5 h-2.5 rounded-sm shrink-0"
              style={{ background: a.cor }}
            />
            <span className="flex-1 text-ink truncate">{a.label}</span>
            <span className="num text-ink-muted">
              {formatPercent(a.proporcao * 100)}
            </span>
            <span className="num text-ink-muted w-20 text-right">
              {formatBRL(a.valor)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export const CORES_GRAFICO = [
  "#3B82F6", // azul
  "#10B981", // verde
  "#F97316", // laranja
  "#8B5CF6", // roxo
  "#FBBF24", // amarelo
  "#EF4444", // vermelho
  "#06B6D4", // ciano
  "#EC4899", // pink
];
