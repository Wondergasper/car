"use client";

import { useEffect, useState } from "react";
import { Shield, Check, AlertTriangle, Info, Loader2 } from "lucide-react";
import { rulesApi } from "@/lib/api";

interface Rule {
  rule_id: string;
  article: string;
  title: string;
  category: string | null;
  description: string;
  severity_default: string;
  is_active: boolean;
}

const categoryIcons: Record<string, any> = {
  "Data Privacy": Shield,
  "Access Control": Check,
  Security: AlertTriangle,
  "Data Subject Rights": Info,
};

const severityColors: Record<string, string> = {
  critical: "bg-red-500/10 text-red-400 border-red-500/20",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  low: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

export default function RulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    rulesApi
      .list()
      .then((res) => setRules(res.data))
      .catch(() => setError("Failed to load compliance rules."))
      .finally(() => setLoading(false));
  }, []);

  const categories = ["all", ...Array.from(new Set(rules.map((r) => r.category ?? "Other")))];
  const filtered = filter === "all" ? rules : rules.filter((r) => (r.category ?? "Other") === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Compliance Rules</h1>
          <p className="text-gray-400 mt-1">
            NDPA 2023 &amp; GAID 2025 rules used by CAR-Bot during auditing
          </p>
        </div>
        {!loading && (
          <span className="rounded-full bg-brand-blue/10 border border-brand-blue/20 px-3 py-1 text-sm font-medium text-brand-blue">
            {rules.length} rules active
          </span>
        )}
      </div>

      {/* Category filter tabs */}
      {!loading && !error && (
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-all ${
                filter === cat
                  ? "bg-brand-blue border-brand-blue text-white"
                  : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
              }`}
            >
              {cat === "all" ? "All" : cat}
            </button>
          ))}
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-6 animate-pulse h-28" />
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="glass-card rounded-2xl p-8 text-center">
          <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-3" />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Rules list */}
      {!loading && !error && (
        <div className="space-y-4">
          {filtered.length === 0 && (
            <div className="glass-card rounded-2xl p-10 text-center">
              <Shield className="h-8 w-8 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No rules found for this category.</p>
            </div>
          )}
          {filtered.map((rule) => {
            const Icon = categoryIcons[rule.category ?? ""] ?? Shield;
            const sevColor = severityColors[rule.severity_default?.toLowerCase()] ?? severityColors.low;
            return (
              <div
                key={rule.rule_id}
                className="glass-card rounded-2xl p-6 flex items-start gap-x-5 group hover:border-white/10 transition-all"
              >
                <div className="h-12 w-12 shrink-0 rounded-xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center group-hover:bg-brand-blue/20 transition-colors">
                  <Icon className="h-6 w-6 text-brand-blue" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <h3 className="text-base font-semibold text-white">{rule.title}</h3>
                      <p className="text-sm text-brand-blue/80 mt-0.5">
                        {rule.article} &bull; <span className="font-mono text-xs text-gray-500">{rule.rule_id}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${sevColor}`}>
                        {rule.severity_default}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-xs font-medium text-gray-400">
                        {rule.category ?? "General"}
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-400 leading-relaxed">{rule.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
