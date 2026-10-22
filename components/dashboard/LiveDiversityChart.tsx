
"use client";

import { useEffect, useMemo, useState } from "react";

import {
  getRadiationColors,
  type RadiationType,
} from "@/constants/radiationColors";

type ChartPoint = {
  id: number;
  actual: number;
  predicted: number;
  group: number;
};

type PanelConfig = {
  type: RadiationType;
  title: string;
  min: number;
  max: number;
  center: number;
  spread: number;
};

type DiversityChartProps = {
  live?: boolean;
  intervalMs?: number;
  maxPoints?: number;
};

const configs: PanelConfig[] = [
  {
    type: "alpha",
    title: "Alpha diversity",
    min: 0,
    max: 100,
    center: 27,
    spread: 17,
  },
  {
    type: "beta",
    title: "Beta diversity",
    min: 0.3,
    max: 0.85,
    center: 0.54,
    spread: 0.055,
  },
  {
    type: "gamma",
    title: "Gamma diversity",
    min: 50,
    max: 800,
    center: 470,
    spread: 115,
  },
];


const clamp = (n: number, a: number, b: number) =>
  Math.max(a, Math.min(b, n));

function normal() {
  return (
    Math.random() +
    Math.random() +
    Math.random() +
    Math.random() -
    2
  );
}

function createPoint(
  id: number,
  config: PanelConfig,
  panelIndex: number
): ChartPoint {
  const actual = clamp(
    config.center + normal() * config.spread,
    config.min,
    config.max
  );

  let predicted: number;

  if (panelIndex === 0) {
    predicted =
      7 + actual * 0.65 + normal() * 12;
    predicted = Math.min(predicted, 45);
  } else if (panelIndex === 1) {
    predicted =
      0.55 + (actual - 0.54) * 0.32 +
      normal() * 0.025;
  } else {
    predicted =
      actual + normal() * 37;
  }

  return {
    id,
    actual,
    predicted: clamp(
      predicted,
      config.min,
      config.max
    ),
    group: Math.floor(Math.random() * 4),
  };
}

function histogram(
  values: number[],
  min: number,
  max: number,
  bins = 28
) {
  const counts = Array(bins).fill(0) as number[];

  values.forEach((value) => {
    const index = clamp(
      Math.floor(
        ((value - min) / (max - min)) * bins
      ),
      0,
      bins - 1
    );
    counts[index]++;
  });

  return counts;
}

