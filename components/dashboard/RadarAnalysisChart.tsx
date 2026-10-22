"use client";

import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import type {
  RadarChartPoint,
} from "@/types/dashboard";

type RadarAnalysisChartProps = {
  data: RadarChartPoint[];
};

export default function RadarAnalysisChart({
  data,
}: RadarAnalysisChartProps) {
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
      <div className="h-[300px] w-full sm:h-[350px] lg:h-[400px]">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <RadarChart
            data={data}
            outerRadius="68%"
          >
            <PolarGrid />

            <PolarAngleAxis
              dataKey="subject"
              tick={{
                fontSize: 11,
                fill: "#64748b",
              }}
            />

            <Tooltip
              contentStyle={{
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                fontSize: "12px",
              }}
            />

            <Radar
              name="Element 1"
              dataKey="value"
              stroke="#3b82c4"
              fill="#3b82c4"
              fillOpacity={0.45}
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