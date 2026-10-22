"use client";

import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import type { PolarChartPoint } from "@/types/dashboard";

type PolarAnalysisChartProps = {
  data: PolarChartPoint[];
};

export default function PolarAnalysisChart({
  data,
}: PolarAnalysisChartProps) {
  return (
    <section
      className="
        overflow-hidden
        bg-white
        px-3
        py-4
        shadow-[0_10px_30px_rgba(15,23,42,0.06)]
        sm:px-5
        sm:py-5
      "
    >
      <div className="h-[320px] w-full sm:h-[380px] lg:h-[430px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            data={data}
            cx="50%"
            cy="50%"
            outerRadius="70%"
          >
            <PolarGrid
              gridType="circle"
            />

            <PolarAngleAxis
              dataKey="name"
              tick={{
                fontSize: 11,
                fill: "#64748b",
              }}
            />

            <PolarRadiusAxis
              tick={{
                fontSize: 9,
                fill: "#94a3b8",
              }}
              axisLine={false}
            />

            <Tooltip
              contentStyle={{
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                fontSize: "12px",
              }}
            />

            <Radar
              name="Radioactivity Level"
              dataKey="value"
              stroke="#3b82c4"
              fill="#3b82c4"
              fillOpacity={0.4}
              strokeWidth={1.5}
              isAnimationActive={false}
            />

            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{
                fontSize: "11px",
                paddingTop: "8px",
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}