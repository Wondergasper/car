"use client";

import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { RefreshCw } from "lucide-react";
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
  if (result.length === 0) {
    return [
      { month: "Jan", score: 0 },
      { month: "Feb", score: 0 },
      { month: "Mar", score: 0 },
      { month: "Apr", score: 0 },
      { month: "May", score: 0 },
      { month: "Jun", score: 0 },
    ];
  }

  return result.slice(-6);
}

export default function ComplianceOverview() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["audits-list"], // Shared query key
    queryFn: async () => {
      const res = await auditsApi.list();
      return buildTrend(res.data);
    },
    staleTime: 60000,
  });

  return (
    <div className="glass-card rounded-[2.5rem] p-8 border border-white/5 bg-white/[0.01] relative overflow-hidden group">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cyan/5 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Header */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-white tracking-tight">Compliance <span className="text-gradient">Trend</span></h3>
        <p className="text-sm text-gray-500 font-medium">Historical performance audit results across all data channels.</p>
      </div>

      {/* Chart Container */}
      <div className="h-72 w-full">
        {isLoading ? (
          <div className="h-full rounded-2xl bg-white/[0.02] animate-pulse flex items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-brand-cyan/20" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={data}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis 
                dataKey="month" 
                stroke="#475569" 
                axisLine={false} 
                tickLine={false} 
                dy={10}
                tick={{ fontSize: 10, fontWeight: 600 }}
              />
              <YAxis 
                stroke="#475569" 
                domain={[0, 100]} 
                axisLine={false} 
                tickLine={false} 
                dx={-10}
                tick={{ fontSize: 10, fontWeight: 600 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "16px",
                  color: "#fff",
                  boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.5)",
                }}
                itemStyle={{ color: "#06b6d4", fontWeight: "bold" }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#06b6d4"
                strokeWidth={4}
                dot={{ fill: "#0f172a", stroke: "#06b6d4", strokeWidth: 2, r: 5 }}
                activeDot={{ 
                  fill: "#06b6d4", 
                  stroke: "#ffffff", 
                  strokeWidth: 2, 
                  r: 7
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
