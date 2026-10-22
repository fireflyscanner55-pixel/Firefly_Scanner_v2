"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type {
  MonthlyBarChartPoint,
} from "@/types/dashboard";

type MonthlyBarChartProps = {
  data: MonthlyBarChartPoint[];
};

export default function MonthlyBarChart({
  data,
}: MonthlyBarChartProps) {
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
      <div className="h-[240px] w-full sm:h-[280px] lg:h-[300px]">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <BarChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid
              vertical={false}
              stroke="#cbd5e1"
              strokeOpacity={0.8}
            />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 10,
                fill: "#64748b",
              }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 10,
                fill: "#64748b",
              }}
              width={40}
            />

            <Tooltip
              cursor={{
                fill: "rgba(59,130,196,0.08)",
              }}
              contentStyle={{
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                fontSize: "12px",
              }}
            />

            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="square"
              iconSize={8}
              wrapperStyle={{
                fontSize: "11px",
                paddingTop: "12px",
              }}
            />

            <Bar
              dataKey="value"
              name="Element 1"
              fill="#3b82c4"
              radius={[0, 0, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}