"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Bot, User, Loader2, Sparkles,
  ChevronDown, BookOpen, Shield,
} from "lucide-react";
import { chatApi, auditsApi } from "@/lib/api";
import { CitationCard } from "@/components/CitationCard";
import { LLMStatusBadge } from "@/components/LLMStatusBadge";

interface Citation {
  source: string;
  page: number;
  article: string;
  text: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  citations?: Citation[];
  grounded?: boolean;
  modelUsed?: string;
  aiSafe?: boolean;
  riskScore?: number;
}

const SUGGESTED_QUESTIONS = [
  "What are my top 3 compliance risks right now?",
  "What does NDPA 2023 Article 43 require for breach notification?",
  "Do I need to appoint a DPO under the NDPA?",
  "How can I improve my compliance score?",
  "What are the CAR filing requirements under GAID 2025?",
  "Which CBN cybersecurity controls apply to my organisation?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [auditId, setAuditId] = useState<string | undefined>();
  const [audits, setAudits] = useState<any[]>([]);
  const [useRag, setUseRag] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    auditsApi.list(0, 10).then((res) => {
      const completed = res.data.filter((a: any) => a.status === "completed");
      setAudits(completed);
      if (completed.length > 0) setAuditId(completed[0].id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await chatApi.send({
        message: text,
        audit_id: auditId,
        history,
        use_rag: useRag,
      });
      const data = res.data;
      const reply: Message = {
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
        citations: data.citations || [],
        grounded: data.grounded || false,
        modelUsed: data.model_used || "gemini-1.5-flash",
        aiSafe: data.ai_safe !== false,
        riskScore: data.risk_score || 0,
      };
      setMessages((prev) => [...prev, reply]);
    } catch (e: any) {
      const errMsg: Message = {
        role: "assistant",
        content: `Sorry, I encountered an error: ${e?.response?.data?.detail || "Please try again."}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col max-w-5xl mx-auto relative">
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-brand-purple/10 rounded-full blur-[100px] -z-10" />
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-brand-cyan/10 rounded-full blur-[100px] -z-10" />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-end justify-between px-2"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-brand-purple via-brand-blue to-brand-cyan flex items-center justify-center shadow-lg shadow-brand-blue/20">
              <Sparkles className="h-5 w-5 text-white animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Compliance <span className="text-gradient">Intelligence</span>
            </h1>
          </div>
          <div className="flex items-center gap-3 ml-1">
            <p className="text-gray-400 text-sm font-medium">
              Powered by RAG | Gemini | Mistral | Llama 3
            </p>
            <button
              onClick={() => setUseRag((v) => !v)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold transition-all ${
                useRag
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                  : "bg-white/5 border-white/10 text-gray-500"
              }`}
            >
              <BookOpen className="w-3 h-3" />
              {useRag ? "RAG On" : "RAG Off"}
            </button>
          </div>
        </div>

        {audits.length > 0 && (
          <div className="relative group">
            <div className="absolute inset-0 bg-brand-cyan/20 blur-md rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <select
              value={auditId}
              onChange={(e) => setAuditId(e.target.value)}
              className="relative appearance-none bg-white/[0.03] border border-white/10 text-white text-sm font-semibold rounded-xl pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-cyan/40 cursor-pointer hover:bg-white/[0.06] transition-all backdrop-blur-md"
            >
              {audits.map((a) => (
                <option key={a.id} value={a.id} className="bg-gray-900">
                  {a.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        )}
      </motion.div>

      <div className="flex-1 glass-card rounded-3xl flex flex-col overflow-hidden border border-white/10 shadow-2xl bg-white/[0.02] backdrop-blur-xl relative">
        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center max-w-2xl mx-auto">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-brand-cyan/30 blur-2xl rounded-full" />
                <div className="relative h-20 w-20 rounded-3xl bg-gradient-to-br from-brand-purple/20 to-brand-blue/20 border border-white/10 flex items-center justify-center backdrop-blur-xl">
                  <Bot className="h-10 w-10 text-brand-cyan" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">How can I help with your compliance?</h2>
              <p className="text-gray-400 text-sm mb-2 leading-relaxed">
                Responses are grounded in official regulatory text from NDPA 2023 and GAID 2025.
              </p>
              <div className="flex items-center gap-1.5 mb-8">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs text-emerald-400 font-medium">RAG-grounded | Article citations included</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-left px-5 py-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-brand-cyan/30 text-gray-400 hover:text-white text-sm transition-all group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex items-start gap-3">
                      <span className="text-brand-cyan font-bold mt-0.5">-&gt;</span>
                      <span>{q}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-brand-blue to-brand-cyan border border-white/20"
                    : "bg-white/[0.05] border border-white/10"
                }`}>
                  {msg.role === "user"
                    ? <User className="h-5 w-5 text-white" />
                    : <Bot className="h-5 w-5 text-brand-cyan" />}
                </div>

                <div className={`max-w-[85%] sm:max-w-[75%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
                  <div className={`rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-xl relative group ${
                    msg.role === "user"
                      ? "bg-brand-blue/10 text-white border border-brand-blue/30 rounded-tr-sm"
                      : "bg-white/[0.04] text-gray-200 border border-white/10 rounded-tl-sm backdrop-blur-md"
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <div className={`text-[10px] uppercase font-bold tracking-widest mt-3 opacity-40 group-hover:opacity-100 transition-opacity ${
                      msg.role === "user" ? "text-right" : "text-left"
                    }`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>

                  {msg.role === "assistant" && (
                    <div className="w-full mt-1 px-1">
                      {msg.modelUsed && (
                        <LLMStatusBadge
                          modelUsed={msg.modelUsed}
                          aiSafe={msg.aiSafe}
                          riskScore={msg.riskScore}
                          grounded={msg.grounded}
                        />
                      )}
                      {msg.citations && msg.citations.length > 0 && (
                        <CitationCard
                          citations={msg.citations}
                          grounded={msg.grounded || false}
                          modelUsed={msg.modelUsed}
                        />
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4"
            >
              <div className="h-10 w-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center flex-shrink-0">
                <Bot className="h-5 w-5 text-brand-cyan animate-pulse" />
              </div>
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl rounded-tl-sm px-6 py-4 flex flex-col gap-2 shadow-lg backdrop-blur-md">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-bounce [animation-delay:0ms]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-bounce [animation-delay:150ms]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-bounce [animation-delay:300ms]" />
                </div>
                {useRag && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    <span className="text-[10px] uppercase font-bold tracking-widest text-brand-cyan/60">Scanning Regulatory Corpus</span>
                    <span className="flex h-1.5 w-1.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-cyan opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-cyan"></span>
                    </span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} className="h-4" />
        </div>

        <div className="border-t border-white/10 p-6 bg-black/20 backdrop-blur-xl">
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
            className="flex gap-4 relative group"
          >
            <div className="absolute inset-0 bg-brand-cyan/5 blur-xl rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity -z-10" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={useRag ? "Ask about a regulation or your compliance posture..." : "Message CAR-Bot assistant..."}
              disabled={loading}
              className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white text-base placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:bg-white/[0.05] transition-all disabled:opacity-50 shadow-inner"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-4 rounded-2xl bg-gradient-to-r from-brand-blue via-brand-blue to-brand-cyan text-white font-bold text-sm disabled:opacity-40 hover:shadow-[0_0_30px_rgba(0,223,216,0.2)] active:scale-95 transition-all flex items-center justify-center gap-2 min-w-[60px]"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </form>
          <p className="text-center text-[10px] text-gray-600 mt-4 font-medium uppercase tracking-[0.2em]">
            {useRag ? "RAG corpus: NDPA 2023 | GAID 2025 (official PDFs)" : "Responses may vary based on data availability"}
          </p>
        </div>
      </div>
    </div>
  );
}
