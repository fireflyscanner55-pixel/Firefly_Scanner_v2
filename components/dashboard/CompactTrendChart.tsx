// "use client";

// import { useEffect, useMemo, useState } from "react";

// type TrendPoint = {
//   timestamp: number;
//   value: number;
// };

// interface CompactTrendChartProps {
//   value: number;
//   unit: string;
//   color: string;
//   precision?: number;
//   maxPoints?: number;
//   windowSeconds?: number;
//   min?: number;
//   max?: number;
// }

// export default function CompactTrendChart({
//   value,
//   unit,
//   color,
//   precision = 0,
//   maxPoints = 50,
//   windowSeconds = 340,
//   min,
//   max,
// }: CompactTrendChartProps) {
//   const [history, setHistory] = useState<TrendPoint[]>([]);

//   useEffect(() => {
//     if (!Number.isFinite(value)) return;

//     setHistory((prev) => {
//       const next = [
//         ...prev,
//         {
//           timestamp: Date.now(),
//           value,
//         },
//       ];

//       return next.slice(-maxPoints);
//     });
//   }, [value, maxPoints]);

//   const width = 320;
//   const height = 140;
//   const leftPad = 10;
//   const rightPad = 10;
//   const topPad = 10;
//   const bottomPad = 10;

//   const values = history.map((item) => item.value);

//   const dataMin = values.length ? Math.min(...values) : value;
//   const dataMax = values.length ? Math.max(...values) : value;

//   const lower =
//   typeof min === "number" ? min : dataMin;

// const upper =
//   typeof max === "number" ? max : dataMax;
  

//   const range = Math.max(upper - lower, 0.0001);

//   const points = history.map((item, index) => {
//   const visibleWidth = width - leftPad - rightPad;

//   // Fixed spacing produces compact, sharp waves.
//   const pointSpacing = visibleWidth / (maxPoints - 1);

//   // New readings enter from the right.
//   // Previous readings shift towards the left.
  
//   const x =
//     width -
//     rightPad -
//     (history.length - 1 - index) * pointSpacing;

//   const y =
//     topPad +
//     (1 - (item.value - lower) / range) *
//       (height - topPad - bottomPad);

//   return {
//     x,
//     y,
//   };
// });
//   const linePath = points
//     .map(
//       (point, index) =>
//         `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
//     )
//     .join(" ");

//   const latestValue =
//     Number.isFinite(value) ? value.toFixed(precision) : "—";

//   const minLabel = lower.toFixed(precision);

//   const elapsedSeconds = useMemo(() => {
//     if (history.length < 2) return 0;

//     const first = history[0]?.timestamp ?? Date.now();
//     const last =
//       history[history.length - 1]?.timestamp ?? Date.now();

//     return Math.max(
//       0,
//       Math.round((last - first) / 1000)
//     );
//   }, [history]);

//   return (
//     <div className="mt-0 w-full">
//       <div className="rounded-md bg-orange-400 p-0.5">
//         <svg
//           viewBox={`0 0 ${width} ${height}`}
//           className="block h-[130px] w-full"
//           preserveAspectRatio="none"
//           role="img"
//           aria-label={`Live trend chart for ${unit}`}
//         >
//           {/* background */}
//           <rect
//             x="0"
//             y="0"
//             width={width}
//             height={height}
//             fill="#a56529"
//           />

//           {/* grid vertical */}
//           {Array.from({ length: 16 }).map((_, i) => {
//             const x =
//               leftPad +
//               (i / 1) * (width - leftPad - rightPad);

//             return (
//               <line
//                 key={`vx-${i}`}
//                 x1={x}
//                 y1={topPad}
//                 x2={x}
//                 y2={height - bottomPad}
//                 stroke="#161b1d"
//                 strokeWidth="0.5"
//               />
//             );
//           })}

//           {/* grid horizontal */}
//           {Array.from({ length: 8 }).map((_, i) => {
//             const y =
//               topPad +
//               (i / 1) * (height - topPad - bottomPad);

