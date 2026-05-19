"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/state/auth";
import { useI18n } from "@/state/i18n";
import { usePortfolio } from "@/state/portfolio";
import { useTheme } from "@/state/theme";
import { classNames } from "@/utils/format";
import { EditarPerfilModal } from "@/components/modals/EditarPerfilModal";
import { AlterarSenhaModal } from "@/components/modals/AlterarSenhaModal";

export default function ConfiguracoesPage() {
  const { usuario } = useAuth();
  const { t, formatarMoeda, formatarData } = useI18n();
  const { resetar, estado } = usePortfolio();
  const { tema, definir } = useTheme();
  const [emailNotificacoes, setEmailNotificacoes] = useState(true);
  const [pushNotificacoes, setPushNotificacoes] = useState(false);
  const [tickerLive, setTickerLive] = useState(true);
  const [confirmandoReset, setConfirmandoReset] = useState(false);
  const [editarAberto, setEditarAberto] = useState(false);
  const [senhaAberto, setSenhaAberto] = useState(false);

  const handleReset = () => {
    resetar();
    setConfirmandoReset(false);
  };

  return (
    <div className="space-y-6 stagger max-w-4xl">
      {/* Aparência */}
      <Secao titulo={t("config.aparencia")} descricao={t("config.aparenciaDesc")}>
        <ToggleRow
          titulo={t("config.temaEscuro")}
          descricao={t("config.temaEscuroDesc")}
          ativo={tema === "dark"}
          onChange={(v) => definir(v ? "dark" : "light")}
        />
        <ToggleRow
          titulo={t("config.atualizacaoAuto")}
          descricao={t("config.atualizacaoAutoDesc")}
          ativo={tickerLive}
          onChange={setTickerLive}
        />
      </Secao>

      {/* Notificações */}
      <Secao
        titulo={t("config.notificacoes")}
        descricao={t("config.notificacoesDesc")}
      >
        <ToggleRow
          titulo={t("config.notifEmail")}
          descricao={t("config.notifEmailDesc")}
          ativo={emailNotificacoes}
          onChange={setEmailNotificacoes}
        />
        <ToggleRow
          titulo={t("config.notifPush")}
          descricao={t("config.notifPushDesc")}
          ativo={pushNotificacoes}
          onChange={setPushNotificacoes}
        />
      </Secao>

      {/* Dados pessoais */}
      <Secao
        titulo={t("config.dadosPessoais")}
        descricao={t("config.dadosPessoaisDesc")}
        acao={
          <button
            onClick={() => setEditarAberto(true)}
            className="text-xs px-3 py-2 border border-rule rounded-md hover:border-brand hover:text-brand transition-colors flex items-center gap-2"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path
                d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {t("btn.editar")}
          </button>
        }
      >
        <div className="space-y-3">
          <InfoRow label={t("perfil.nome")} valor={usuario?.nome ?? "—"} />
          <InfoRow label={t("perfil.email")} valor={usuario?.email ?? "—"} />
          <InfoRow
            label={t("config.dataNascimento")}
            valor={
              usuario?.dataNascimento
                ? formatarData(usuario.dataNascimento)
                : "—"
            }
          />
          <InfoRow
            label={t("perfil.idioma")}
            valor={t(`idioma.${usuario?.idioma ?? "pt-BR"}` as const)}
          />
          <InfoRow
            label={t("perfil.moedaPadrao")}
            valor={t(`moeda.${usuario?.moeda ?? "BRL"}` as const)}
          />
        </div>
      </Secao>

      {/* Segurança */}
      <Secao titulo={t("config.seguranca")} descricao={t("config.segurancaDesc")}>
        <div className="space-y-3">
          <InfoRow
            label={t("config.senha")}
            valor="••••••••••"
            cta={t("btn.alterar")}
            onCtaClick={() => setSenhaAberto(true)}
          />
          <InfoRow
            label={t("config.autenticacao2f")}
            valor={t("config.desativado")}
            cta={t("btn.ativar")}
          />
        </div>
      </Secao>

      {/* Simulação */}
      <Secao titulo={t("config.simulacao")} descricao={t("config.simulacaoDesc")}>
        <div className="space-y-3">
          <InfoRow
            label={t("config.status")}
            valor={
              estado.configurado
                ? t("config.configurado")
                : t("config.naoConfigurado")
            }
          />
          <InfoRow
            label={t("config.saldoInicial")}
            valor={
              estado.configurado ? formatarMoeda(estado.saldoInicial) : "—"
            }
          />
          <InfoRow
            label={t("config.operacoesRealizadas")}
            valor={String(estado.transacoes.length)}
          />
        </div>

        {!estado.configurado && (
          <div className="mt-5 p-4 rounded-lg border border-brand/30 bg-brand/5">
            <div className="text-sm font-semibold mb-1">
              {t("config.naoConfigurado")}
            </div>
            <Link
              href="/portfolio"
              className="inline-block mt-2 text-xs px-3 py-2 bg-brand hover:bg-brand-hover text-white rounded-md transition-colors font-medium"
            >
              {t("btn.confirmar")}
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
                  {t("btn.reiniciar")}
                </div>

                {!confirmandoReset ? (
                  <button
                    onClick={() => setConfirmandoReset(true)}
                    className="mt-3 text-xs px-3 py-2 border border-down/50 text-down hover:bg-down/10 rounded-md transition-colors"
                  >
                    {t("btn.reiniciar")}
                  </button>
                ) : (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleReset}
                      className="text-xs px-3 py-1.5 bg-down hover:bg-down/80 text-white rounded-md transition-colors font-medium"
                    >
                      {t("btn.confirmar")}
                    </button>
                    <button
                      onClick={() => setConfirmandoReset(false)}
                      className="text-xs px-3 py-1.5 border border-rule hover:border-ink/40 rounded-md transition-colors"
                    >
                      {t("btn.cancelar")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Secao>

      {/* Sobre */}
      <Secao titulo={t("config.sobre")} descricao={t("config.sobreDesc")}>
        <div className="space-y-3">
          <InfoRow label={t("config.versao")} valor="v0.1.0" />
          <InfoRow label={t("config.plataforma")} valor="GYM Capital" />
          <InfoRow
            label={t("config.desenvolvidoPor")}
            valor="Grupo G.Y.M — Mackenzie"
          />
        </div>
      </Secao>

      {/* Modais */}
      <EditarPerfilModal
        aberto={editarAberto}
        onFechar={() => setEditarAberto(false)}
      />
      <AlterarSenhaModal
        aberto={senhaAberto}
        onFechar={() => setSenhaAberto(false)}
      />
    </div>
  );
}

function Secao({
  titulo,
  descricao,
  acao,
  children,
}: {
  titulo: string;
  descricao: string;
  acao?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
        <div>
          <h3 className="text-sm font-semibold">{titulo}</h3>
          <p className="text-xs text-ink-muted mt-0.5">{descricao}</p>
        </div>
        {acao}
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
  onCtaClick,
}: {
  label: string;
  valor: string;
  cta?: string;
  onCtaClick?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-rule-soft last:border-0">
      <div className="text-sm text-ink-muted">{label}</div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-ink">{valor}</span>
        {cta && (
          <button
            onClick={onCtaClick}
            className="text-xs text-brand hover:underline"
          >
            {cta}
          </button>
        )}
      </div>
    </div>
  );
}
