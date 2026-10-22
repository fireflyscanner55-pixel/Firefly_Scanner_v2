"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
} from "recharts";

import type {
  ResultCardData,
} from "@/types/dashboard";

type ResultCardProps = {
  chart: ResultCardData;
};

export default function ResultCard({
  chart,
}: ResultCardProps) {
  return (
    <article
      className="
        min-w-0 overflow-hidden
        bg-white
        px-4 pb-4 pt-3
        shadow-[0_10px_30px_rgba(15,23,42,0.08)]
      "
    >
      {/* Chart controls placeholder */}

      <div className="mb-1 flex justify-end">
        <div className="flex items-center gap-1 text-[9px] text-slate-400">
          <span>◉</span>
          <span>○</span>
          <span>⌕</span>
          <span>⌂</span>
        </div>
      </div>

      {/* Chart */}

      <div className="h-24 w-full sm:h-28">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <AreaChart
            data={chart.data}
            margin={{
              top: 0,
              right: 0,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient
                id={`gradient-${chart.id}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={chart.color}
                  stopOpacity={0.95}
                />

                <stop
                  offset="100%"
                  stopColor={chart.color}
                  stopOpacity={0.8}
                />
              </linearGradient>
            </defs>

            <Area
              type="monotone"
              dataKey="value"
              stroke={chart.color}
              strokeWidth={1}
              fill={`url(#gradient-${chart.id})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}

      <div className="mt-2 flex items-center justify-center gap-1.5">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{
            backgroundColor: chart.color,
          }}
        />

        <span className="text-sm font-medium text-slate-600">
          {chart.title}
        </span>
      </div>
    </article>
  );
}