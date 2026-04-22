"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, CheckCircle, AlertCircle, FileJson } from "lucide-react";
import { auditsApi } from "@/lib/api";

export default function DataAnalysisPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setSuccess(false);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append("file", file);

    try {
      await auditsApi.uploadData(formData);
      setSuccess(true);
      setFile(null);
    } catch (err: any) {
      console.error("Upload failed", err);
      setError(err.response?.data?.detail || "An error occurred during upload.");
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = () => {
    if (!file) return <Upload className="h-12 w-12 text-brand-cyan mb-4 opacity-70" />;
    if (file.name.endsWith(".json")) return <FileJson className="h-12 w-12 text-brand-purple mb-4" />;
    return <FileText className="h-12 w-12 text-brand-blue mb-4" />;
  };

  return (
    <div className="space-y-8 pb-8 max-w-4xl mx-auto mt-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">
          Data <span className="text-brand-cyan">Analysis</span>
        </h1>
        <p className="text-gray-400 text-sm sm:text-base">
          Upload raw data, privacy policies, or JSON exports. CAR-Bot will parse and stage the file for your organization so the next audit can analyze it alongside your connector data.
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

          <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
            Select a file to analyze
          </h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Supported formats: PDF (Privacy Policies, Terms), JSON (Data schemas, Meta API exports).
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
                      Analyzing...
                    </>
                  ) : (
                    "Upload & Analyze"
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
              <span>File uploaded successfully. It has been staged for use in your next audit run.</span>
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
    </div>
  );
}
