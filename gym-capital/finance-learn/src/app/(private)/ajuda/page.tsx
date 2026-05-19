"use client";

import Link from "next/link";
import { useState } from "react";
import { classNames } from "@/utils/format";

const faqs = [
  {
    q: "O dinheiro da plataforma é real?",
    a: "Não. Todo o saldo, ativos e operações são fictícios — a plataforma é estritamente educacional. Use à vontade para praticar sem riscos.",
  },
  {
    q: "Como funciona a compra de um ativo?",
    a: "Acesse Mercados ou Negociar, selecione um ativo, defina a quantidade no modal de compra. O custo total é debitado do seu caixa e a quantidade entra na sua carteira ao preço médio ponderado.",
  },
  {
    q: "O que é preço médio (PM)?",
    a: "Quando você compra o mesmo ativo em momentos diferentes, o sistema calcula a média ponderada dos preços pagos. Esse é o seu custo médio — referência para calcular lucro ou prejuízo.",
  },
  {
    q: "Como escolho meu saldo inicial?",
    a: "Na primeira vez que você acessar a aba Portfólio, aparecerá um wizard de configuração. Escolha um valor sugerido ou digite um personalizado. Você pode reiniciar a qualquer momento.",
  },
  {
    q: "Com que frequência os preços são atualizados?",
    a: "Os preços simulados são atualizados automaticamente a cada 1 hora. Isso simula o comportamento de pregões reais, sem causar variações visuais incômodas durante a navegação.",
  },
  {
    q: "Onde encontro conteúdo educacional?",
    a: "Acesse a aba Biblioteca para vídeos, artigos e cursos sobre investimentos, organizados por nível (iniciante a avançado) e tema.",
  },
  {
    q: "Posso recomeçar a simulação?",
    a: "Sim. Tanto no botão 'Reiniciar simulação' do topo quanto na aba Configurações há a opção para zerar a carteira e configurar tudo novamente.",
  },
  {
    q: "Meus dados ficam salvos?",
    a: "Por enquanto, sim — no localStorage do seu navegador. Se você limpar os dados do navegador, sua carteira será zerada. Em versões futuras, os dados serão persistidos em PostgreSQL via backend.",
  },
];

export default function AjudaPage() {
  const [busca, setBusca] = useState("");

  const faqsFiltrados = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(busca.toLowerCase()) ||
      f.a.toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <div className="space-y-6 stagger max-w-4xl">
      {/* Busca */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-base font-semibold mb-1">Como podemos te ajudar?</h3>
        <p className="text-xs text-ink-muted mb-4">
          Busque por uma dúvida ou termo
        </p>
        <div className="relative">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-dim"
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Ex: como comprar, preço médio, reiniciar..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-navy-800 border border-rule rounded-md pl-10 pr-3 py-2.5 text-sm placeholder:text-ink-dim focus:border-brand focus:outline-none"
          />
        </div>
      </div>

      {/* Atalhos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link href="/biblioteca">
          <CardAtalho
            titulo="Biblioteca"
            desc="Vídeos, artigos e cursos"
            icone={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          />
        </Link>
        <CardAtalho
          titulo="Tutorial"
          desc="Primeiros passos"
          icone={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M5 4a2 2 0 012-2h10a2 2 0 012 2v16l-7-3-7 3V4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          }
        />
        <CardAtalho
          titulo="Contato"
          desc="Falar com suporte"
          icone={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
        <CardAtalho
          titulo="Status"
          desc="Saúde do sistema"
          icone={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
      </div>

      {/* FAQ */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-base font-semibold mb-1">Perguntas Frequentes</h3>
        <p className="text-xs text-ink-muted mb-5">
          Dúvidas comuns sobre o uso da plataforma
        </p>
        {faqsFiltrados.length === 0 ? (
          <div className="text-sm text-ink-muted text-center py-8">
            Nenhuma pergunta para &ldquo;{busca}&rdquo;.
          </div>
        ) : (
          <div className="space-y-3">
            {faqsFiltrados.map((f, i) => (
              <FaqItem key={i} pergunta={f.q} resposta={f.a} />
            ))}
          </div>
        )}
      </div>

      <div className="glass-card rounded-xl p-5 text-center">
        <p className="text-sm text-ink-muted">
          Para aprender conceitos financeiros, visite a{" "}
          <Link href="/biblioteca" className="text-brand hover:underline">
            Biblioteca
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

function CardAtalho({
  titulo,
  desc,
  icone,
}: {
  titulo: string;
  desc: string;
  icone: React.ReactNode;
}) {
  return (
    <div className="glass-card rounded-xl p-4 text-left hover:border-brand transition-colors cursor-pointer h-full">
      <div className="w-10 h-10 rounded-md bg-brand/15 text-brand flex items-center justify-center mb-3">
        {icone}
      </div>
      <div className="text-sm font-semibold">{titulo}</div>
      <p className="text-xs text-ink-muted mt-0.5">{desc}</p>
    </div>
  );
}

function FaqItem({
  pergunta,
  resposta,
}: {
  pergunta: string;
  resposta: string;
}) {
  const [aberto, setAberto] = useState(false);
  return (
    <div className="border border-rule rounded-md overflow-hidden">
      <button
        onClick={() => setAberto(!aberto)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-navy-800/30 transition-colors"
      >
        <span className="text-sm font-medium">{pergunta}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          className={classNames(
            "text-ink-muted transition-transform shrink-0 ml-3",
            aberto && "rotate-180",
          )}
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {aberto && (
        <div className="px-4 pb-4 pt-1 text-xs text-ink-muted leading-relaxed bg-navy-800/20">
          {resposta}
        </div>
      )}
    </div>
  );
}
