"use client";

import { useCallback, useEffect, useState } from "react";
import { documentsApi } from "@/lib/api";
import { toast } from "sonner";
import { AlertTriangle, Download, FileText, Loader2, Search, Trash2, Upload } from "lucide-react";
import { motion } from "framer-motion";

type AnalysisSummary = {
  headline: string;
  document_preview?: string | null;
  total_findings: number;
  by_category: Record<string, number>;
  by_risk_level: Record<string, number>;
  high_risk_locations: string[];
  top_findings: Array<{ category: string; value: string; risk_level: string; description: string }>;
  recommendations: string[];
};

interface DocRow {
  id: string;
  audit_id?: string | null;
  title: string;
  document_type: string;
  status: string;
  storage_url: string | null;
  analysis_status?: string | null;
  analysis_mode?: string | null;
  latest_analysis?: AnalysisSummary | null;
  created_at: string;
}

type AnalysisMode = "instant" | "audit";

export default function DocumentsPage() {
  const [items, setItems] = useState<DocRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [mode, setMode] = useState<AnalysisMode>("instant");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await documentsApi.list();
      setItems(res.data);
    } catch {
      toast.error("Could not load documents.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Choose a file first.");
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (title.trim()) fd.append("title", title.trim());
      fd.append("document_type", "custom");
      fd.append("analysis_mode", mode);
      const response = await documentsApi.upload(fd);
      const uploaded = response.data as DocRow;

      toast.success(
        mode === "instant"
          ? "Document uploaded and analyzed."
          : "Document uploaded and sent into a full audit."
      );
      if (uploaded.audit_id) {
        toast.message("Audit linked", { description: "This document now has a synced audit result." });
      }
      setFile(null);
      setTitle("");
      await load();
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this document?")) return;
    try {
      await documentsApi.delete(id);
      toast.success("Deleted.");
      await load();
    } catch {
      toast.error("Delete failed.");
    }
  };

  const onRun = async (id: string, selectedMode: AnalysisMode) => {
    setRunningId(id);
    try {
      const fd = new FormData();
      fd.append("analysis_mode", selectedMode);
      await documentsApi.analyze(id, fd);
      toast.success(
        selectedMode === "instant" ? "Instant analysis refreshed." : "Full audit started from this document."
      );
      await load();
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Action failed.");
    } finally {
      setRunningId(null);
    }
  };

  const onDownload = async (id: string, name: string) => {
    try {
      const res = await documentsApi.download(id);
      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = name || "document";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Download failed.");
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Documents <span className="text-gradient">Library</span>
        </h1>
        <p className="text-gray-400 text-sm mt-2">
          Every uploaded file becomes a shared source for Documents, Data Analysis, Dashboard, and Chat.
        </p>
      </motion.div>

      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-brand-cyan" />
          Upload and process
        </h2>
        <form onSubmit={onUpload} className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Optional title (defaults to filename)"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
          />
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-brand-blue/20 file:text-white"
          />
          <div className="flex flex-wrap gap-3">
            <ActionPill
              active={mode === "instant"}
              title="Instant analysis"
              description="Recommended default. Save a quick reusable result now."
              onClick={() => setMode("instant")}
            />
            <ActionPill
              active={mode === "audit"}
              title="Full audit"
              description="Run the upload through the full audit pipeline immediately."
              onClick={() => setMode("audit")}
            />
          </div>
          <button
            type="submit"
            disabled={uploading || !file}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan text-white font-semibold text-sm disabled:opacity-40"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : "Upload"}
          </button>
        </form>
      </div>

      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4">Synced documents</h2>
        {loading ? (
          <div className="flex justify-center py-12 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-gray-500 text-sm">No documents yet.</p>
        ) : (
          <ul className="space-y-4">
            {items.map((d) => (
              <li
                key={d.id}
                className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <FileText className="w-5 h-5 text-brand-cyan flex-shrink-0 mt-1" />
                    <div className="min-w-0">
                      <p className="text-white font-medium truncate">{d.title}</p>
                      <p className="text-xs text-gray-500">
                        {d.document_type} · {d.status} · {new Date(d.created_at).toLocaleString()}
                      </p>
                      {d.audit_id && (
                        <p className="text-xs text-brand-cyan mt-1">Linked audit: {d.audit_id}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => void onDownload(d.id, d.title)}
                      className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void onDelete(d.id)}
                      className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-red-400"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={runningId === d.id}
                    onClick={() => void onRun(d.id, "instant")}
                    className="px-3 py-2 rounded-lg bg-brand-cyan/10 text-brand-cyan text-xs font-semibold disabled:opacity-50"
                  >
                    {runningId === d.id ? "Working..." : "Run instant analysis"}
                  </button>
                  <button
                    type="button"
                    disabled={runningId === d.id}
                    onClick={() => void onRun(d.id, "audit")}
                    className="px-3 py-2 rounded-lg bg-white/5 text-white text-xs font-semibold disabled:opacity-50"
                  >
                    Start full audit
                  </button>
                </div>

                {d.latest_analysis ? (
                  <AnalysisPanel analysis={d.latest_analysis} />
                ) : (
                  <div className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-gray-500">
                    No instant analysis has been saved for this document yet.
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ActionPill({
  active,
  title,
  description,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left px-4 py-3 rounded-xl border transition-all ${
        active
          ? "border-brand-cyan/40 bg-brand-cyan/10 text-white"
          : "border-white/10 bg-white/5 text-gray-400"
      }`}
    >
      <p className="text-sm font-semibold">{title}</p>
      <p className="text-xs mt-1">{description}</p>
    </button>
  );
}

function AnalysisPanel({ analysis }: { analysis: AnalysisSummary }) {
  const highRiskCount = (analysis.by_risk_level.critical || 0) + (analysis.by_risk_level.high || 0);

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Search className="w-4 h-4 text-brand-cyan mt-1" />
        <div>
          <p className="text-sm font-semibold text-white">{analysis.headline}</p>
          {analysis.document_preview && (
            <p className="text-xs text-gray-400 mt-1 line-clamp-3">{analysis.document_preview}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <span className="px-2 py-1 rounded-full bg-white/5 text-gray-300">
          Findings: {analysis.total_findings}
        </span>
        <span className="px-2 py-1 rounded-full bg-red-500/10 text-red-300">
          High risk: {highRiskCount}
        </span>
      </div>

      {analysis.top_findings.length > 0 && (
        <div className="space-y-2">
          {analysis.top_findings.slice(0, 3).map((finding, index) => (
            <div key={`${finding.category}-${index}`} className="text-xs text-gray-300 flex gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
              <span>
                {finding.category}: {finding.description}
              </span>
            </div>
          ))}
        </div>
      )}

      {analysis.recommendations.length > 0 && (
        <div className="space-y-1">
          {analysis.recommendations.slice(0, 2).map((item) => (
            <p key={item} className="text-xs text-gray-400">
              • {item}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
