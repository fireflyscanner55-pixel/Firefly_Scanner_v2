"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { LineChartPoint } from "@/types/dashboard";

type MultiLineChartProps = {
  data: LineChartPoint[];
};

export default function MultiLineChart({
  data,
}: MultiLineChartProps) {
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
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
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
              dataKey="label"
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
              width={35}
            />

            <Tooltip
              contentStyle={{
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                fontSize: "12px",
              }}
            />

            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="line"
              iconSize={14}
              wrapperStyle={{
                fontSize: "11px",
                paddingTop: "12px",
              }}
            />

            <Line
              type="monotone"
              dataKey="alpha"
              name="Alpha"
              stroke="#3b82c4"
              strokeWidth={1.5}
              dot={{
                r: 0,
              }}
              activeDot={{
                r: 4,
              }}
            />

            <Line
              type="monotone"
              dataKey="beta"
              name="Beta"
              stroke="#b95a52"
              strokeWidth={1.5}
              dot={{
                r: 0,
              }}
              activeDot={{
                r: 4,
              }}
            />

            <Line
              type="monotone"
              dataKey="gamma"
              name="Gamma"
              stroke="#438b62"
              strokeWidth={1.5}
              dot={{
                r: 0,
              }}
              activeDot={{
                r: 4,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}