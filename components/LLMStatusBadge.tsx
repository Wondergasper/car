"use client";

import { motion } from "framer-motion";
import { Cpu, AlertTriangle, CheckCircle2 } from "lucide-react";

interface LLMStatusBadgeProps {
  modelUsed: string;
  aiSafe?: boolean;
  riskScore?: number;
  grounded?: boolean;
}

const MODEL_META: Record<string, { label: string; color: string; dot: string }> = {
  "gemini-1.5-flash": {
    label: "Gemini 1.5 Flash",
    color: "bg-blue-500/15 border-blue-500/30 text-blue-400",
    dot: "bg-blue-400",
  },
  "mistral-7b": {
    label: "Mistral 7B",
    color: "bg-purple-500/15 border-purple-500/30 text-purple-400",
    dot: "bg-purple-400",
  },
  "llama3-8b": {
    label: "Llama 3 8B",
    color: "bg-violet-500/15 border-violet-500/30 text-violet-400",
    dot: "bg-violet-400",
  },
  "phi3-mini": {
    label: "Phi-3 Mini (Offline)",
    color: "bg-amber-500/15 border-amber-500/30 text-amber-400",
    dot: "bg-amber-400",
  },
};

const DEFAULT_META = {
  label: "AI",
  color: "bg-gray-500/15 border-gray-500/30 text-gray-400",
  dot: "bg-gray-400",
};

export function LLMStatusBadge({
  modelUsed,
  aiSafe = true,
  riskScore = 0,
  grounded = false,
}: LLMStatusBadgeProps) {
  const meta = MODEL_META[modelUsed] ?? DEFAULT_META;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-1.5 flex-wrap mt-1"
    >
      {/* Model badge */}
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-semibold tracking-wider uppercase ${meta.color}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot} animate-pulse`} />
        <Cpu className="w-3 h-3" />
        {meta.label}
      </span>

      {/* Grounded badge */}
      {grounded && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold tracking-wider uppercase bg-emerald-500/15 border-emerald-500/30 text-emerald-400">
          <CheckCircle2 className="w-3 h-3" />
          Grounded
        </span>
      )}

      {/* Risk warning */}
      {!aiSafe && riskScore > 0 && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold tracking-wider uppercase bg-red-500/15 border-red-500/30 text-red-400">
          <AlertTriangle className="w-3 h-3" />
          Verify response
        </span>
      )}
    </motion.div>
  );
}