function Panel({
  config,
  points,
}: {
  config: PanelConfig;
  points: ChartPoint[];
}) {
  const panelColors = getRadiationColors(config.type);
  const min = config.min;
  const max = config.max;
  const range = max - min;

  const plotX = 43;
  const plotY = 145;
  const plotW = 278;
  const plotH = 265;
  const histY = 34;
  const histH = 84;
  const rightX = 339;
  const rightW = 75;

  const sx = (v: number) =>
    plotX + ((v - min) / range) * plotW;

  const sy = (v: number) =>
    plotY + plotH -
    ((v - min) / range) * plotH;

  const histX = useMemo(
    () =>
      histogram(
        points.map((p) => p.actual),
        min,
        max
      ),
    [points, min, max]
  );

  const histRight = useMemo(
    () =>
      histogram(
        points.map((p) => p.predicted),
        min,
        max
      ),
    [points, min, max]
  );

  const maxHistX = Math.max(1, ...histX);
  const maxHistY = Math.max(1, ...histRight);

  const mape = points.length
    ? points.reduce(
        (sum, p) =>
          sum +
          Math.abs(
            (p.actual - p.predicted) /
              Math.max(Math.abs(p.actual), 0.0001)
          ),
        0
      ) / points.length
    : 0;

  const ticks = Array.from(
    { length: 5 },
    (_, i) => min + (range * i) / 4
  );

  const fmt = (v: number) =>
    range < 1 ? v.toFixed(2) : v.toFixed(0);

  return (
    <div className="min-w-0 bg-white">
      <h3 className="mb-1 text-center font-serif text-xl font-bold"
      style={{ color: panelColors.primary }}
      >
        {config.title}
      </h3>

      <svg
        viewBox="0 0 430 460"
        className="h-auto w-full"
        role="img"
        aria-label={`${config.title} live scatter plot`}
      >
        {/* Top distribution histogram */}
        <rect
          x={plotX}
          y={histY}
          width={plotW}
          height={histH}
          fill={panelColors.primary}
          fillOpacity={0.85}
          stroke="#666"
          strokeWidth="0.7"
        />

        {histX.map((count, i) => {
          const binW = plotW / histX.length;
          const h =
            (count / maxHistX) * histH * 0.95;

          return (
            <rect
              key={i}
              x={plotX + i * binW}
              y={histY + histH - h}
              width={binW + 0.1}
              height={h}
              fill="#0f0f0f"
            />
          );
        })}

        {/* Prediction error */}
        <text
          x="344"
          y="62"
          fill="#111"
          fontSize="15"
          fontFamily="serif"
        >
          MAPE:
        </text>
        <text
          x="344"
          y="82"
          fill="#111"
          fontSize="14"
          fontFamily="serif"
        >
          {mape.toFixed(4)}
        </text>

        {/* Scatter plot background */}
        <rect
          x={plotX}
          y={plotY}
          width={plotW}
          height={plotH}
          fill="white"
          stroke="#444"
          strokeWidth="0.8"
        />

        {/* Grid */}
        {ticks.map((tick, i) => {
          const x = sx(tick);
          const y = sy(tick);

          return (
            <g key={i}>
              <line
                x1={x}
                y1={plotY}
                x2={x}
                y2={plotY + plotH}
                stroke="#c0c0c0"
                strokeWidth="0.7"
              />
              <line
                x1={plotX}
                y1={y}
                x2={plotX + plotW}
                y2={y}
                stroke="#c0c0c0"
                strokeWidth="0.7"
              />
              <text
                x={x}
                y={plotY + plotH + 17}
                textAnchor="middle"
                fontSize="10"
                fill="#333"
              >
                {fmt(tick)}
              </text>
              <text
                x={plotX - 5}
                y={y + 3}
                textAnchor="end"
                fontSize="10"
                fill="#333"
              >
                {fmt(tick)}
              </text>
            </g>
          );
        })}

        {/* Perfect prediction reference */}
        <line
          x1={sx(min)}
          y1={sy(min)}
          x2={sx(max)}
          y2={sy(max)}
          stroke="#c82020"
          strokeWidth="1.4"
          strokeDasharray="5 3"
        />

        {/* Live scatter points */}
        {points.map((point) => (
          <circle
            key={point.id}
            cx={sx(point.actual)}
            cy={sy(point.predicted)}
            r="1.65"
            fill={panelColors.shades[point.group] ?? panelColors.primary}
            opacity="0.58"
          >
            <title>
              {`Actual: ${fmt(point.actual)} | Predicted: ${fmt(point.predicted)}`}
            </title>
          </circle>
        ))}

        {/* Right distribution histogram */}
        <rect
          x={rightX}
          y={plotY}
          width={rightW}
          height={plotH}
          fill={panelColors.dark}
          fillOpacity={0.8}
          stroke="#666"
          strokeWidth="0.7"
        />

        {histRight.map((count, i) => {
          const binH = plotH / histRight.length;
          const w =
            (count / maxHistY) * rightW * 0.95;

          return (
            <rect
              key={i}
              x={rightX}
              y={
                plotY +
                plotH -
                (i + 1) * binH
              }
              width={w}
              height={binH + 0.1}
              fill="#0f0f0f"
            />
          );
        })}

        {/* Axis labels */}
        <text
          x={plotX + plotW / 2}
          y="448"
          textAnchor="middle"
          fontSize="12"
          fill="#111"
        >
          True diversity
        </text>

        <text
          transform={`translate(12 ${
            plotY + plotH / 2
          }) rotate(-90)`}
          textAnchor="middle"
          fontSize="12"
          fill="#111"
        >
          Predicted diversity
        </text>

        {/* Legend */}
        <rect
          x="226"
          y="342"
          width="90"
          height="65"
          fill="white"
          fillOpacity="0.9"
          stroke="#ccc"
        />

        {["Other", "250 m²", "400 m²", "500 m²"].map(
          (label, i) => (
            <g key={label}>
              <circle 
              cx="237"
              cy={354 + i * 14}
              r="2.2"
              fill={panelColors.shades[i]}
              />
              <text
                x="245"
                y={357 + i * 14}
                fontSize="9"
                fill="#111"
              >
                {label}
              </text>
            </g>
          )
        )}
      </svg>
    </div>
  );
}

export default function LiveDiversityChart({
  live = true,
  intervalMs = 1200,
  maxPoints = 300,
}: DiversityChartProps) {
  const [datasets, setDatasets] = useState<
    ChartPoint[][]
  >([[], [], []]);

  useEffect(() => {
    let nextId = 0;

    const initial = configs.map((config, index) =>
      Array.from({ length: maxPoints }, () =>
        createPoint(nextId++, config, index)
      )
    );

    // Initialize the generated demonstration dataset
    // after client mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDatasets(initial);

    if (!live) return;

    const timer = window.setInterval(() => {
      setDatasets((previous) =>
        previous.map((points, index) => {
          const fresh = Array.from(
            { length: 5 },
            () =>
              createPoint(
                nextId++,
                configs[index],
                index
              )
          );

          return [...points, ...fresh].slice(
            -maxPoints
          );
        })
      );
    }, Math.max(intervalMs, 100));

    return () => window.clearInterval(timer);
  }, [live, intervalMs, maxPoints]);

  return (
    <section className="w-full overflow-x-auto rounded-lg border border-slate-300 bg-white p-3 text-black">
      <div className="w-full min-w-0">
        <div className="grid grid-cols-3 divide-x divide-black">
          {configs.map((config, index) => (
            <Panel
              key={config.title}
              config={config}
              points={datasets[index]}
            />
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-3 pt-3 text-xs text-slate-500">
          <span>
            {live
              ? "Live measurements"
              : "Static measurements"}
          </span>
          <span>
            {datasets[0].length} samples per panel
          </span>
        </div>
      </div>
    </section>
  );
}
