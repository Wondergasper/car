"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, Download, Clock, CheckCircle, Loader2, AlertCircle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { auditsApi } from "@/lib/api";

interface Audit {
  id: string;
  name: string;
  audit_type: string;
  status: "in_progress" | "completed" | "failed" | "pending";
  compliance_score: number | null;
  findings_count: number;
  critical_count: number;
  progress: number;
  created_at: string;
  completed_at: string | null;
}

interface AuditDiff {
  score_delta: number | null;
  regressions: number;
  improvements: number;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  completed: { label: "Completed", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: CheckCircle },
  in_progress: { label: "In Progress", color: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: Loader2 },
  pending: { label: "Pending", color: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: Clock },
  failed: { label: "Failed", color: "bg-red-500/10 text-red-400 border-red-500/20", icon: AlertCircle },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function LiveProgressBar({ auditId, initialProgress }: { auditId: string; initialProgress: number }) {
  const [progress, setProgress] = useState(initialProgress);
  
  useEffect(() => {
    const url = auditsApi.progressWsUrl(auditId);
    const ws = new WebSocket(url);
    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        if (data.progress !== undefined) setProgress(data.progress);
      } catch {}
    };
    return () => ws.close();
  }, [auditId]);

  const pct = Math.round(progress);
  return (
    <div className="mt-3">
      <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
        <span>Processing Pipeline</span>
        <span className="text-brand-cyan">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden border border-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-blue to-brand-cyan transition-all duration-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function RecentAudits() {
  const { data: audits = [], isLoading, error } = useQuery({
    queryKey: ["audits-list"],
    queryFn: async () => {
      const res = await auditsApi.list(0, 10);
      return res.data;
    },
    staleTime: 30000,
  });

  return (
    <div className="glass-card rounded-[2.5rem] p-8 border border-white/5 bg-white/[0.01] h-full flex flex-col">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-white tracking-tight">Recent <span className="text-gradient">Audits</span></h3>
        <p className="text-sm text-gray-500 font-medium">Verification reports and discovery logs.</p>
      </div>

      <div className="flex flex-col gap-4 flex-1 overflow-y-auto max-h-[520px] pr-2 custom-scrollbar">
        {isLoading && (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-3xl border border-white/5 bg-white/[0.02] animate-pulse" />
          ))
        )}

        {!isLoading && error && (
          <div className="text-center py-10 opacity-50">
            <AlertCircle className="h-10 w-10 text-status-error mx-auto mb-3" />
            <p className="text-sm font-bold text-white uppercase tracking-widest">Load Failure</p>
          </div>
        )}

        {!isLoading && audits.length === 0 && (
          <div className="text-center py-20 px-4 rounded-[2.5rem] border border-dashed border-white/5">
            <FileText className="h-10 w-10 text-gray-700 mx-auto mb-4" />
            <p className="text-white font-bold">No Audit Activity</p>
            <p className="text-xs text-gray-500 mt-2">Historical verification records will appear here.</p>
          </div>
        )}

        {audits.map((audit: Audit) => {
          const cfg = statusConfig[audit.status] ?? statusConfig.pending;
          const StatusIcon = cfg.icon;

          return (
            <div
              key={audit.id}
              className="flex flex-col p-5 rounded-[2rem] border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-brand-purple/10 flex items-center justify-center border border-brand-purple/20 flex-shrink-0 group-hover:bg-brand-purple/20 transition-all">
                    <FileText className="h-6 w-6 text-brand-purple" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white group-hover:text-brand-purple transition-colors truncate">
                      {audit.name}
                    </p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter mt-0.5">
                      {(audit.audit_type || "manual_audit").replace("_", " ")} • {formatDate(audit.created_at)}
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase border flex-shrink-0 ${cfg.color}`}>
                  <StatusIcon className={`h-3 w-3 ${audit.status === "in_progress" ? "animate-spin" : ""}`} />
                  <span>{cfg.label}</span>
                </span>
              </div>

              {audit.status === "in_progress" && (
                <LiveProgressBar auditId={audit.id} initialProgress={audit.progress || 0} />
              )}

              {audit.status === "completed" && (
                <div className="mt-6 flex items-center justify-between">
                    <div className="flex gap-4">
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">Score</p>
                            <p className="text-sm font-bold text-white">{audit.compliance_score}%</p>
                        </div>
                        <div className="text-center border-l border-white/5 pl-4">
                            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">Findings</p>
                            <p className="text-sm font-bold text-white">{audit.findings_count}</p>
                        </div>
                    </div>
                    <button 
                        className="p-2 rounded-xl bg-white/5 text-gray-500 hover:text-brand-cyan hover:bg-brand-cyan/10 transition-all"
                        title="Download Report"
                    >
                        <Download className="h-4 w-4" />
                    </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
