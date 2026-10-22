
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";

import { RADIATION_COLORS } from "@/constants/radiationColors";

interface SpectrumPoint {
  energy: number;
  counts: number;
}

interface LowEnergySpectrumChartProps {
  peakEnergy?: number;
  maxEnergy?: number;
  peakHeight?: number;
  peakWidth?: number;
  duration?: number;
  intervalMs?: number;
  className?: string;
}

const GAMMA_COLOR = RADIATION_COLORS.gamma.primary;
const CHANNEL_COUNT = 561;

const gaussian = (
  x: number,
  mean: number,
  sigma: number
) =>
  Math.exp(-0.5 * ((x - mean) / sigma) ** 2);

// Reproducible pseudo-random numbers.
function randomValue(seed: number) {
  const value =
    Math.sin(seed * 127.1 + 78.233) * 43758.5453;

  return value - Math.floor(value);
}

// Approximate Poisson-distributed counting noise.
function poissonCount(
  expected: number,
  seed: number
) {
  if (expected <= 0) return 0;

  const u1 = Math.max(1e-10, randomValue(seed));
  const u2 = randomValue(seed + 97);

  const normal =
    Math.sqrt(-2 * Math.log(u1)) *
    Math.cos(2 * Math.PI * u2);

  return Math.max(
    0,
    Math.round(
      expected + Math.sqrt(expected) * normal
    )
  );
}

function generateSpectrum(
  peakEnergy: number,
  maxEnergy: number,
  peakHeight: number,
  peakWidth: number
): SpectrumPoint[] {
  return Array.from(
    { length: CHANNEL_COUNT },
    (_, index) => {
      const energy =
        (index / (CHANNEL_COUNT - 1)) *
        maxEnergy;

      // Very low background counting rate.
      // Starts at zero, with occasional low counts.
      const baseline =
        index === 0
          ? 0
          : 0.45 + 1.0 * Math.exp(-energy / 35);

      // Sharp full-energy absorption photopeak.
      const photopeak =
        peakHeight *
        gaussian(
          energy,
          peakEnergy,
          peakWidth
        );

      const counts = poissonCount(
        baseline + photopeak,
        index + 1
      );

      return {
        energy: Number(energy.toFixed(3)),
        counts,
      };
    }
  );
}

