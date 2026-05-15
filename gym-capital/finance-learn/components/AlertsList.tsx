"use client";

import { usePortfolio } from "@/contexts/PortfolioContext";
import {
  formatBRL,
  classNames,
  formatDateTime,
} from "@/lib/formatters";

export function AlertsList() {
  const { estado, removerAlerta, precoAtual } = usePortfolio();

  const ativos = estado.alertas.filter((a) => !a.atingido);
  const atingidos = estado.alertas.filter((a) => a.atingido);

  if (estado.alertas.length === 0) {
    return (
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-base font-semibold mb-1">Meus Alertas</h3>
        <p className="text-xs text-ink-muted mb-5">
          Configure alertas de preço para ser notificado quando ativos atingirem
          valores específicos
        </p>
        <div className="text-center py-8 text-sm text-ink-muted">
          Você ainda não criou nenhum alerta. Vá para Negociar e clique em
          &ldquo;Criar alerta de preço&rdquo;.
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-rule">
        <h3 className="text-base font-semibold">Meus Alertas</h3>
        <p className="text-xs text-ink-muted mt-0.5">
          {ativos.length}{" "}
          {ativos.length === 1 ? "alerta ativo" : "alertas ativos"} ·{" "}
          {atingidos.length}{" "}
          {atingidos.length === 1 ? "atingido" : "atingidos"}
        </p>
      </div>

      <div className="divide-y divide-rule-soft">
        {[...ativos, ...atingidos].map((a) => {
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
    </div>
  );
}
