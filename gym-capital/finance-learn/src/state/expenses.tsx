/**
 * ESTADO DO CONTROLE DE GASTOS
 * ============================================================
 * Gerencia os gastos registrados pelo usuário em /gastos.
 *
 * Inclui:
 *   - Lista de gastos (com tipo: único ou recorrente)
 *   - Salário e outras rendas
 *   - Função para calcular total de gastos de um mês específico
 *     (considera gastos recorrentes que vão se repetindo)
 *
 * Persistido no localStorage (gym-capital:gastos:v1).
 */
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { ControleGastosState, Gasto } from "../types";

const STORAGE_KEY = "gym-capital:gastos:v1";

/**
 * Verifica se um gasto deve contar para um mês específico.
 *
 * REGRA:
 * - Gastos ÚNICOS: contam apenas no mês da data informada (data específica do gasto).
 * - Gastos RECORRENTES MENSAIS: contam em todos os meses a partir do MENOR
 *   entre o mês da data e o mês de criação. Isso significa que se o usuário
 *   cadastrou hoje (maio) um aluguel com vencimento 01/06, ele já aparece
 *   contabilizado em maio — porque é um gasto fixo do orçamento dele a partir
 *   de quando ele cadastrou.
 * - Gastos RECORRENTES ANUAIS: contam no mesmo mês do calendário em todos os
 *   anos a partir do MENOR entre data e criação.
 *
 * O mês de "criação" é inferido pelo ID do gasto, que usa timestamp UUID;
 * como fallback, usamos a própria data do gasto.
 */
export function gastoOcorreNoMes(g: Gasto, mesISO: string): boolean {
  // Gastos únicos: só no mês exato
  if (g.tipo !== "recorrente") {
    return g.data.startsWith(mesISO);
  }

  // Recorrente: o "mês de início" é o menor entre data e criação
  const mesCriacao = inferirMesCriacao(g);
  const mesData = g.data.slice(0, 7); // YYYY-MM
  const mesInicio = mesData < mesCriacao ? mesData : mesCriacao;

  // Não começou ainda
  if (mesInicio > mesISO) return false;

  if (g.recorrencia === "mensal") return true;
  if (g.recorrencia === "anual") {
    // Mesmo mês do calendário (compara apenas o MM)
    return mesData.slice(5, 7) === mesISO.slice(5, 7);
  }
  return false;
}

/**
 * Tenta inferir o mês em que o gasto foi cadastrado.
 *
 * Prioriza o campo `criadoEm` (presente em gastos novos). Para gastos antigos
 * salvos antes da introdução desse campo, cai de volta para a `data` do gasto,
 * mantendo compatibilidade.
 */
function inferirMesCriacao(g: Gasto): string {
  if (g.criadoEm) return g.criadoEm.slice(0, 7);
  return g.data.slice(0, 7); // YYYY-MM (fallback)
}

const estadoInicial: ControleGastosState = {
  gastos: [],
  salario: 0,
  outrasRendas: 0,
};

interface GastosContextValue {
  estado: ControleGastosState;
  adicionarGasto: (g: Omit<Gasto, "id">) => void;
  editarGasto: (id: string, g: Partial<Gasto>) => void;
  removerGasto: (id: string) => void;
  definirSalario: (valor: number) => void;
  definirOutrasRendas: (valor: number) => void;
  resetar: () => void;
  hidratado: boolean;
  // Computed
  totalRenda: number;
  totalGastosMes: (mesISO: string) => number;
}

const GastosContext = createContext<GastosContextValue | null>(null);

function novoId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : String(Date.now() + Math.random());
}

export function GastosProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<ControleGastosState>(estadoInicial);
  const [hidratado, setHidratado] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setEstado(JSON.parse(raw));
    } catch {}
    setHidratado(true);
  }, []);

  useEffect(() => {
    if (!hidratado) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
    } catch {}
  }, [estado, hidratado]);

  const adicionarGasto = useCallback((g: Omit<Gasto, "id">) => {
    const novo: Gasto = {
      ...g,
      id: novoId(),
      // Marca o momento real do cadastro (usado para recorrentes começarem
      // a contar a partir do mês certo, mesmo se o usuário informar uma
      // data de vencimento futura)
      criadoEm: g.criadoEm ?? new Date().toISOString(),
    };
    setEstado((prev) => ({
      ...prev,
      gastos: [novo, ...prev.gastos].sort(
        (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime(),
      ),
    }));
  }, []);

  const editarGasto = useCallback((id: string, dados: Partial<Gasto>) => {
    setEstado((prev) => ({
      ...prev,
      gastos: prev.gastos.map((g) => (g.id === id ? { ...g, ...dados } : g)),
    }));
  }, []);

  const removerGasto = useCallback((id: string) => {
    setEstado((prev) => ({
      ...prev,
      gastos: prev.gastos.filter((g) => g.id !== id),
    }));
  }, []);

  const definirSalario = useCallback((valor: number) => {
    setEstado((prev) => ({ ...prev, salario: Math.max(0, valor) }));
  }, []);

  const definirOutrasRendas = useCallback((valor: number) => {
    setEstado((prev) => ({ ...prev, outrasRendas: Math.max(0, valor) }));
  }, []);

  const resetar = useCallback(() => {
    setEstado(estadoInicial);
  }, []);

  const totalRenda = estado.salario + estado.outrasRendas;

  const totalGastosMes = useCallback(
    (mesISO: string) => {
      // mesISO formato YYYY-MM. Considera recorrentes.
      return estado.gastos.reduce(
        (acc, g) => (gastoOcorreNoMes(g, mesISO) ? acc + g.valor : acc),
        0,
      );
    },
    [estado.gastos],
  );

  return (
    <GastosContext.Provider
      value={{
        estado,
        adicionarGasto,
        editarGasto,
        removerGasto,
        definirSalario,
        definirOutrasRendas,
        resetar,
        hidratado,
        totalRenda,
        totalGastosMes,
      }}
    >
      {children}
    </GastosContext.Provider>
  );
}

export function useGastos() {
  const ctx = useContext(GastosContext);
  if (!ctx) throw new Error("useGastos precisa estar dentro de GastosProvider");
  return ctx;
}