export default function LowEnergySpectrumChart({
  peakEnergy = 59.5,
  maxEnergy = 140,
  peakHeight = 200,
  peakWidth = 0.65,
  duration = 30,
  intervalMs = 100,
  className = "",
}: LowEnergySpectrumChartProps) {
  const [streaming, setStreaming] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const startedAtRef = useRef(0);
  const elapsedBeforeRef = useRef(0);

  const safeDuration = Math.max(0.1, duration);
  const safeMaxEnergy = Math.max(1, maxEnergy);
  const safePeakWidth = Math.max(0.05, peakWidth);

  const fullSpectrum = useMemo(
    () =>
      generateSpectrum(
        peakEnergy,
        safeMaxEnergy,
        peakHeight,
        safePeakWidth
      ),
    [
      peakEnergy,
      safeMaxEnergy,
      peakHeight,
      safePeakWidth,
    ]
  );

  const startStream = () => {
    elapsedBeforeRef.current = 0;
    startedAtRef.current = performance.now();
    setElapsed(0);
    setStreaming(true);
  };

  const pauseStream = () => {
    const currentElapsed = Math.min(
      safeDuration,
      elapsedBeforeRef.current +
        (performance.now() - startedAtRef.current) /
          1000
    );

    elapsedBeforeRef.current = currentElapsed;
    setElapsed(currentElapsed);
    setStreaming(false);
  };

  useEffect(() => {
    if (!streaming) return;

    const tick = () => {
      const seconds = Math.min(
        safeDuration,
        elapsedBeforeRef.current +
          (performance.now() - startedAtRef.current) /
            1000
      );

      setElapsed(seconds);

      if (seconds >= safeDuration) {
        elapsedBeforeRef.current = safeDuration;
        setStreaming(false);
      }
    };

    tick();

    const timer = window.setInterval(
      tick,
      Math.max(50, intervalMs)
    );

    return () => window.clearInterval(timer);
  }, [streaming, intervalMs, safeDuration]);

  const progress = Math.min(
    1,
    elapsed / safeDuration
  );

  // Reveal channels progressively from left to right.
  const visibleSpectrum = useMemo(() => {
    const visibleCount = Math.floor(
      progress * (fullSpectrum.length - 1)
    );

    return fullSpectrum.slice(
      0,
      Math.max(1, visibleCount + 1)
    );
  }, [fullSpectrum, progress]);

  const scanEnergy = progress * safeMaxEnergy;

  const completed =
    elapsed >= safeDuration;

  const yMax = Math.max(
    25,
    Math.ceil((peakHeight * 1.3) / 25) * 25
  );

  return (
    <div
      className={`mx-auto mt-8 w-full max-w-5xl rounded-xl border border-slate-800 bg-slate-950 p-6 shadow-2xl ${className}`}
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-100">
            Live Radiation Spectrum
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            {peakEnergy} keV Photopeak
          </p>
        </div>

        <button
          type="button"
          onClick={
            streaming
              ? pauseStream
              : startStream
          }
          aria-pressed={streaming}
          className={`flex items-center gap-2 rounded-full border px-4 py-2 transition-colors ${
            streaming
              ? "border-emerald-800 bg-emerald-950/50 text-emerald-400"
              : "border-violet-600 bg-violet-600 text-white hover:bg-violet-700"
          }`}
        >
          <span className="relative flex h-2 w-2">
            {streaming && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                streaming
                  ? "bg-emerald-500"
                  : "bg-white"
              }`}
            />
          </span>

          <span className="text-xs font-semibold tracking-wider">
            {streaming ? "live" : "stream"}
          </span>
        </button>
      </div>

      {/* Chart */}
      <div className="h-96 w-full">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <LineChart
            data={visibleSpectrum}
            margin={{
              top: 20,
              right: 25,
              left: -10,
              bottom: 10,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1e293b"
              opacity={0.5}
            />

            <XAxis
              type="number"
              dataKey="energy"
              domain={[0, safeMaxEnergy]}
              allowDataOverflow
              tickCount={8}
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              dy={10}
              label={{
                value: "Energy (keV)",
                position: "insideBottom",
                offset: -5,
                fill: "#94a3b8",
                fontSize: 12,
              }}
            />

            <YAxis
              domain={[0, yMax]}
              allowDataOverflow
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              allowDecimals={false}
              label={{
                value: "Counts",
                angle: -90,
                position: "insideLeft",
                fill: "#94a3b8",
                fontSize: 12,
              }}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#020617",
                borderColor: "#334155",
                borderRadius: "8px",
                color: "#f8fafc",
              }}
              labelStyle={{
                color: "#94a3b8",
              }}
              labelFormatter={(value) =>
                `${Number(value).toFixed(2)} keV`
              }
              formatter={(value) => [
                Number(value).toFixed(0),
                "Counts",
              ]}
            />

            {/* Photopeak marker */}
            <ReferenceLine
              x={peakEnergy}
              stroke={GAMMA_COLOR}
              strokeDasharray="5 5"
              strokeOpacity={0.45}
              label={{
                value: `${peakEnergy} keV`,
                position: "top",
                fill: GAMMA_COLOR,
                fontSize: 11,
              }}
            />

            {/* Scanning position */}
            {streaming && (
              <ReferenceLine
                x={scanEnergy}
                stroke="#22D3EE"
                strokeDasharray="3 3"
                strokeOpacity={0.65}
              />
            )}

            <Line
              type="linear"
              dataKey="counts"
              name="Gamma Spectrum"
              stroke={GAMMA_COLOR}
              strokeWidth={1.8}
              dot={false}
              isAnimationActive={false}
              activeDot={{
                r: 3,
                fill: GAMMA_COLOR,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-800 pt-3 text-xs text-slate-400">
        <span>
          {streaming
            ? "Acquiring simulated spectrum"
            : completed
              ? "Spectrum acquisition complete"
              : elapsed > 0
                ? "Acquisition paused"
                : "Ready to stream"}
        </span>

        <span className="font-mono">
          {elapsed.toFixed(1)} / {safeDuration}s
        </span>
      </div>
    </div>
  );
}
