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
import type { Severity } from "@/lib/acclimatization";
import type { Day } from "@/lib/types";

const RULES_START_M = 3000;
// Theme tokens from app/globals.css, so the chart follows the light/dark toggle.
const DOT_COLORS = { ok: "var(--chart-line)", warning: "var(--warning)", high: "var(--danger)" };
const TICK = { fontSize: 12, fill: "var(--fg-muted)" };

type Props = {
  days: Day[];
  severities: (Severity | null)[];
  summitAltitude: number | null;
};

export function ElevationChart({ days, severities, summitAltitude }: Props) {
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
              <stop offset="0%" stopColor="var(--chart-line)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--chart-line)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
          <XAxis
            dataKey="day"
            tickFormatter={(d) => `D${d}`}
            tick={TICK}
            axisLine={{ stroke: "var(--line-strong)" }}
            tickLine={{ stroke: "var(--line-strong)" }}
          />
          <YAxis
            domain={domain}
            tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}k`}
            tick={TICK}
            axisLine={{ stroke: "var(--line-strong)" }}
            tickLine={{ stroke: "var(--line-strong)" }}
            width={40}
          />
          <Tooltip
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: 8,
              boxShadow: "0 4px 12px rgb(0 0 0 / 0.12)",
              fontSize: 13,
            }}
            labelStyle={{ color: "var(--fg)", fontWeight: 500 }}
            itemStyle={{ color: "var(--fg-muted)" }}
            cursor={{ stroke: "var(--line-strong)" }}
            formatter={(value) => [meters(Number(value)), "Sleeping altitude"]}
            labelFormatter={(_, payload) => {
              const p = payload?.[0]?.payload as { day: number; camp: string } | undefined;
              return p ? `Day ${p.day}: ${p.camp}` : "";
            }}
          />
          <ReferenceLine
            y={RULES_START_M}
            stroke="var(--fg-subtle)"
            strokeDasharray="4 4"
            label={{
              value: "3,000m: acclimatization rules apply",
              position: "insideBottomRight",
              fontSize: 11,
              fill: "var(--fg-muted)",
            }}
          />
          {summitAltitude && (
            <ReferenceLine
              y={summitAltitude}
              stroke="var(--info)"
              strokeDasharray="6 3"
              label={{
                value: `Summit ${meters(summitAltitude)}`,
                position: "insideTopRight",
                fontSize: 11,
                fill: "var(--info-fg)",
              }}
            />
          )}
          <Area
            type="linear"
            dataKey="altitude"
            stroke="var(--chart-line)"
            strokeWidth={2}
            fill="url(#altitudeFill)"
            dot={({ cx, cy, index }: { cx?: number; cy?: number; index?: number }) => {
              const severity = index === undefined ? null : severities[index];
              return (
                <circle
                  key={index}
                  cx={cx}
                  cy={cy}
                  r={severity ? 5 : 3}
                  fill={DOT_COLORS[severity ?? "ok"]}
                  stroke="var(--surface)"
                  strokeWidth={severity ? 1.5 : 0}
                />
              );
            }}
            activeDot={{ r: 5, fill: "var(--chart-line)", stroke: "var(--surface)" }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
