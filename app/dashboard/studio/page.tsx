"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Check,
  X,
  Edit,
  Save,
  Lightbulb,
  AlertTriangle,
  AlertCircle,
  Info,
  Eye,
  Download,
  ArrowLeft,
  ArrowRight,
  Shield,
  Code
} from "lucide-react";

const findingSchema = z.object({
  description: z.string().min(10, "Description must be at least 10 characters"),
  recommendation: z.string().min(10, "Recommendation must be at least 10 characters"),
  aiSuggestedFix: z.string().min(10, "Fix suggestion must be at least 10 characters"),
});

type FindingFormData = z.infer<typeof findingSchema>;

// Mock data - replace with API calls
const mockFindings = [
  {
    id: "1",
    rule: "NDPA-2023-Art25",
    title: "Missing Consent Records",
    severity: "critical",
    description: "No consent management system detected. The organization is collecting personal data without proper consent records for 5,000 customers.",
    recommendation: "Implement a consent management system that records when, how, and what consent was obtained from data subjects.",
    aiSuggestedFix: "Deploy a consent management platform (CMP) like OneTrust or Cookiebot that integrates with your web applications to capture and store consent records with timestamps.",
    status: "open",
    evidence: { table: "customers", affected_records: 5000, sample: "..." },
  },
  {
    id: "2",
    rule: "NDPA-2023-Art38-Rest",
    title: "Database Not Encrypted",
    severity: "high",
    description: "PostgreSQL database containing personal data is not encrypted at rest. This violates Article 38 of NDPA 2023.",
    recommendation: "Encrypt all personal data at rest using industry-standard encryption (AES-256 or equivalent).",
    aiSuggestedFix: "Enable TDE (Transparent Data Encryption) on PostgreSQL. Use pgcrypto extension for column-level encryption of sensitive fields like BVN, NIN, and emails.",
    status: "in_review",
    evidence: { database: "production_db", encryption: false },
  },
  {
    id: "3",
    rule: "NDPA-2023-Art40",
    title: "Incomplete Audit Logging",
    severity: "medium",
    description: "Access to personal data is not being fully logged. Only 40% of database queries are being audited.",
    recommendation: "Implement comprehensive audit logging for all access to and processing of personal data.",
    aiSuggestedFix: "Deploy pgAudit extension for PostgreSQL to log all SELECT, INSERT, UPDATE, DELETE statements. Configure log retention for 12 months minimum.",
    status: "accepted",
    evidence: { audit_coverage: "40%", required: "100%" },
  },
];

