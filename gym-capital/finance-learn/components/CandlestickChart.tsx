"use client";

import { useMemo, useRef, useState } from "react";
import type { Candle } from "@/lib/types";
import {
  formatBRLNoCurrency,
  formatPercent,
  formatVolume,
  formatDateShort,
  classNames,
} from "@/lib/formatters";
import { CandleDetailsModal } from "./CandleDetailsModal";

interface Props {
  candles: Candle[];
  ticker?: string;
  altura?: number;
  alturaVolume?: number;
}

interface DragState {
  startX: number;
  currentX: number;
  drag: boolean; // true após mover > THRESHOLD pixels
}

// Distância mínima em pixels (no espaço da viewBox) para distinguir click de drag
const ZOOM_DRAG_THRESHOLD = 12;

export function CandlestickChart({
  candles,
  ticker = "",
  altura = 320,
  alturaVolume = 80,
}: Props) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [clickedIdx, setClickedIdx] = useState<number | null>(null);
  const [zoomRange, setZoomRange] = useState<[number, number] | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Candles visíveis (filtrados pelo zoom se houver)
  const visiveis = useMemo(() => {
    if (!zoomRange) return candles;
    const [s, e] = zoomRange;
    return candles.slice(s, e + 1);
  }, [candles, zoomRange]);

  const dimensoes = useMemo(() => {
    if (visiveis.length === 0) return null;
    const precos = visiveis.flatMap((c) => [c.maxima, c.minima]);
    const minPreco = Math.min(...precos);
    const maxPreco = Math.max(...precos);
    const rangePreco = maxPreco - minPreco || 1;
    const padPreco = rangePreco * 0.08;
    const maxVolume = Math.max(...visiveis.map((c) => c.volume));
    return {
      minPreco: minPreco - padPreco,
      maxPreco: maxPreco + padPreco,
      maxVolume,
    };
  }, [visiveis]);

  // EMA 20 e SMA periódica (sobre candles visíveis)
  const indicadores = useMemo(() => {
    if (visiveis.length === 0) return { ema20: [], sma30: [] };

    const ema20: (number | null)[] = [];
    const k = 2 / (20 + 1);
    let prev: number | null = null;
    for (let i = 0; i < visiveis.length; i++) {
      if (i < 19) {
        ema20.push(null);
        continue;
      }
      if (prev === null) {
        const slice = visiveis.slice(0, 20);
        prev = slice.reduce((s, c) => s + c.fechamento, 0) / 20;
        ema20.push(prev);
      } else {
        prev = visiveis[i].fechamento * k + prev * (1 - k);
        ema20.push(prev);
      }
    }

    const periodo = Math.min(30, Math.max(5, Math.floor(visiveis.length * 0.4)));
    const sma: (number | null)[] = [];
    for (let i = 0; i < visiveis.length; i++) {
      if (i < periodo - 1) {
        sma.push(null);
        continue;
      }
      const slice = visiveis.slice(i - periodo + 1, i + 1);
      sma.push(slice.reduce((s, c) => s + c.fechamento, 0) / periodo);
    }

    return { ema20, sma30: sma };
  }, [visiveis]);

  if (!dimensoes || visiveis.length === 0) {
    return (
      <div className="text-ink-muted text-sm text-center py-8">
        Sem dados disponíveis
      </div>
    );
  }

  // Dimensões SVG (viewBox)
  const w = 800;
  const hChart = altura;
  const hVol = alturaVolume;
  const paddingRight = 56;
  const paddingLeft = 4;
  const innerW = w - paddingLeft - paddingRight;
  const stepX = innerW / visiveis.length;
  const candleWidth = Math.max(1.5, stepX * 0.65);

  const precoToY = (preco: number) => {
    const { minPreco, maxPreco } = dimensoes;
    return ((maxPreco - preco) / (maxPreco - minPreco)) * hChart;
  };

  const volToH = (vol: number) => (vol / dimensoes.maxVolume) * hVol;

  // Linhas de grade
  const gridLevels = 5;
  const gridPrices: { y: number; preco: number }[] = [];
  for (let i = 0; i <= gridLevels; i++) {
    const preco =
      dimensoes.minPreco + (i / gridLevels) * (dimensoes.maxPreco - dimensoes.minPreco);
    gridPrices.push({ y: precoToY(preco), preco });
  }

  // Ticks adaptativos no eixo X
  const espacoMinTickPx = 60;
  const intervaloTicks = Math.max(
    1,
    Math.ceil(visiveis.length / Math.floor((w - paddingRight) / espacoMinTickPx)),
  );
  const ticksX: { x: number; label: string; idx: number }[] = [];
  for (let i = 0; i < visiveis.length; i += intervaloTicks) {
    ticksX.push({
      x: paddingLeft + i * stepX + candleWidth / 2,
      label: formatDateShort(visiveis[i].data),
      idx: i,
    });
  }
  if (
    ticksX.length > 0 &&
    ticksX[ticksX.length - 1].idx !== visiveis.length - 1
  ) {
    ticksX.push({
      x: paddingLeft + (visiveis.length - 1) * stepX + candleWidth / 2,
      label: formatDateShort(visiveis[visiveis.length - 1].data),
      idx: visiveis.length - 1,
    });
  }

  const pathDe = (serie: (number | null)[]) => {
    let d = "";
    let comecou = false;
    serie.forEach((v, i) => {
      if (v === null) return;
      const x = paddingLeft + i * stepX + candleWidth / 2;
      const y = precoToY(v);
      d += `${!comecou ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)} `;
      comecou = true;
    });
    return d;
  };

  // Posição do mouse em coordenadas de viewBox
  const mouseToViewBoxX = (e: { clientX: number }): number => {
    const svg = svgRef.current;
    if (!svg) return 0;
    const rect = svg.getBoundingClientRect();
    return ((e.clientX - rect.left) / rect.width) * w;
  };

  const idxFromViewBoxX = (vbx: number): number => {
    const rel = vbx - paddingLeft;
    const idx = Math.floor(rel / stepX);
    return Math.max(0, Math.min(visiveis.length - 1, idx));
  };

  const handleMouseDown = (e: React.MouseEvent<SVGElement>) => {
    const x = mouseToViewBoxX(e);
    if (x < paddingLeft || x > paddingLeft + innerW) return;
    setDrag({ startX: x, currentX: x, drag: false });
    setClickedIdx(null);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGElement>) => {
    const x = mouseToViewBoxX(e);

    if (drag) {
      const distVB = Math.abs(x - drag.startX);
      // distância em pixels reais = distVB * (rectWidth / w)
      const isDrag = distVB > ZOOM_DRAG_THRESHOLD;
      setDrag({ ...drag, currentX: x, drag: drag.drag || isDrag });
      // Não mostra hover durante drag confirmado
      if (drag.drag || isDrag) {
        setHoverIdx(null);
        return;
      }
    }
    setHoverIdx(idxFromViewBoxX(x));
  };

  const handleMouseUp = (e: React.MouseEvent<SVGElement>) => {
    if (!drag) return;
    const x = mouseToViewBoxX(e);

    if (drag.drag) {
      // Aplica zoom
      const i1 = idxFromViewBoxX(drag.startX);
      const i2 = idxFromViewBoxX(x);
      const start = Math.min(i1, i2);
      const end = Math.max(i1, i2);
      // Se em modo já zoomado, ajusta para índices absolutos
      if (zoomRange) {
        const offset = zoomRange[0];
        setZoomRange([offset + start, offset + end]);
      } else {
        setZoomRange([start, end]);
      }
    } else {
      // Click puro → abre modal de detalhes
      // Em zoom, idxFromViewBoxX retorna índice no array visivel; preciso converter
      // para o índice absoluto no array original.
      const idxVisivel = idxFromViewBoxX(x);
      const idxAbsoluto = zoomRange
        ? zoomRange[0] + idxVisivel
        : idxVisivel;
      setClickedIdx(idxAbsoluto);
    }
    setDrag(null);
  };

  const handleMouseLeave = () => {
    setHoverIdx(null);
    setDrag(null);
  };

  const hoverCandle = hoverIdx !== null ? visiveis[hoverIdx] : null;
  const hoverCandleAnterior =
    hoverIdx !== null && hoverIdx > 0 ? visiveis[hoverIdx - 1] : null;
  const hoverX =
    hoverIdx !== null
      ? paddingLeft + hoverIdx * stepX + candleWidth / 2
      : null;

  // Tooltip flutuante (maior e mais detalhado)
  const TOOLTIP_W = 240;
  const TOOLTIP_H = 158;
  const tooltipPos = (() => {
    if (hoverIdx === null || hoverX === null) return null;
    let x = hoverX + 14;
    if (x + TOOLTIP_W > w - paddingRight) x = hoverX - 14 - TOOLTIP_W;
    let y = 8;
    return { x, y };
  })();

  // Retângulo de seleção de zoom
  const zoomSelection = drag && drag.drag
    ? {
        x: Math.min(drag.startX, drag.currentX),
        w: Math.abs(drag.currentX - drag.startX),
      }
    : null;

  return (
    <div className="w-full relative">
      {/* Barra de controles superior */}
      <div className="flex items-center justify-between mb-1 text-xs">
        <div className="text-ink-muted">
          {zoomRange ? (
            <span>
              Zoom: {visiveis.length} candles ·{" "}
              {formatDateShort(visiveis[0].data)} →{" "}
              {formatDateShort(visiveis[visiveis.length - 1].data)}
            </span>
          ) : (
            <span>{visiveis.length} candles</span>
          )}
        </div>
        {zoomRange && (
          <button
            onClick={() => setZoomRange(null)}
            className="text-xs px-2.5 py-1 bg-brand/15 text-brand hover:bg-brand/25 rounded transition-colors flex items-center gap-1.5"
            title="Resetar zoom"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 12a9 9 0 109-9M3 12V3m0 9h9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Resetar zoom
          </button>
        )}
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${w} ${hChart + hVol + 28}`}
        className="w-full h-auto select-none touch-none"
        preserveAspectRatio="none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: drag?.drag ? "ew-resize" : "crosshair" }}
      >
        {/* Grid horizontal */}
        {gridPrices.map((g, i) => (
          <g key={`grid-${i}`}>
            <line
              x1={paddingLeft}
              x2={paddingLeft + innerW}
              y1={g.y}
              y2={g.y}
              stroke="var(--grid)"
              strokeWidth="1"
              strokeDasharray="2 3"
            />
            <text
              x={w - paddingRight + 8}
              y={g.y + 4}
              fill="var(--text-dim)"
              fontSize="11"
              fontFamily="JetBrains Mono, monospace"
            >
              {formatBRLNoCurrency(g.preco, 2)}
            </text>
          </g>
        ))}

        {/* Linha vertical do tick em foco */}
        {hoverIdx !== null && hoverX !== null && !drag?.drag && (
          <line
            x1={hoverX}
            x2={hoverX}
            y1={0}
            y2={hChart + hVol + 8}
            stroke="var(--grid-strong)"
            strokeWidth="1"
            strokeDasharray="2 2"
            pointerEvents="none"
          />
        )}

        {/* Retângulo de seleção de zoom */}
        {zoomSelection && (
          <g pointerEvents="none">
            <rect
              x={zoomSelection.x}
              y={0}
              width={zoomSelection.w}
              height={hChart + hVol + 8}
              fill="#3B82F6"
              opacity="0.15"
            />
            <line
              x1={zoomSelection.x}
              x2={zoomSelection.x}
              y1={0}
              y2={hChart + hVol + 8}
              stroke="#3B82F6"
              strokeWidth="1.5"
            />
            <line
              x1={zoomSelection.x + zoomSelection.w}
              x2={zoomSelection.x + zoomSelection.w}
              y1={0}
              y2={hChart + hVol + 8}
              stroke="#3B82F6"
              strokeWidth="1.5"
            />
          </g>
        )}

        {/* Candles */}
        {visiveis.map((c, i) => {
          const x = paddingLeft + i * stepX;
          const xMid = x + candleWidth / 2;
          const yMax = precoToY(c.maxima);
          const yMin = precoToY(c.minima);
          const yOpen = precoToY(c.abertura);
          const yClose = precoToY(c.fechamento);
          const positivo = c.fechamento >= c.abertura;
          const cor = positivo ? "#10B981" : "#EF4444";
          const bodyTop = Math.min(yOpen, yClose);
          const bodyHeight = Math.max(1, Math.abs(yOpen - yClose));
          const ehHover = i === hoverIdx && !drag?.drag;
          const idxAbsoluto = zoomRange ? zoomRange[0] + i : i;
          const ehClicked = idxAbsoluto === clickedIdx;

          return (
            <g key={`candle-${i}`} pointerEvents="none">
              <line
                x1={xMid}
                x2={xMid}
                y1={yMax}
                y2={yMin}
                stroke={cor}
                strokeWidth="1"
                opacity={
                  hoverIdx !== null && !ehHover && !ehClicked ? 0.55 : 1
                }
              />
              <rect
                x={x}
                y={bodyTop}
                width={candleWidth}
                height={bodyHeight}
                fill={cor}
                rx="0.5"
                opacity={
                  hoverIdx !== null && !ehHover && !ehClicked ? 0.55 : 1
                }
                stroke={ehClicked ? "var(--text-primary)" : "none"}
                strokeWidth="1.5"
              />
            </g>
          );
        })}

        {/* EMA 20 */}
        <path
          d={pathDe(indicadores.ema20)}
          fill="none"
          stroke="#FBBF24"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.85"
          pointerEvents="none"
        />
        {/* SMA 30 */}
        <path
          d={pathDe(indicadores.sma30)}
          fill="none"
          stroke="#8B5CF6"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.85"
          pointerEvents="none"
        />

        {/* Tag de cotação flutuante na borda direita (último preço) */}
        {(() => {
          const ultimo = visiveis[visiveis.length - 1];
          const yUltimo = precoToY(ultimo.fechamento);
          const positivo = ultimo.fechamento >= ultimo.abertura;
          const cor = positivo ? "#10B981" : "#EF4444";
          return (
            <g pointerEvents="none">
              <line
                x1={paddingLeft}
                x2={w - paddingRight}
                y1={yUltimo}
                y2={yUltimo}
                stroke={cor}
                strokeWidth="0.7"
                strokeDasharray="2 4"
                opacity="0.5"
              />
              <rect
                x={w - paddingRight + 2}
                y={yUltimo - 9}
                width={paddingRight - 4}
                height="18"
                fill={cor}
                rx="2"
              />
              <text
                x={w - paddingRight / 2}
                y={yUltimo + 4}
                fill="white"
                fontSize="11"
                fontWeight="bold"
                fontFamily="JetBrains Mono, monospace"
                textAnchor="middle"
              >
                {formatBRLNoCurrency(ultimo.fechamento, 2)}
              </text>
            </g>
          );
        })()}

        {/* Separador entre chart e volume */}
        <line
          x1={paddingLeft}
          x2={paddingLeft + innerW}
          y1={hChart + 4}
          y2={hChart + 4}
          stroke="var(--grid)"
          strokeWidth="1"
        />

        {/* Volume bars */}
        {visiveis.map((c, i) => {
          const x = paddingLeft + i * stepX;
          const positivo = c.fechamento >= c.abertura;
          const cor = positivo ? "#10B98140" : "#EF444440";
          const h = volToH(c.volume);
          const ehHover = i === hoverIdx && !drag?.drag;
          return (
            <rect
              key={`vol-${i}`}
              x={x}
              y={hChart + 8 + (hVol - h)}
              width={candleWidth}
              height={h}
              fill={cor}
              rx="0.5"
              opacity={hoverIdx !== null && !ehHover ? 0.55 : 1}
              pointerEvents="none"
            />
          );
        })}

        {/* Eixo X com datas */}
        {ticksX.map((t, i) => (
          <text
            key={`tickx-${i}`}
            x={t.x}
            y={hChart + hVol + 22}
            fill="var(--text-dim)"
            fontSize="11"
            fontFamily="JetBrains Mono, monospace"
            textAnchor="middle"
          >
            {t.label}
          </text>
        ))}

        {/* Tooltip flutuante grande */}
        {hoverCandle && tooltipPos && !drag?.drag && (
          <g pointerEvents="none" className="animate-fade-in">
            <rect
              x={tooltipPos.x}
              y={tooltipPos.y}
              width={TOOLTIP_W}
              height={TOOLTIP_H}
              fill="var(--tooltip-bg)"
              stroke="var(--grid-strong)"
              strokeWidth="1.5"
              rx="6"
            />
            {/* Data */}
            <text
              x={tooltipPos.x + 12}
              y={tooltipPos.y + 19}
              fill="var(--text-primary)"
              fontSize="13"
              fontWeight="bold"
              fontFamily="Inter, sans-serif"
            >
              {new Date(hoverCandle.data + "T00:00:00").toLocaleDateString(
                "pt-BR",
                { day: "2-digit", month: "short", year: "numeric" },
              )}
            </text>
            {/* Variação dia */}
            <text
              x={tooltipPos.x + TOOLTIP_W - 12}
              y={tooltipPos.y + 19}
              fill={
                hoverCandle.fechamento >= hoverCandle.abertura
                  ? "#10B981"
                  : "#EF4444"
              }
              fontSize="13"
              fontWeight="bold"
              fontFamily="JetBrains Mono, monospace"
              textAnchor="end"
            >
              {formatPercent(
                ((hoverCandle.fechamento - hoverCandle.abertura) /
                  hoverCandle.abertura) *
                  100,
              )}
            </text>

            {/* Separador */}
            <line
              x1={tooltipPos.x + 12}
              x2={tooltipPos.x + TOOLTIP_W - 12}
              y1={tooltipPos.y + 28}
              y2={tooltipPos.y + 28}
              stroke="var(--grid)"
              strokeWidth="1"
            />

            {/* OHLC em 2 colunas */}
            <TooltipLinha
              x={tooltipPos.x + 12}
              y={tooltipPos.y + 46}
              label="Abertura"
              valor={formatBRLNoCurrency(hoverCandle.abertura, 2)}
            />
            <TooltipLinha
              x={tooltipPos.x + 12}
              y={tooltipPos.y + 64}
              label="Fechamento"
              valor={formatBRLNoCurrency(hoverCandle.fechamento, 2)}
              corValor={
                hoverCandle.fechamento >= hoverCandle.abertura
                  ? "#10B981"
                  : "#EF4444"
              }
              destaque
            />
            <TooltipLinha
              x={tooltipPos.x + 12}
              y={tooltipPos.y + 82}
              label="Mínima"
              valor={formatBRLNoCurrency(hoverCandle.minima, 2)}
              corValor="#EF4444"
            />
            <TooltipLinha
              x={tooltipPos.x + 12}
              y={tooltipPos.y + 100}
              label="Máxima"
              valor={formatBRLNoCurrency(hoverCandle.maxima, 2)}
              corValor="#10B981"
            />
            <TooltipLinha
              x={tooltipPos.x + 12}
              y={tooltipPos.y + 118}
              label="Volume"
              valor={formatVolume(hoverCandle.volume)}
            />
            {hoverCandleAnterior && (
              <TooltipLinha
                x={tooltipPos.x + 12}
                y={tooltipPos.y + 136}
                label="vs dia anterior"
                valor={formatPercent(
                  ((hoverCandle.fechamento - hoverCandleAnterior.fechamento) /
                    hoverCandleAnterior.fechamento) *
                    100,
                )}
                corValor={
                  hoverCandle.fechamento >= hoverCandleAnterior.fechamento
                    ? "#10B981"
                    : "#EF4444"
                }
              />
            )}

            {/* Dica de interação */}
            <text
              x={tooltipPos.x + TOOLTIP_W - 12}
              y={tooltipPos.y + TOOLTIP_H - 8}
              fill="var(--text-dim)"
              fontSize="9"
              fontStyle="italic"
              fontFamily="Inter, sans-serif"
              textAnchor="end"
            >
              clique para detalhes
            </text>
          </g>
        )}
      </svg>

      {/* Legenda e instruções */}
      <div className="flex items-center gap-4 mt-2 text-xs text-ink-muted flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-[#FBBF24]" />
          <span>EMA 20</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-[#8B5CF6]" />
          <span>SMA 30</span>
        </div>
        <div className="ml-auto text-[10px] text-ink-dim hidden md:flex items-center gap-3">
          <span>🖱️ hover: detalhes</span>
          <span>👆 clique: pop-up</span>
          <span>🔍 arraste horizontal: zoom</span>
        </div>
      </div>

      {/* Modal detalhado */}
      {clickedIdx !== null && candles[clickedIdx] && (
        <CandleDetailsModal
          candle={candles[clickedIdx]}
          candleAnterior={
            clickedIdx > 0 ? candles[clickedIdx - 1] : undefined
          }
          ticker={ticker}
          onClose={() => setClickedIdx(null)}
        />
      )}
    </div>
  );
}

// SVG <text> agrupando label esquerda + valor direita
function TooltipLinha({
  x,
  y,
  label,
  valor,
  corValor,
  destaque,
}: {
  x: number;
  y: number;
  label: string;
  valor: string;
  corValor?: string;
  destaque?: boolean;
}) {
  return (
    <g>
      <text
        x={x}
        y={y}
        fill="var(--text-muted)"
        fontSize="11"
        fontFamily="Inter, sans-serif"
      >
        {label}
      </text>
      <text
        x={x + 216}
        y={y}
        fill={corValor ?? "var(--text-primary)"}
        fontSize={destaque ? "12" : "11"}
        fontWeight={destaque ? "700" : "600"}
        fontFamily="JetBrains Mono, monospace"
        textAnchor="end"
      >
        {valor}
      </text>
    </g>
  );
}
