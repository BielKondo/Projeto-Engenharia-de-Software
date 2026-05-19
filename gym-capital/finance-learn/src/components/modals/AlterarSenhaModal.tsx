/**
 * MODAL DE ALTERAÇÃO DE SENHA
 * ============================================================
 * Pede a senha atual + nova senha + confirmação.
 * Aplica a mesma regra de força da senha do cadastro.
 */
"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/state/i18n";
import { classNames } from "@/utils/format";
import { Portal } from "./Portal";

interface Props {
  aberto: boolean;
  onFechar: () => void;
}

export function AlterarSenhaModal({ aberto, onFechar }: Props) {
  const { t } = useI18n();
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacaoSenha, setConfirmacao] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  // Reseta o estado ao abrir
  useEffect(() => {
    if (!aberto) return;
    setSenhaAtual("");
    setNovaSenha("");
    setConfirmacao("");
    setErros({});
    setErroGeral(null);
    setSucesso(false);
    setMostrar(false);
  }, [aberto]);

  if (!aberto) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErros({});
    setErroGeral(null);

    // Validação rápida no cliente
    const errosCliente: Record<string, string> = {};
    if (!senhaAtual) errosCliente.senhaAtual = t("modal.senha.senhaAtual");
    if (novaSenha.length < 8)
      errosCliente.novaSenha = "Mínimo 8 caracteres";
    if (novaSenha !== confirmacaoSenha)
      errosCliente.confirmacaoSenha = "Senhas não conferem";
    if (Object.keys(errosCliente).length > 0) {
      setErros(errosCliente);
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch("/api/auth/senha", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senhaAtual, novaSenha, confirmacaoSenha }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.erros) setErros(data.erros);
        setErroGeral(data.erro ?? "Falha ao alterar senha");
        setEnviando(false);
        return;
      }

      setSucesso(true);
      setTimeout(() => {
        onFechar();
        setEnviando(false);
      }, 1200);
    } catch {
      setErroGeral(t("msg.erroConexao"));
      setEnviando(false);
    }
  };

  return (
    <Portal>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 animate-fade-in"
        onClick={onFechar}
      >
        <div
          className="glass-card rounded-xl w-full max-w-md p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold">{t("modal.senha.titulo")}</h2>
              <p className="text-xs text-ink-muted mt-0.5">
                {t("modal.senha.subtitulo")}
              </p>
            </div>
            <button
              onClick={onFechar}
              className="text-ink-muted hover:text-ink p-1"
              aria-label={t("btn.fechar")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4" noValidate>
            <Campo label={t("modal.senha.senhaAtual")} erro={erros.senhaAtual}>
              <input
                type={mostrar ? "text" : "password"}
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                autoComplete="current-password"
                required
                className={inputCls(erros.senhaAtual)}
              />
            </Campo>

            <Campo label={t("modal.senha.novaSenha")} erro={erros.novaSenha}>
              <input
                type={mostrar ? "text" : "password"}
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                required
                className={inputCls(erros.novaSenha)}
              />
            </Campo>

            <Campo
              label={t("modal.senha.confirmacao")}
              erro={erros.confirmacaoSenha}
            >
              <input
                type={mostrar ? "text" : "password"}
                value={confirmacaoSenha}
                onChange={(e) => setConfirmacao(e.target.value)}
                autoComplete="new-password"
                required
                className={inputCls(erros.confirmacaoSenha)}
              />
            </Campo>

            <label className="flex items-center gap-2 text-xs text-ink-muted cursor-pointer">
              <input
                type="checkbox"
                checked={mostrar}
                onChange={(e) => setMostrar(e.target.checked)}
                className="accent-brand"
              />
              Mostrar senhas
            </label>

            {erroGeral && !Object.keys(erros).length && (
              <div className="text-xs text-down bg-down/10 border border-down/30 rounded-md p-3">
                {erroGeral}
              </div>
            )}

            {sucesso && (
              <div className="text-xs text-up bg-up/10 border border-up/30 rounded-md p-3 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12l5 5L20 7"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {t("modal.senha.sucesso")}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onFechar}
                className="flex-1 py-2.5 rounded-md font-medium text-sm border border-rule hover:border-ink-muted text-ink-muted transition-colors"
              >
                {t("btn.cancelar")}
              </button>
              <button
                type="submit"
                disabled={enviando || sucesso}
                className={classNames(
                  "flex-1 py-2.5 rounded-md font-semibold text-sm transition-colors flex items-center justify-center gap-2",
                  enviando || sucesso
                    ? "bg-brand/40 text-white/80 cursor-not-allowed"
                    : "bg-brand hover:bg-brand-hover text-white",
                )}
              >
                {enviando ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t("btn.salvando")}
                  </>
                ) : sucesso ? (
                  t("btn.salvo")
                ) : (
                  t("btn.alterar")
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}

function Campo({
  label,
  erro,
  children,
}: {
  label: string;
  erro?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs text-ink-muted block mb-1.5 uppercase tracking-wider font-medium">
        {label}
      </label>
      {children}
      {erro && <div className="text-xs text-down mt-1">{erro}</div>}
    </div>
  );
}

function inputCls(erro?: string) {
  return classNames(
    "w-full bg-navy-800 border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors",
    erro
      ? "border-down focus:ring-down/20 focus:border-down"
      : "border-rule focus:border-brand focus:ring-brand/20",
  );
}
