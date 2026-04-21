"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ChevronDown, ExternalLink, BookOpen } from "lucide-react";

interface Citation {
  source: string;
  page: number;
  article: string;
  text: string;
}

interface CitationCardProps {
  citations: Citation[];
  grounded: boolean;
  modelUsed?: string;
}

const SOURCE_COLORS: Record<string, string> = {
  "NDPA 2023":  "from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400",
  "GAID 2025":  "from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400",
  "CBN Cybersecurity Framework": "from-green-500/20 to-green-600/10 border-green-500/30 text-green-400",
  "NCC Consumer Code of Practice": "from-orange-500/20 to-orange-600/10 border-orange-500/30 text-orange-400",
};

const getSourceStyle = (source: string) =>
  SOURCE_COLORS[source] ??
  "from-gray-500/20 to-gray-600/10 border-gray-500/30 text-gray-400";

export function CitationCard({ citations, grounded, modelUsed }: CitationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  if (!citations || citations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mt-3 space-y-2"
    >
      {/* Header toggle */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-300 transition-colors group"
      >
        <BookOpen className="w-3.5 h-3.5 text-brand-cyan" />
        <span className="text-brand-cyan">{citations.length} regulatory clause{citations.length !== 1 ? "s" : ""} cited</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        />
        {grounded && (
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-[10px] font-bold tracking-wider">
            GROUNDED
          </span>
        )}
      </button>

      {/* Citations list */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-2 overflow-hidden"
          >
            {citations.map((c, i) => {
              const style = getSourceStyle(c.source);
              const isOpen = expandedIdx === i;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`rounded-xl border bg-gradient-to-r ${style} p-3 cursor-pointer`}
                  onClick={() => setExpandedIdx(isOpen ? null : i)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{c.source}</p>
                        {c.article && (
                          <p className="text-[11px] opacity-75 mt-0.5">{c.article} · Page {c.page}</p>
                        )}
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 flex-shrink-0 opacity-60 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </div>

                  <AnimatePresence>
                    {isOpen && c.text && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-[11px] leading-relaxed opacity-80 mt-2 pt-2 border-t border-white/10 overflow-hidden"
                      >
                        {c.text}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
