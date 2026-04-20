"use client";

import { useEffect, useState, useRef } from "react";
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
  completed: { label: "Completed", color: "bg-green-500/10 text-green-400 border-green-500/20", icon: CheckCircle },
  in_progress: { label: "In Progress", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", icon: Loader2 },
  pending: { label: "Pending", color: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: Clock },
  failed: { label: "Failed", color: "bg-red-500/10 text-red-400 border-red-500/20", icon: AlertCircle },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

async function handleDownload(auditId: string, auditName: string) {
  try {
    const res = await auditsApi.download(auditId);
    const { download_url } = res.data;
    const link = document.createElement("a");
    link.href = download_url;
    link.download = auditName;
    link.click();
  } catch {
    alert("Report is not yet available for download.");
  }
}

/** Live progress bar for in_progress audits using WebSocket */
function LiveProgressBar({ auditId, initialProgress }: { auditId: string; initialProgress: number }) {
  const [progress, setProgress] = useState(initialProgress);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const url = auditsApi.progressWsUrl(auditId);
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        if (data.progress !== undefined) setProgress(data.progress);
      } catch {}
    };

    ws.onerror = () => ws.close();
    return () => ws.close();
  }, [auditId]);

  const pct = Math.round(progress);
  return (
    <div className="mt-1">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Processing…</span>
        <span className="text-brand-cyan font-medium">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-blue to-brand-cyan transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/** Score delta badge */
function DeltaBadge({ delta }: { delta: number }) {
  if (delta > 0) return (
    <span className="inline-flex items-center gap-0.5 text-xs text-green-400">
      <TrendingUp className="h-3 w-3" /> +{delta}%
    </span>
  );
  if (delta < 0) return (
    <span className="inline-flex items-center gap-0.5 text-xs text-red-400">
      <TrendingDown className="h-3 w-3" /> {delta}%
    </span>
  );
  return <span className="inline-flex items-center gap-0.5 text-xs text-gray-500"><Minus className="h-3 w-3" /> 0%</span>;
}

export default function RecentAudits() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [diffs, setDiffs] = useState<Record<string, AuditDiff>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    auditsApi
      .list(0, 5)
      .then(async (res) => {
        const data: Audit[] = res.data;
        setAudits(data);

        // Fetch diff for completed audits (non-blocking)
        const diffResults: Record<string, AuditDiff> = {};
        await Promise.allSettled(
          data
            .filter((a) => a.status === "completed")
            .map(async (a) => {
              try {
                const d = await auditsApi.diff(a.id);
                diffResults[a.id] = d.data;
              } catch {}
            })
        );
        setDiffs(diffResults);
      })
      .catch(() => setError("Failed to load audits."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="glass-card rounded-xl sm:rounded-2xl p-6 h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl sm:text-2xl font-bold text-white">Recent Audits</h3>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">Latest compliance reports</p>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 sm:gap-4 flex-1 overflow-y-auto max-h-[480px]">
        {loading && (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-xl border border-white/5 bg-white/[0.02] animate-pulse" role="status" />
            ))}
          </>
        )}

        {!loading && error && (
          <div className="text-center py-6 px-4">
            <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {!loading && !error && audits.length === 0 && (
          <div className="text-center py-10 px-4">
            <FileText className="h-8 w-8 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400 text-xs sm:text-sm font-medium">No audits yet</p>
            <p className="text-gray-500 text-xs mt-1">Generate your first audit to see results.</p>
          </div>
        )}

        {!loading && !error && audits.map((audit) => {
          const cfg = statusConfig[audit.status] ?? statusConfig.pending;
          const StatusIcon = cfg.icon;
          const diff = diffs[audit.id];

          return (
            <div
              key={audit.id}
              className="flex flex-col gap-3 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all group"
              role="article"
              aria-label={`Audit: ${audit.name}`}
            >
              {/* Top Row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="h-10 w-10 rounded-lg bg-brand-purple/10 flex items-center justify-center border border-brand-purple/20 flex-shrink-0">
                    <FileText className="h-5 w-5 text-brand-purple" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-white group-hover:text-brand-purple transition-colors truncate">
                      {audit.name}
                    </p>
                    <p className="text-xs text-gray-500 capitalize mt-0.5">
                      {audit.audit_type.replace("_", " ")} • {formatDate(audit.created_at)}
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border flex-shrink-0 ${cfg.color}`}>
                  <StatusIcon className={`h-3 w-3 ${audit.status === "in_progress" ? "animate-spin" : ""}`} />
                  <span>{cfg.label}</span>
                </span>
              </div>

              {/* Live Progress Bar for in_progress */}
              {audit.status === "in_progress" && (
                <LiveProgressBar auditId={audit.id} initialProgress={audit.progress || 0} />
              )}

              {/* Score + Diff Row */}
              {audit.compliance_score !== null && (
                <div className="flex items-center gap-3 text-xs text-gray-500 px-0.5">
                  <span>Score: <strong className="text-white">{audit.compliance_score}%</strong></span>
                  <span>·</span>
                  <span>Findings: <strong className="text-white">{audit.findings_count}</strong></span>
                  {audit.critical_count > 0 && (
                    <>
                      <span>·</span>
                      <span className="text-red-400 font-medium">{audit.critical_count} critical</span>
                    </>
                  )}
                  {diff?.score_delta !== null && diff?.score_delta !== undefined && (
                    <>
                      <span>·</span>
                      <DeltaBadge delta={diff.score_delta} />
                    </>
                  )}
                </div>
              )}

              {/* Download Button */}
              {audit.status === "completed" && (
                <button
                  onClick={() => handleDownload(audit.id, audit.name)}
                  className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs sm:text-sm font-medium text-white transition-all border border-white/10"
                  aria-label={`Download ${audit.name} report`}
                >
                  <Download className="h-4 w-4" />
                  <span>Download Report</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
