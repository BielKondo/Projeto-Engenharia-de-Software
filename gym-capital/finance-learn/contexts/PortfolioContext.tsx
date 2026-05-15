"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type {
  Alert,
  Asset,
  Meta,
  PortfolioState,
  Position,
  Transaction,
} from "@/lib/types";
import { mockAssets } from "@/lib/mockAssets";
import { useNotifications } from "./NotificationsContext";

const STORAGE_KEY = "gym-capital:portfolio:v3";

// Atualização de preços a cada 10 minutos
const INTERVALO_ATUALIZACAO_MS = 10 * 60 * 1000;

interface PortfolioContextValue {
  estado: PortfolioState;
  ativos: Asset[];
  comprar: (ticker: string, quantidade: number) => { ok: boolean; erro?: string };
  vender: (ticker: string, quantidade: number) => { ok: boolean; erro?: string };
  configurarSaldoInicial: (valor: number) => { ok: boolean; erro?: string };
  resetar: () => void;
  // Alertas
  criarAlerta: (
    ticker: string,
    precoAlvo: number,
    direcao: "acima" | "abaixo",
  ) => { ok: boolean; erro?: string };
  removerAlerta: (id: string) => void;
  // Metas
  criarMeta: (meta: Omit<Meta, "id" | "criadaEm">) => void;
  atualizarMeta: (id: string, dados: Partial<Meta>) => void;
  removerMeta: (id: string) => void;
  // Computed
  patrimonioTotal: number;
  valorInvestido: number;
  rendimentoTotal: number;
  rendimentoPercentual: number;
  precoAtual: (ticker: string) => number;
  variacaoDia: (ticker: string) => number;
  posicaoDe: (ticker: string) => Position | undefined;
  hidratado: boolean;
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

function gerarHistoricoInicial(saldo: number) {
  if (saldo <= 0) return [];
  const hoje = new Date();
  const lista: { data: string; patrimonio: number }[] = [];
  for (let i = 60; i >= 0; i--) {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() - i);
    const drift = (60 - i) / 60;
    const ruido = (Math.sin(i * 0.6) + Math.cos(i * 0.3)) * 0.008;
    lista.push({
      data: d.toISOString().slice(0, 10),
      patrimonio: saldo * (0.92 + drift * 0.085 + ruido),
    });
  }
  lista[lista.length - 1].patrimonio = saldo;
  return lista;
}

const estadoInicial: PortfolioState = {
  caixa: 0,
  posicoes: [],
  transacoes: [],
  saldoInicial: 0,
  historico: [],
  configurado: false,
  alertas: [],
  metas: [],
};

