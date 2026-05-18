"use client";

import Link from "next/link";
import { usePortfolio } from "@/contexts/PortfolioContext";
import {
  formatBRL,
  classNames,
  formatDateTime,
} from "@/lib/formatters";

export function AlertsList() {
  const { estado, removerAlerta, precoAtual, ativos } = usePortfolio();

  // Sugere o ticker da primeira posição da carteira, senão PETR4
  const tickerSugerido = estado.posicoes[0]?.ticker ?? "PETR4";
  const linkCriar = `/negociar?ticker=${tickerSugerido}&abrirAlerta=1`;

  const ativosAlertas = estado.alertas.filter((a) => !a.atingido);
  const atingidos = estado.alertas.filter((a) => a.atingido);

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-rule flex items-baseline justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-base font-semibold">Meus Alertas</h3>
          <p className="text-xs text-ink-muted mt-0.5">
            {estado.alertas.length === 0 ? (
              "Configure alertas de preço para ser notificado quando ativos atingirem valores específicos"
            ) : (
              <>
                {ativosAlertas.length}{" "}
                {ativosAlertas.length === 1 ? "alerta ativo" : "alertas ativos"} ·{" "}
                {atingidos.length}{" "}
                {atingidos.length === 1 ? "atingido" : "atingidos"}
              </>
            )}
          </p>
        </div>

        {/* Botão Criar alerta — leva direto ao Negociar com o modal pronto */}
        <Link
          href={linkCriar}
          className="text-xs px-3 py-2 bg-brand hover:bg-brand-hover text-white rounded-md font-medium transition-colors flex items-center gap-1.5"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Criar alerta de preço
        </Link>
      </div>

      {/* Estado vazio com tutorial visual */}
      {estado.alertas.length === 0 ? (
        <div className="p-6">
          <div className="bg-navy-800/40 border border-rule rounded-lg p-5">
            <div className="text-xs uppercase tracking-wider text-brand mb-3 font-semibold">
              Como criar um alerta de preço
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <PassoCard
                numero={1}
                titulo="Vá para Negociar"
                descricao="Escolha o ativo que você quer monitorar na lista lateral"
                icone={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M3 17l6-6 4 4 8-8M21 7v5h-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
              />
              <PassoCard
                numero={2}
                titulo="Defina o preço alvo"
                descricao="Escolha se quer ser avisado quando o preço subir ou cair até um valor"
                icone={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2v20M5 9l7-7 7 7M5 15l7 7 7-7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
              />
              <PassoCard
                numero={3}
                titulo="Receba a notificação"
                descricao="Quando o preço cruzar o valor definido, você será avisado no sino do topo"
                icone={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
              />
            </div>

            <Link
              href={linkCriar}
              className="mt-5 block text-center py-2.5 bg-brand hover:bg-brand-hover text-white font-semibold rounded-md text-sm transition-colors"
            >
              Criar meu primeiro alerta →
            </Link>
            <p className="text-[11px] text-ink-dim text-center mt-2">
              Você será levado direto à página de Negociar com o formulário aberto
            </p>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-rule-soft">
          {[...ativosAlertas, ...atingidos].map((a) => {
            const atual = precoAtual(a.ticker);
            const distancia = atual > 0 ? ((a.precoAlvo - atual) / atual) * 100 : 0;
            const ehAcima = a.direcao === "acima";

            return (
              <div
                key={a.id}
                className={classNames(
                  "px-5 py-3 flex items-center gap-4",
                  a.atingido && "opacity-60",
                )}
              >
                <div
                  className={classNames(
                    "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
                    a.atingido
                      ? "bg-up/15 text-up"
                      : ehAcima
                        ? "bg-up-soft/30 text-up"
                        : "bg-down-soft/30 text-down",
                  )}
                >
                  {a.atingido ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5 12l5 5L20 7"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : ehAcima ? (
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
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{a.ticker}</span>
                    <span className="text-xs text-ink-muted">
                      {a.atingido
                        ? "Atingido"
                        : ehAcima
                          ? "Subir até"
                          : "Cair até"}
                    </span>
                    <span className="text-sm font-semibold num">
                      {formatBRL(a.precoAlvo)}
                    </span>
                  </div>
                  <div className="text-xs text-ink-muted mt-0.5">
                    {a.atingido && a.atingidoEm ? (
                      <>Disparado em {formatDateTime(a.atingidoEm)}</>
                    ) : (
                      <>
                        Atual:{" "}
                        <span className="num text-ink">{formatBRL(atual)}</span>{" "}
                        ·{" "}
                        <span
                          className={classNames(
                            "num",
                            distancia >= 0 ? "text-up" : "text-down",
                          )}
                        >
                          {distancia >= 0 ? "+" : ""}
                          {distancia.toFixed(2)}% para atingir
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => removerAlerta(a.id)}
                  className="text-xs text-ink-dim hover:text-down px-2 py-1 rounded transition-colors"
                  title="Remover alerta"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PassoCard({
  numero,
  titulo,
  descricao,
  icone,
}: {
  numero: number;
  titulo: string;
  descricao: string;
  icone: React.ReactNode;
}) {
  return (
    <div className="bg-navy-900/50 border border-rule rounded-md p-3 relative">
      <div className="absolute -top-2.5 -left-2.5 w-7 h-7 rounded-full bg-brand text-white text-xs font-bold flex items-center justify-center shadow-lg">
        {numero}
      </div>
      <div className="flex items-start gap-2 mb-1.5">
        <div className="w-9 h-9 rounded-md bg-brand/15 text-brand flex items-center justify-center shrink-0">
          {icone}
        </div>
        <div className="text-sm font-semibold pt-1.5">{titulo}</div>
      </div>
      <p className="text-[11px] text-ink-muted leading-relaxed">
        {descricao}
      </p>
    </div>
  );
}
