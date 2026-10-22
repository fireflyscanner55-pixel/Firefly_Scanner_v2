"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type {
  MonthlyAreaChartPoint,
} from "@/types/dashboard";

type MonthlyAreaChartProps = {
  data: MonthlyAreaChartPoint[];
};

export default function MonthlyAreaChart({
  data,
}: MonthlyAreaChartProps) {
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
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 5,
            }}
          >
            <defs>
              <linearGradient
                id="monthlyAreaGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="#3b82c4"
                  stopOpacity={0.85}
                />

                <stop
                  offset="95%"
                  stopColor="#3b82c4"
                  stopOpacity={0.15}
                />
              </linearGradient>
            </defs>

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
              contentStyle={{
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                fontSize: "12px",
              }}
            />

            <Area
              type="monotone"
              dataKey="value"
              name="Element 1"
              stroke="#3b82c4"
              strokeWidth={1.5}
              fill="url(#monthlyAreaGradient)"
              isAnimationActive={false}
              activeDot={{
                r: 4,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-1 flex justify-center">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 bg-[#3b82c4]" />

          <span className="text-[11px] text-slate-600">
            Element 1
          </span>
        </div>
      </div>
    </section>
  );
}