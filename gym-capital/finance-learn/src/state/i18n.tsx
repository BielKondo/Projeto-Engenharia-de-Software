/**
 * ESTADO DE INTERNACIONALIZAÇÃO (I18N)
 * ============================================================
 * Gerencia o idioma da interface e a moeda padrão escolhida pelo usuário.
 *
 * Quando o usuário muda essas preferências:
 *   - Os textos do app trocam de idioma instantaneamente (via t())
 *   - Os valores monetários trocam de símbolo (R$/$/€)
 *   - As datas usam o formato local do idioma
 *
 * Use assim em qualquer componente:
 *
 *   const { idioma, moeda, t, formatarMoeda } = useI18n();
 *   t("nav.dashboard")             // "Dashboard" / "Dashboard" / "Panel"
 *   formatarMoeda(1234.5)          // "R$ 1.234,50" / "$1,234.50" / "1.234,50 €"
 */
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useAuth } from "@/state/auth";
import {
  DICIONARIO,
  aplicarVariaveis,
  type ChaveTraducao,
} from "@/data/translations";
import type { Idioma, Moeda } from "@/types";

interface I18nContextValue {
  idioma: Idioma;
  moeda: Moeda;
  /** Tradução de uma chave (com variáveis opcionais) */
  t: (chave: ChaveTraducao, vars?: Record<string, string | number>) => string;
  /** Formata um número como moeda no formato escolhido */
  formatarMoeda: (valor: number) => string;
  /** Formata uma data ISO no formato local */
  formatarData: (iso: string) => string;
  /** Formata data + hora no formato local */
  formatarDataHora: (iso: string) => string;
  /** Formata número com separadores locais */
  formatarNumero: (valor: number, casas?: number) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

/** Configurações de cada locale (relacionadas ao idioma) */
const LOCALES: Record<Idioma, string> = {
  "pt-BR": "pt-BR",
  "en-US": "en-US",
  "es-ES": "es-ES",
};

/** Símbolos e configurações de cada moeda */
const MOEDAS_INFO: Record<Moeda, { code: string; locale: string }> = {
  BRL: { code: "BRL", locale: "pt-BR" },
  USD: { code: "USD", locale: "en-US" },
  EUR: { code: "EUR", locale: "es-ES" },
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();

  // Idioma e moeda vêm do usuário, com fallback para pt-BR/BRL
  const idioma: Idioma = (usuario?.idioma as Idioma | undefined) ?? "pt-BR";
  const moeda: Moeda = (usuario?.moeda as Moeda | undefined) ?? "BRL";

  const t = useCallback(
    (chave: ChaveTraducao, vars?: Record<string, string | number>) => {
      const dicAtual = DICIONARIO[idioma];
      const dicPadrao = DICIONARIO["pt-BR"];
      const texto = dicAtual[chave] ?? dicPadrao[chave] ?? chave;
      return aplicarVariaveis(texto, vars);
    },
    [idioma],
  );

  const formatarMoeda = useCallback(
    (valor: number) => {
      const info = MOEDAS_INFO[moeda];
      return valor.toLocaleString(info.locale, {
        style: "currency",
        currency: info.code,
        minimumFractionDigits: 2,
      });
    },
    [moeda],
  );

  const formatarData = useCallback(
    (iso: string) => {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return "—";
      return d.toLocaleDateString(LOCALES[idioma]);
    },
    [idioma],
  );

  const formatarDataHora = useCallback(
    (iso: string) => {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return "—";
      return d.toLocaleString(LOCALES[idioma], {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    [idioma],
  );

  const formatarNumero = useCallback(
    (valor: number, casas = 2) => {
      return valor.toLocaleString(LOCALES[idioma], {
        minimumFractionDigits: casas,
        maximumFractionDigits: casas,
      });
    },
    [idioma],
  );

  const value = useMemo(
    () => ({ idioma, moeda, t, formatarMoeda, formatarData, formatarDataHora, formatarNumero }),
    [idioma, moeda, t, formatarMoeda, formatarData, formatarDataHora, formatarNumero],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n precisa estar dentro de I18nProvider");
  return ctx;
}