//             return (
//               <line
//                 key={`hy-${i}`}
//                 x1={leftPad}
//                 y1={y}
//                 x2={width - rightPad}
//                 y2={y}
//                 stroke="#161b1d"
//                 strokeWidth="0.5"
//               />
//             );
//           })}

//           {/* line */}
//           {points.length > 1 && (
//             <path
//             d={linePath}
//             fill="none"
//             stroke={color}
//             strokeWidth="0.35"
//             strokeLinejoin="miter"
//             strokeLinecap="butt"
//             vectorEffect="non-scaling-stroke"
//             shapeRendering="geometricPrecision"
//             opacity="0.9"
//             />
//           )}

//           {/* lower-left minimum/reference */}
//           <text
//             x="6"
//             y={height - bottomPad - 2}
//             fontSize="9"
//             fill="#060606"
//           >
//             {minLabel}
//           </text>

//           {/* elapsed time bottom-left */}
//           <text
//             x="6"
//             y={height - 2}
//             fontSize="10"
//             fill="#6b7280"
//           >
//             {elapsedSeconds || windowSeconds}s
//           </text>

//           <text
//           x={width - rightPad}
//           y={18}
//           textAnchor="end"
//           fontSize="10"
//           fill="#060606"
//           >
//             {latestValue} {unit}
//           </text>

//           {/* right bottom */}
//           <text
//             x={width - 18}
//             y={height - 2}
//             fontSize="9"
//             fill="#6b7280"
//           >
//             0s
//           </text>
//         </svg>
//       </div>
//     </div>
//   );
// }


"use client";

import { useEffect, useMemo, useState } from "react";

type TrendPoint = {
  timestamp: number;
  value: number;
};

interface CompactTrendChartProps {
  value: number;
  unit: string;
  color: string;
  precision?: number;
  maxPoints?: number;
  windowSeconds?: number;
  min?: number;
  max?: number;
}

