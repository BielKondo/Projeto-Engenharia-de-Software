"use client";

import { useState } from "react";
import Link from "next/link";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { useTheme } from "@/contexts/ThemeContext";
import { formatBRL, classNames } from "@/lib/formatters";

export default function ConfiguracoesPage() {
  const { resetar, estado } = usePortfolio();
  const { tema, definir } = useTheme();
  const [emailNotificacoes, setEmailNotificacoes] = useState(true);
  const [pushNotificacoes, setPushNotificacoes] = useState(false);
  const [tickerLive, setTickerLive] = useState(true);
  const [confirmandoReset, setConfirmandoReset] = useState(false);

  const handleReset = () => {
    resetar();
    setConfirmandoReset(false);
  };

  return (
    <div className="space-y-6 stagger max-w-4xl">
      {/* Aparência */}
      <Secao
        titulo="Aparência"
        descricao="Personalize como a interface é exibida"
      >
        <ToggleRow
          titulo="Tema escuro"
          descricao="Use o tema dark navy (recomendado para mercados financeiros)"
          ativo={tema === "dark"}
          onChange={(v) => definir(v ? "dark" : "light")}
        />
        <ToggleRow
          titulo="Atualização automática de preços"
          descricao="Preços são atualizados a cada 1 hora (comportamento similar ao do pregão)"
          ativo={tickerLive}
          onChange={setTickerLive}
        />
      </Secao>

      {/* Notificações */}
      <Secao
        titulo="Notificações"
        descricao="Escolha como quer ser avisado sobre suas operações e metas"
      >
        <ToggleRow
          titulo="Notificações por e-mail"
          descricao="Receber resumos diários e alertas de mercado"
          ativo={emailNotificacoes}
          onChange={setEmailNotificacoes}
        />
        <ToggleRow
          titulo="Notificações push"
          descricao="Alertas no navegador (em breve)"
          ativo={pushNotificacoes}
          onChange={setPushNotificacoes}
        />
      </Secao>

      {/* Conta */}
      <Secao
        titulo="Conta"
        descricao="Informações de acesso e segurança"
      >
        <div className="space-y-3">
          <InfoRow label="E-mail" valor="arthur.slikta@exemplo.com" />
          <InfoRow label="Senha" valor="••••••••••" cta="Alterar" />
          <InfoRow
            label="Autenticação em 2 fatores"
            valor="Desativado"
            cta="Ativar"
          />
        </div>
      </Secao>

      {/* Simulação */}
      <Secao titulo="Simulação" descricao="Controle dos dados de prática">
        <div className="space-y-3">
          <InfoRow
            label="Status"
            valor={estado.configurado ? "Configurado" : "Não configurado"}
          />
          <InfoRow
            label="Saldo inicial"
            valor={
              estado.configurado ? formatBRL(estado.saldoInicial) : "—"
            }
          />
          <InfoRow
            label="Operações realizadas"
            valor={String(estado.transacoes.length)}
          />
        </div>

        {!estado.configurado && (
          <div className="mt-5 p-4 rounded-lg border border-brand/30 bg-brand/5">
            <div className="text-sm font-semibold mb-1">
              Você ainda não configurou o simulador
            </div>
            <p className="text-xs text-ink-muted mb-3">
              Vá para o Portfólio Detalhado para escolher seu saldo inicial e
              começar a investir.
            </p>
            <Link
              href="/portfolio"
              className="inline-block text-xs px-3 py-2 bg-brand hover:bg-brand-hover text-white rounded-md transition-colors font-medium"
            >
              Configurar agora
            </Link>
          </div>
        )}

        {estado.configurado && (
          <div className="mt-5 p-4 rounded-lg border border-down/30 bg-down/5">
            <div className="flex items-start gap-3">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                className="text-down shrink-0 mt-0.5"
              >
                <path
                  d="M12 9v4M12 17h.01M10.3 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex-1">
                <div className="text-sm font-semibold text-ink">
                  Reiniciar simulação
                </div>
                <p className="text-xs text-ink-muted mt-1">
                  Apaga todas as transações, posições e o saldo inicial. Você
                  precisará configurar tudo novamente. Esta ação não pode ser
                  desfeita.
                </p>

                {!confirmandoReset ? (
                  <button
                    onClick={() => setConfirmandoReset(true)}
                    className="mt-3 text-xs px-3 py-2 border border-down/50 text-down hover:bg-down/10 rounded-md transition-colors"
                  >
                    Zerar carteira
                  </button>
                ) : (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-ink">Tem certeza?</span>
                    <button
                      onClick={handleReset}
                      className="text-xs px-3 py-1.5 bg-down hover:bg-down/80 text-white rounded-md transition-colors font-medium"
                    >
                      Sim, zerar tudo
                    </button>
                    <button
                      onClick={() => setConfirmandoReset(false)}
                      className="text-xs px-3 py-1.5 border border-rule hover:border-ink/40 rounded-md transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Secao>

      {/* Sobre */}
      <Secao titulo="Sobre" descricao="Informações da plataforma">
        <div className="space-y-3">
          <InfoRow label="Versão" valor="v0.1.0 (Sprint inicial)" />
          <InfoRow label="Plataforma" valor="GYM Capital" />
          <InfoRow label="Desenvolvido por" valor="Grupo G.Y.M — Mackenzie" />
        </div>
      </Secao>
    </div>
  );
}

function Secao({
  titulo,
  descricao,
  children,
}: {
  titulo: string;
  descricao: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card rounded-xl p-6">
      <div className="mb-5">
        <h3 className="text-sm font-semibold">{titulo}</h3>
        <p className="text-xs text-ink-muted mt-0.5">{descricao}</p>
      </div>
      {children}
    </div>
  );
}

function ToggleRow({
  titulo,
  descricao,
  ativo,
  onChange,
}: {
  titulo: string;
  descricao: string;
  ativo: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-rule-soft last:border-0">
      <div className="flex-1">
        <div className="text-sm font-medium">{titulo}</div>
        <p className="text-xs text-ink-muted mt-0.5">{descricao}</p>
      </div>
      <button
        onClick={() => onChange(!ativo)}
        className={classNames(
          "shrink-0 w-11 h-6 rounded-full p-0.5 transition-colors",
          ativo ? "bg-brand" : "bg-navy-700",
        )}
      >
        <div
          className={classNames(
            "w-5 h-5 rounded-full bg-white transition-transform",
            ativo ? "translate-x-5" : "translate-x-0",
          )}
        />
      </button>
    </div>
  );
}

function InfoRow({
  label,
  valor,
  cta,
}: {
  label: string;
  valor: string;
  cta?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-rule-soft last:border-0">
      <div className="text-sm text-ink-muted">{label}</div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-ink">{valor}</span>
        {cta && (
          <button className="text-xs text-brand hover:underline">{cta}</button>
        )}
      </div>
    </div>
  );
}
