
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
} from "recharts";

interface LiveSpectrumSweepProps {
  durationSeconds?: number;
  flatSeconds?: number;
  peakSeconds?: number;
  height?: number;
  color?: string;
  autoStart?: boolean;
  onComplete?: () => void;
}

interface SpectrumPoint {
  secondsAgo: number;
  elapsed: number;
  intensity: number;
}

const SAMPLE_INTERVAL = 0.1;

function gaussian(
  x: number,
  center: number,
  width: number
): number {
  return Math.exp(
    -0.5 * Math.pow((x - center) / width, 2)
  );
}

function spectrumValue(
  time: number,
  flat: number,
  peakDuration: number
): number {
  // Phase 1: Almost flat readings for 5 seconds.
  if (time < flat) {
    return Math.max(
      0,
      3 +
        Math.sin(time * 17) * 1.3 +
        Math.sin(time * 39) * 0.8
    );
  }

  const relative = time - flat;

  // Phase 2: Inverted mountain spectrum.
  // Gradual rise toward the right, sharp peak,
  // followed by a rapid decline.
  if (relative <= peakDuration && peakDuration > 0) {
    const progress = relative / peakDuration;
    const peakPosition = 0.78;

    const mountain =
      progress <= peakPosition
        ? 295 *
          Math.pow(progress / peakPosition, 2.1)
        : 295 *
          Math.exp(
            -Math.pow(
              (progress - peakPosition) / 0.09,
              2
            )
          );

    const fluctuations =
      Math.sin(time * 25) * 8 +
      Math.sin(time * 48) * 5 +
      Math.sin(time * 73) * 3;

    const narrowPeaks =
      24 * gaussian(progress, 0.62, 0.022) +
      30 * gaussian(progress, 0.77, 0.018);

    return Math.max(
      0,
      Math.min(
        329,
        4 + mountain + narrowPeaks + fluctuations
      )
    );
  }

  // Phase 3: Low-level readings after peak.
  // Continue until the 30-second automatic stop.
  const settlingTime = relative - peakDuration;

  return Math.max(
    0,
    3 +
      18 * Math.exp(-settlingTime * 1.5) +
      Math.sin(time * 19) * 2
  );
}
export default function LiveSpectrumSweep({
  durationSeconds = 20,
  flatSeconds = 5,
  peakSeconds = 10,
  height = 290,
  color = "#2563eb",
  autoStart = false,
  onComplete,
}: LiveSpectrumSweepProps) {
  const duration = Math.max(1, durationSeconds);
  const flat = Math.max(
    0,
    Math.min(flatSeconds, duration)
  );
  const peak = Math.max(
    0,
    Math.min(peakSeconds, duration - flat)
  );

  const [elapsed, setElapsed] = useState(0);
  const [isStreaming, setIsStreaming] =
    useState(autoStart);
  const [runId, setRunId] = useState(
    autoStart ? 1 : 0
  );

  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const startStream = () => {
    setElapsed(0);
    setIsStreaming(true);
    setRunId((previous) => previous + 1);
  };

  useEffect(() => {
    if (runId === 0) return;

    const startTime = performance.now();
    let completed = false;

    const timer = window.setInterval(() => {
      const seconds = Math.min(
        duration,
        (performance.now() - startTime) / 1000
      );

      setElapsed(seconds);

      if (seconds >= duration) {
        window.clearInterval(timer);
        setIsStreaming(false);

        if (!completed) {
          completed = true;
          onCompleteRef.current?.();
        }
      }
    }, 50);

    return () => {
      window.clearInterval(timer);
    };
  }, [runId, duration]);

  const data = useMemo<SpectrumPoint[]>(() => {
    if (runId === 0) return [];

    const count = Math.floor(
      elapsed / SAMPLE_INTERVAL
    );

    const readings: SpectrumPoint[] = [];

    for (let index = 0; index <= count; index++) {
      const sampleTime =
        index * SAMPLE_INTERVAL;

      readings.push({
        secondsAgo: sampleTime - elapsed,
        elapsed: sampleTime,
        intensity: spectrumValue(
          sampleTime,
          flat,
          peak
        ),
      });
    }

    // Include the current endpoint between samples.
    if (elapsed > count * SAMPLE_INTERVAL) {
      readings.push({
        secondsAgo: 0,
        elapsed,
        intensity: spectrumValue(
          elapsed,
          flat,
          peak
        ),
      });
    }

    return readings;
  }, [elapsed, runId, flat, peak]);

  const isComplete =
    runId > 0 &&
    !isStreaming &&
    elapsed >= duration;

  const phase =
    isComplete
      ? "Stream completed"
      : !isStreaming
        ? "Ready to stream"
        : elapsed < flat
          ? "Baseline acquisition"
          : elapsed < flat + peak
            ? "Peak formation"
            : "Signal settling";

  return (
    <div className="mx-auto mt-8 w-full min-w-0 max-w-5xl rounded-xl border border-slate-800 bg-slate-950 p-6 text-slate-100 shadow-2xl">
      {/* Header matches EndlessEEGChart */}
      <div className="mb-6 flex items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-100">
            Live Spectrum Sweep
          </h2>
        </div>

        {/* Stream / Live button */}
        <button
          type="button"
          onClick={startStream}
          disabled={isStreaming}
          className={`flex items-center gap-2 rounded-full border px-4 py-2 transition-colors ${
            isStreaming
              ? "cursor-default border-emerald-800/50 bg-emerald-950/50 text-emerald-400"
              : "border-violet-600 bg-violet-600 text-white hover:bg-violet-700"
          }`}
        >
          <span className="relative flex h-2 w-2">
            {isStreaming && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            )}

            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                isStreaming
                  ? "bg-emerald-500"
                  : "bg-white"
              }`}
            />
          </span>

          <span className="text-xs font-semibold tracking-wider">
            {isStreaming ? "live" : "stream"}
          </span>
        </button>
      </div>

      {/* Same chart height as EndlessEEGChart */}
      <div className="h-96 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 10,
              right: 20,
              left: -15,
              bottom: 0,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1e293b"
              opacity={0.3}
            />

            <XAxis
              type="number"
              dataKey="secondsAgo"
              domain={[-duration, 0]}
              ticks={[
                -duration,
                -duration * 0.75,
                -duration * 0.5,
                -duration * 0.25,
                0,
              ]}
              tickFormatter={(value: number) =>
                `${Math.abs(value).toFixed(0)}s`
              }
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              dy={10}
              allowDataOverflow
            />

            {/* <YAxis
              domain={[0, 1]}
              ticks={[0, 0.2, 0.4, 0.6, 0.8, 1]}
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              dx={-5}
              width={55}
            /> */}

            <YAxis
  domain={[0, 335]}
  ticks={[0, 100, 200, 300, 350, 400]}
  stroke="#64748b"
  fontSize={11}
  tickLine={false}
  dx={-5}
  width={55}
/>

            <Tooltip
              contentStyle={{
                backgroundColor: "#020617",
                borderColor: "#334155",
                borderRadius: "8px",
                color: "#e2e8f0",
              }}
              labelStyle={{
                color: "#94a3b8",
                fontWeight: "bold",
              }}
              labelFormatter={(_, items) => {
                const point = items?.[0]?.payload as
                  | SpectrumPoint
                  | undefined;

                return point
                  ? `${point.elapsed.toFixed(1)}s elapsed`
                  : "";
              }}
              formatter={(value) => [
                typeof value === "number"
                  ? value.toFixed(3)
                  : String(value ?? "—"),
                "Relative intensity",
              ]}
            />

            <Line
              type="linear"
              dataKey="intensity"
              name="Spectrum"
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <span>{phase}</span>
        <span className="tabular-nums">
          {elapsed.toFixed(1)}s / {duration}s
        </span>
      </div> */}
    </div>
  );
}
