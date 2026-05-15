"use client";

import { useMemo, useState } from "react";
import { usePortfolio } from "@/contexts/PortfolioContext";
import {
  formatBRL,
  formatDateTime,
  classNames,
} from "@/lib/formatters";
import { MetasSection } from "@/components/MetasSection";
import { AlertsList } from "@/components/AlertsList";

type FiltroTipo = "todos" | "compra" | "venda";

export default function RelatoriosPage() {
  const { estado, ativos } = usePortfolio();
  const [filtro, setFiltro] = useState<FiltroTipo>("todos");
  const [busca, setBusca] = useState("");

  const transacoes = useMemo(() => {
    let lista = estado.transacoes;
    if (filtro !== "todos") lista = lista.filter((t) => t.tipo === filtro);
    if (busca.trim()) {
      const q = busca.toLowerCase();
      lista = lista.filter((t) => t.ticker.toLowerCase().includes(q));
    }
    return lista;
  }, [estado.transacoes, filtro, busca]);

  // Estatísticas
  const stats = useMemo(() => {
    const compras = estado.transacoes.filter((t) => t.tipo === "compra");
    const vendas = estado.transacoes.filter((t) => t.tipo === "venda");
    return {
      totalOperacoes: estado.transacoes.length,
      qtdCompras: compras.length,
      qtdVendas: vendas.length,
      volumeCompra: compras.reduce((s, t) => s + t.total, 0),
      volumeVenda: vendas.reduce((s, t) => s + t.total, 0),
    };
  }, [estado.transacoes]);

  return (
    <div className="space-y-6 stagger">
      {/* Metas Financeiras */}
      <MetasSection />

      {/* Alertas de Preço */}
      <AlertsList />

      {/* Estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total de Operações" valor={String(stats.totalOperacoes)} />
        <StatCard
          label="Compras"
          valor={String(stats.qtdCompras)}
          accent="brand"
        />
        <StatCard
          label="Vendas"
          valor={String(stats.qtdVendas)}
          accent="sell"
        />
        <StatCard
          label="Volume Comprado"
          valor={formatBRL(stats.volumeCompra)}
          accent="brand"
        />
        <StatCard
          label="Volume Vendido"
          valor={formatBRL(stats.volumeVenda)}
          accent="sell"
        />
      </div>

      {/* Filtros */}
      <div className="glass-card rounded-xl p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="flex gap-1.5">
          {(["todos", "compra", "venda"] as FiltroTipo[]).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={classNames(
                "px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors",
                filtro === f
                  ? "bg-brand text-white"
                  : "bg-navy-800 text-ink-muted hover:text-ink border border-rule",
              )}
            >
              {f === "todos" ? "Todos" : f === "compra" ? "Compras" : "Vendas"}
            </button>
          ))}
        </div>

        <div className="flex-1 md:ml-auto md:max-w-xs relative">
          <input
            type="text"
            placeholder="Buscar por ticker..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-navy-800 border border-rule rounded-md px-3 py-2 text-sm placeholder:text-ink-dim focus:border-brand focus:outline-none"
          />
        </div>
      </div>

      {/* Tabela */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-rule">
          <h3 className="text-base font-semibold">Histórico de Transações</h3>
          <p className="text-xs text-ink-muted mt-0.5">
            {transacoes.length}{" "}
            {transacoes.length === 1 ? "operação" : "operações"}
          </p>
        </div>

        {transacoes.length === 0 ? (
          <div className="p-10 text-center text-sm text-ink-muted">
            {estado.transacoes.length === 0
              ? "Você ainda não realizou nenhuma operação."
              : "Nenhuma transação encontrada com esses filtros."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-ink-muted uppercase tracking-wider border-b border-rule">
                  <th className="text-left px-5 py-3 font-medium">Data</th>
                  <th className="text-left px-3 py-3 font-medium">Tipo</th>
                  <th className="text-left px-3 py-3 font-medium">Ativo</th>
                  <th className="text-right px-3 py-3 font-medium">
                    Quantidade
                  </th>
                  <th className="text-right px-3 py-3 font-medium">Preço</th>
                  <th className="text-right px-5 py-3 font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule-soft">
                {transacoes.map((t) => {
                  const ativo = ativos.find((a) => a.ticker === t.ticker);
                  const ehCompra = t.tipo === "compra";
                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-navy-800/30 transition-colors"
                    >
                      <td className="px-5 py-3 text-xs text-ink-muted whitespace-nowrap">
                        {formatDateTime(t.data)}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={classNames(
                            "text-[10px] px-2 py-1 rounded font-medium uppercase tracking-wider",
                            ehCompra
                              ? "bg-buy/15 text-buy"
                              : "bg-sell/15 text-sell",
                          )}
                        >
                          {t.tipo}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-semibold">{t.ticker}</div>
                        {ativo && (
                          <div className="text-xs text-ink-muted">
                            {ativo.nome}
                          </div>
                        )}
                      </td>
                      <td className="text-right px-3 py-3 num">
                        {t.quantidade}
                      </td>
                      <td className="text-right px-3 py-3 num text-ink-muted">
                        {formatBRL(t.preco)}
                      </td>
                      <td className="text-right px-5 py-3 num font-semibold">
                        {ehCompra ? "−" : "+"}
                        {formatBRL(t.total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  valor,
  accent,
}: {
  label: string;
  valor: string;
  accent?: "brand" | "sell";
}) {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="text-xs text-ink-muted uppercase tracking-wider mb-1.5">
        {label}
      </div>
      <div
        className={classNames(
          "text-xl font-bold num",
          accent === "brand" && "text-brand",
          accent === "sell" && "text-sell",
          !accent && "text-ink",
        )}
      >
        {valor}
      </div>
    </div>
  );
}
