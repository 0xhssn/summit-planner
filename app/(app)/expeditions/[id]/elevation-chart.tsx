"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { meters } from "@/lib/format";
import type { Day } from "@/lib/types";

const RULES_START_M = 3000;

export function ElevationChart({ days, summitAltitude }: { days: Day[]; summitAltitude: number | null }) {
  const data = days.map((d, i) => ({ day: i + 1, camp: d.camp_name, altitude: d.sleep_altitude_m }));
  const altitudes = days.map((d) => d.sleep_altitude_m);
  const top = Math.max(...altitudes, summitAltitude ?? 0);
  const bottom = Math.min(...altitudes, RULES_START_M);
  const domain = [Math.floor((bottom - 300) / 500) * 500, Math.ceil((top + 200) / 500) * 500];

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 24, right: 16, bottom: 0, left: 8 }}>
          <defs>
            <linearGradient id="altitudeFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f172a" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#0f172a" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="day" tickFormatter={(d) => `D${d}`} tick={{ fontSize: 12, fill: "#64748b" }} />
          <YAxis
            domain={domain}
            tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}k`}
            tick={{ fontSize: 12, fill: "#64748b" }}
            width={40}
          />
          <Tooltip
            formatter={(value) => [meters(Number(value)), "Sleeping altitude"]}
            labelFormatter={(_, payload) => {
              const p = payload?.[0]?.payload as { day: number; camp: string } | undefined;
              return p ? `Day ${p.day}: ${p.camp}` : "";
            }}
          />
          <ReferenceLine
            y={RULES_START_M}
            stroke="#94a3b8"
            strokeDasharray="4 4"
            label={{ value: "3,000m: acclimatization rules apply", position: "insideBottomRight", fontSize: 11, fill: "#64748b" }}
          />
          {summitAltitude && (
            <ReferenceLine
              y={summitAltitude}
              stroke="#0ea5e9"
              strokeDasharray="6 3"
              label={{ value: `Summit ${meters(summitAltitude)}`, position: "insideTopRight", fontSize: 11, fill: "#0369a1" }}
            />
          )}
          <Area
            type="linear"
            dataKey="altitude"
            stroke="#0f172a"
            strokeWidth={2}
            fill="url(#altitudeFill)"
            dot={{ r: 3, fill: "#0f172a" }}
            activeDot={{ r: 5 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
