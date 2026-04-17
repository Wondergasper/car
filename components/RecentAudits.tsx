"use client";

import { useEffect, useState } from "react";
import { FileText, Download, Clock, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { auditsApi } from "@/lib/api";

interface Audit {
  id: string;
  name: string;
  audit_type: string;
  status: "in_progress" | "completed" | "failed" | "pending";
  compliance_score: number | null;
  findings_count: number;
  created_at: string;
  completed_at: string | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  completed: { label: "Completed", color: "bg-green-500/10 text-green-400 border-green-500/20", icon: CheckCircle },
  in_progress: { label: "In Progress", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", icon: Loader2 },
  pending: { label: "Pending", color: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: Clock },
  failed: { label: "Failed", color: "bg-red-500/10 text-red-400 border-red-500/20", icon: FileText },
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

export default function RecentAudits() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    auditsApi
      .list()
      .then((res) => setAudits(res.data.slice(0, 5))) // show last 5
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
      <div className="flex flex-col gap-3 sm:gap-4 flex-1 overflow-y-auto max-h-96">
        {/* Loading State */}
        {loading && (
          <>
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className="h-20 rounded-xl border border-white/5 bg-white/[0.02] animate-pulse"
                role="status"
                aria-label="Loading audit"
              />
            ))}
          </>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="text-center py-6 px-4">
            <AlertCircle className="h-8 w-8 text-status-error mx-auto mb-2" aria-hidden="true" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && audits.length === 0 && (
          <div className="text-center py-10 px-4">
            <FileText className="h-8 w-8 text-gray-600 mx-auto mb-2" aria-hidden="true" />
            <p className="text-gray-400 text-xs sm:text-sm font-medium">No audits yet</p>
            <p className="text-gray-500 text-xs mt-1">Generate your first audit to see results.</p>
          </div>
        )}

        {/* Audit List */}
        {!loading && !error && audits.map((audit, index) => {
          const cfg = statusConfig[audit.status] ?? statusConfig.pending;
          const StatusIcon = cfg.icon;
          return (
            <div
              key={audit.id}
              className="flex flex-col gap-3 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all group focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-accent focus-within:ring-offset-background"
              role="article"
              aria-label={`Audit: ${audit.name}`}
            >
              {/* Top Row: Icon, Info, Status */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="h-10 w-10 rounded-lg bg-brand-purple/10 flex items-center justify-center border border-brand-purple/20 flex-shrink-0">
                    <FileText className="h-5 w-5 text-brand-purple" aria-hidden="true" />
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
                  <StatusIcon className="h-3 w-3" aria-hidden="true" />
                  <span>{cfg.label}</span>
                </span>
              </div>

              {/* Score and Findings */}
              {audit.compliance_score !== null && (
                <div className="flex items-center gap-2 text-xs text-gray-500 px-0.5">
                  <span>Score: <strong className="text-white">{audit.compliance_score}%</strong></span>
                  <span>·</span>
                  <span>Findings: <strong className="text-white">{audit.findings_count}</strong></span>
                </div>
              )}

              {/* Download Button */}
              {audit.status === "completed" && (
                <button
                  onClick={() => handleDownload(audit.id, audit.name)}
                  className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 active:bg-white/15 text-xs sm:text-sm font-medium text-white transition-all border border-white/10 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent focus-visible:ring-offset-background"
                  aria-label={`Download ${audit.name} report`}
                  title="Download report"
                >
                  <Download className="h-4 w-4" aria-hidden="true" /> 
                  <span>Download</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
