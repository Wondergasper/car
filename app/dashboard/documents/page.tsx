"use client";

import { useState, useEffect, useCallback } from "react";
import { documentsApi } from "@/lib/api";
import { toast } from "sonner";
import { Upload, FileText, Trash2, Download, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface DocRow {
  id: string;
  title: string;
  document_type: string;
  status: string;
  storage_url: string | null;
  created_at: string;
}

export default function DocumentsPage() {
  const [items, setItems] = useState<DocRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");

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
      await documentsApi.upload(fd);
      toast.success("Document uploaded.");
      setFile(null);
      setTitle("");
      await load();
    } catch (err: unknown) {
      const d = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(typeof d === "string" ? d : "Upload failed.");
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
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Documents <span className="text-gradient">Library</span>
        </h1>
        <p className="text-gray-400 text-sm mt-2">
          Upload policies and evidence files. They are stored under your organisation and served from{" "}
          <code className="text-brand-cyan/80">/media/...</code>. For raw data used in audits, use{" "}
          <strong className="text-white">Data Analysis</strong> (file upload into the audit pipeline).
        </p>
      </motion.div>

      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-brand-cyan" />
          Upload document
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
        <h2 className="text-lg font-semibold text-white mb-4">Your files</h2>
        {loading ? (
          <div className="flex justify-center py-12 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-gray-500 text-sm">No documents yet.</p>
        ) : (
          <ul className="space-y-3">
            {items.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/10"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-5 h-5 text-brand-cyan flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-white font-medium truncate">{d.title}</p>
                    <p className="text-xs text-gray-500">
                      {d.document_type} · {d.status} · {new Date(d.created_at).toLocaleString()}
                    </p>
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
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