const severityConfig = {
  critical: { icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  high: { icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  medium: { icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  low: { icon: Info, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
};

const statusColors: Record<string, string> = {
  open: "bg-white/5 text-gray-400 border-white/10",
  in_review: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  accepted: "bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20",
  resolved: "bg-green-500/10 text-green-400 border-green-500/20",
};

export default function DocumentStudioPage() {
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [currentFindingIndex, setCurrentFindingIndex] = useState(0);

  const selectedFinding = mockFindings.find((f) => f.id === selectedFindingId) || mockFindings[currentFindingIndex];

  const handleNext = () => {
    if (currentFindingIndex < mockFindings.length - 1) {
      setCurrentFindingIndex(currentFindingIndex + 1);
      setSelectedFindingId(mockFindings[currentFindingIndex + 1].id);
      setEditMode(false);
    }
  };

  const handlePrevious = () => {
    if (currentFindingIndex > 0) {
      setCurrentFindingIndex(currentFindingIndex - 1);
      setSelectedFindingId(mockFindings[currentFindingIndex - 1].id);
      setEditMode(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Document Studio</h1>
          <p className="text-gray-400 mt-1">
            Review findings and approve AI-generated fixes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-x-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors px-4 py-2.5 text-sm font-medium text-gray-300">
            <Eye className="h-4 w-4" />
            Preview
          </button>
          <button className="flex items-center gap-x-2 rounded-xl bg-brand-blue hover:bg-brand-blue/80 transition-shadow shadow-lg shadow-brand-blue/20 px-5 py-2.5 text-sm font-semibold text-white">
            <Download className="h-4 w-4" />
            Export CAR PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Findings List */}
        <div className="lg:col-span-1">
          <div className="glass-card rounded-2xl overflow-hidden h-[calc(100vh-200px)] flex flex-col relative">
             <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/10 rounded-full blur-[40px] pointer-events-none" />
            <div className="p-5 border-b border-white/5 shrink-0 relative z-10">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Shield className="h-4 w-4 text-brand-cyan" />
                Audit Findings ({mockFindings.length})
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 pb-4">
              {mockFindings.map((finding, index) => {
                const SeverityIcon = severityConfig[finding.severity as keyof typeof severityConfig].icon;
                const isSelected = selectedFindingId === finding.id || (!selectedFindingId && index === 0);
                
                return (
                  <button
                    key={finding.id}
                    onClick={() => {
                      setSelectedFindingId(finding.id);
                      setCurrentFindingIndex(index);
                      setEditMode(false);
                    }}
                    className={`w-full text-left p-5 transition-all outline-none relative group border-b border-white/5 last:border-0 ${
                      isSelected 
                        ? "bg-brand-blue/10 border-l-4 border-l-brand-cyan shadow-[inset_0_0_20px_rgba(0,223,216,0.05)]" 
                        : "hover:bg-white/5 border-l-4 border-l-transparent"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-x-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-x-2 mb-2">
                          <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 border ${severityConfig[finding.severity as keyof typeof severityConfig].bg} ${severityConfig[finding.severity as keyof typeof severityConfig].color} ${severityConfig[finding.severity as keyof typeof severityConfig].border}`}>
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
                        <p className="text-xs font-mono text-gray-500 mt-1 truncate">{finding.rule}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Finding Detail */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedFinding.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <div className="glass-card rounded-2xl p-8 relative overflow-hidden h-full flex flex-col">
                {/* Background glow based on severity */}
                 <div className={`absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[100px] pointer-events-none opacity-20 ${severityConfig[selectedFinding.severity as keyof typeof severityConfig].color.replace('text-', 'bg-')}`} />

                {/* Navigation */}
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <div className="flex items-center gap-x-2">
                    <button
                      onClick={handlePrevious}
                      disabled={currentFindingIndex === 0}
                      className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    <span className="text-sm font-medium text-gray-500 px-2">
                      {currentFindingIndex + 1} of {mockFindings.length}
                    </span>
                    <button
                      onClick={handleNext}
                      disabled={currentFindingIndex === mockFindings.length - 1}
                      className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </div>
                  <button
                    onClick={() => setEditMode(!editMode)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors border text-sm font-medium ${
                      editMode 
                      ? "bg-gray-800 text-gray-300 border-white/10 hover:bg-gray-700" 
                      : "bg-brand-blue/10 text-brand-blue border-brand-blue/20 hover:bg-brand-blue/20"
                    }`}
                  >
                    {editMode ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                    {editMode ? "Cancel Editing" : "Edit Details"}
                  </button>
                </div>

                {/* Finding Header */}
                <div className="mb-8 relative z-10">
                  <div className="flex items-center gap-x-3 mb-2 whitespace-nowrap overflow-x-auto custom-scrollbar pb-1">
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 border text-xs font-bold uppercase tracking-wider ${severityConfig[selectedFinding.severity as keyof typeof severityConfig].color} ${severityConfig[selectedFinding.severity as keyof typeof severityConfig].border} ${severityConfig[selectedFinding.severity as keyof typeof severityConfig].bg}`}>
                      {selectedFinding.severity}
                    </span>
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 border text-xs font-bold uppercase tracking-wider ${statusColors[selectedFinding.status]}`}>
                      {selectedFinding.status.replace("_", " ")}
                    </span>
                    <span className="font-mono text-sm text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">{selectedFinding.rule}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mt-4 leading-tight">{selectedFinding.title}</h2>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 relative z-10">
                  <FindingDetailForm
                    finding={selectedFinding}
                    editMode={editMode}
                    setEditMode={setEditMode}
                    severity={selectedFinding.severity}
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function FindingDetailForm({ finding, editMode, setEditMode, severity }: { finding: any; editMode: boolean; setEditMode: (v: boolean) => void; severity: string }) {
  const form = useForm<FindingFormData>({
    resolver: zodResolver(findingSchema),
    defaultValues: {
      description: finding.description,
      recommendation: finding.recommendation,
      aiSuggestedFix: finding.aiSuggestedFix,
    },
  });

  const onSubmit = async (data: FindingFormData) => {
    // TODO: Save to API
    alert("Changes saved locally (Mock)");
    setEditMode(false);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* Description */}
      <div>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
          <FileText className="h-4 w-4" /> Issue Description
        </h3>
        {editMode ? (
          <div>
            <textarea
              {...form.register("description")}
              rows={4}
              className="w-full rounded-xl border border-white/10 bg-black/40 p-4 text-sm text-gray-200 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none transition-all resize-y"
            />
            {form.formState.errors.description && (
              <p className="mt-2 text-xs text-red-400 flex items-center gap-1"><AlertCircle className="h-3 w-3"/> {form.formState.errors.description.message}</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-300 bg-black/20 border border-white/5 rounded-xl p-5 leading-relaxed">{finding.description}</p>
        )}
      </div>

      {/* Recommendation */}
      <div>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
          <Check className="h-4 w-4" /> Recommendation
        </h3>
        {editMode ? (
          <div>
            <textarea
              {...form.register("recommendation")}
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-black/40 p-4 text-sm text-gray-200 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none transition-all resize-y"
            />
            {form.formState.errors.recommendation && (
              <p className="mt-2 text-xs text-red-400 flex items-center gap-1"><AlertCircle className="h-3 w-3"/> {form.formState.errors.recommendation.message}</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-300 bg-black/20 border border-white/5 rounded-xl p-5 leading-relaxed">{finding.recommendation}</p>
        )}
      </div>

      {/* AI Suggestion */}
      <div className="rounded-2xl border-2 border-brand-purple/30 bg-gradient-to-br from-brand-purple/10 to-transparent p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
           <Lightbulb className="h-32 w-32" />
        </div>
        <h3 className="flex items-center gap-2 text-sm font-bold text-brand-purple mb-4 uppercase tracking-wider relative z-10">
          <Lightbulb className="h-5 w-5" /> AI Auto-Remediation Plan
        </h3>
        {editMode ? (
          <div className="relative z-10">
            <textarea
              {...form.register("aiSuggestedFix")}
              rows={4}
              className="w-full rounded-xl border border-brand-purple/40 bg-black/50 p-4 text-sm text-brand-purple/90 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple focus:outline-none transition-all resize-y placeholder-brand-purple/30"
            />
            {form.formState.errors.aiSuggestedFix && (
              <p className="mt-2 text-xs text-red-400 flex items-center gap-1"><AlertCircle className="h-3 w-3"/> {form.formState.errors.aiSuggestedFix.message}</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-brand-purple/90 font-medium leading-relaxed relative z-10">{finding.aiSuggestedFix}</p>
        )}
      </div>

      {/* Evidence */}
      <div>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
          <Code className="h-4 w-4" /> Technical Evidence
        </h3>
        <div className="rounded-xl border border-gray-800 bg-gray-950 overflow-hidden">
          <div className="flex items-center px-4 py-2 bg-gray-900 border-b border-gray-800">
             <span className="flex gap-1.5">
               <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
               <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
               <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
             </span>
             <span className="ml-3 text-xs font-mono text-gray-500">payload.json</span>
          </div>
          <pre className="text-xs font-mono text-green-400/90 p-4 overflow-x-auto">
            {JSON.stringify(finding.evidence, null, 2)}
          </pre>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-8 flex flex-wrap items-center gap-3">
        {editMode ? (
          <>
            <button
              type="submit"
              className="flex items-center gap-x-2 rounded-xl bg-green-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-green-400 shadow-lg shadow-green-500/20 transition-all"
            >
              <Save className="h-4 w-4" />
              Save Modifications
            </button>
            <button
              type="button"
              onClick={() => setEditMode(false)}
              className="rounded-xl border border-white/10 bg-transparent px-6 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors"
            >
              Revert
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="flex items-center gap-x-2 rounded-xl bg-brand-cyan hover:bg-brand-cyan/80 px-6 py-2.5 text-sm font-bold text-gray-900 shadow-lg shadow-brand-cyan/20 transition-all"
            >
              <Check className="h-4 w-4" />
              Approve AI Fix
            </button>
            <button
              type="button"
              className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-6 py-2.5 text-sm font-medium text-white transition-colors"
            >
              Mark Resolved
            </button>
            <button
              type="button"
              className="rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 px-6 py-2.5 text-sm font-medium text-red-400 transition-colors ml-auto sm:ml-0"
            >
              Accept Risk
            </button>
          </>
        )}
      </div>
    </form>
  );
}
