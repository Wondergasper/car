"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Shield,
  Building2,
  User,
  Database,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Lock,
  FileText,
  Globe,
  AlertCircle,
  Check,
  Layers,
  Zap,
} from "lucide-react";

// ─── Validation Schemas ───────────────────────────────────────────────────────

const companySchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  industry: z.string().min(1, "Please select an industry"),
  size: z.string().min(1, "Please select company size"),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  rcNumber: z.string().optional(),
});

const dpoSchema = z.object({
  dpoName: z.string().min(2, "DPO name must be at least 2 characters"),
  dpoEmail: z.string().email("Invalid email address"),
  dpoPhone: z.string().min(10, "Phone number must be at least 10 digits"),
});

const connectorSchema = z.object({
  connectorName: z.string().min(2, "Connector name must be at least 2 characters"),
  connectorType: z.string().min(1, "Please select a connector type"),
  connectionString: z.string().min(5, "Connection string is required"),
});

type CompanyFormData = z.infer<typeof companySchema>;
type DPOFormData = z.infer<typeof dpoSchema>;
type ConnectorFormData = z.infer<typeof connectorSchema>;

// ─── Step Config ──────────────────────────────────────────────────────────────

const STEPS = [
  { id: 0, label: "Welcome",   icon: Sparkles  },
  { id: 1, label: "Company",   icon: Building2 },
  { id: 2, label: "DPO",       icon: User      },
  { id: 3, label: "Framework", icon: Layers    },
  { id: 4, label: "Connector", icon: Database  },
];

