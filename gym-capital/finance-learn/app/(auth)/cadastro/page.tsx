"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AuthShell } from "@/components/AuthShell";
import { classNames } from "@/lib/formatters";

export default function CadastroPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    nome: "",
    email: "",
    dataNascimento: "",
    cpf: "",
    senha: "",
    confirmacaoSenha: "",
    aceitouTermos: false,
  });
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const set = <K extends keyof typeof form>(campo: K, valor: typeof form[K]) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setErros((prev) => {
      if (!prev[campo as string]) return prev;
      const novo = { ...prev };
      delete novo[campo as string];
      return novo;
    });
  };

  // Calcula força da senha em tempo real
  const forcaSenha = useMemo(() => calcularForcaSenha(form.senha), [form.senha]);

  const formatarCPF = (valor: string) => {
    const digitos = valor.replace(/\D/g, "").slice(0, 11);
    return digitos
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroGeral(null);
    setErros({});
    setEnviando(true);

    try {
      const res = await fetch("/api/auth/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          cpf: form.cpf || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.erros) setErros(data.erros);
        setErroGeral(data.erro ?? "Falha ao criar conta");
        setEnviando(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setErroGeral("Erro de conexão. Tente novamente.");
      setEnviando(false);
    }
  };

  return (
    <AuthShell
      titulo="Crie sua conta"
      subtitulo="Comece a aprender sobre investimentos com dinheiro fictício"
      rodape={
        <>
          Já tem uma conta?{" "}
          <Link href="/login" className="text-brand hover:underline font-medium">
            Fazer login
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Campo label="Nome completo" erro={erros.nome}>
          <input
            type="text"
            value={form.nome}
            onChange={(e) => set("nome", e.target.value)}
            placeholder="Seu nome"
            autoComplete="name"
            required
            className={inputCls(erros.nome)}
          />
        </Campo>

        <Campo label="Email" erro={erros.email}>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="seu@email.com"
            autoComplete="email"
            required
            className={inputCls(erros.email)}
          />
        </Campo>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Campo label="Data de nascimento" erro={erros.dataNascimento}>
            <input
              type="date"
              value={form.dataNascimento}
              onChange={(e) => set("dataNascimento", e.target.value)}
              required
              className={inputCls(erros.dataNascimento)}
            />
          </Campo>

          <Campo label="CPF (opcional)" erro={erros.cpf}>
            <input
              type="text"
              inputMode="numeric"
              value={form.cpf}
              onChange={(e) => set("cpf", formatarCPF(e.target.value))}
              placeholder="000.000.000-00"
              maxLength={14}
              className={inputCls(erros.cpf)}
            />
          </Campo>
        </div>

        <Campo label="Senha" erro={erros.senha}>
          <div className="relative">
            <input
              type={mostrarSenha ? "text" : "password"}
              value={form.senha}
              onChange={(e) => set("senha", e.target.value)}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              required
              className={classNames(inputCls(erros.senha), "pr-10")}
            />
            <button
              type="button"
              onClick={() => setMostrarSenha(!mostrarSenha)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink p-1"
              aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
            >
              {mostrarSenha ? <IconeOlhoFechado /> : <IconeOlho />}
            </button>
          </div>
          {form.senha && <BarraForcaSenha forca={forcaSenha} />}
        </Campo>

        <Campo label="Confirmar senha" erro={erros.confirmacaoSenha}>
          <input
            type={mostrarSenha ? "text" : "password"}
            value={form.confirmacaoSenha}
            onChange={(e) => set("confirmacaoSenha", e.target.value)}
            placeholder="Digite a senha novamente"
            autoComplete="new-password"
            required
            className={inputCls(erros.confirmacaoSenha)}
          />
        </Campo>

        {/* Termos */}
        <label className="flex items-start gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            checked={form.aceitouTermos}
            onChange={(e) => set("aceitouTermos", e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-brand cursor-pointer shrink-0"
            required
          />
          <span className="text-xs text-ink-muted leading-relaxed">
            Estou ciente que o GYM Capital é uma{" "}
            <strong className="text-ink">plataforma educacional</strong>. Todos
            os valores são fictícios, não há nenhum investimento real, e o
            conteúdo não constitui recomendação de investimento. Aceito os{" "}
            <span className="text-brand">termos de uso</span> e a{" "}
            <span className="text-brand">política de privacidade</span>.
          </span>
        </label>
        {erros.aceitouTermos && (
          <div className="text-xs text-down -mt-2 ml-6">
            {erros.aceitouTermos}
          </div>
        )}

        {erroGeral && !Object.keys(erros).length && (
          <div className="text-xs text-down bg-down/10 border border-down/30 rounded-md p-3">
            {erroGeral}
          </div>
        )}

        <button
          type="submit"
          disabled={enviando || !form.aceitouTermos}
          className={classNames(
            "w-full py-2.5 rounded-md font-semibold text-sm transition-colors flex items-center justify-center gap-2",
            enviando || !form.aceitouTermos
              ? "bg-brand/40 text-white/80 cursor-not-allowed"
              : "bg-brand hover:bg-brand-hover text-white",
          )}
        >
          {enviando ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Criando conta...
            </>
          ) : (
            "Criar conta"
          )}
        </button>
      </form>
    </AuthShell>
  );
}

// Helpers visuais

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

interface ForcaSenha {
  pontuacao: number; // 0 a 4
  label: string;
  cor: string;
}

function calcularForcaSenha(senha: string): ForcaSenha {
  if (!senha) return { pontuacao: 0, label: "", cor: "" };

  let pontos = 0;
  if (senha.length >= 8) pontos++;
  if (senha.length >= 12) pontos++;
  if (/[A-Z]/.test(senha) && /[a-z]/.test(senha)) pontos++;
  if (/\d/.test(senha)) pontos++;
  if (/[^A-Za-z0-9]/.test(senha)) pontos++;

  const escala = Math.min(4, Math.floor((pontos / 5) * 4));

  const niveis: ForcaSenha[] = [
    { pontuacao: 0, label: "Muito fraca", cor: "bg-down" },
    { pontuacao: 1, label: "Fraca", cor: "bg-down" },
    { pontuacao: 2, label: "Razoável", cor: "bg-sell" },
    { pontuacao: 3, label: "Boa", cor: "bg-brand" },
    { pontuacao: 4, label: "Forte", cor: "bg-up" },
  ];
  return niveis[escala];
}

function BarraForcaSenha({ forca }: { forca: ForcaSenha }) {
  return (
    <div className="mt-2 flex items-center gap-2">
      <div className="flex-1 h-1 bg-navy-700 rounded-full overflow-hidden flex gap-0.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={classNames(
              "flex-1 transition-colors",
              i <= forca.pontuacao - 1 ? forca.cor : "bg-transparent",
            )}
          />
        ))}
      </div>
      <span className="text-[10px] text-ink-muted shrink-0">{forca.label}</span>
    </div>
  );
}

function IconeOlho() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function IconeOlhoFechado() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