export default function CompactTrendChart({
  value,
  unit,
  color,
  precision = 0,
  maxPoints = 240,
  windowSeconds = 340,
  min,
  max,
}: CompactTrendChartProps) {
  const [history, setHistory] = useState<TrendPoint[]>([]);

  /*
   * Append live readings.
   * Maintain only the most recent maxPoints values.
   */
  useEffect(() => {
    if (!Number.isFinite(value)) return;

    setHistory((previous) => {
      const next = [
        ...previous,
        {
          timestamp: Date.now(),
          value,
        },
      ];

      return next.slice(-Math.max(2, maxPoints));
    });
  }, [value, maxPoints]);

  /*
   * Original chart dimensions — unchanged.
   */
  const width = 320;
  const height = 140;

  const leftPad = 10;
  const rightPad = 10;
  const topPad = 10;
  const bottomPad = 10;

  const plotWidth = width - leftPad - rightPad;
  const plotHeight = height - topPad - bottomPad;

  const safeMaxPoints = Math.max(2, maxPoints);

  /*
   * Calculate vertical bounds.
   *
   * Prefer the scenario's configured range
   * so the waveform does not rescale on each
   * incoming reading.
   */
  const { lower, upper } = useMemo(() => {
    const readings = history.map((item) => item.value);

    const observedMin =
      readings.length > 0
        ? Math.min(...readings)
        : Number.isFinite(value)
          ? value
          : 0;

    const observedMax =
      readings.length > 0
        ? Math.max(...readings)
        : Number.isFinite(value)
          ? value
          : 1;

    const configuredMin =
      typeof min === "number" && Number.isFinite(min)
        ? min
        : undefined;

    const configuredMax =
      typeof max === "number" && Number.isFinite(max)
        ? max
        : undefined;

    let nextLower = configuredMin ?? observedMin;
    let nextUpper = configuredMax ?? observedMax;

    // Prevent zero-height scaling.
    if (nextUpper <= nextLower) {
      const center = nextLower;
      const margin = Math.max(
        Math.abs(center) * 0.05,
        precision > 0 ? 0.001 : 1
      );

      nextLower = center - margin;
      nextUpper = center + margin;
    }

    return {
      lower: nextLower,
      upper: nextUpper,
    };
  }, [history, value, min, max, precision]);

  const range = Math.max(upper - lower, 0.0001);

  /*
   * Calculate graph points.
   *
   * Readings enter from the right side.
   * Existing readings move toward the left.
   *
   * Fixed spacing prevents the waveform from
   * stretching as the history grows.
   */
  const points = useMemo(() => {
    const spacing =
      plotWidth / (safeMaxPoints - 1);

    return history.map((item, index) => {
      const x =
        width -
        rightPad -
        (history.length - 1 - index) * spacing;

      const normalized = Math.max(
        0,
        Math.min(1, (item.value - lower) / range)
      );

      const y =
        topPad +
        (1 - normalized) * plotHeight;

      return { x, y };
    });
  }, [
    history,
    safeMaxPoints,
    plotWidth,
    plotHeight,
    width,
    rightPad,
    topPad,
    lower,
    range,
  ]);

  /*
   * Build the continuous SVG waveform path.
   */
  const linePath = useMemo(() => {
    return points
      .map(
        (point, index) =>
          `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`
      )
      .join(" ");
  }, [points]);

  /*
   * Display values.
   */
  const latestValue = Number.isFinite(value)
    ? value.toFixed(precision)
    : "—";

  const minLabel = lower.toFixed(precision);

  /*
   * Duration of retained readings.
   */
  const elapsedSeconds = useMemo(() => {
    if (history.length < 2) return 0;

    const first = history[0].timestamp;
    const last = history[history.length - 1].timestamp;

    return Math.max(
      0,
      Math.round((last - first) / 1000)
    );
  }, [history]);

  return (
    <div className="mt-0 w-full">
      <div className="rounded-md bg-orange-400 p-0.5">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="block h-[130px] w-full"
          preserveAspectRatio="none"
          role="img"
          aria-label={`Live trend chart for ${unit}`}
        >
          {/* Original background */}
          <rect
            x="0"
            y="0"
            width={width}
            height={height}
            fill="#a56529"
          />

          {/* 16 vertical gridlines */}
          {Array.from({ length: 64 }).map((_, index) => {
            const x =
              leftPad +
              (index / 60) * plotWidth;

            return (
              <line
                key={`vertical-${index}`}
                x1={x}
                y1={topPad}
                x2={x}
                y2={height - bottomPad}
                stroke="#e28585"
                strokeWidth="0.5"
              />
            );
          })}

          {/* 8 horizontal gridlines */}
          {Array.from({ length: 64 }).map((_, index) => {
            const y =
              topPad +
              (index / 28) * plotHeight;

            return (
              <line
                key={`horizontal-${index}`}
                x1={leftPad}
                y1={y}
                x2={width - rightPad}
                y2={y}
                stroke="#e28585"
                strokeWidth="0.5"
              />
            );
          })}

          {/* Sharp, compact, high-sensitivity waveform */}
          {points.length > 1 && (
            <path
              d={linePath}
              fill="none"
              stroke={color}
              strokeWidth="0.35"
              strokeLinejoin="miter"
              strokeLinecap="butt"
              vectorEffect="non-scaling-stroke"
              shapeRendering="geometricPrecision"
              opacity="0.9"
            />
          )}

          {/* Minimum/reference label */}
          <text
            x="6"
            y={height - bottomPad - 2}
            fontSize="9"
            fill="#060606"
          >
            {minLabel}
          </text>

          {/* Elapsed time */}
          <text
            x="6"
            y={height - 2}
            fontSize="10"
            fill="#6b7280"
          >
            {elapsedSeconds || windowSeconds}s
          </text>

          {/* Latest live reading */}
          <text
            x={width - rightPad}
            y={18}
            textAnchor="end"
            fontSize="10"
            fill="#060606"
          >
            {latestValue} {unit}
          </text>

          {/* Right-side time label */}
          <text
            x={width - 18}
            y={height - 2}
            fontSize="9"
            fill="#6b7280"
          >
            0s
          </text>
        </svg>
      </div>
    </div>
  );
}