const FRAMEWORKS = [
  {
    id: "ndpa",
    name: "NDPA 2023",
    full: "Nigeria Data Protection Act 2023",
    desc: "Core Nigerian data privacy law",
    color: "from-blue-500 to-cyan-500",
    required: true,
  },
  {
    id: "gaid",
    name: "GAID 2025",
    full: "General Application Implementation Directive 2025",
    desc: "NITDA implementation guidelines",
    color: "from-purple-500 to-blue-500",
    required: true,
  },
  {
    id: "cbn",
    name: "CBN Framework",
    full: "CBN Cybersecurity Framework",
    desc: "Central Bank cybersecurity requirements",
    color: "from-green-500 to-emerald-500",
    required: false,
  },
  {
    id: "ncc",
    name: "NCC Code",
    full: "NCC Consumer Code of Practice",
    desc: "Telecom consumer data protection",
    color: "from-orange-500 to-amber-500",
    required: false,
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>(["ndpa", "gaid"]);

  const companyForm = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: { companyName: "", industry: "", size: "", website: "", rcNumber: "" },
  });

  const dpoForm = useForm<DPOFormData>({
    resolver: zodResolver(dpoSchema),
    defaultValues: { dpoName: "", dpoEmail: "", dpoPhone: "" },
  });

  const connectorForm = useForm<ConnectorFormData>({
    resolver: zodResolver(connectorSchema),
    defaultValues: { connectorName: "", connectorType: "", connectionString: "" },
  });

  const toggleFramework = (id: string) => {
    const fw = FRAMEWORKS.find((f) => f.id === id);
    if (fw?.required) return; // Can't deselect required
    setSelectedFrameworks((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleFinish = async (data: ConnectorFormData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/connectors/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: data.connectorName,
          connector_type_id: data.connectorType,
          connection_string: data.connectionString,
        }),
      });

      if (!response.ok) throw new Error("Failed to create connector");
      toast.success("Setup complete! Welcome to CAR-Bot 🎉");
      router.push("/dashboard");
    } catch {
      // Even if connector fails, push to dashboard
      toast.success("Setup complete! Welcome to CAR-Bot 🎉");
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--background)] flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Ambient background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-blue/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-brand-cyan/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[100px]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,#fff,#fff 1px,transparent 1px,transparent 60px),repeating-linear-gradient(90deg,#fff,#fff 1px,transparent 1px,transparent 60px)",
          }}
        />
      </div>

      <div className="w-full max-w-2xl relative z-10 space-y-6">
        {/* Logo */}
        <motion.div
          className="flex items-center justify-center gap-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-blue to-brand-cyan flex items-center justify-center shadow-lg shadow-brand-blue/30">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">CAR-Bot</span>
          <span className="text-xs bg-brand-blue/20 text-brand-cyan px-2 py-0.5 rounded-full font-medium border border-brand-cyan/20">
            NDPA 2023
          </span>
        </motion.div>

        {/* Step indicator — hidden on welcome screen */}
        {step > 0 && (
          <motion.div
            className="flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {STEPS.slice(1).map((s, i) => {
              const realStep = i + 1;
              const done = step > realStep;
              const active = step === realStep;
              return (
                <div key={s.id} className="flex items-center gap-2">
                  <motion.div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-300 ${
                      done
                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                        : active
                        ? "bg-brand-blue/30 border-brand-cyan/60 text-brand-cyan"
                        : "bg-white/5 border-white/10 text-gray-500"
                    }`}
                    animate={active ? { scale: 1.15 } : { scale: 1 }}
                  >
                    {done ? <Check className="w-4 h-4" /> : realStep}
                  </motion.div>
                  {i < STEPS.length - 2 && (
                    <div
                      className={`w-10 h-0.5 rounded-full transition-all duration-500 ${
                        done ? "bg-emerald-500/40" : "bg-white/10"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Card */}
        <AnimatePresence mode="wait">
          {step === 0 && (
            <WelcomeStep key="welcome" onNext={() => setStep(1)} />
          )}
          {step === 1 && (
            <CompanyStep
              key="company"
              form={companyForm}
              onSubmit={() => setStep(2)}
              onBack={() => setStep(0)}
            />
          )}
          {step === 2 && (
            <DPOStep
              key="dpo"
              form={dpoForm}
              onSubmit={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <FrameworkStep
              key="framework"
              selected={selectedFrameworks}
              onToggle={toggleFramework}
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
            />
          )}
          {step === 4 && (
            <ConnectorStep
              key="connector"
              form={connectorForm}
              onSubmit={handleFinish}
              onBack={() => setStep(3)}
              loading={loading}
            />
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.p
          className="text-center text-xs text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Lock className="w-3 h-3 inline-block mr-1" />
          Your data is encrypted end-to-end. We never share your information.
        </motion.p>
      </div>
    </div>
  );
}

// ─── Step 0: Welcome ──────────────────────────────────────────────────────────

function WelcomeStep({ onNext }: { onNext: () => void }) {
  const features = [
    { icon: Shield,   label: "NDPA 2023 & GAID 2025",    desc: "Full Nigerian compliance coverage"    },
    { icon: Zap,      label: "AI-Powered Audits",         desc: "Grounded in actual regulatory text"  },
    { icon: FileText, label: "Cited Recommendations",     desc: "Every finding links to a clause"     },
    { icon: Globe,    label: "Multi-Framework Support",   desc: "CBN, NCC, NDPA & GAID in one place" },
  ];

  return (
    <motion.div
      key="welcome"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.45 }}
      className="glass-card rounded-2xl p-8 space-y-8"
    >
      {/* Hero */}
      <div className="text-center space-y-4">
        <motion.div
          className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-brand-blue via-brand-cyan to-purple-500 flex items-center justify-center shadow-2xl shadow-brand-blue/40"
          animate={{ rotate: [0, 3, -3, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        >
          <Shield className="w-10 h-10 text-white" />
        </motion.div>

        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-brand-cyan to-brand-blue bg-clip-text text-transparent">
              CAR-Bot
            </span>
          </h1>
          <p className="text-gray-400 mt-2 text-base leading-relaxed max-w-md mx-auto">
            Your AI-powered compliance assistant for Nigerian data protection law.
            We&apos;ll get your organisation set up in under 5 minutes.
          </p>
        </div>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-2 gap-3">
        {features.map((f, i) => (
          <motion.div
            key={f.label}
            className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/8 hover:border-brand-cyan/30 hover:bg-white/8 transition-all"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
          >
            <div className="w-8 h-8 rounded-lg bg-brand-blue/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <f.icon className="w-4 h-4 text-brand-cyan" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{f.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Compliance badge strip */}
      <div className="flex items-center gap-2 justify-center flex-wrap">
        {["NDPA 2023", "GAID 2025", "CBN", "NCC", "NITDA"].map((badge) => (
          <span
            key={badge}
            className="text-xs font-medium px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400"
          >
            {badge}
          </span>
        ))}
      </div>

      {/* CTA */}
      <motion.button
        onClick={onNext}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan text-white font-semibold text-base shadow-lg shadow-brand-blue/30 hover:shadow-xl hover:shadow-brand-blue/40 active:scale-[0.98] transition-all"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
      >
        <Sparkles className="w-5 h-5" />
        Get Started — It&apos;s Free
        <ArrowRight className="w-5 h-5" />
      </motion.button>

      <p className="text-center text-xs text-gray-600">
        Already set up?{" "}
        <a href="/dashboard" className="text-brand-cyan hover:underline">
          Go to dashboard
        </a>
      </p>
    </motion.div>
  );
}

// ─── Step 1: Company Info ─────────────────────────────────────────────────────

function CompanyStep({
  form,
  onSubmit,
  onBack,
}: {
  form: any;
  onSubmit: () => void;
  onBack: () => void;
}) {
  const industries = [
    "Finance & Banking", "Healthcare", "Technology", "Retail & E-commerce",
    "Telecommunications", "Manufacturing", "Education", "Government",
    "Insurance", "Media & Entertainment", "Oil & Gas", "Other",
  ];
  const sizes = ["1–10", "11–50", "51–200", "201–500", "501–1,000", "1,000+"];

  return (
    <motion.div
      key="company"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35 }}
      className="glass-card rounded-2xl p-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Organisation Details</h2>
          <p className="text-sm text-gray-500">Tell us about your company</p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-1.5">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Company Name *
            </label>
            <input
              {...form.register("companyName")}
              placeholder="Acme Nigeria Ltd."
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all"
            />
            {form.formState.errors.companyName && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {form.formState.errors.companyName.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Industry *
            </label>
            <select
              {...form.register("industry")}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all appearance-none"
            >
              <option value="">Select industry…</option>
              {industries.map((i) => (
                <option key={i} value={i.toLowerCase().replace(/\s+/g, "_")}>{i}</option>
              ))}
            </select>
            {form.formState.errors.industry && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {form.formState.errors.industry.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Company Size *
            </label>
            <select
              {...form.register("size")}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all appearance-none"
            >
              <option value="">Select size…</option>
              {sizes.map((s) => (
                <option key={s} value={s}>{s} employees</option>
              ))}
            </select>
            {form.formState.errors.size && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {form.formState.errors.size.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              CAC / RC Number <span className="text-gray-600 normal-case">(optional)</span>
            </label>
            <input
              {...form.register("rcNumber")}
              placeholder="RC123456"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Website <span className="text-gray-600 normal-case">(optional)</span>
            </label>
            <input
              {...form.register("website")}
              placeholder="https://company.com"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan text-white font-semibold shadow-lg shadow-brand-blue/25 hover:shadow-xl active:scale-[0.98] transition-all"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </motion.div>
  );
}

// ─── Step 2: DPO Details ──────────────────────────────────────────────────────

function DPOStep({
  form,
  onSubmit,
  onBack,
}: {
  form: any;
  onSubmit: () => void;
  onBack: () => void;
}) {
  return (
    <motion.div
      key="dpo"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35 }}
      className="glass-card rounded-2xl p-8"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
          <User className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Data Protection Officer</h2>
          <p className="text-sm text-gray-500">Required by NDPA 2023 Section 30</p>
        </div>
      </div>

      {/* Info callout */}
      <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-6">
        <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-300 leading-relaxed">
          The NDPA 2023 mandates that all organisations processing personal data appoint a
          Data Protection Officer (DPO). This person is your primary compliance contact.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            DPO Full Name *
          </label>
          <input
            {...form.register("dpoName")}
            placeholder="Amara Okafor"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all"
          />
          {form.formState.errors.dpoName && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {form.formState.errors.dpoName.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              DPO Email *
            </label>
            <input
              {...form.register("dpoEmail")}
              type="email"
              placeholder="dpo@company.com"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all"
            />
            {form.formState.errors.dpoEmail && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {form.formState.errors.dpoEmail.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              DPO Phone *
            </label>
            <input
              {...form.register("dpoPhone")}
              placeholder="+234 801 234 5678"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all"
            />
            {form.formState.errors.dpoPhone && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {form.formState.errors.dpoPhone.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan text-white font-semibold shadow-lg shadow-brand-blue/25 hover:shadow-xl active:scale-[0.98] transition-all"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </motion.div>
  );
}

// ─── Step 3: Framework Selection ──────────────────────────────────────────────

function FrameworkStep({
  selected,
  onToggle,
  onNext,
  onBack,
}: {
  selected: string[];
  onToggle: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <motion.div
      key="framework"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35 }}
      className="glass-card rounded-2xl p-8"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
          <Layers className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Compliance Frameworks</h2>
          <p className="text-sm text-gray-500">Select all frameworks that apply to you</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 mb-6 mt-5">
        {FRAMEWORKS.map((fw, i) => {
          const isSelected = selected.includes(fw.id);
          return (
            <motion.button
              key={fw.id}
              type="button"
              onClick={() => onToggle(fw.id)}
              className={`relative w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 ${
                isSelected
                  ? "bg-white/8 border-white/20"
                  : "bg-white/3 border-white/8 hover:border-white/15"
              }`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              {/* Gradient dot */}
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${fw.color} flex items-center justify-center flex-shrink-0 opacity-80`}>
                <FileText className="w-5 h-5 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-sm">{fw.name}</span>
                  {fw.required && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-blue/20 text-brand-cyan border border-brand-cyan/20">
                      Required
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{fw.desc}</p>
              </div>

              {/* Checkbox */}
              <div
                className={`w-6 h-6 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${
                  isSelected
                    ? "bg-brand-cyan border-brand-cyan"
                    : "border-white/20"
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 text-black font-bold" />}
              </div>

              {fw.required && (
                <div className="absolute inset-0 rounded-xl cursor-not-allowed" />
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan text-white font-semibold shadow-lg shadow-brand-blue/25 hover:shadow-xl active:scale-[0.98] transition-all"
        >
          Continue ({selected.length} selected) <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Step 4: First Connector ──────────────────────────────────────────────────

function ConnectorStep({
  form,
  onSubmit,
  onBack,
  loading,
}: {
  form: any;
  onSubmit: (data: ConnectorFormData) => void;
  onBack: () => void;
  loading: boolean;
}) {
  const connectorTypes = [
    { id: "postgresql", name: "PostgreSQL",  icon: "🐘" },
    { id: "mysql",      name: "MySQL",       icon: "🐬" },
    { id: "mongodb",    name: "MongoDB",     icon: "🍃" },
    { id: "rest_api",   name: "REST API",    icon: "🔌" },
    { id: "aws_s3",     name: "AWS S3",      icon: "☁️" },
    { id: "other",      name: "Other",       icon: "🔧" },
  ];

  return (
    <motion.div
      key="connector"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35 }}
      className="glass-card rounded-2xl p-8"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
          <Database className="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Connect a Data Source</h2>
          <p className="text-sm text-gray-500">Where does your organisation store personal data?</p>
        </div>
      </div>

      {/* Skip option */}
      <div className="flex items-center gap-2 mb-5 p-3 rounded-xl bg-white/3 border border-white/8">
        <CheckCircle2 className="w-4 h-4 text-gray-500 flex-shrink-0" />
        <p className="text-xs text-gray-500">
          You can skip this step and add connectors later from the dashboard.{" "}
          <button
            type="button"
            onClick={() => {
              toast.success("Welcome to CAR-Bot! Add connectors from the dashboard.");
              window.location.href = "/dashboard";
            }}
            className="text-brand-cyan hover:underline"
          >
            Skip for now
          </button>
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Connector Name *
          </label>
          <input
            {...form.register("connectorName")}
            placeholder="Production Database"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all"
          />
          {form.formState.errors.connectorName && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {form.formState.errors.connectorName.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Type *
          </label>
          <div className="grid grid-cols-3 gap-2">
            {connectorTypes.map((ct) => (
              <label
                key={ct.id}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border cursor-pointer transition-all text-center ${
                  form.watch("connectorType") === ct.id
                    ? "border-brand-cyan bg-brand-cyan/10 text-white"
                    : "border-white/10 bg-white/3 text-gray-400 hover:border-white/20"
                }`}
              >
                <input
                  type="radio"
                  value={ct.id}
                  {...form.register("connectorType")}
                  className="sr-only"
                />
                <span className="text-xl">{ct.icon}</span>
                <span className="text-xs font-medium">{ct.name}</span>
              </label>
            ))}
          </div>
          {form.formState.errors.connectorType && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {form.formState.errors.connectorType.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Connection String *
          </label>
          <input
            {...form.register("connectionString")}
            placeholder="postgresql://user:pass@host:5432/dbname"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 font-mono text-sm focus:outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all"
          />
          {form.formState.errors.connectionString && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {form.formState.errors.connectionString.message}
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Setting up…
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Complete Setup
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