function novoId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : String(Date.now() + Math.random());
}

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<PortfolioState>(estadoInicial);
  const [ativos, setAtivos] = useState<Asset[]>(mockAssets);
  const [hidratado, setHidratado] = useState(false);
  const { adicionar: adicionarNotif } = useNotifications();
  // Snapshot dos preços anteriores para detectar cruzamentos de alerta
  const precosAnterioresRef = useRef<Record<string, number>>({});

  // Carrega do localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PortfolioState;
        setEstado({
          caixa: parsed.caixa ?? 0,
          posicoes: parsed.posicoes ?? [],
          transacoes: parsed.transacoes ?? [],
          saldoInicial: parsed.saldoInicial ?? 0,
          historico: parsed.historico ?? [],
          configurado: parsed.configurado ?? false,
          alertas: parsed.alertas ?? [],
          metas: parsed.metas ?? [],
        });
      }
    } catch {
      // ignore
    }
    setHidratado(true);
  }, []);

  // Persiste mudanças
  useEffect(() => {
    if (!hidratado) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
    } catch {
      // ignore
    }
  }, [estado, hidratado]);

  // Inicializa snapshot de preços
  useEffect(() => {
    ativos.forEach((a) => {
      if (precosAnterioresRef.current[a.ticker] === undefined) {
        precosAnterioresRef.current[a.ticker] = a.preco;
      }
    });
  }, [ativos]);

  // Atualização periódica de preços
  useEffect(() => {
    const atualizar = () => {
      setAtivos((prev) =>
        prev.map((a) => {
          const amplitude =
            a.categoria === "tesouro"
              ? 0.003
              : a.categoria === "cripto"
                ? 0.04
                : 0.015;
          const fator = 1 + (Math.random() - 0.5) * 2 * amplitude;
          const novoPreco = Math.max(0.01, a.preco * fator);
          const novaVariacaoAbs = a.variacaoAbs + (novoPreco - a.preco);
          const precoBase = a.preco - a.variacaoAbs;
          const novaVariacao =
            precoBase > 0
              ? ((novoPreco - precoBase) / precoBase) * 100
              : a.variacaoDia;

          const novoHistorico = [...a.historico];
          const lastIdx = novoHistorico.length - 1;
          if (lastIdx >= 0) {
            const last = { ...novoHistorico[lastIdx] };
            last.fechamento = novoPreco;
            last.maxima = Math.max(last.maxima, novoPreco);
            last.minima = Math.min(last.minima, novoPreco);
            novoHistorico[lastIdx] = last;
          }

          return {
            ...a,
            preco: novoPreco,
            variacaoAbs: novaVariacaoAbs,
            variacaoDia: novaVariacao,
            maxima: Math.max(a.maxima, novoPreco),
            minima: Math.min(a.minima, novoPreco),
            historico: novoHistorico,
          };
        }),
      );
    };

    const intervalo = setInterval(atualizar, INTERVALO_ATUALIZACAO_MS);
    return () => clearInterval(intervalo);
  }, []);

  // Verifica alertas a cada mudança de preço
  useEffect(() => {
    if (!hidratado) return;
    if (estado.alertas.length === 0) return;

    const novos: Alert[] = [];
    const idsAtingidos: string[] = [];

    estado.alertas.forEach((alerta) => {
      if (alerta.atingido) {
        novos.push(alerta);
        return;
      }
      const ativo = ativos.find((a) => a.ticker === alerta.ticker);
      if (!ativo) {
        novos.push(alerta);
        return;
      }
      const precoAtual = ativo.preco;
      const precoAnterior =
        precosAnterioresRef.current[alerta.ticker] ?? precoAtual;

      let cruzou = false;
      if (alerta.direcao === "acima") {
        cruzou =
          precoAnterior < alerta.precoAlvo && precoAtual >= alerta.precoAlvo;
      } else {
        cruzou =
          precoAnterior > alerta.precoAlvo && precoAtual <= alerta.precoAlvo;
      }

      if (cruzou) {
        idsAtingidos.push(alerta.id);
        novos.push({
          ...alerta,
          atingido: true,
          atingidoEm: new Date().toISOString(),
        });
        // Gera notificação
        adicionarNotif({
          tipo: "alerta",
          titulo: `Alerta de preço: ${alerta.ticker}`,
          texto: `${alerta.ticker} ${
            alerta.direcao === "acima" ? "atingiu" : "caiu para"
          } R$ ${alerta.precoAlvo
            .toLocaleString("pt-BR", { minimumFractionDigits: 2 })} (atual: R$ ${precoAtual.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}).`,
        });
      } else {
        novos.push(alerta);
      }
    });

    if (idsAtingidos.length > 0) {
      setEstado((prev) => ({ ...prev, alertas: novos }));
    }

    // Atualiza snapshot
    ativos.forEach((a) => {
      precosAnterioresRef.current[a.ticker] = a.preco;
    });
  }, [ativos, estado.alertas, hidratado, adicionarNotif]);

  const precoAtual = useCallback(
    (ticker: string) => ativos.find((a) => a.ticker === ticker)?.preco ?? 0,
    [ativos],
  );

  const variacaoDia = useCallback(
    (ticker: string) => ativos.find((a) => a.ticker === ticker)?.variacaoDia ?? 0,
    [ativos],
  );

  const posicaoDe = useCallback(
    (ticker: string) => estado.posicoes.find((p) => p.ticker === ticker),
    [estado.posicoes],
  );

  // Após uma compra/venda, simula uma execução de mercado aplicando
  // uma pequena variação no preço do ativo (~±0.6%). Isso garante que
  // o L/P imediato saia do zero e o usuário veja a posição "viva".
  const aplicarPequenaVariacao = useCallback((ticker: string) => {
    setAtivos((prev) =>
      prev.map((a) => {
        if (a.ticker !== ticker) return a;
        const amplitude =
          a.categoria === "tesouro"
            ? 0.001
            : a.categoria === "cripto"
              ? 0.012
              : 0.006;
        const fator = 1 + (Math.random() - 0.5) * 2 * amplitude;
        const novoPreco = Math.max(0.01, a.preco * fator);
        const novaVariacaoAbs = a.variacaoAbs + (novoPreco - a.preco);
        const precoBase = a.preco - a.variacaoAbs;
        const novaVariacao =
          precoBase > 0
            ? ((novoPreco - precoBase) / precoBase) * 100
            : a.variacaoDia;
        const novoHistorico = [...a.historico];
        const lastIdx = novoHistorico.length - 1;
        if (lastIdx >= 0) {
          const last = { ...novoHistorico[lastIdx] };
          last.fechamento = novoPreco;
          last.maxima = Math.max(last.maxima, novoPreco);
          last.minima = Math.min(last.minima, novoPreco);
          novoHistorico[lastIdx] = last;
        }
        return {
          ...a,
          preco: novoPreco,
          variacaoAbs: novaVariacaoAbs,
          variacaoDia: novaVariacao,
          maxima: Math.max(a.maxima, novoPreco),
          minima: Math.min(a.minima, novoPreco),
          historico: novoHistorico,
        };
      }),
    );
  }, []);

  const configurarSaldoInicial = useCallback((valor: number) => {
    if (valor <= 0) return { ok: false, erro: "Valor deve ser maior que zero" };
    if (valor > 1_000_000_000)
      return { ok: false, erro: "Valor muito alto (máximo R$ 1 bilhão)" };

    setEstado(() => ({
      caixa: valor,
      posicoes: [],
      transacoes: [],
      saldoInicial: valor,
      historico: gerarHistoricoInicial(valor),
      configurado: true,
      alertas: [],
      metas: [],
    }));
    return { ok: true };
  }, []);

  const comprar = useCallback(
    (ticker: string, quantidade: number) => {
      if (!estado.configurado)
        return { ok: false, erro: "Configure seu saldo inicial primeiro" };
      if (quantidade <= 0) return { ok: false, erro: "Quantidade inválida" };
      const ativo = ativos.find((a) => a.ticker === ticker);
      if (!ativo) return { ok: false, erro: "Ativo não encontrado" };
      const custo = ativo.preco * quantidade;
      if (custo > estado.caixa)
        return { ok: false, erro: "Saldo insuficiente" };

      setEstado((prev) => {
        const existente = prev.posicoes.find((p) => p.ticker === ticker);
        let novasPosicoes: Position[];
        if (existente) {
          const qtdTotal = existente.quantidade + quantidade;
          const novoPM =
            (existente.precoMedio * existente.quantidade +
              ativo.preco * quantidade) /
            qtdTotal;
          novasPosicoes = prev.posicoes.map((p) =>
            p.ticker === ticker
              ? { ...p, quantidade: qtdTotal, precoMedio: novoPM }
              : p,
          );
        } else {
          novasPosicoes = [
            ...prev.posicoes,
            { ticker, quantidade, precoMedio: ativo.preco },
          ];
        }
        const tx: Transaction = {
          id: novoId(),
          tipo: "compra",
          ticker,
          quantidade,
          preco: ativo.preco,
          total: custo,
          data: new Date().toISOString(),
        };
        return {
          ...prev,
          caixa: prev.caixa - custo,
          posicoes: novasPosicoes,
          transacoes: [tx, ...prev.transacoes],
        };
      });
      // Simula movimentação de mercado imediata após a execução
      setTimeout(() => aplicarPequenaVariacao(ticker), 50);
      return { ok: true };
    },
    [ativos, estado.caixa, estado.configurado, aplicarPequenaVariacao],
  );

  const vender = useCallback(
    (ticker: string, quantidade: number) => {
      if (!estado.configurado)
        return { ok: false, erro: "Configure seu saldo inicial primeiro" };
      if (quantidade <= 0) return { ok: false, erro: "Quantidade inválida" };
      const ativo = ativos.find((a) => a.ticker === ticker);
      if (!ativo) return { ok: false, erro: "Ativo não encontrado" };
      const pos = estado.posicoes.find((p) => p.ticker === ticker);
      if (!pos || pos.quantidade < quantidade)
        return { ok: false, erro: "Quantidade insuficiente em carteira" };

      const receita = ativo.preco * quantidade;

      setEstado((prev) => {
        const qtdRestante = pos.quantidade - quantidade;
        const novasPosicoes =
          qtdRestante === 0
            ? prev.posicoes.filter((p) => p.ticker !== ticker)
            : prev.posicoes.map((p) =>
                p.ticker === ticker ? { ...p, quantidade: qtdRestante } : p,
              );
        const tx: Transaction = {
          id: novoId(),
          tipo: "venda",
          ticker,
          quantidade,
          preco: ativo.preco,
          total: receita,
          data: new Date().toISOString(),
        };
        return {
          ...prev,
          caixa: prev.caixa + receita,
          posicoes: novasPosicoes,
          transacoes: [tx, ...prev.transacoes],
        };
      });
      setTimeout(() => aplicarPequenaVariacao(ticker), 50);
      return { ok: true };
    },
    [ativos, estado.posicoes, estado.configurado, aplicarPequenaVariacao],
  );

  const criarAlerta = useCallback(
    (
      ticker: string,
      precoAlvo: number,
      direcao: "acima" | "abaixo",
    ): { ok: boolean; erro?: string } => {
      if (precoAlvo <= 0) return { ok: false, erro: "Preço inválido" };
      const ativo = ativos.find((a) => a.ticker === ticker);
      if (!ativo) return { ok: false, erro: "Ativo não encontrado" };

      const novo: Alert = {
        id: novoId(),
        ticker,
        precoAlvo,
        direcao,
        criadoEm: new Date().toISOString(),
        atingido: false,
      };
      setEstado((prev) => ({ ...prev, alertas: [novo, ...prev.alertas] }));
      return { ok: true };
    },
    [ativos],
  );

  const removerAlerta = useCallback((id: string) => {
    setEstado((prev) => ({
      ...prev,
      alertas: prev.alertas.filter((a) => a.id !== id),
    }));
  }, []);

  const criarMeta = useCallback((meta: Omit<Meta, "id" | "criadaEm">) => {
    const nova: Meta = {
      ...meta,
      id: novoId(),
      criadaEm: new Date().toISOString(),
    };
    setEstado((prev) => ({ ...prev, metas: [nova, ...prev.metas] }));
  }, []);

  const atualizarMeta = useCallback((id: string, dados: Partial<Meta>) => {
    setEstado((prev) => ({
      ...prev,
      metas: prev.metas.map((m) => (m.id === id ? { ...m, ...dados } : m)),
    }));
  }, []);

  const removerMeta = useCallback((id: string) => {
    setEstado((prev) => ({
      ...prev,
      metas: prev.metas.filter((m) => m.id !== id),
    }));
  }, []);

  const resetar = useCallback(() => {
    setEstado(estadoInicial);
  }, []);

  const valorInvestido = estado.posicoes.reduce((acc, p) => {
    return acc + p.quantidade * precoAtual(p.ticker);
  }, 0);
  const patrimonioTotal = estado.caixa + valorInvestido;
  const rendimentoTotal = patrimonioTotal - estado.saldoInicial;
  const rendimentoPercentual =
    estado.saldoInicial > 0 ? (rendimentoTotal / estado.saldoInicial) * 100 : 0;

  return (
    <PortfolioContext.Provider
      value={{
        estado,
        ativos,
        comprar,
        vender,
        configurarSaldoInicial,
        resetar,
        criarAlerta,
        removerAlerta,
        criarMeta,
        atualizarMeta,
        removerMeta,
        patrimonioTotal,
        valorInvestido,
        rendimentoTotal,
        rendimentoPercentual,
        precoAtual,
        variacaoDia,
        posicaoDe,
        hidratado,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx)
    throw new Error("usePortfolio precisa estar dentro de PortfolioProvider");
  return ctx;
}
