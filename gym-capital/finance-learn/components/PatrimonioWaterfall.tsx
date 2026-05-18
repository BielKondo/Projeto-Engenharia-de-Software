"use client";

import { useMemo, useState } from "react";
import { usePortfolio } from "@/contexts/PortfolioContext";
import {
  formatBRL,
  formatPercent,
  classNames,
} from "@/lib/formatters";

interface DriverAtivo {
  ticker: string;
  nome: string;
  quantidade: number;
  precoMedio: number;
  precoAtual: number;
  valorInvestido: number; // PM × qty
  valorAtual: number; // preço atual × qty
  contribuicao: number; // valorAtual − valorInvestido (em R$)
  contribuicaoPct: number; // contribuição / valorInvestido × 100
}

export function PatrimonioWaterfall() {
  const {
    estado,
    ativos,
    patrimonioTotal,
    rendimentoTotal,
    rendimentoPercentual,
    hidratado,
  } = usePortfolio();

  const [expandido, setExpandido] = useState(true);

  const drivers: DriverAtivo[] = useMemo(() => {
    return estado.posicoes
      .map((p) => {
        const ativo = ativos.find((a) => a.ticker === p.ticker);
        if (!ativo) return null;
        const valorInvestido = p.precoMedio * p.quantidade;
        const valorAtual = ativo.preco * p.quantidade;
        const contribuicao = valorAtual - valorInvestido;
        const contribuicaoPct =
          valorInvestido > 0 ? (contribuicao / valorInvestido) * 100 : 0;
        return {
          ticker: p.ticker,
          nome: ativo.nome,
          quantidade: p.quantidade,
          precoMedio: p.precoMedio,
          precoAtual: ativo.preco,
          valorInvestido,
          valorAtual,
          contribuicao,
          contribuicaoPct,
        } as DriverAtivo;
      })
      .filter((x): x is DriverAtivo => x !== null)
      .sort((a, b) => Math.abs(b.contribuicao) - Math.abs(a.contribuicao));
  }, [estado.posicoes, ativos]);

  const contribuicaoTotal = drivers.reduce((s, d) => s + d.contribuicao, 0);
  const drivePositivos = drivers.filter((d) => d.contribuicao > 0);
  const driveNegativos = drivers.filter((d) => d.contribuicao < 0);
  const ganho = drivePositivos.reduce((s, d) => s + d.contribuicao, 0);
  const perda = Math.abs(driveNegativos.reduce((s, d) => s + d.contribuicao, 0));

  // Não exibe se não há histórico (não configurado)
  if (!hidratado || !estado.configurado) return null;

  const positivo = rendimentoTotal >= 0;

  // Estado inicial sem operações
  if (drivers.length === 0) {
    return (
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            className="text-brand"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path
              d="M12 8v4M12 16h.01"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <h3 className="text-base font-semibold">Por que meu patrimônio mudou?</h3>
        </div>
        <p className="text-sm text-ink-muted">
          Seu patrimônio está integralmente em <strong>caixa</strong>, que não
          rende sozinho. Para que ele varie, você precisa comprar ativos na
          carteira.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-rule">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              className={positivo ? "text-up" : "text-down"}
            >
              <path
                d="M3 17l6-6 4 4 8-8M21 7v5h-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                transform={positivo ? "" : "rotate(0 12 12) scale(1 -1) translate(0 -24)"}
              />
            </svg>
            <h3 className="text-base font-semibold">
              Por que meu patrimônio mudou?
            </h3>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted">
              Resultado total
            </div>
            <div
              className={classNames(
                "text-lg font-bold num",
                positivo ? "text-up" : "text-down",
              )}
            >
              {rendimentoTotal >= 0 ? "+" : ""}
              {formatBRL(rendimentoTotal)} ({formatPercent(rendimentoPercentual)})
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Resumo: ganhos vs perdas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-up/5 border border-up/20 rounded-md p-3">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted mb-1">
              💚 O que te fez ganhar
            </div>
            <div className="text-lg font-bold text-up num">
              +{formatBRL(ganho)}
            </div>
            <div className="text-[11px] text-ink-muted mt-0.5">
              {drivePositivos.length}{" "}
              {drivePositivos.length === 1 ? "ativo subiu" : "ativos subiram"}
            </div>
          </div>

          <div className="bg-down/5 border border-down/20 rounded-md p-3">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted mb-1">
              ❤️ O que te fez perder
            </div>
            <div className="text-lg font-bold text-down num">
              −{formatBRL(perda)}
            </div>
            <div className="text-[11px] text-ink-muted mt-0.5">
              {driveNegativos.length}{" "}
              {driveNegativos.length === 1 ? "ativo caiu" : "ativos caíram"}
            </div>
          </div>

          <div className="bg-navy-800/50 border border-rule rounded-md p-3">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted mb-1">
              💰 Em caixa (sem render)
            </div>
            <div className="text-lg font-bold num">
              {formatBRL(estado.caixa)}
            </div>
            <div className="text-[11px] text-ink-muted mt-0.5">
              {patrimonioTotal > 0
                ? `${((estado.caixa / patrimonioTotal) * 100).toFixed(1)}% do patrimônio`
                : "—"}
            </div>
          </div>
        </div>

        {/* Cascata / Barra horizontal de contribuição */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <div className="text-xs uppercase tracking-wider text-ink-muted">
              Contribuição de cada ativo
            </div>
            <button
              onClick={() => setExpandido(!expandido)}
              className="text-[11px] text-brand hover:underline"
            >
              {expandido ? "Recolher detalhes" : "Ver detalhes"}
            </button>
          </div>

          <BarraContribuicao drivers={drivers} contribuicaoTotal={contribuicaoTotal} />

          {expandido && (
            <div className="mt-4 space-y-2">
              {drivers.map((d) => (
                <LinhaDriver key={d.ticker} driver={d} />
              ))}
            </div>
          )}
        </div>

        {/* Explicação textual em linguagem simples */}
        <div className="border-t border-rule pt-4">
          <div className="text-xs uppercase tracking-wider text-ink-muted mb-2">
            💡 Explicação
          </div>
          <p className="text-sm text-ink-muted leading-relaxed">
            <ExplicacaoSimples
              positivo={positivo}
              drivers={drivers}
              caixa={estado.caixa}
              patrimonioTotal={patrimonioTotal}
            />
          </p>
        </div>
      </div>
    </div>
  );
}

function BarraContribuicao({
  drivers,
  contribuicaoTotal,
}: {
  drivers: DriverAtivo[];
  contribuicaoTotal: number;
}) {
  // Se o total é 0, não pode dividir
  if (Math.abs(contribuicaoTotal) < 0.01) {
    return (
      <div className="h-3 bg-navy-800 rounded-full overflow-hidden flex items-center justify-center text-[10px] text-ink-muted">
        Sem variação significativa
      </div>
    );
  }

  // Separa positivos e negativos
  const positivos = drivers.filter((d) => d.contribuicao > 0);
  const negativos = drivers.filter((d) => d.contribuicao < 0);

  // Total absoluto pra normalizar (positivos + |negativos|)
  const totalAbs =
    positivos.reduce((s, d) => s + d.contribuicao, 0) +
    Math.abs(negativos.reduce((s, d) => s + d.contribuicao, 0));

  return (
    <div className="space-y-1.5">
      <div className="h-4 flex rounded-md overflow-hidden bg-navy-800">
        {positivos.map((d, i) => {
          const w = (d.contribuicao / totalAbs) * 100;
          return (
            <div
              key={`pos-${d.ticker}`}
              className="bg-up h-full relative group cursor-default flex items-center justify-center"
              style={{
                width: `${w}%`,
                opacity: 1 - i * 0.12,
                minWidth: w > 3 ? undefined : "auto",
                borderRight:
                  i < positivos.length - 1
                    ? "1px solid rgba(255,255,255,0.15)"
                    : "none",
              }}
              title={`${d.ticker}: +${formatBRL(d.contribuicao)}`}
            >
              {w > 8 && (
                <span className="text-[9px] font-bold text-white px-1 truncate">
                  {d.ticker}
                </span>
              )}
            </div>
          );
        })}
        {negativos.map((d, i) => {
          const w = (Math.abs(d.contribuicao) / totalAbs) * 100;
          return (
            <div
              key={`neg-${d.ticker}`}
              className="bg-down h-full relative group cursor-default flex items-center justify-center"
              style={{
                width: `${w}%`,
                opacity: 1 - i * 0.12,
                minWidth: w > 3 ? undefined : "auto",
                borderRight:
                  i < negativos.length - 1
                    ? "1px solid rgba(255,255,255,0.15)"
                    : "none",
              }}
              title={`${d.ticker}: ${formatBRL(d.contribuicao)}`}
            >
              {w > 8 && (
                <span className="text-[9px] font-bold text-white px-1 truncate">
                  {d.ticker}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-ink-muted">
        <span>
          <span className="inline-block w-2 h-2 rounded-sm bg-up mr-1" />
          Ganhos
        </span>
        <span>
          <span className="inline-block w-2 h-2 rounded-sm bg-down mr-1" />
          Perdas
        </span>
      </div>
    </div>
  );
}

function LinhaDriver({ driver }: { driver: DriverAtivo }) {
  const positivo = driver.contribuicao >= 0;
  const variacaoPrecoPct =
    driver.precoMedio > 0
      ? ((driver.precoAtual - driver.precoMedio) / driver.precoMedio) * 100
      : 0;

  return (
    <div className="flex items-center gap-3 p-2.5 bg-navy-800/30 border border-rule rounded-md">
      <div
        className={classNames(
          "w-9 h-9 rounded-md flex items-center justify-center shrink-0",
          positivo ? "bg-up/15 text-up" : "bg-down/15 text-down",
        )}
      >
        {positivo ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4l8 8h-5v8h-6v-8H4z" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 20l-8-8h5V4h6v8h5z" />
          </svg>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-sm">{driver.ticker}</span>
          <span className="text-[10px] text-ink-muted truncate">
            {driver.quantidade} cotas · PM {formatBRL(driver.precoMedio)} → atual{" "}
            {formatBRL(driver.precoAtual)}
          </span>
        </div>
        <div
          className={classNames(
            "text-[11px] num mt-0.5",
            positivo ? "text-up" : "text-down",
          )}
        >
          Preço {positivo ? "subiu" : "caiu"} {formatPercent(Math.abs(variacaoPrecoPct))}{" "}
          desde a compra
        </div>
      </div>

      <div className="text-right shrink-0">
        <div
          className={classNames(
            "font-bold text-sm num",
            positivo ? "text-up" : "text-down",
          )}
        >
          {positivo ? "+" : ""}
          {formatBRL(driver.contribuicao)}
        </div>
        <div
          className={classNames(
            "text-[10px] num",
            positivo ? "text-up/70" : "text-down/70",
          )}
        >
          {formatPercent(driver.contribuicaoPct)}
        </div>
      </div>
    </div>
  );
}

function ExplicacaoSimples({
  positivo,
  drivers,
  caixa,
  patrimonioTotal,
}: {
  positivo: boolean;
  drivers: DriverAtivo[];
  caixa: number;
  patrimonioTotal: number;
}) {
  const maiorGanho = drivers
    .filter((d) => d.contribuicao > 0)
    .sort((a, b) => b.contribuicao - a.contribuicao)[0];
  const maiorPerda = drivers
    .filter((d) => d.contribuicao < 0)
    .sort((a, b) => a.contribuicao - b.contribuicao)[0];

  const pctCaixa =
    patrimonioTotal > 0 ? (caixa / patrimonioTotal) * 100 : 0;

  return (
    <>
      Seu patrimônio{" "}
      {positivo ? (
        <span className="text-up font-medium">cresceu</span>
      ) : (
        <span className="text-down font-medium">caiu</span>
      )}{" "}
      principalmente por causa do desempenho dos ativos da sua carteira.{" "}
      {maiorGanho && (
        <>
          O que mais contribuiu positivamente foi{" "}
          <strong className="text-up">{maiorGanho.ticker}</strong>, que rendeu{" "}
          <span className="num text-up">
            +{formatBRL(maiorGanho.contribuicao)}
          </span>{" "}
          ({formatPercent(maiorGanho.contribuicaoPct)}).{" "}
        </>
      )}
      {maiorPerda && (
        <>
          Já <strong className="text-down">{maiorPerda.ticker}</strong> puxou
          para baixo, com{" "}
          <span className="num text-down">
            {formatBRL(maiorPerda.contribuicao)}
          </span>{" "}
          ({formatPercent(maiorPerda.contribuicaoPct)}).{" "}
        </>
      )}
      {pctCaixa > 30 && (
        <>
          Vale lembrar que{" "}
          <strong>{pctCaixa.toFixed(0)}% do seu patrimônio</strong> está em
          caixa, que não rende sozinho — diversificar mais pode acelerar seus
          ganhos (mas também aumenta o risco).
        </>
      )}
    </>
  );
}
