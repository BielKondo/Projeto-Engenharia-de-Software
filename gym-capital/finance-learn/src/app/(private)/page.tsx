"use client";

import { useState } from "react";
import { PortfolioSummary } from "@/components/common/PortfolioSummary";
import { AssetAnalysis } from "@/components/common/AssetAnalysis";
import { MarketFavorites } from "@/components/common/MarketFavorites";
import { ActivitiesTrends } from "@/components/common/ActivitiesTrends";
import { PatrimonioWaterfall } from "@/components/common/PatrimonioWaterfall";

export default function DashboardPage() {
  const [tickerAtivo, setTickerAtivo] = useState("PETR4");

  return (
    <div className="space-y-6 stagger">
      <PortfolioSummary />

      <PatrimonioWaterfall />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-6">
        <AssetAnalysis ticker={tickerAtivo} />
        <MarketFavorites
          selecionado={tickerAtivo}
          onSelecionar={setTickerAtivo}
        />
      </div>

      <ActivitiesTrends onNegociar={setTickerAtivo} />
    </div>
  );
}
