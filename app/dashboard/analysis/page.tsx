"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, FileJson, FileText, Loader2, Search, Upload } from "lucide-react";
import { documentsApi } from "@/lib/api";

type AnalysisMode = "instant" | "audit";

type AnalysisSummary = {
  headline: string;
  document_preview?: string | null;
  total_findings: number;
  by_category: Record<string, number>;
  by_risk_level: Record<string, number>;
  recommendations: string[];
};

type DocumentRow = {
  id: string;
  title: string;
  status: string;
  analysis_status?: string | null;
  analysis_mode?: string | null;
  latest_analysis?: AnalysisSummary | null;
  created_at: string;
};

export default function DataAnalysisPage() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<AnalysisMode>("instant");
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [runningId, setRunningId] = useState<string | null>(null);

  const loadDocuments = useCallback(async () => {
    setLoadingDocuments(true);
    try {
      const response = await documentsApi.list();
      setDocuments(response.data);
    } catch {
      setError("Could not load synced analysis documents.");
    } finally {
      setLoadingDocuments(false);
    }
  }, []);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setSuccess(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("document_type", "custom");
    formData.append("analysis_mode", mode);

    try {
      const response = await documentsApi.upload(formData);
      const uploaded = response.data as DocumentRow & { audit_id?: string | null };
      setSuccess(
        uploaded.audit_id
          ? "File uploaded, analyzed, and linked to a full audit."
          : "File uploaded and analyzed successfully."
      );
      setFile(null);
      await loadDocuments();
    } catch (err: any) {
      setError(err.response?.data?.detail || "An error occurred during upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleRun = async (documentId: string, selectedMode: AnalysisMode) => {
    setRunningId(documentId);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("analysis_mode", selectedMode);
      await documentsApi.analyze(documentId, formData);
      setSuccess(
        selectedMode === "instant"
          ? "Instant analysis refreshed from the stored document."
          : "Full audit launched from the stored document."
      );
      await loadDocuments();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Could not run analysis for this document.");
    } finally {
      setRunningId(null);
    }
  };

  const getFileIcon = () => {
    if (!file) return <Upload className="h-12 w-12 text-brand-cyan mb-4 opacity-70" />;
    if (file.name.endsWith(".json")) return <FileJson className="h-12 w-12 text-brand-purple mb-4" />;
    return <FileText className="h-12 w-12 text-brand-blue mb-4" />;
  };

  return (
    <div className="space-y-8 pb-8 max-w-5xl mx-auto mt-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">
          Data <span className="text-brand-cyan">Analysis</span>
        </h1>
        <p className="text-gray-400 text-sm sm:text-base">
          Upload once, then reuse the same document across analysis, dashboard insights, chat context, and audits.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-10 rounded-[2rem] border border-white/5 bg-white/[0.01] relative overflow-hidden"
      >
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-cyan/50 to-transparent"></div>

        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="h-24 w-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-cyan/20 to-brand-blue/20 opacity-50 z-0" />
              <div className="z-10">{getFileIcon()}</div>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Select a file to process</h3>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Instant analysis is preselected, but users can switch to a full audit before uploading.
          </p>

          {!file && (
            <div className="relative inline-block">
              <input
                type="file"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".pdf,.json,.csv,.txt"
              />
              <button className="px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold transition-all border border-white/10">
                Browse Files
              </button>
            </div>
          )}

          {file && (
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-full border-brand-cyan/30 bg-brand-cyan/5">
                <span className="text-gray-200 font-medium">{file.name}</span>
                <span className="text-gray-500 text-sm">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                <ModeButton
                  active={mode === "instant"}
                  title="Instant analysis"
                  subtitle="Recommended"
                  onClick={() => setMode("instant")}
                />
                <ModeButton
                  active={mode === "audit"}
                  title="Full audit"
                  subtitle="Run the full pipeline"
                  onClick={() => setMode("audit")}
                />
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setFile(null)}
                  disabled={uploading}
                  className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-brand-blue to-brand-cyan hover:shadow-[0_0_20px_rgba(0,223,216,0.3)] text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Processing...
                    </>
                  ) : (
                    "Upload"
                  )}
                </button>
              </div>
            </div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center gap-3 text-green-400"
            >
              <CheckCircle className="h-5 w-5" />
              <span>{success}</span>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center gap-3 text-red-400"
            >
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </motion.div>
          )}
        </div>
      </motion.div>

      <div className="glass-card p-6 rounded-[2rem] border border-white/5 bg-white/[0.01]">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-5 h-5 text-brand-cyan" />
          <h2 className="text-xl font-semibold text-white">Synced instant-analysis results</h2>
        </div>

        {loadingDocuments ? (
          <div className="flex justify-center py-8 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : documents.length === 0 ? (
          <p className="text-sm text-gray-500">No uploaded documents yet.</p>
        ) : (
          <div className="space-y-4">
            {documents.map((document) => (
              <div key={document.id} className="rounded-2xl border border-white/10 bg-black/20 p-5 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-white font-semibold">{document.title}</p>
                    <p className="text-xs text-gray-500">
                      {document.status} · {new Date(document.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={runningId === document.id}
                      onClick={() => void handleRun(document.id, "instant")}
                      className="px-3 py-2 rounded-lg bg-brand-cyan/10 text-brand-cyan text-xs font-semibold disabled:opacity-50"
                    >
                      Refresh instant analysis
                    </button>
                    <button
                      type="button"
                      disabled={runningId === document.id}
                      onClick={() => void handleRun(document.id, "audit")}
                      className="px-3 py-2 rounded-lg bg-white/5 text-white text-xs font-semibold disabled:opacity-50"
                    >
                      Start full audit
                    </button>
                  </div>
                </div>

                {document.latest_analysis ? (
                  <div className="space-y-3">
                    <p className="text-sm text-white">{document.latest_analysis.headline}</p>
                    {document.latest_analysis.document_preview && (
                      <p className="text-xs text-gray-400 line-clamp-4">
                        {document.latest_analysis.document_preview}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 text-xs text-gray-300">
                      <span className="px-2 py-1 rounded-full bg-white/5">
                        Findings: {document.latest_analysis.total_findings}
                      </span>
                      <span className="px-2 py-1 rounded-full bg-red-500/10 text-red-300">
                        High risk: {(document.latest_analysis.by_risk_level.critical || 0) + (document.latest_analysis.by_risk_level.high || 0)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">No saved analysis on this document yet.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ModeButton({
  active,
  title,
  subtitle,
  onClick,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-3 rounded-2xl border text-left min-w-44 ${
        active ? "border-brand-cyan/40 bg-brand-cyan/10 text-white" : "border-white/10 bg-white/5 text-gray-400"
      }`}
    >
      <p className="text-sm font-semibold">{title}</p>
      <p className="text-xs mt-1">{subtitle}</p>
    </button>
  );
}
