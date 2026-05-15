"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { ControleGastosState, Gasto } from "@/lib/types";

const STORAGE_KEY = "gym-capital:gastos:v1";

/**
 * Verifica se um gasto deve contar para um mês específico, considerando:
 * - Gastos únicos: apenas no mês da criação
 * - Gastos recorrentes mensais: em todos os meses a partir da criação
 * - Gastos recorrentes anuais: no mesmo mês do calendário a partir da criação
 */
export function gastoOcorreNoMes(g: Gasto, mesISO: string): boolean {
  if (g.data.startsWith(mesISO)) return true;
  if (g.tipo !== "recorrente") return false;

  const mesCriacao = g.data.slice(0, 7); // YYYY-MM
  if (mesCriacao > mesISO) return false; // criação no futuro

  if (g.recorrencia === "mensal") return true;
  if (g.recorrencia === "anual") {
    return mesCriacao.slice(5, 7) === mesISO.slice(5, 7);
  }
  return false;
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
    const novo: Gasto = { ...g, id: novoId() };
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
