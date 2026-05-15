"use client";

import Link from "next/link";
import { usePortfolio } from "@/contexts/PortfolioContext";
import {
  formatBRL,
  formatPercent,
  classNames,
  categoriaLabel,
} from "@/lib/formatters";
import { DonutChart, CORES_GRAFICO } from "@/components/DonutChart";
import { SetupPortfolio } from "@/components/SetupPortfolio";
import type { Asset, Position } from "@/lib/types";

interface PosicaoHidratada {
  ativo: Asset;
  posicao: Position;
  preco: number;
  valor: number;
  investido: number;
  lucro: number;
  lucroPct: number;
  alocacao: number;
}

export default function PortfolioPage() {
  const {
    estado,
    ativos,
    patrimonioTotal,
    valorInvestido,
    rendimentoTotal,
    rendimentoPercentual,
    precoAtual,
    hidratado,
  } = usePortfolio();

  // Se ainda não configurou, mostra setup
  if (hidratado && !estado.configurado) {
    return (
      <div className="stagger">
        <SetupPortfolio />
      </div>
    );
  }

  // Hidrata posições
  const posicoesHidratadas: PosicaoHidratada[] = estado.posicoes
    .map((p): PosicaoHidratada | null => {
      const ativo = ativos.find((a) => a.ticker === p.ticker);
      if (!ativo) return null;
      const preco = precoAtual(p.ticker);
      const valor = p.quantidade * preco;
      const investido = p.precoMedio * p.quantidade;
      const lucro = valor - investido;
      const lucroPct = investido > 0 ? (lucro / investido) * 100 : 0;
      return {
        ativo,
        posicao: p,
        preco,
        valor,
        investido,
        lucro,
        lucroPct,
        alocacao: patrimonioTotal > 0 ? (valor / patrimonioTotal) * 100 : 0,
      };
    })
    .filter((x): x is PosicaoHidratada => x !== null)
    .sort((a, b) => b.valor - a.valor);

  // Agrupa por categoria
  const porCategoria = posicoesHidratadas.reduce<Record<string, number>>(
    (acc, p) => {
      acc[p.ativo.categoria] = (acc[p.ativo.categoria] || 0) + p.valor;
      return acc;
    },
    {},
  );

  // Adiciona o caixa como uma fatia também
  const fatiasCategoria = [
    ...Object.entries(porCategoria).map(([cat, val], i) => ({
      label: categoriaLabel(cat),
      valor: val as number,
      cor: CORES_GRAFICO[i % CORES_GRAFICO.length],
    })),
    {
      label: "Caixa",
      valor: estado.caixa,
      cor: "#64748B",
    },
  ];

  const fatiasAtivo = posicoesHidratadas.map((p, i) => ({
    label: p.ativo.ticker,
    valor: p.valor,
    cor: CORES_GRAFICO[i % CORES_GRAFICO.length],
  }));

  return (
    <div className="space-y-6 stagger">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          titulo="Patrimônio Total"
          valor={hidratado ? formatBRL(patrimonioTotal) : "—"}
          accent="brand"
        />
        <KPICard
          titulo="Valor Investido"
          valor={hidratado ? formatBRL(valorInvestido) : "—"}
        />
        <KPICard
          titulo="Caixa Disponível"
          valor={hidratado ? formatBRL(estado.caixa) : "—"}
        />
        <KPICard
          titulo="Rendimento Total"
          valor={
            hidratado
              ? `${rendimentoTotal >= 0 ? "+" : ""}${formatBRL(rendimentoTotal)}`
              : "—"
          }
          subValor={hidratado ? formatPercent(rendimentoPercentual) : ""}
          accent={rendimentoTotal >= 0 ? "up" : "down"}
        />
      </div>

      {/* Alocação */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-sm font-semibold mb-1">Alocação por Categoria</h3>
          <p className="text-xs text-ink-muted mb-5">
            Distribuição do patrimônio entre classes de ativos
          </p>
          {patrimonioTotal > 0 ? (
            <DonutChart fatias={fatiasCategoria} total={patrimonioTotal} />
          ) : (
            <EmptyState />
          )}
        </div>

        <div className="glass-card rounded-xl p-6">
          <h3 className="text-sm font-semibold mb-1">Alocação por Ativo</h3>
          <p className="text-xs text-ink-muted mb-5">
            Cada ativo na sua carteira e o peso relativo
          </p>
          {posicoesHidratadas.length > 0 ? (
            <DonutChart
              fatias={fatiasAtivo}
              total={fatiasAtivo.reduce((s, f) => s + f.valor, 0)}
            />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>

      {/* Tabela de posições */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-rule flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold">Minhas Posições</h3>
            <p className="text-xs text-ink-muted mt-0.5">
              {posicoesHidratadas.length}{" "}
              {posicoesHidratadas.length === 1 ? "ativo" : "ativos"} em carteira
            </p>
          </div>
          <Link
            href="/negociar"
            className="text-xs px-3 py-2 bg-brand hover:bg-brand-hover text-white rounded-md transition-colors font-medium"
          >
            + Negociar
          </Link>
        </div>

        {posicoesHidratadas.length === 0 ? (
          <div className="p-10 text-center">
            <div className="text-sm text-ink mb-2">
              Sua carteira está vazia
            </div>
            <p className="text-xs text-ink-muted mb-4 max-w-md mx-auto">
              Faça sua primeira compra simulada para começar a acompanhar suas
              posições.
            </p>
            <Link
              href="/mercados"
              className="inline-block text-xs px-4 py-2 bg-brand hover:bg-brand-hover text-white rounded-md transition-colors font-medium"
            >
              Explorar Mercados
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-ink-muted uppercase tracking-wider border-b border-rule">
                  <th className="text-left px-5 py-3 font-medium">Ativo</th>
                  <th className="text-right px-3 py-3 font-medium">Qtd.</th>
                  <th className="text-right px-3 py-3 font-medium">PM</th>
                  <th className="text-right px-3 py-3 font-medium">Preço</th>
                  <th className="text-right px-3 py-3 font-medium">Valor</th>
                  <th className="text-right px-3 py-3 font-medium">L/P</th>
                  <th className="text-right px-3 py-3 font-medium">L/P %</th>
                  <th className="text-right px-3 py-3 font-medium">Alocação</th>
                  <th className="text-right px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule-soft">
                {posicoesHidratadas.map((p) => {
                  const positivo = p.lucro >= 0;
                  return (
                    <tr
                      key={p.ativo.ticker}
                      className="hover:bg-navy-800/30 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-navy-700 to-navy-800 border border-rule flex items-center justify-center font-bold text-[10px]">
                            {p.ativo.ticker.slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold">
                              {p.ativo.ticker}
                            </div>
                            <div className="text-xs text-ink-muted truncate max-w-[180px]">
                              {p.ativo.nome}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-right px-3 py-3.5 num">
                        {p.posicao.quantidade}
                      </td>
                      <td className="text-right px-3 py-3.5 num text-ink-muted">
                        {formatBRL(p.posicao.precoMedio)}
                      </td>
                      <td className="text-right px-3 py-3.5 num">
                        {formatBRL(p.preco)}
                      </td>
                      <td className="text-right px-3 py-3.5 num font-medium">
                        {formatBRL(p.valor)}
                      </td>
                      <td
                        className={classNames(
                          "text-right px-3 py-3.5 num font-medium",
                          positivo ? "text-up" : "text-down",
                        )}
                      >
                        {positivo ? "+" : ""}
                        {formatBRL(p.lucro)}
                      </td>
                      <td
                        className={classNames(
                          "text-right px-3 py-3.5 num font-medium",
                          positivo ? "text-up" : "text-down",
                        )}
                      >
                        {formatPercent(p.lucroPct)}
                      </td>
                      <td className="text-right px-3 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 bg-navy-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-full bg-brand"
                              style={{
                                width: `${Math.min(100, p.alocacao)}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs num text-ink-muted w-10">
                            {p.alocacao.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="text-right px-5 py-3.5">
                        <Link
                          href={`/negociar?ticker=${p.ativo.ticker}`}
                          className="text-xs px-3 py-1.5 bg-navy-800 border border-rule hover:border-brand hover:text-brand rounded-md transition-colors"
                        >
                          Negociar
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function KPICard({
  titulo,
  valor,
  subValor,
  accent,
}: {
  titulo: string;
  valor: string;
  subValor?: string;
  accent?: "brand" | "up" | "down";
}) {
  return (
    <div className="glass-card rounded-xl p-5">
      <div className="text-xs text-ink-muted uppercase tracking-wider mb-2">
        {titulo}
      </div>
      <div
        className={classNames(
          "text-2xl font-bold num tracking-tight",
          accent === "brand" && "text-brand",
          accent === "up" && "text-up",
          accent === "down" && "text-down",
          !accent && "text-ink",
        )}
      >
        {valor}
      </div>
      {subValor && (
        <div
          className={classNames(
            "text-xs num mt-1",
            accent === "up" && "text-up",
            accent === "down" && "text-down",
            !accent && "text-ink-muted",
          )}
        >
          {subValor}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-8 text-center text-sm text-ink-muted">
      Sem posições para exibir
    </div>
  );
}
