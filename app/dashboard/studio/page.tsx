"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Check,
  X,
  Save,
  Lightbulb,
  AlertTriangle,
  AlertCircle,
  Info,
  Shield,
  Code,
  Loader2,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { auditsApi } from "@/lib/api";
import { toast } from "sonner";

type AuditSummary = {
  id: string;
  name: string;
  status: string;
  completed_at: string | null;
};

type Finding = {
  id: string;
  audit_id: string;
  rule_id: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  title: string;
  description: string;
  recommendation: string;
  status: "open" | "in_review" | "accepted" | "resolved" | "false_positive";
  auto_fixable: boolean;
  auto_fix_suggestion?: string | null;
  evidence?: Record<string, unknown> | null;
  resolution_notes?: string | null;
};

const severityConfig = {
  critical: { icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  high: { icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  medium: { icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  low: { icon: Info, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  info: { icon: Info, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
};

const statusColors: Record<string, string> = {
  open: "bg-white/5 text-gray-400 border-white/10",
  in_review: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  accepted: "bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20",
  resolved: "bg-green-500/10 text-green-400 border-green-500/20",
  false_positive: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function DocumentStudioPage() {
  const queryClient = useQueryClient();
  const [selectedAuditId, setSelectedAuditId] = useState<string>("");
  const [selectedFindingId, setSelectedFindingId] = useState<string>("");
  const [currentFindingIndex, setCurrentFindingIndex] = useState(0);
  const [resolutionNotes, setResolutionNotes] = useState("");

  const { data: audits = [], isLoading: auditsLoading } = useQuery({
    queryKey: ["audits"],
    queryFn: async () => {
      const response = await auditsApi.list();
      return (response.data as AuditSummary[]).filter((audit) => audit.status === "completed");
    },
  });

  useEffect(() => {
    if (!selectedAuditId && audits.length > 0) {
      setSelectedAuditId(audits[0].id);
    }
  }, [audits, selectedAuditId]);

  const { data: findings = [], isLoading: findingsLoading, refetch } = useQuery({
    queryKey: ["audit-findings", selectedAuditId],
    enabled: Boolean(selectedAuditId),
    queryFn: async () => {
      const response = await auditsApi.getFindings(selectedAuditId);
      return response.data as Finding[];
    },
  });

  useEffect(() => {
    if (!findings.length) {
      setSelectedFindingId("");
      setCurrentFindingIndex(0);
      setResolutionNotes("");
      return;
    }

    const selectedExists = findings.some((finding) => finding.id === selectedFindingId);
    const nextFinding = selectedExists ? findings.find((finding) => finding.id === selectedFindingId)! : findings[0];
    const nextIndex = findings.findIndex((finding) => finding.id === nextFinding.id);

    setSelectedFindingId(nextFinding.id);
    setCurrentFindingIndex(nextIndex >= 0 ? nextIndex : 0);
    setResolutionNotes(nextFinding.resolution_notes || "");
  }, [findings, selectedFindingId]);

  const selectedFinding = findings[currentFindingIndex];

  const updateFindingMutation = useMutation({
    mutationFn: ({ findingId, status, notes }: { findingId: string; status: Finding["status"]; notes: string }) =>
      auditsApi.updateFinding(selectedAuditId, findingId, {
        status,
        resolution_notes: notes || undefined,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["audit-findings", selectedAuditId] });
      toast.success(`Finding marked ${variables.status.replace("_", " ")}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to update finding");
    },
  });

  const handleSelectFinding = (findingId: string, index: number) => {
    setSelectedFindingId(findingId);
    setCurrentFindingIndex(index);
    setResolutionNotes(findings[index]?.resolution_notes || "");
  };

  const submitStatus = (status: Finding["status"]) => {
    if (!selectedFinding) return;
    updateFindingMutation.mutate({
      findingId: selectedFinding.id,
      status,
      notes: resolutionNotes,
    });
  };

  const saveNotes = () => {
    if (!selectedFinding) return;
    updateFindingMutation.mutate({
      findingId: selectedFinding.id,
      status: selectedFinding.status,
      notes: resolutionNotes,
    });
  };

  const goToFinding = (offset: number) => {
    const nextIndex = currentFindingIndex + offset;
    if (nextIndex < 0 || nextIndex >= findings.length) return;
    handleSelectFinding(findings[nextIndex].id, nextIndex);
  };

  if (auditsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-brand-cyan animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading completed audits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Document Studio</h1>
          <p className="text-gray-400 mt-1">Review audit findings, capture notes, and persist remediation decisions.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedAuditId}
            onChange={(e) => setSelectedAuditId(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-gray-200 focus:border-brand-cyan focus:outline-none"
          >
            {audits.length === 0 ? (
              <option value="">No completed audits</option>
            ) : (
              audits.map((audit) => (
                <option key={audit.id} value={audit.id} className="bg-gray-900 text-white">
                  {audit.name}
                </option>
              ))
            )}
          </select>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-x-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors px-4 py-2.5 text-sm font-medium text-gray-300"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {!selectedAuditId ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Shield className="h-10 w-10 text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No completed audits yet</h2>
          <p className="text-gray-400">Run an audit first, then Document Studio will load its findings here.</p>
        </div>
      ) : findingsLoading ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Loader2 className="h-8 w-8 text-brand-cyan animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading findings...</p>
        </div>
      ) : findings.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <FileText className="h-10 w-10 text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No findings for this audit</h2>
          <p className="text-gray-400">This audit does not have any persisted findings yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="glass-card rounded-2xl overflow-hidden h-[calc(100vh-220px)] flex flex-col relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/10 rounded-full blur-[40px] pointer-events-none" />
              <div className="p-5 border-b border-white/5 shrink-0 relative z-10">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Shield className="h-4 w-4 text-brand-cyan" />
                  Audit Findings ({findings.length})
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 pb-4">
                {findings.map((finding, index) => {
                  const SeverityIcon = severityConfig[finding.severity].icon;
                  const isSelected = finding.id === selectedFindingId;

                  return (
                    <button
                      key={finding.id}
                      onClick={() => handleSelectFinding(finding.id, index)}
                      className={`w-full text-left p-5 transition-all outline-none relative group border-b border-white/5 last:border-0 ${
                        isSelected
                          ? "bg-brand-blue/10 border-l-4 border-l-brand-cyan shadow-[inset_0_0_20px_rgba(0,223,216,0.05)]"
                          : "hover:bg-white/5 border-l-4 border-l-transparent"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-x-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-x-2 mb-2">
                            <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 border ${severityConfig[finding.severity].bg} ${severityConfig[finding.severity].color} ${severityConfig[finding.severity].border}`}>
                              <SeverityIcon className="h-3 w-3 mr-1" />
                              <span className="text-[10px] uppercase font-bold tracking-wider">{finding.severity}</span>
                            </span>
                            <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 border text-[10px] uppercase font-bold tracking-wider ${statusColors[finding.status]}`}>
                              {finding.status.replace("_", " ")}
                            </span>
                          </div>
                          <p className={`text-sm font-semibold truncate transition-colors ${isSelected ? "text-brand-cyan" : "text-white group-hover:text-gray-200"}`}>
                            {finding.title}
                          </p>
                          <p className="text-xs font-mono text-gray-500 mt-1 truncate">{finding.rule_id}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {selectedFinding && (
                <motion.div
                  key={selectedFinding.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="glass-card rounded-2xl p-8 relative overflow-hidden h-full flex flex-col"
                >
                  <div className={`absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[100px] pointer-events-none opacity-20 ${severityConfig[selectedFinding.severity].color.replace("text-", "bg-")}`} />

                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-x-2">
                      <button
                        onClick={() => goToFinding(-1)}
                        disabled={currentFindingIndex === 0}
                        className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </button>
                      <span className="text-sm font-medium text-gray-500 px-2">
                        {currentFindingIndex + 1} of {findings.length}
                      </span>
                      <button
                        onClick={() => goToFinding(1)}
                        disabled={currentFindingIndex === findings.length - 1}
                        className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ArrowRight className="h-5 w-5" />
                      </button>
                    </div>
                    {updateFindingMutation.isPending && (
                      <div className="flex items-center gap-2 text-sm text-brand-cyan">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving
                      </div>
                    )}
                  </div>

                  <div className="mb-8 relative z-10">
                    <div className="flex items-center gap-x-3 mb-2 whitespace-nowrap overflow-x-auto custom-scrollbar pb-1">
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 border text-xs font-bold uppercase tracking-wider ${severityConfig[selectedFinding.severity].color} ${severityConfig[selectedFinding.severity].border} ${severityConfig[selectedFinding.severity].bg}`}>
                        {selectedFinding.severity}
                      </span>
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 border text-xs font-bold uppercase tracking-wider ${statusColors[selectedFinding.status]}`}>
                        {selectedFinding.status.replace("_", " ")}
                      </span>
                      <span className="font-mono text-sm text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">{selectedFinding.rule_id}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mt-4 leading-tight">{selectedFinding.title}</h2>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 relative z-10 space-y-8">
                    <section>
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
                        <FileText className="h-4 w-4" /> Issue Description
                      </h3>
                      <p className="text-sm text-gray-300 bg-black/20 border border-white/5 rounded-xl p-5 leading-relaxed">{selectedFinding.description}</p>
                    </section>

                    <section>
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
                        <Check className="h-4 w-4" /> Recommendation
                      </h3>
                      <p className="text-sm text-gray-300 bg-black/20 border border-white/5 rounded-xl p-5 leading-relaxed">{selectedFinding.recommendation}</p>
                    </section>

                    <section className="rounded-2xl border-2 border-brand-purple/30 bg-gradient-to-br from-brand-purple/10 to-transparent p-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <Lightbulb className="h-32 w-32" />
                      </div>
                      <h3 className="flex items-center gap-2 text-sm font-bold text-brand-purple mb-4 uppercase tracking-wider relative z-10">
                        <Lightbulb className="h-5 w-5" /> AI Auto-Remediation Plan
                      </h3>
                      <p className="text-sm text-brand-purple/90 font-medium leading-relaxed relative z-10">
                        {selectedFinding.auto_fix_suggestion || "No AI-generated remediation has been stored for this finding yet."}
                      </p>
                    </section>

                    <section>
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
                        <Code className="h-4 w-4" /> Technical Evidence
                      </h3>
                      <div className="rounded-xl border border-gray-800 bg-gray-950 overflow-hidden">
                        <div className="flex items-center px-4 py-2 bg-gray-900 border-b border-gray-800">
                          <span className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                          </span>
                          <span className="ml-3 text-xs font-mono text-gray-500">payload.json</span>
                        </div>
                        <pre className="text-xs font-mono text-green-400/90 p-4 overflow-x-auto">
                          {JSON.stringify(selectedFinding.evidence || {}, null, 2)}
                        </pre>
                      </div>
                    </section>

                    <section>
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
                        <FileText className="h-4 w-4" /> Resolution Notes
                      </h3>
                      <textarea
                        rows={4}
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/40 p-4 text-sm text-gray-200 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none transition-all resize-y"
                        placeholder="Capture analyst notes, approval context, or remediation evidence."
                      />
                    </section>
                  </div>

                  <div className="pt-8 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={saveNotes}
                      disabled={updateFindingMutation.isPending}
                      className="flex items-center gap-x-2 rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/10 transition-colors disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      Save Notes
                    </button>
                    <button
                      type="button"
                      onClick={() => submitStatus("accepted")}
                      disabled={updateFindingMutation.isPending}
                      className="flex items-center gap-x-2 rounded-xl bg-brand-cyan hover:bg-brand-cyan/80 px-6 py-2.5 text-sm font-bold text-gray-900 shadow-lg shadow-brand-cyan/20 transition-all disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" />
                      Approve AI Fix
                    </button>
                    <button
                      type="button"
                      onClick={() => submitStatus("resolved")}
                      disabled={updateFindingMutation.isPending}
                      className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-6 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50"
                    >
                      Mark Resolved
                    </button>
                    <button
                      type="button"
                      onClick={() => submitStatus("in_review")}
                      disabled={updateFindingMutation.isPending}
                      className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20 px-6 py-2.5 text-sm font-medium text-yellow-300 transition-colors disabled:opacity-50"
                    >
                      Send to Review
                    </button>
                    <button
                      type="button"
                      onClick={() => submitStatus("false_positive")}
                      disabled={updateFindingMutation.isPending}
                      className="rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 px-6 py-2.5 text-sm font-medium text-red-400 transition-colors ml-auto sm:ml-0 disabled:opacity-50"
                    >
                      Reject Finding
                    </button>
                    <button
                      type="button"
                      onClick={() => setResolutionNotes(selectedFinding.resolution_notes || "")}
                      className="flex items-center gap-2 rounded-xl border border-white/10 px-6 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors"
                    >
                      <X className="h-4 w-4" />
                      Revert Notes
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
