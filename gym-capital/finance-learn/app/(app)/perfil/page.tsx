"use client";

import { usePortfolio } from "@/contexts/PortfolioContext";
import {
  formatBRL,
  formatPercent,
  classNames,
} from "@/lib/formatters";

export default function PerfilPage() {
  const {
    estado,
    patrimonioTotal,
    valorInvestido,
    rendimentoTotal,
    rendimentoPercentual,
  } = usePortfolio();

  // Calcula nível de diversificação como heurística simples
  const qtdAtivos = estado.posicoes.length;
  const nivelDiversificacao =
    qtdAtivos === 0
      ? "Sem posições"
      : qtdAtivos < 3
        ? "Baixa"
        : qtdAtivos < 6
          ? "Moderada"
          : "Alta";

  const conquistas = [
    {
      id: "primeira-compra",
      titulo: "Primeira Compra",
      desc: "Realize sua primeira operação de compra",
      cumprida: estado.transacoes.some((t) => t.tipo === "compra"),
    },
    {
      id: "primeira-venda",
      titulo: "Primeira Venda",
      desc: "Venda um ativo para realizar lucros",
      cumprida: estado.transacoes.some((t) => t.tipo === "venda"),
    },
    {
      id: "diversificado",
      titulo: "Diversificado",
      desc: "Tenha pelo menos 3 ativos diferentes",
      cumprida: estado.posicoes.length >= 3,
    },
    {
      id: "lucrativo",
      titulo: "No Azul",
      desc: "Acumule rendimento positivo",
      cumprida: rendimentoTotal > 0,
    },
  ];

  return (
    <div className="space-y-6 stagger">
      {/* Cabeçalho do perfil */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-start gap-5 flex-wrap">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand to-brand-soft flex items-center justify-center text-2xl font-bold shrink-0">
            AS
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-semibold">Arthur Slikta</h2>
            <p className="text-sm text-ink-muted mt-0.5">
              arthur.slikta@exemplo.com
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-xs px-2.5 py-1 rounded-full bg-brand/15 text-brand border border-brand/30 font-medium">
                Investidor Qualificado
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-navy-800 text-ink-muted border border-rule">
                Perfil: Moderado
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-up/15 text-up border border-up/30">
                Conta ativa
              </span>
            </div>
          </div>

          <button className="text-xs px-4 py-2 border border-rule rounded-md hover:border-brand hover:text-brand transition-colors">
            Editar Perfil
          </button>
        </div>
      </div>

      {/* Estatísticas + sobre */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card rounded-xl p-6">
          <h3 className="text-sm font-semibold mb-1">Estatísticas Gerais</h3>
          <p className="text-xs text-ink-muted mb-5">
            Resumo da sua atividade na plataforma
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Stat
              label="Patrimônio total"
              valor={formatBRL(patrimonioTotal)}
            />
            <Stat label="Valor investido" valor={formatBRL(valorInvestido)} />
            <Stat label="Caixa em conta" valor={formatBRL(estado.caixa)} />
            <Stat
              label="Rendimento total"
              valor={`${rendimentoTotal >= 0 ? "+" : ""}${formatBRL(
                rendimentoTotal,
              )}`}
              accent={rendimentoTotal >= 0 ? "up" : "down"}
            />
            <Stat
              label="Rendimento %"
              valor={formatPercent(rendimentoPercentual)}
              accent={rendimentoPercentual >= 0 ? "up" : "down"}
            />
            <Stat label="Operações" valor={String(estado.transacoes.length)} />
            <Stat label="Ativos diferentes" valor={String(qtdAtivos)} />
            <Stat label="Diversificação" valor={nivelDiversificacao} />
            <Stat
              label="Membro desde"
              valor={new Date().toLocaleDateString("pt-BR", {
                month: "short",
                year: "numeric",
              })}
            />
          </div>
        </div>

        <div className="glass-card rounded-xl p-6">
          <h3 className="text-sm font-semibold mb-1">Sobre o Investidor</h3>
          <p className="text-xs text-ink-muted mb-5">
            Características pessoais
          </p>

          <div className="space-y-3 text-sm">
            <Info label="Nome" valor="Arthur Slikta" />
            <Info label="RA" valor="10353847" />
            <Info label="Universidade" valor="Mackenzie" />
            <Info label="País" valor="Brasil" />
            <Info label="Idioma" valor="Português (BR)" />
            <Info label="Moeda padrão" valor="Real (BRL)" />
          </div>
        </div>
      </div>

      {/* Conquistas */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-sm font-semibold mb-1">Conquistas de Aprendizado</h3>
        <p className="text-xs text-ink-muted mb-5">
          Marcos que você desbloqueou usando a plataforma
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {conquistas.map((c) => (
            <div
              key={c.id}
              className={classNames(
                "p-4 rounded-lg border transition-colors",
                c.cumprida
                  ? "bg-brand/10 border-brand/40"
                  : "bg-navy-800/40 border-rule opacity-60",
              )}
            >
              <div
                className={classNames(
                  "w-9 h-9 rounded-full flex items-center justify-center mb-2.5",
                  c.cumprida ? "bg-brand/30 text-brand" : "bg-navy-800 text-ink-dim",
                )}
              >
                {c.cumprida ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12l5 5L20 7"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  </svg>
                )}
              </div>
              <div className="font-semibold text-sm">{c.titulo}</div>
              <p className="text-xs text-ink-muted mt-1">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  valor,
  accent,
}: {
  label: string;
  valor: string;
  accent?: "up" | "down";
}) {
  return (
    <div className="p-3 rounded-md bg-navy-800/50 border border-rule">
      <div className="text-[10px] text-ink-muted uppercase tracking-wider mb-1">
        {label}
      </div>
      <div
        className={classNames(
          "text-lg font-semibold num",
          accent === "up" && "text-up",
          accent === "down" && "text-down",
          !accent && "text-ink",
        )}
      >
        {valor}
      </div>
    </div>
  );
}

function Info({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex items-center justify-between border-b border-rule-soft pb-2 last:border-0">
      <span className="text-xs text-ink-muted">{label}</span>
      <span className="text-ink font-medium">{valor}</span>
    </div>
  );
}
