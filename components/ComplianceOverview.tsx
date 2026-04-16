"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { auditsApi } from "@/lib/api";

interface AuditPoint {
  month: string;
  score: number;
}

function buildTrend(audits: any[]): AuditPoint[] {
  // Group completed audits by month and average their compliance_score
  const byMonth: Record<string, number[]> = {};
  audits
    .filter((a) => a.status === "completed" && a.compliance_score !== null)
    .forEach((a) => {
      const label = new Date(a.created_at).toLocaleString("en-US", { month: "short" });
      if (!byMonth[label]) byMonth[label] = [];
      byMonth[label].push(a.compliance_score);
    });

  const result = Object.entries(byMonth).map(([month, scores]) => ({
    month,
    score: Math.round(scores.reduce((s, v) => s + v, 0) / scores.length),
  }));

  // Return last 6 months; fallback to placeholder if no data
  return result.length > 0
    ? result.slice(-6)
    : [
        { month: "Jan", score: 0 },
        { month: "Feb", score: 0 },
        { month: "Mar", score: 0 },
        { month: "Apr", score: 0 },
        { month: "May", score: 0 },
        { month: "Jun", score: 0 },
      ];
}

export default function ComplianceOverview() {
  const [data, setData] = useState<AuditPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    auditsApi
      .list()
      .then((res) => setData(buildTrend(res.data)))
      .catch(() =>
        setData([
          { month: "Jan", score: 0 },
          { month: "Feb", score: 0 },
          { month: "Mar", score: 0 },
          { month: "Apr", score: 0 },
          { month: "May", score: 0 },
          { month: "Jun", score: 0 },
        ])
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/10 rounded-full blur-[80px] -z-10" />
      <h3 className="text-xl font-bold text-white">Compliance Score Trend</h3>
      <p className="text-sm text-gray-400 mt-1 mb-8">
        Your overall compliance score over the last 6 months
      </p>
      <div className="h-72">
        {loading ? (
          <div className="h-full rounded-xl bg-white/[0.02] animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00dfd8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#00dfd8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" stroke="#94a3b8" axisLine={false} tickLine={false} dy={10} />
              <YAxis stroke="#94a3b8" domain={[0, 100]} axisLine={false} tickLine={false} dx={-10} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                itemStyle={{ color: "#00dfd8", fontWeight: "bold" }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#00dfd8"
                strokeWidth={3}
                dot={{ fill: "#030712", stroke: "#00dfd8", strokeWidth: 2, r: 4 }}
                activeDot={{ fill: "#00dfd8", stroke: "#ffffff", strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
