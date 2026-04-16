"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
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
  completed: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", label: "Completed" },
  in_progress: { icon: Clock, color: "text-blue-600", bg: "bg-blue-50", label: "In Progress" },
  pending: { icon: Clock, color: "text-gray-600", bg: "bg-gray-50", label: "Pending" },
  failed: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50", label: "Failed" },
  cancelled: { icon: AlertTriangle, color: "text-yellow-600", bg: "bg-yellow-50", label: "Cancelled" },
};

const submissionConfig = {
  draft: { icon: FileText, color: "text-gray-600", bg: "bg-gray-50", label: "Draft" },
  ready: { icon: FileCheck, color: "text-blue-600", bg: "bg-blue-50", label: "Ready to File" },
  submitted: { icon: Upload, color: "text-purple-600", bg: "bg-purple-50", label: "Submitted" },
  accepted: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", label: "Accepted by NDPC" },
  rejected: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50", label: "Rejected" },
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
      // TODO: Trigger report generation via API
      console.log("Generating report for audit:", auditId);
    } catch (error) {
      console.error("Failed to generate report:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Clock className="h-8 w-8 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading audits...</p>
        </div>
      </div>
    );
  }

  const completedAudits = audits?.filter((a) => a.status === "completed") || [];
  const inProgressAudits = audits?.filter((a) => a.status === "in_progress") || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Filing Portal</h1>
        <p className="text-gray-500 mt-1">
          Track audit status, generate CAR PDFs, and file with NDPC
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Audits"
          value={audits?.length || 0}
          icon={FileText}
          color="text-gray-600"
        />
        <StatCard
          label="Completed"
          value={completedAudits.length}
          icon={CheckCircle}
          color="text-green-600"
        />
        <StatCard
          label="In Progress"
          value={inProgressAudits.length}
          icon={Clock}
          color="text-blue-600"
        />
        <StatCard
          label="Avg Score"
          value={
            completedAudits.length > 0
              ? `${Math.round(completedAudits.reduce((sum, a) => sum + (a.compliance_score || 0), 0) / completedAudits.length)}%`
              : "N/A"
          }
          icon={TrendingUp}
          color="text-primary-600"
        />
      </div>

      {/* In Progress Audits */}
      {inProgressAudits.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">In Progress</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {inProgressAudits.map((audit) => (
              <div key={audit.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-x-3">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{audit.name}</p>
                        <p className="text-xs text-gray-500">
                          Started {new Date(audit.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{Math.round(audit.progress)}%</p>
                    </div>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
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
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Audit Reports & Filing Status</h3>
        </div>

        {completedAudits.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No completed audits yet</h3>
            <p className="text-gray-500">
              Run your first audit to generate a CAR PDF report.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
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
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <Icon className={`h-8 w-8 ${color}`} />
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
  const scoreColor = score >= 80 ? "text-green-600" : score >= 60 ? "text-yellow-600" : "text-red-600";

  // Derive filing status from audit status (no report_storage_key on frontend)
  const submissionStatus: FilingRecord["submission_status"] =
    audit.status === "completed" ? "ready" : "draft";
  const SubIcon = submissionConfig[submissionStatus].icon;

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-x-3 mb-2">
            <h4 className="text-sm font-semibold text-gray-900">{audit.name}</h4>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${submissionConfig[submissionStatus].bg} ${submissionConfig[submissionStatus].color}`}>
              <SubIcon className="h-3 w-3 mr-1" />
              {submissionConfig[submissionStatus].label}
            </span>
          </div>

          <div className="flex items-center gap-x-4 text-xs text-gray-500">
            <span className="flex items-center gap-x-1">
              <Calendar className="h-3 w-3" />
              {new Date(audit.created_at).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-x-1">
              <AlertCircle className="h-3 w-3 text-red-500" />
              {audit.critical_count} critical
            </span>
            <span className="flex items-center gap-x-1">
              <AlertTriangle className="h-3 w-3 text-orange-500" />
              {audit.high_count} high
            </span>
            <span className="flex items-center gap-x-1">
              Total: {audit.findings_count} findings
            </span>
          </div>
        </div>

        <div className="flex items-center gap-x-6">
          {/* Score */}
          <div className="text-center">
            <p className={`text-2xl font-bold ${scoreColor}`}>{score}%</p>
            <p className="text-xs text-gray-500">Compliance</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-x-2">
            <button
              onClick={onView}
              className="p-2 text-gray-400 hover:text-primary-600 rounded-md hover:bg-gray-100"
              title="Preview Report"
            >
              <Eye className="h-4 w-4" />
            </button>
            {audit.status === "completed" ? (
              <button
                onClick={() => onDownload(audit.id)}
                className="flex items-center gap-x-2 rounded-md bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-500"
              >
                <Download className="h-3 w-3" />
                Download PDF
              </button>
            ) : (
              <button
                onClick={() => onGenerateReport(audit.id)}
                className="flex items-center gap-x-2 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                <FileText className="h-3 w-3" />
                Generate Report
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Compliance Audit Report</h2>
              <p className="text-sm text-gray-500 mt-1">{audit.name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
            >
              <ExternalLink className="h-5 w-5 rotate-45" />
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="p-6 space-y-6">
          {/* Score */}
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <p className={`text-5xl font-bold ${score >= 80 ? "text-green-600" : score >= 60 ? "text-yellow-600" : "text-red-600"}`}>
              {score}%
            </p>
            <p className="text-sm text-gray-500 mt-2">Overall Compliance Score</p>
          </div>

          {/* Findings Summary */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Findings Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <SeverityBadge severity="Critical" count={audit.critical_count} color="red" />
              <SeverityBadge severity="High" count={audit.high_count} color="orange" />
              <SeverityBadge severity="Medium" count={audit.medium_count} color="yellow" />
              <SeverityBadge severity="Low" count={audit.low_count} color="blue" />
            </div>
          </div>

          {/* Audit Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Audit Type</p>
              <p className="font-medium text-gray-900 capitalize">{audit.audit_type.replace("_", " ")}</p>
            </div>
            <div>
              <p className="text-gray-500">Total Findings</p>
              <p className="font-medium text-gray-900">{audit.findings_count}</p>
            </div>
            <div>
              <p className="text-gray-500">Started</p>
              <p className="font-medium text-gray-900">{new Date(audit.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-500">Completed</p>
              <p className="font-medium text-gray-900">{audit.completed_at ? new Date(audit.completed_at).toLocaleDateString() : "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-x-3">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={onDownload}
            className="flex items-center gap-x-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500"
          >
            <Download className="h-4 w-4" />
            Download CAR PDF
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SeverityBadge({ severity, count, color }: { severity: string; count: number; color: string }) {
  const colorClasses: Record<string, string> = {
    red: "bg-red-50 text-red-700 border-red-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
  };

  return (
    <div className={`rounded-lg border ${colorClasses[color]} p-3 text-center`}>
      <p className="text-lg font-bold">{count}</p>
      <p className="text-xs">{severity}</p>
    </div>
  );
}
