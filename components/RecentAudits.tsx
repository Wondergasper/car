"use client";

import { useEffect, useState } from "react";
import { FileText, Download, Clock, CheckCircle, Loader2 } from "lucide-react";
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
    <div className="glass-card rounded-2xl p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">Recent Audits</h3>
          <p className="text-sm text-gray-400 mt-1">Latest compliance reports</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        {loading && (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-xl border border-white/5 bg-white/[0.02] animate-pulse" />
            ))}
          </>
        )}

        {!loading && error && (
          <p className="text-sm text-red-400 text-center py-6">{error}</p>
        )}

        {!loading && !error && audits.length === 0 && (
          <div className="text-center py-10">
            <FileText className="h-8 w-8 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No audits yet — generate your first audit.</p>
          </div>
        )}

        {!loading && !error && audits.map((audit) => {
          const cfg = statusConfig[audit.status] ?? statusConfig.pending;
          const StatusIcon = cfg.icon;
          return (
            <div
              key={audit.id}
              className="flex flex-col gap-3 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors group cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-brand-purple/10 flex items-center justify-center border border-brand-purple/20">
                    <FileText className="h-5 w-5 text-brand-purple" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white group-hover:text-brand-purple transition-colors line-clamp-1">
                      {audit.name}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {audit.audit_type.replace("_", " ")} • {formatDate(audit.created_at)}
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border ${cfg.color}`}>
                  <StatusIcon className="h-3 w-3" />
                  {cfg.label}
                </span>
              </div>

              {audit.compliance_score !== null && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>Score: <strong className="text-white">{audit.compliance_score}%</strong></span>
                  <span>·</span>
                  <span>Findings: <strong className="text-white">{audit.findings_count}</strong></span>
                </div>
              )}

              {audit.status === "completed" && (
                <button
                  onClick={() => handleDownload(audit.id, audit.name)}
                  className="flex items-center w-full justify-center gap-2 mt-1 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium text-white transition-colors border border-white/10"
                >
                  <Download className="h-4 w-4" /> Download Report
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
