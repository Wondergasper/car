"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, BookOpen, FileText, ChevronRight, Loader2,
  AlertCircle, Sparkles, Filter, X,
} from "lucide-react";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ClauseResult {
  source: string;
  page: number;
  article: string;
  text: string;
  relevance_rank: number;
}

const SOURCE_COLORS: Record<string, { bg: string; badge: string; dot: string }> = {
  "NDPA 2023": {
    bg: "from-blue-500/10 to-transparent border-blue-500/20",
    badge: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    dot: "bg-blue-400",
  },
  "GAID 2025": {
    bg: "from-purple-500/10 to-transparent border-purple-500/20",
    badge: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    dot: "bg-purple-400",
  },
  "CBN Cybersecurity Framework": {
    bg: "from-green-500/10 to-transparent border-green-500/20",
    badge: "bg-green-500/20 text-green-400 border-green-500/30",
    dot: "bg-green-400",
  },
  "NCC Consumer Code of Practice": {
    bg: "from-orange-500/10 to-transparent border-orange-500/20",
    badge: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    dot: "bg-orange-400",
  },
};

const DEFAULT_STYLE = {
  bg: "from-gray-500/10 to-transparent border-gray-500/20",
  badge: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  dot: "bg-gray-400",
};

const SAMPLE_QUERIES = [
  "breach notification requirements",
  "consent and lawful basis for processing",
  "cross-border data transfer safeguards",
  "DPO appointment obligations",
  "data subject rights and access requests",
  "CAR filing deadline and format",
];

const FRAMEWORKS = ["All", "NDPA 2023", "GAID 2025", "CBN Cybersecurity Framework", "NCC Consumer Code of Practice"];

export default function ClausesPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ClauseResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFramework, setSelectedFramework] = useState("All");
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [ragReady, setRagReady] = useState<boolean | null>(null);
  const [ragChunks, setRagChunks] = useState(0);

  // Check RAG status on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${API}/api/rag/status`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        setRagReady(r.data.ready);
        setRagChunks(r.data.document_count);
      })
      .catch(() => setRagReady(false));
  }, []);

  const search = async (q?: string) => {
    const searchQuery = (q ?? query).trim();
    if (!searchQuery) return;
    setLoading(true);
    setError("");
    setResults([]);
    setExpandedIdx(null);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API}/api/rag/search`,
        {
          query: searchQuery,
          k: 8,
          framework: selectedFramework === "All" ? null : selectedFramework,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResults(res.data.results || []);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredResults =
    selectedFramework === "All"
      ? results
      : results.filter((r) => r.source === selectedFramework);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-brand-purple to-brand-cyan flex items-center justify-center shadow-lg shadow-brand-purple/20">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Clause <span className="text-gradient">Explorer</span>
          </h1>
        </div>
        <p className="text-gray-400 text-sm ml-1">
          Semantic search across NDPA 2023, GAID 2025, CBN & NCC frameworks
        </p>

        {/* RAG status pill */}
        <div className="flex items-center gap-2 mt-3 ml-1">
          {ragReady === null ? (
            <span className="text-xs text-gray-600">Checking index…</span>
          ) : ragReady ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {ragChunks.toLocaleString()} clauses indexed · Ready
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
              <AlertCircle className="w-3.5 h-3.5" />
              RAG not ready — install sentence-transformers chromadb pypdf
            </span>
          )}
        </div>
      </motion.div>

      {/* Search bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-2xl p-6 space-y-4"
      >
        <div className="relative flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              placeholder="Search for any regulatory requirement…"
              className="w-full pl-11 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all text-sm"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => search()}
            disabled={loading || !query.trim()}
            className="px-6 py-4 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan text-white font-semibold text-sm disabled:opacity-40 hover:shadow-lg hover:shadow-brand-blue/30 active:scale-95 transition-all flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Search
          </button>
        </div>

        {/* Framework filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-gray-500" />
          {FRAMEWORKS.map((fw) => (
            <button
              key={fw}
              onClick={() => setSelectedFramework(fw)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                selectedFramework === fw
                  ? "bg-brand-cyan/20 border-brand-cyan/40 text-brand-cyan"
                  : "bg-white/5 border-white/10 text-gray-500 hover:border-white/20"
              }`}
            >
              {fw}
            </button>
          ))}
        </div>

        {/* Sample queries */}
        {results.length === 0 && !loading && (
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-xs text-gray-600">Try:</span>
            {SAMPLE_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => { setQuery(q); search(q); }}
                className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/8 text-gray-400 hover:border-brand-cyan/30 hover:text-brand-cyan transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {filteredResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <p className="text-xs text-gray-500 font-medium px-1">
              {filteredResults.length} clause{filteredResults.length !== 1 ? "s" : ""} found
              {selectedFramework !== "All" && ` in ${selectedFramework}`}
            </p>

            {filteredResults.map((r, i) => {
              const style = SOURCE_COLORS[r.source] ?? DEFAULT_STYLE;
              const isOpen = expandedIdx === i;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`glass-card rounded-2xl border bg-gradient-to-r ${style.bg} cursor-pointer overflow-hidden`}
                  onClick={() => setExpandedIdx(isOpen ? null : i)}
                >
                  <div className="p-5 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0">
                      {/* Rank badge */}
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-gray-400">
                        {r.relevance_rank}
                      </div>

                      <div className="min-w-0">
                        {/* Source + Article */}
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-semibold ${style.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                            {r.source}
                          </span>
                          {r.article && (
                            <span className="text-xs text-gray-400 font-mono">{r.article}</span>
                          )}
                          <span className="text-xs text-gray-600">Page {r.page}</span>
                        </div>

                        {/* Preview text */}
                        <p className={`text-sm text-gray-300 leading-relaxed ${isOpen ? "" : "line-clamp-2"}`}>
                          {r.text}
                        </p>
                      </div>
                    </div>

                    <ChevronRight
                      className={`w-4 h-4 text-gray-500 flex-shrink-0 mt-1 transition-transform ${isOpen ? "rotate-90" : ""}`}
                    />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Empty state after search */}
        {!loading && results.length === 0 && query && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 text-gray-500"
          >
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">No clauses found for your query</p>
            <p className="text-sm mt-1">Try different keywords or check that the RAG engine is ready</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
