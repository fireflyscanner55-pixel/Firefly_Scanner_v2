"use client";

import {
  Area,
  AreaChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { CombinedChartPoint } from "@/types/dashboard";

type CombinedAreaChartProps = {
  data: CombinedChartPoint[];
};

export default function CombinedAreaChart({
  data,
}: CombinedAreaChartProps) {
  return (
    <section
      className="
        overflow-hidden
        bg-white
        px-3
        pb-4
        pt-4
        shadow-[0_10px_30px_rgba(15,23,42,0.06)]
        sm:px-5
        sm:pb-5
      "
    >
      {/* Chart */}

      <div className="h-[220px] w-full sm:h-[260px] lg:h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 5,
              left: -20,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient
                id="alphaArea"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#3b82c4"
                  stopOpacity={0.9}
                />
                <stop
                  offset="100%"
                  stopColor="#3b82c4"
                  stopOpacity={0.7}
                />
              </linearGradient>

              <linearGradient
                id="betaArea"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#e33131"
                  stopOpacity={0.9}
                />
                <stop
                  offset="100%"
                  stopColor="#e33131"
                  stopOpacity={0.75}
                />
              </linearGradient>

              <linearGradient
                id="gammaArea"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#16a02b"
                  stopOpacity={0.9}
                />
                <stop
                  offset="100%"
                  stopColor="#16a02b"
                  stopOpacity={0.75}
                />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="label"
              tick={false}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              hide
              domain={[0, "dataMax"]}
            />

            <Tooltip
              contentStyle={{
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
                fontSize: "12px",
              }}
            />

            <Area
              type="monotone"
              dataKey="alpha"
              name="Alpha"
              stroke="#3b82c4"
              fill="url(#alphaArea)"
              strokeWidth={1}
            />

            <Area
              type="monotone"
              dataKey="beta"
              name="Beta"
              stroke="#e33131"
              fill="url(#betaArea)"
              strokeWidth={1}
            />

            <Area
              type="monotone"
              dataKey="gamma"
              name="Gamma"
              stroke="#16a02b"
              fill="url(#gammaArea)"
              strokeWidth={1}
            />

            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              iconSize={7}
              wrapperStyle={{
                fontSize: "12px",
                paddingTop: "8px",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}