"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Eye,
  ExternalLink,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  FileCheck,
  Upload,
  X,
} from "lucide-react";
import { api, auditsApi } from "@/lib/api";

interface Audit {
  id: string;
  name: string;
  audit_type: string;
  status: "pending" | "in_progress" | "completed" | "failed" | "cancelled";
  progress: number;
  findings_count: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  compliance_score: number | null;
  scope?: {
    submitted_to_ndpc?: boolean;
    submitted_at?: string;
    ndpc_receipt_id?: string;
  } | null;
  report_storage_key?: string | null;
  report_generated_at?: string | null;
  created_at: string;
  completed_at: string | null;
}

interface FilingRecord {
  audit: Audit;
  document?: {
    id: string;
    title: string;
    status: string;
    storage_url: string | null;
    created_at: string;
  };
  submission_status: "draft" | "ready" | "submitted" | "accepted" | "rejected";
  submitted_at: string | null;
  ndpc_reference: string | null;
}

const statusConfig = {
  completed: { icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/10", label: "Completed" },
  in_progress: { icon: Clock, color: "text-blue-400", bg: "bg-brand-blue/10", label: "In Progress" },
  pending: { icon: Clock, color: "text-gray-400", bg: "bg-white/5", label: "Pending" },
  failed: { icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10", label: "Failed" },
  cancelled: { icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-500/10", label: "Cancelled" },
};

const submissionConfig = {
  draft: { icon: FileText, color: "text-gray-400", bg: "bg-white/5", label: "Draft" },
  ready: { icon: FileCheck, color: "text-blue-400", bg: "bg-brand-blue/10", label: "Ready to File" },
  submitted: { icon: Upload, color: "text-purple-400", bg: "bg-brand-purple/10", label: "Submitted" },
  accepted: { icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/10", label: "Accepted by NDPC" },
  rejected: { icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10", label: "Rejected" },
};

export default function FilingPortalPage() {
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const { data: audits, isLoading } = useQuery({
    queryKey: ["audits"],
    queryFn: async () => {
      const response = await api.get("/audits");
      return response.data as Audit[];
    },
  });

  const handleDownload = async (auditId: string) => {
    try {
      const response = await api.get(`/audits/${auditId}/download`);
      const { download_url } = response.data;
      window.open(download_url, "_blank");
    } catch (error) {
      console.error("Failed to download report:", error);
    }
  };

  const handleGenerateReport = async (auditId: string) => {
    try {
      console.log("Report generation is not available yet for audit:", auditId);
    } catch (error) {
      console.error("Failed to generate report:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Clock className="h-8 w-8 text-brand-blue animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading audits...</p>
        </div>
      </div>
    );
  }

  const completedAudits = audits?.filter((a) => a.status === "completed") || [];
  const inProgressAudits = audits?.filter((a) => a.status === "in_progress") || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Filing Portal</h1>
        <p className="text-gray-400 mt-1">
          Track audit status, generate CAR PDFs, and file with NDPC
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          label="Total Audits"
          value={audits?.length || 0}
          icon={FileText}
          color="text-gray-300"
        />
        <StatCard
          label="Completed"
          value={completedAudits.length}
          icon={CheckCircle}
          color="text-green-400"
        />
        <StatCard
          label="In Progress"
          value={inProgressAudits.length}
          icon={Clock}
          color="text-blue-400"
        />
        <StatCard
          label="Avg Score"
          value={
            completedAudits.length > 0
              ? `${Math.round(completedAudits.reduce((sum, a) => sum + (a.compliance_score || 0), 0) / completedAudits.length)}%`
              : "N/A"
          }
          icon={TrendingUp}
          color="text-brand-cyan"
        />
      </div>

      {/* In Progress Audits */}
      {inProgressAudits.length > 0 && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/5">
            <h3 className="font-semibold text-white">In Progress</h3>
          </div>
          <div className="divide-y divide-white/5">
            {inProgressAudits.map((audit) => (
              <div key={audit.id} className="p-5 bg-white/[0.01]">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-x-4">
                      <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{audit.name}</p>
                        <p className="text-xs text-gray-400">
                          Started {new Date(audit.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">{Math.round(audit.progress)}%</p>
                    </div>
                    <div className="w-32 bg-gray-800 rounded-full h-2 overflow-hidden border border-white/5">
                      <div
                        className="bg-brand-blue h-full rounded-full transition-all"
                        style={{ width: `${audit.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Audits / Filing Records */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h3 className="font-semibold text-white">Audit Reports & Filing Status</h3>
        </div>

        {completedAudits.length === 0 ? (
          <div className="p-12 text-center bg-white/[0.01]">
            <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10">
              <FileText className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-1">No completed audits yet</h3>
            <p className="text-gray-400 text-sm">
              Run your first audit to generate a CAR PDF report.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {completedAudits.map((audit) => (
              <AuditFilingCard
                key={audit.id}
                audit={audit}
                onDownload={handleDownload}
                onGenerateReport={handleGenerateReport}
                onView={() => {
                  setSelectedAudit(audit);
                  setShowPreview(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Report Preview Modal */}
      <AnimatePresence>
        {showPreview && selectedAudit && (
          <ReportPreviewModal
            audit={selectedAudit}
            onClose={() => {
              setShowPreview(false);
              setSelectedAudit(null);
            }}
            onDownload={() => handleDownload(selectedAudit.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/5 rounded-full blur-xl group-hover:bg-brand-blue/10 transition-colors" />
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-sm text-gray-400">{label}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  );
}

function AuditFilingCard({
  audit,
  onDownload,
  onGenerateReport,
  onView,
}: {
  audit: Audit;
  onDownload: (id: string) => void;
  onGenerateReport: (id: string) => void;
  onView: () => void;
}) {
  const score = audit.compliance_score || 0;
  const scoreColor = score >= 80 ? "text-green-400" : score >= 60 ? "text-yellow-400" : "text-red-400";
  const hasReport = Boolean(audit.report_storage_key);

  const submissionStatus: FilingRecord["submission_status"] =
    audit.scope?.submitted_to_ndpc ? "submitted" : hasReport ? "ready" : "draft";
  const SubIcon = submissionConfig[submissionStatus].icon;

  return (
    <div className="p-5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors group">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-x-4 mb-2">
            <h4 className="text-base font-semibold text-white group-hover:text-brand-cyan transition-colors">{audit.name}</h4>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border border-white/5 ${submissionConfig[submissionStatus].bg} ${submissionConfig[submissionStatus].color}`}>
              <SubIcon className="h-3 w-3 mr-1.5" />
              {submissionConfig[submissionStatus].label}
            </span>
          </div>

          <div className="flex items-center gap-x-5 text-sm text-gray-400">
            <span className="flex items-center gap-x-1.5">
              <Calendar className="h-4 w-4" />
              {new Date(audit.created_at).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-x-1.5">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <span className="text-white font-medium">{audit.critical_count}</span> critical
            </span>
            <span className="flex items-center gap-x-1.5">
              <AlertTriangle className="h-4 w-4 text-orange-400" />
              <span className="text-white font-medium">{audit.high_count}</span> high
            </span>
            <span className="flex items-center gap-x-1.5 opacity-70">
              ({audit.findings_count} total)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-x-8">
          {/* Score */}
          <div className="text-center">
            <p className={`text-2xl font-bold ${scoreColor}`}>{score}%</p>
            <p className="text-xs text-gray-500 mt-1">Score</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-x-3">
            <button
              onClick={onView}
              className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
              title="Preview Report"
            >
              <Eye className="h-5 w-5" />
            </button>
            {hasReport ? (
              <button
                onClick={() => onDownload(audit.id)}
                className="flex items-center gap-x-2 rounded-xl bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue/80 shadow-lg shadow-brand-blue/20 transition-all"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </button>
            ) : (
              <button
                onClick={() => onGenerateReport(audit.id)}
                disabled
                className="flex items-center gap-x-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-500 transition-colors disabled:cursor-not-allowed"
              >
                <FileText className="h-4 w-4" />
                PDF Pending
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportPreviewModal({
  audit,
  onClose,
  onDownload,
}: {
  audit: Audit;
  onClose: () => void;
  onDownload: () => void;
}) {
  const score = audit.compliance_score || 0;
  const hasReport = Boolean(audit.report_storage_key);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Header */}
        <div className="p-6 border-b border-white/10 shrink-0 relative z-10 bg-gray-900/50 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Compliance Audit Report</h2>
              <p className="text-sm text-gray-400 mt-1">{audit.name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="p-6 overflow-y-auto relative z-10 space-y-8 custom-scrollbar">
          {/* Score */}
          <div className="text-center py-8 glass-card rounded-2xl relative overflow-hidden">
             <div className={`absolute inset-0 bg-gradient-to-b opacity-10 ${score >= 80 ? "from-green-500" : score >= 60 ? "from-yellow-500" : "from-red-500"} to-transparent`} />
            <p className={`text-6xl font-black ${score >= 80 ? "text-green-400" : score >= 60 ? "text-yellow-400" : "text-red-400"}`}>
              {score}%
            </p>
            <p className="text-sm text-gray-400 mt-3 font-medium tracking-wide uppercase">Overall Compliance Score</p>
          </div>

          {/* Findings Summary */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Findings Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SeverityBadge severity="Critical" count={audit.critical_count} color="red" />
              <SeverityBadge severity="High" count={audit.high_count} color="orange" />
              <SeverityBadge severity="Medium" count={audit.medium_count} color="yellow" />
              <SeverityBadge severity="Low" count={audit.low_count} color="blue" />
            </div>
          </div>

          {/* Audit Details */}
          <div className="glass-card rounded-2xl p-6">
             <h3 className="text-lg font-semibold text-white mb-5">Audit Details</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Audit Type</p>
                <p className="font-semibold text-white capitalize">
                  {(audit.audit_type || "manual_audit").replace("_", " ")}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Total Findings</p>
                <p className="font-semibold text-white">{audit.findings_count}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Started</p>
                <p className="font-semibold text-white">{new Date(audit.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Completed</p>
                <p className="font-semibold text-white">{audit.completed_at ? new Date(audit.completed_at).toLocaleDateString() : "N/A"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/10 shrink-0 flex items-center justify-end gap-x-3 bg-gray-900/80 backdrop-blur-md relative z-10">
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-transparent px-5 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors"
          >
            Close Viewer
          </button>
          <button
            onClick={onDownload}
            disabled={!hasReport}
            className="flex items-center gap-x-2 rounded-xl bg-brand-cyan px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-brand-cyan/80 shadow-lg shadow-brand-cyan/20 transition-all disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-gray-500 disabled:shadow-none"
          >
            <Download className="h-4 w-4" />
            {hasReport ? "Download PDF" : "PDF Pending"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SeverityBadge({ severity, count, color }: { severity: string; count: number; color: string }) {
  const colorClasses: Record<string, string> = {
    red: "bg-red-500/10 text-red-400 border-red-500/20",
    orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    blue: "bg-brand-blue/10 text-brand-blue border-brand-blue/20",
  };

  return (
    <div className={`rounded-2xl border ${colorClasses[color]} p-4 flex flex-col items-center justify-center`}>
      <p className="text-3xl font-black mb-1">{count}</p>
      <p className="text-xs font-semibold tracking-wide uppercase">{severity}</p>
    </div>
  );
}
