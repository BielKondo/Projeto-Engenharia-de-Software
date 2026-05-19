"use client";

import { useState } from "react";
import { useAuth } from "@/state/auth";
import { useI18n } from "@/state/i18n";
import { usePortfolio } from "@/state/portfolio";
import { classNames } from "@/utils/format";
import { EditarPerfilModal } from "@/components/modals/EditarPerfilModal";
import { UserAvatar } from "@/components/common/UserAvatar";

export default function PerfilPage() {
  const { usuario } = useAuth();
  const { t, formatarMoeda } = useI18n();
  const {
    estado,
    patrimonioTotal,
    valorInvestido,
    rendimentoTotal,
    rendimentoPercentual,
  } = usePortfolio();
  const [modalAberto, setModalAberto] = useState(false);

  if (!usuario) {
    return (
      <div className="glass-card rounded-xl p-6 text-center text-ink-muted">
        {t("msg.carregandoPerfil")}
      </div>
    );
  }

  const qtdAtivos = estado.posicoes.length;
  const nivelDiversificacao =
    qtdAtivos === 0
      ? t("perfil.semPosicoes")
      : qtdAtivos < 3
        ? t("perfil.baixa")
        : qtdAtivos < 6
          ? t("perfil.moderada")
          : t("perfil.alta");

  const idade = usuario.dataNascimento
    ? calcularIdade(usuario.dataNascimento)
    : null;

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
          <UserAvatar
            nome={usuario.nome}
            avatarUrl={usuario.avatarUrl}
            tamanho={80}
            className="text-2xl"
          />

          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-semibold">{usuario.nome}</h2>
            <p className="text-sm text-ink-muted mt-0.5">{usuario.email}</p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-xs px-2.5 py-1 rounded-full bg-brand/15 text-brand border border-brand/30 font-medium">
                {t("perfil.investidorAprendizado")}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-navy-800 text-ink-muted border border-rule">
                {t("perfil.perfilModerado")}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-up/15 text-up border border-up/30">
                {t("perfil.contaAtiva")}
              </span>
            </div>
          </div>

          <button
            onClick={() => setModalAberto(true)}
            className="text-xs px-4 py-2 border border-rule rounded-md hover:border-brand hover:text-brand transition-colors flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {t("btn.editarPerfil")}
          </button>
        </div>
      </div>

      {/* Estatísticas + sobre */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card rounded-xl p-6">
          <h3 className="text-sm font-semibold mb-1">
            {t("perfil.estatisticasGerais")}
          </h3>
          <p className="text-xs text-ink-muted mb-5">
            {t("perfil.resumoAtividade")}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Stat
              label={t("perfil.patrimonioTotal")}
              valor={formatarMoeda(patrimonioTotal)}
            />
            <Stat
              label={t("perfil.valorInvestido")}
              valor={formatarMoeda(valorInvestido)}
            />
            <Stat
              label={t("perfil.caixaEmConta")}
              valor={formatarMoeda(estado.caixa)}
            />
            <Stat
              label={t("perfil.rendimentoTotal")}
              valor={`${rendimentoTotal >= 0 ? "+" : ""}${formatarMoeda(rendimentoTotal)}`}
              accent={rendimentoTotal >= 0 ? "up" : "down"}
            />
            <Stat
              label={t("perfil.rendimentoPct")}
              valor={`${rendimentoPercentual >= 0 ? "+" : ""}${rendimentoPercentual.toFixed(2)}%`}
              accent={rendimentoPercentual >= 0 ? "up" : "down"}
            />
            <Stat
              label={t("perfil.operacoes")}
              valor={String(estado.transacoes.length)}
            />
            <Stat label={t("perfil.ativosDiferentes")} valor={String(qtdAtivos)} />
            <Stat
              label={t("perfil.diversificacao")}
              valor={nivelDiversificacao}
            />
          </div>
        </div>

        <div className="glass-card rounded-xl p-6">
          <h3 className="text-sm font-semibold mb-1">
            {t("perfil.sobreInvestidor")}
          </h3>
          <p className="text-xs text-ink-muted mb-5">
            {t("perfil.informacoesConta")}
          </p>

          <div className="space-y-3 text-sm">
            <Info label={t("perfil.nome")} valor={usuario.nome} />
            <Info label={t("perfil.email")} valor={usuario.email} />
            {idade !== null && (
              <Info
                label={t("perfil.idade")}
                valor={`${idade} ${t("perfil.anos")}`}
              />
            )}
            <Info label={t("perfil.pais")} valor={t("perfil.brasil")} />
            <Info
              label={t("perfil.idioma")}
              valor={t(`idioma.${usuario.idioma ?? "pt-BR"}` as const)}
            />
            <Info
              label={t("perfil.moedaPadrao")}
              valor={t(`moeda.${usuario.moeda ?? "BRL"}` as const)}
            />
          </div>
        </div>
      </div>

      {/* Conquistas */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-sm font-semibold mb-1">
          {t("perfil.conquistasAprendizado")}
        </h3>
        <p className="text-xs text-ink-muted mb-5">
          {t("perfil.marcosDesbloqueados")}
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

      <EditarPerfilModal
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
      />
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
    <div className="flex items-center justify-between border-b border-rule-soft pb-2 last:border-0 gap-3">
      <span className="text-xs text-ink-muted shrink-0">{label}</span>
      <span className="text-ink font-medium text-right truncate" title={valor}>
        {valor}
      </span>
    </div>
  );
}

function calcularIdade(dataNascimentoISO: string): number {
  const nasc = new Date(dataNascimentoISO);
  const hoje = new Date();
  let anos = hoje.getFullYear() - nasc.getFullYear();
  const aniversarioPassou =
    hoje.getMonth() > nasc.getMonth() ||
    (hoje.getMonth() === nasc.getMonth() && hoje.getDate() >= nasc.getDate());
  if (!aniversarioPassou) anos--;
  return anos;
}
