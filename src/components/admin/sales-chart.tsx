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
import { formatPrice } from "@/lib/utils";

export type SalesPoint = {
  date: string;
  label: string;
  total: number;
  orders: number;
};

export function SalesChart({ data }: { data: SalesPoint[] }) {
  return (
    <div className="card-surface p-5">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-foreground">المبيعات آخر 7 أيام</h3>
        <p className="text-sm text-muted">إجمالي المبيعات اليومية من الطلبات</p>
      </div>
      <div className="h-72 w-full" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#6b5f7a" }} />
            <YAxis
              tick={{ fontSize: 12, fill: "#6b5f7a" }}
              tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
              width={48}
            />
            <Tooltip
              formatter={(value) => [formatPrice(Number(value ?? 0)), "المبيعات"]}
              labelFormatter={(_, payload) =>
                payload?.[0]?.payload?.date
                  ? String(payload[0].payload.date)
                  : ""
              }
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e8e0f0",
                direction: "rtl",
              }}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#6b21a8"
              strokeWidth={2.5}
              fill="url(#salesFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
