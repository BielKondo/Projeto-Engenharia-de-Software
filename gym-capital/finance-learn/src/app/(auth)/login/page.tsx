"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AuthShell } from "@/components/layout/AuthShell";
import { classNames } from "@/utils/format";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const proximaRota = searchParams.get("next") ?? "/";

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setEnviando(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErro(data.erro ?? "Falha ao fazer login");
        setEnviando(false);
        return;
      }

      // Redireciona após login com sucesso
      router.push(proximaRota);
      router.refresh();
    } catch {
      setErro("Erro de conexão. Tente novamente.");
      setEnviando(false);
    }
  };

  return (
    <AuthShell
      titulo="Bem-vindo de volta"
      subtitulo="Entre com seu email e senha para acessar sua conta"
      rodape={
        <>
          Ainda não tem uma conta?{" "}
          <Link
            href="/cadastro"
            className="text-brand hover:underline font-medium"
          >
            Cadastre-se
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Campo label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            autoComplete="email"
            required
            className="w-full bg-navy-800 border border-rule rounded-md px-3 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </Campo>

        <Campo label="Senha">
          <div className="relative">
            <input
              type={mostrarSenha ? "text" : "password"}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              className="w-full bg-navy-800 border border-rule rounded-md px-3 py-2.5 pr-10 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
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
        </Campo>

        {erro && (
          <div className="text-xs text-down bg-down/10 border border-down/30 rounded-md p-3">
            {erro}
          </div>
        )}

        <button
          type="submit"
          disabled={enviando}
          className={classNames(
            "w-full py-2.5 rounded-md font-semibold text-sm transition-colors flex items-center justify-center gap-2",
            enviando
              ? "bg-brand/60 text-white/80 cursor-not-allowed"
              : "bg-brand hover:bg-brand-hover text-white",
          )}
        >
          {enviando ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Entrando...
            </>
          ) : (
            "Entrar"
          )}
        </button>

        <div className="text-xs text-ink-dim text-center pt-2">
          🔒 Suas credenciais são criptografadas e armazenadas com segurança.
        </div>
      </form>
    </AuthShell>
  );
}

function Campo({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs text-ink-muted block mb-1.5 uppercase tracking-wider font-medium">
        {label}
      </label>
      {children}
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-10 text-ink-muted">Carregando...</div>}>
      <LoginContent />
    </Suspense>
  );
}
