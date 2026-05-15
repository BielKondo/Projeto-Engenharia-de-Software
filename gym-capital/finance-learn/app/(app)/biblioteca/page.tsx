"use client";

import { useMemo, useState } from "react";
import {
  conteudosBiblioteca,
  type ConteudoBiblioteca,
  type TipoConteudo,
  type NivelConteudo,
  TEMAS,
} from "@/lib/mockBiblioteca";
import { classNames } from "@/lib/formatters";

type FiltroTipo = "todos" | TipoConteudo;
type FiltroNivel = "todos" | NivelConteudo;

const tiposFiltro: { key: FiltroTipo; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "video", label: "Vídeos" },
  { key: "artigo", label: "Artigos" },
  { key: "curso", label: "Cursos" },
];

const niveisFiltro: { key: FiltroNivel; label: string }[] = [
  { key: "todos", label: "Todos os níveis" },
  { key: "iniciante", label: "Iniciante" },
  { key: "intermediario", label: "Intermediário" },
  { key: "avancado", label: "Avançado" },
];

export default function BibliotecaPage() {
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>("todos");
  const [filtroNivel, setFiltroNivel] = useState<FiltroNivel>("todos");
  const [filtroTema, setFiltroTema] = useState<string>("todos");
  const [busca, setBusca] = useState("");

  const destaques = useMemo(
    () => conteudosBiblioteca.filter((c) => c.destaque),
    [],
  );

  const lista = useMemo(() => {
    let result = conteudosBiblioteca;
    if (filtroTipo !== "todos") result = result.filter((c) => c.tipo === filtroTipo);
    if (filtroNivel !== "todos") result = result.filter((c) => c.nivel === filtroNivel);
    if (filtroTema !== "todos") result = result.filter((c) => c.tema === filtroTema);
    if (busca.trim()) {
      const q = busca.toLowerCase();
      result = result.filter(
        (c) =>
          c.titulo.toLowerCase().includes(q) ||
          c.descricao.toLowerCase().includes(q) ||
          c.tema.toLowerCase().includes(q) ||
          c.autor.toLowerCase().includes(q),
      );
    }
    return result;
  }, [filtroTipo, filtroNivel, filtroTema, busca]);

  return (
    <div className="space-y-6 stagger">
      {/* Hero / boas-vindas */}
      <div className="glass-card glow-card rounded-xl p-6 lg:p-8 relative">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-wider text-brand mb-2">
            Biblioteca G.Y.M
          </div>
          <h2 className="text-2xl lg:text-3xl font-semibold mb-3">
            Aprenda a investir com quem entende
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            Vídeos, artigos e cursos estruturados para todos os níveis. Comece
            pelo básico ou vá direto para tópicos avançados — você escolhe o
            ritmo da sua jornada.
          </p>
          <div className="flex gap-6 mt-5 text-sm">
            <div>
              <div className="text-xl font-bold text-brand num">
                {conteudosBiblioteca.length}
              </div>
              <div className="text-xs text-ink-muted">conteúdos</div>
            </div>
            <div>
              <div className="text-xl font-bold text-up num">
                {conteudosBiblioteca.filter((c) => c.tipo === "video").length}
              </div>
              <div className="text-xs text-ink-muted">vídeos</div>
            </div>
            <div>
              <div className="text-xl font-bold text-sell num">
                {conteudosBiblioteca.filter((c) => c.tipo === "curso").length}
              </div>
              <div className="text-xs text-ink-muted">cursos</div>
            </div>
            <div>
              <div className="text-xl font-bold text-[#8B5CF6] num">
                {conteudosBiblioteca.filter((c) => c.tipo === "artigo").length}
              </div>
              <div className="text-xs text-ink-muted">artigos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Destaques */}
      {destaques.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-muted mb-3 px-1">
            Destaques da semana
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {destaques.map((c) => (
              <CardDestaque key={c.id} conteudo={c} />
            ))}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="glass-card rounded-xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          <div className="flex gap-1.5 flex-wrap">
            {tiposFiltro.map((f) => (
              <button
                key={f.key}
                onClick={() => setFiltroTipo(f.key)}
                className={classNames(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  filtroTipo === f.key
                    ? "bg-brand text-white"
                    : "bg-navy-800 text-ink-muted hover:text-ink border border-rule",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex-1 md:ml-auto md:max-w-xs relative">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-dim"
            >
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Buscar título, autor, tema..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-navy-800 border border-rule rounded-md pl-9 pr-3 py-2 text-sm placeholder:text-ink-dim focus:border-brand focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex gap-1.5 flex-wrap">
            {niveisFiltro.map((n) => (
              <button
                key={n.key}
                onClick={() => setFiltroNivel(n.key)}
                className={classNames(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  filtroNivel === n.key
                    ? "bg-navy-700 text-ink border border-brand/30"
                    : "bg-transparent text-ink-muted hover:text-ink border border-rule",
                )}
              >
                {n.label}
              </button>
            ))}
          </div>

          <div className="flex-1 md:ml-auto md:max-w-xs">
            <select
              value={filtroTema}
              onChange={(e) => setFiltroTema(e.target.value)}
              className="w-full bg-navy-800 border border-rule rounded-md px-3 py-1.5 text-xs focus:border-brand focus:outline-none"
            >
              <option value="todos">Todos os temas</option>
              {TEMAS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid de conteúdos */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-muted mb-3 px-1">
          {lista.length} {lista.length === 1 ? "conteúdo" : "conteúdos"}
        </h3>
        {lista.length === 0 ? (
          <div className="glass-card rounded-xl p-10 text-center text-sm text-ink-muted">
            Nenhum conteúdo encontrado com esses filtros.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lista.map((c) => (
              <CardConteudo key={c.id} conteudo={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CardDestaque({ conteudo }: { conteudo: ConteudoBiblioteca }) {
  return (
    <button className="text-left glass-card rounded-xl overflow-hidden hover:border-brand transition-colors group">
      {/* Thumb */}
      <div
        className={classNames(
          "h-32 relative overflow-hidden",
          gradientePorTipo(conteudo.tipo),
        )}
      >
        <IconePorTipo tipo={conteudo.tipo} grande />
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <BadgeTipo tipo={conteudo.tipo} />
        </div>
        <div className="absolute top-3 right-3 text-[10px] uppercase tracking-wider text-white/80 bg-black/40 backdrop-blur px-2 py-0.5 rounded">
          Destaque
        </div>
      </div>
      <div className="p-4">
        <div className="text-xs text-ink-muted mb-1">{conteudo.tema}</div>
        <h4 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-brand transition-colors">
          {conteudo.titulo}
        </h4>
        <p className="text-xs text-ink-muted line-clamp-2 mb-3">
          {conteudo.descricao}
        </p>
        <div className="flex items-center justify-between text-xs">
          <span className="text-ink-muted">{conteudo.autor}</span>
          <DuracaoLabel conteudo={conteudo} />
        </div>
      </div>
    </button>
  );
}

function CardConteudo({ conteudo }: { conteudo: ConteudoBiblioteca }) {
  return (
    <button className="text-left glass-card rounded-xl overflow-hidden hover:border-brand transition-colors group flex flex-col">
      {/* Thumb */}
      <div
        className={classNames(
          "h-24 relative overflow-hidden",
          gradientePorTipo(conteudo.tipo),
        )}
      >
        <IconePorTipo tipo={conteudo.tipo} />
        <div className="absolute top-2 left-2">
          <BadgeTipo tipo={conteudo.tipo} />
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-ink-muted mb-1.5">
          <span>{conteudo.tema}</span>
          <BadgeNivel nivel={conteudo.nivel} />
        </div>
        <h4 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-brand transition-colors">
          {conteudo.titulo}
        </h4>
        <p className="text-xs text-ink-muted line-clamp-2 flex-1 mb-3">
          {conteudo.descricao}
        </p>
        <div className="flex items-center justify-between text-xs">
          <span className="text-ink-muted truncate max-w-[140px]">
            {conteudo.autor}
          </span>
          <DuracaoLabel conteudo={conteudo} />
        </div>
      </div>
    </button>
  );
}

function BadgeTipo({ tipo }: { tipo: TipoConteudo }) {
  const cores: Record<TipoConteudo, string> = {
    video: "bg-up/90 text-white",
    artigo: "bg-[#8B5CF6]/90 text-white",
    curso: "bg-sell/90 text-white",
  };
  const labels: Record<TipoConteudo, string> = {
    video: "Vídeo",
    artigo: "Artigo",
    curso: "Curso",
  };
  return (
    <span
      className={classNames(
        "text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider backdrop-blur",
        cores[tipo],
      )}
    >
      {labels[tipo]}
    </span>
  );
}

function BadgeNivel({ nivel }: { nivel: NivelConteudo }) {
  const labels: Record<NivelConteudo, string> = {
    iniciante: "Iniciante",
    intermediario: "Interm.",
    avancado: "Avançado",
  };
  const cores: Record<NivelConteudo, string> = {
    iniciante: "text-up",
    intermediario: "text-brand",
    avancado: "text-sell",
  };
  return <span className={cores[nivel]}>{labels[nivel]}</span>;
}

function DuracaoLabel({ conteudo }: { conteudo: ConteudoBiblioteca }) {
  if (conteudo.tipo === "curso" && conteudo.modulos) {
    return (
      <span className="text-ink-muted num">{conteudo.modulos} módulos</span>
    );
  }
  if (conteudo.duracaoMin) {
    return <span className="text-ink-muted num">{conteudo.duracaoMin} min</span>;
  }
  return null;
}

function IconePorTipo({
  tipo,
  grande,
}: {
  tipo: TipoConteudo;
  grande?: boolean;
}) {
  const tamanho = grande ? 44 : 32;
  const className = "absolute inset-0 flex items-center justify-center text-white/80";
  if (tipo === "video") {
    return (
      <div className={className}>
        <svg
          width={tamanho}
          height={tamanho}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    );
  }
  if (tipo === "artigo") {
    return (
      <div className={className}>
        <svg
          width={tamanho}
          height={tamanho}
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }
  return (
    <div className={className}>
      <svg
        width={tamanho}
        height={tamanho}
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M22 10v6M2 10l10-5 10 5-10 5z M6 12v5c3 3 9 3 12 0v-5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function gradientePorTipo(tipo: TipoConteudo): string {
  if (tipo === "video") return "bg-gradient-to-br from-emerald-700 to-emerald-900";
  if (tipo === "artigo") return "bg-gradient-to-br from-violet-700 to-violet-900";
  return "bg-gradient-to-br from-orange-700 to-orange-900";
}
