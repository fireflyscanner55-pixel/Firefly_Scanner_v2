
"use client";

import { useId } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export interface GammaIndexData {
  sample: string;
  gammaIndex: number;
}

interface GammaIndexBarChartProps {
  data: GammaIndexData[];
  title?: string;
  height?: number;
  className?: string;
}

export default function GammaIndexBarChart({
  data,
  title = "Gamma Index",
  height = 350,
  className = "",
}: GammaIndexBarChartProps) {
  const titleId = useId();

  return (
    <section
      className={`w-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
      aria-labelledby={titleId}
    >
      <h2
        id={titleId}
        className="mb-1 text-lg font-semibold text-slate-900"
      >
        {title}
      </h2>

      <p className="mb-5 text-sm text-slate-500">
        Gamma Index values across scan samples
      </p>

      <div style={{ width: "100%", height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 15,
              right: 15,
              left: 0,
              bottom: 20,
            }}
            barCategoryGap="25%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
              vertical={false}
            />

            <XAxis
              dataKey="sample"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#64748b",
                fontSize: 12,
              }}
              tickMargin={10}
              label={{
                value: "Samples Codes",
                position: "insideBottom",
                offset: -12,
                fill: "#64748b",
                fontSize: 12,
              }}
            />

            <YAxis
              domain={[0, 1]}
              ticks={[0, 0.25, 0.5, 0.75, 1]}
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#64748b",
                fontSize: 12,
              }}
              tickFormatter={(value: number) =>
                value.toFixed(2).replace(/\.?0+$/, "")
              }
            />

            <Tooltip
              cursor={{ fill: "#f1f5f9" }}
              formatter={(value) => [
                Number(value).toFixed(2),
                "Gamma Index",
              ]}
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                boxShadow:
                  "0 4px 12px rgba(0,0,0,0.08)",
              }}
            />

            <Bar
              dataKey="gammaIndex"
              name="Gamma Index"
              fill="#8884d8"
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
              isAnimationActive
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
