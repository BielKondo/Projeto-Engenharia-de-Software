"use client";

import Link from "next/link";

export function AuthShell({
  titulo,
  subtitulo,
  children,
  rodape,
}: {
  titulo: string;
  subtitulo: string;
  children: React.ReactNode;
  rodape?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-[1fr_440px] xl:grid-cols-[1fr_500px]">
      {/* Painel esquerdo: brand + storytelling */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden bg-navy-950">
        {/* Glow effects de fundo */}
        <div
          aria-hidden
          className="absolute top-0 -right-32 w-96 h-96 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(59,130,246,0.18), transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="absolute bottom-0 -left-32 w-96 h-96 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(139,92,246,0.12), transparent 70%)",
          }}
        />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-brand flex items-center justify-center shadow-lg shadow-brand/30">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <div className="font-bold text-lg leading-none">GYM CAPITAL</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-ink-muted mt-0.5">
              Aprenda investindo
            </div>
          </div>
        </div>

        {/* Storytelling */}
        <div className="relative z-10 max-w-md">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-3">
            ✨ Ambiente seguro de aprendizado
          </div>
          <h2 className="text-3xl xl:text-4xl font-bold leading-tight mb-4">
            Pratique investimentos sem colocar seu dinheiro em risco
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            O GYM Capital é um simulador de investimentos 100% educacional.
            Aprenda sobre ações, FIIs, ETFs, Tesouro Direto e criptomoedas com
            dinheiro fictício e conteúdo estruturado por nível.
          </p>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <Feature numero="15+" texto="conteúdos educacionais" />
            <Feature numero="15" texto="ativos para simular" />
            <Feature numero="100%" texto="ambiente fictício" />
            <Feature numero="0" texto="risco financeiro" />
          </div>
        </div>

        {/* Rodapé */}
        <div className="relative z-10 text-[11px] text-ink-dim">
          © 2026 GYM Capital · Projeto acadêmico · Universidade Presbiteriana
          Mackenzie
        </div>
      </div>

      {/* Painel direito: formulário */}
      <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12 bg-navy-900 overflow-y-auto">
        {/* Brand mobile (some no desktop) */}
        <Link
          href="/"
          className="lg:hidden flex items-center gap-2 mb-8 self-start"
        >
          <div className="w-8 h-8 rounded-md bg-brand flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="font-bold">GYM CAPITAL</span>
        </Link>

        <div className="w-full max-w-md mx-auto lg:mx-0">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{titulo}</h1>
          <p className="text-sm text-ink-muted mb-8">{subtitulo}</p>

          {children}

          {rodape && (
            <div className="mt-8 pt-6 border-t border-rule text-center text-sm text-ink-muted">
              {rodape}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Feature({ numero, texto }: { numero: string; texto: string }) {
  return (
    <div className="border-l-2 border-brand pl-3">
      <div className="text-xl font-bold text-brand num">{numero}</div>
      <div className="text-[11px] text-ink-muted">{texto}</div>
    </div>
  );
}
