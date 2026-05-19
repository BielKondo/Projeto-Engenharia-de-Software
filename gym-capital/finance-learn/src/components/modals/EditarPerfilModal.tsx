/**
 * MODAL DE EDIÇÃO DE PERFIL
 * ============================================================
 * Janela pop-up que permite editar:
 *   - Foto de perfil (avatar)
 *   - Nome completo
 *   - Email
 *   - Data de nascimento (com validação 16+)
 *   - Idioma da interface
 *   - Moeda padrão
 *
 * Quando salva, atualiza no banco e refresca o usuário em todo o app.
 */
"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/state/auth";
import { useI18n } from "@/state/i18n";
import { classNames } from "@/utils/format";
import type { Idioma, Moeda } from "@/types";
import { Portal } from "./Portal";

const IDADE_MINIMA = 16;
const IDADE_MAXIMA = 120;
/** Avatar é base64; limitamos tamanho pra caber tranquilo no banco */
const TAMANHO_MAXIMO_AVATAR_BYTES = 1_500_000; // ~1.5MB

interface Props {
  aberto: boolean;
  onFechar: () => void;
}

export function EditarPerfilModal({ aberto, onFechar }: Props) {
  const { usuario, refresh } = useAuth();
  const { t, idioma: idiomaAtual } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado local do formulário
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [idioma, setIdioma] = useState<Idioma>("pt-BR");
  const [moeda, setMoeda] = useState<Moeda>("BRL");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  // Preenche o form com os dados atuais sempre que abrir o modal
  useEffect(() => {
    if (!aberto || !usuario) return;
    setNome(usuario.nome);
    setEmail(usuario.email);
    setDataNascimento(
      usuario.dataNascimento ? usuario.dataNascimento.slice(0, 10) : "",
    );
    setIdioma(usuario.idioma ?? "pt-BR");
    setMoeda(usuario.moeda ?? "BRL");
    setAvatarUrl(usuario.avatarUrl ?? null);
    setErros({});
    setErroGeral(null);
    setSucesso(false);
  }, [aberto, usuario]);

  if (!aberto || !usuario) return null;

  // Calcula idade em tempo real
  const idade = dataNascimento ? calcularIdade(dataNascimento) : null;
  const idadeValida =
    idade !== null && idade >= IDADE_MINIMA && idade <= IDADE_MAXIMA;

  const escolherFoto = () => fileInputRef.current?.click();

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErros((prev) => ({ ...prev, avatarUrl: "Arquivo precisa ser uma imagem" }));
      return;
    }
    if (file.size > TAMANHO_MAXIMO_AVATAR_BYTES) {
      setErros((prev) => ({
        ...prev,
        avatarUrl: "Imagem muito grande (máximo 1.5MB)",
      }));
      return;
    }

    // Converte para base64
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUrl(reader.result as string);
      setErros((prev) => {
        const { avatarUrl: _, ...rest } = prev;
        return rest;
      });
    };
    reader.readAsDataURL(file);
  };

  const removerFoto = () => setAvatarUrl(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErros({});
    setErroGeral(null);
    setSucesso(false);

    // Validação rápida no cliente
    const errosCliente: Record<string, string> = {};
    if (nome.trim().length < 3) errosCliente.nome = "Nome muito curto";
    if (!email.includes("@")) errosCliente.email = "Email inválido";
    if (!idadeValida) {
      errosCliente.dataNascimento =
        idade !== null && idade < IDADE_MINIMA
          ? t("msg.idadeApenas", { idade, minimo: IDADE_MINIMA })
          : "Data inválida";
    }
    if (Object.keys(errosCliente).length > 0) {
      setErros(errosCliente);
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          email,
          dataNascimento,
          idioma,
          moeda,
          avatarUrl,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.erros) setErros(data.erros);
        setErroGeral(data.erro ?? "Falha ao salvar alterações");
        setEnviando(false);
        return;
      }

      setSucesso(true);
      await refresh();
      setTimeout(() => {
        onFechar();
        setEnviando(false);
      }, 1000);
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
          className="glass-card rounded-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold">
                {t("modal.editarPerfil.titulo")}
              </h2>
              <p className="text-xs text-ink-muted mt-0.5">
                {t("modal.editarPerfil.subtitulo")}
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
            {/* Avatar */}
            <div>
              <label className="text-xs text-ink-muted block mb-2 uppercase tracking-wider font-medium">
                {t("modal.editarPerfil.foto")}
              </label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-brand to-brand-soft flex items-center justify-center text-xl font-bold text-white shrink-0">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    gerarIniciais(nome || usuario.nome)
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFotoChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={escolherFoto}
                    className="text-xs px-3 py-2 border border-rule rounded-md hover:border-brand hover:text-brand transition-colors"
                  >
                    {t("modal.editarPerfil.escolherFoto")}
                  </button>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={removerFoto}
                      className="text-xs px-3 py-2 border border-rule rounded-md hover:border-down hover:text-down transition-colors"
                    >
                      {t("modal.editarPerfil.removerFoto")}
                    </button>
                  )}
                </div>
              </div>
              {erros.avatarUrl && (
                <div className="text-xs text-down mt-1">{erros.avatarUrl}</div>
              )}
            </div>

            {/* Nome */}
            <Campo label={t("modal.editarPerfil.nome")} erro={erros.nome}>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className={inputCls(erros.nome)}
              />
            </Campo>

            {/* Email */}
            <Campo label={t("modal.editarPerfil.email")} erro={erros.email}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputCls(erros.email)}
              />
            </Campo>

            {/* Data nascimento */}
            <Campo
              label={t("modal.editarPerfil.dataNascimento")}
              erro={erros.dataNascimento}
            >
              <input
                type="date"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                lang={idiomaAtual}
                required
                className={inputCls(erros.dataNascimento)}
              />
              {dataNascimento && idade !== null && (
                <div
                  className={classNames(
                    "text-xs mt-1.5",
                    idadeValida ? "text-up" : "text-down",
                  )}
                >
                  {idadeValida
                    ? `✓ ${idade} ${t("perfil.anos")}`
                    : idade < IDADE_MINIMA
                      ? `⚠ ${t("msg.idadeApenas", { idade, minimo: IDADE_MINIMA })}`
                      : "⚠ Data inválida"}
                </div>
              )}
            </Campo>

            {/* Idioma e Moeda lado a lado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Campo label={t("modal.editarPerfil.idioma")} erro={erros.idioma}>
                <select
                  value={idioma}
                  onChange={(e) => setIdioma(e.target.value as Idioma)}
                  className={inputCls(erros.idioma)}
                >
                  <option value="pt-BR">{t("idioma.pt-BR")}</option>
                  <option value="en-US">{t("idioma.en-US")}</option>
                  <option value="es-ES">{t("idioma.es-ES")}</option>
                </select>
              </Campo>

              <Campo label={t("modal.editarPerfil.moeda")} erro={erros.moeda}>
                <select
                  value={moeda}
                  onChange={(e) => setMoeda(e.target.value as Moeda)}
                  className={inputCls(erros.moeda)}
                >
                  <option value="BRL">{t("moeda.BRL")}</option>
                  <option value="USD">{t("moeda.USD")}</option>
                  <option value="EUR">{t("moeda.EUR")}</option>
                </select>
              </Campo>
            </div>

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
                {t("modal.editarPerfil.sucesso")}
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
                  t("btn.salvar")
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

/** Calcula idade em anos a partir de uma data ISO */
function calcularIdade(dataISO: string): number {
  const nasc = new Date(dataISO);
  if (isNaN(nasc.getTime())) return -1;
  const hoje = new Date();
  let anos = hoje.getFullYear() - nasc.getFullYear();
  const aniversarioPassou =
    hoje.getMonth() > nasc.getMonth() ||
    (hoje.getMonth() === nasc.getMonth() && hoje.getDate() >= nasc.getDate());
  if (!aniversarioPassou) anos--;
  return anos;
}

function gerarIniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}
