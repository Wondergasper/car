"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
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
  critical: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  high: { icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
  medium: { icon: AlertTriangle, color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" },
  low: { icon: Info, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
};

const statusColors: Record<string, string> = {
  open: "bg-gray-100 text-gray-800",
  in_review: "bg-yellow-100 text-yellow-800",
  accepted: "bg-green-100 text-green-800",
  resolved: "bg-blue-100 text-blue-800",
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Studio</h1>
          <p className="text-gray-500 mt-1">
            Review findings and approve AI-generated fixes
          </p>
        </div>
        <div className="flex items-center gap-x-3">
          <button className="flex items-center gap-x-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Eye className="h-4 w-4" />
            Preview Report
          </button>
          <button className="flex items-center gap-x-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500">
            <Download className="h-4 w-4" />
            Generate CAR PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Findings List */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Findings ({mockFindings.length})</h3>
            </div>
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {mockFindings.map((finding, index) => {
                const SeverityIcon = severityConfig[finding.severity as keyof typeof severityConfig].icon;
                return (
                  <button
                    key={finding.id}
                    onClick={() => {
                      setSelectedFindingId(finding.id);
                      setCurrentFindingIndex(index);
                      setEditMode(false);
                    }}
                    className={`w-full text-left p-4 transition-colors hover:bg-gray-50 ${
                      selectedFindingId === finding.id ? "bg-primary-50 border-l-4 border-l-primary-600" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-x-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-x-2">
                          <SeverityIcon className={`h-4 w-4 ${severityConfig[finding.severity as keyof typeof severityConfig].color}`} />
                          <p className="text-sm font-semibold text-gray-900 truncate">{finding.rule}</p>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 truncate">{finding.title}</p>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium mt-2 ${statusColors[finding.status]}`}>
                          {finding.status.replace("_", " ")}
                        </span>
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
            >
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                {/* Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-x-3">
                    <button
                      onClick={handlePrevious}
                      disabled={currentFindingIndex === 0}
                      className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={currentFindingIndex === mockFindings.length - 1}
                      className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </button>
                    <span className="text-sm text-gray-500">
                      {currentFindingIndex + 1} / {mockFindings.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setEditMode(!editMode)}
                    className="p-2 text-gray-400 hover:text-primary-600 rounded-md hover:bg-gray-100"
                  >
                    {editMode ? <X className="h-5 w-5" /> : <Edit className="h-5 w-5" />}
                  </button>
                </div>

                {/* Finding Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-x-3 mb-2">
                    <span className="text-lg font-bold text-gray-900">{selectedFinding.rule}</span>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusColors[selectedFinding.status]}`}>
                      {selectedFinding.status.replace("_", " ")}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedFinding.title}</h2>
                </div>

                {/* Content */}
                <FindingDetailForm
                  finding={selectedFinding}
                  editMode={editMode}
                  setEditMode={setEditMode}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function FindingDetailForm({ finding, editMode, setEditMode }: { finding: any; editMode: boolean; setEditMode: (v: boolean) => void }) {
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
    toast.success("Changes saved");
    setEditMode(false);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
        {editMode ? (
          <>
            <textarea
              {...form.register("description")}
              rows={3}
              className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-primary-500 focus:outline-none"
            />
            {form.formState.errors.description && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.description.message}</p>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-600 bg-gray-50 rounded-md p-3">{finding.description}</p>
        )}
      </div>

      {/* Recommendation */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Recommendation</label>
        {editMode ? (
          <>
            <textarea
              {...form.register("recommendation")}
              rows={3}
              className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-primary-500 focus:outline-none"
            />
            {form.formState.errors.recommendation && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.recommendation.message}</p>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-600 bg-gray-50 rounded-md p-3">{finding.recommendation}</p>
        )}
      </div>

      {/* AI Suggestion */}
      <div className={`rounded-lg border-2 ${severityConfig.medium.border} bg-blue-50 p-4`}>
        <div className="flex items-center gap-x-2 mb-2">
          <Lightbulb className="h-5 w-5 text-blue-600" />
          <label className="text-sm font-semibold text-blue-800">AI Suggested Fix</label>
        </div>
        {editMode ? (
          <>
            <textarea
              {...form.register("aiSuggestedFix")}
              rows={3}
              className="w-full rounded-md border border-blue-300 bg-white p-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            {form.formState.errors.aiSuggestedFix && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.aiSuggestedFix.message}</p>
            )}
          </>
        ) : (
          <p className="text-sm text-blue-700">{finding.aiSuggestedFix}</p>
        )}
      </div>

      {/* Evidence */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Evidence</label>
        <pre className="text-xs bg-gray-900 text-green-400 rounded-md p-3 overflow-x-auto">
          {JSON.stringify(finding.evidence, null, 2)}
        </pre>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-x-3 pt-4 border-t border-gray-200">
        {editMode ? (
          <>
            <button
              type="submit"
              className="flex items-center gap-x-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setEditMode(false)}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="flex items-center gap-x-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500"
            >
              <Check className="h-4 w-4" />
              Accept Fix
            </button>
            <button
              type="button"
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Mark as Resolved
            </button>
            <button
              type="button"
              className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
            >
              Accept Risk
            </button>
          </>
        )}
      </div>
    </form>
  );
}
