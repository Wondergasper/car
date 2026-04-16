"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Building, User, Mail, Phone, Database, ArrowRight, ArrowLeft, Check, CheckCircle2 } from "lucide-react";

// Validation schemas
const companySchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  industry: z.string().min(1, "Please select an industry"),
  size: z.string().min(1, "Please select company size"),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
});

const dpoSchema = z.object({
  dpoName: z.string().min(2, "DPO name must be at least 2 characters"),
  dpoEmail: z.string().email("Invalid email address"),
  dpoPhone: z.string().min(10, "Phone number must be at least 10 digits"),
});

const connectorSchema = z.object({
  connectorName: z.string().min(2, "Connector name must be at least 2 characters"),
  connectorType: z.string().min(1, "Please select a connector type"),
  connectionString: z.string().min(10, "Connection string is required"),
});

type CompanyFormData = z.infer<typeof companySchema>;
type DPOFormData = z.infer<typeof dpoSchema>;
type ConnectorFormData = z.infer<typeof connectorSchema>;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const companyForm = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      companyName: "",
      industry: "",
      size: "",
      website: "",
    },
  });

  const dpoForm = useForm<DPOFormData>({
    resolver: zodResolver(dpoSchema),
    defaultValues: {
      dpoName: "",
      dpoEmail: "",
      dpoPhone: "",
    },
  });

  const connectorForm = useForm<ConnectorFormData>({
    resolver: zodResolver(connectorSchema),
    defaultValues: {
      connectorName: "",
      connectorType: "",
      connectionString: "",
    },
  });

  const handleCompanySubmit = async (data: CompanyFormData) => {
    setStep(2);
  };

  const handleDPOSubmit = async (data: DPOFormData) => {
    setStep(3);
  };

  const handleConnectorSubmit = async (data: ConnectorFormData) => {
    setLoading(true);
    try {
      // TODO: Create connector via API
      toast.success("Onboarding complete!");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Failed to complete onboarding");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: "Company Info", icon: Building },
    { number: 2, title: "DPO Details", icon: User },
    { number: 3, title: "First Connector", icon: Database },
  ];

  return (
    <div className="min-h-screen bg-[color:var(--background)] flex items-center justify-center px-4 py-12">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-blue/20 rounded-full blur-3xl opacity-20" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-cyan/20 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="w-full max-w-2xl relative z-10 space-y-8">
        {/* Header */}
        <motion.div
          className="text-center space-y-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Welcome to CAR-Bot
          </h1>
          <p className="text-gray-400 text-lg">
            Let's set up your organization for compliance in 3 easy steps
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {steps.map((s, i) => {
            const isComplete = step > s.number;
            const isCurrent = step === s.number;
            const Icon = s.icon;

            return (
              <div key={s.number} className="flex items-center flex-1">
                {/* Step circle */}
                <motion.div
                  className={`relative flex items-center justify-center w-14 h-14 rounded-full font-semibold transition-all duration-300 flex-shrink-0 ${
                    isComplete
                      ? "bg-status-success/10 border border-status-success/30 text-status-success"
                      : isCurrent
                      ? "bg-brand-blue/20 border border-brand-blue/50 text-brand-cyan"
                      : "bg-white/5 border border-white/10 text-gray-500"
                  }`}
                  animate={isCurrent ? { scale: 1.1 } : { scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {isComplete ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </motion.div>

                {/* Connector line */}
                {i < steps.length - 1 && (
                  <motion.div
                    className={`flex-1 h-1 mx-3 rounded-full transition-all duration-300 ${
                      isComplete
                        ? "bg-status-success/30"
                        : isCurrent || step > s.number
                        ? "bg-brand-blue/30"
                        : "bg-white/10"
                    }`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  />
                )}

                {/* Step label */}
                {i === steps.length - 1 && (
                  <span className="ml-3 text-sm font-medium text-gray-400">{s.title}</span>
                )}
              </div>
            );
          })}
        </motion.div>

        {/* Step Content */}
        <motion.div
          className="glass-card rounded-2xl p-8"
          key={step}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <AnimatePresence mode="wait">
            {step === 1 && (
              <CompanyStep form={companyForm} onSubmit={handleCompanySubmit} />
            )}
            {step === 2 && (
              <DPOStep form={dpoForm} onSubmit={handleDPOSubmit} onBack={() => setStep(1)} />
            )}
            {step === 3 && (
              <ConnectorStep
                form={connectorForm}
                onSubmit={handleConnectorSubmit}
                onBack={() => setStep(2)}
                loading={loading}
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <motion.p
          className="text-center text-xs text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Your data is encrypted and secure. We never share your information.
        </motion.p>
      </div>
    </div>
  );
}

function CompanyStep({
  form,
  onSubmit,
}: {
  form: any;
  onSubmit: (data: CompanyFormData) => void;
}) {
  return (
    <motion.form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Building className="w-6 h-6 text-brand-cyan" />
          Company Information
        </h2>
        <p className="text-sm text-gray-400">Tell us about your organization</p>
      </div>

      {/* Company Name */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Company Name *</label>
        <input
          {...form.register("companyName")}
          placeholder="Your Company Ltd."
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 transition-all duration-200 focus:bg-white/10 focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/30"
        />
        {form.formState.errors.companyName && (
          <p className="text-xs text-red-400">{form.formState.errors.companyName.message}</p>
        )}
      </div>

      {/* Industry */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Industry *</label>
        <select
          {...form.register("industry")}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white transition-all duration-200 focus:bg-white/10 focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/30"
        >
          <option value="">Select an industry...</option>
          <option value="finance">Finance & Banking</option>
          <option value="healthcare">Healthcare</option>
          <option value="technology">Technology</option>
          <option value="retail">Retail & E-commerce</option>
          <option value="manufacturing">Manufacturing</option>
          <option value="education">Education</option>
          <option value="government">Government</option>
          <option value="other">Other</option>
        </select>
        {form.formState.errors.industry && (
          <p className="text-xs text-red-400">{form.formState.errors.industry.message}</p>
        )}
      </div>

      {/* Company Size */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Company Size *</label>
        <select
          {...form.register("size")}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white transition-all duration-200 focus:bg-white/10 focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/30"
        >
          <option value="">Select company size...</option>
          <option value="1-50">1-50 employees</option>
          <option value="51-200">51-200 employees</option>
          <option value="201-500">201-500 employees</option>
          <option value="501-1000">501-1000 employees</option>
          <option value="1000+">1000+ employees</option>
        </select>
        {form.formState.errors.size && (
          <p className="text-xs text-red-400">{form.formState.errors.size.message}</p>
        )}
      </div>

      {/* Website */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Website (Optional)</label>
        <input
          {...form.register("website")}
          placeholder="https://www.company.com"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 transition-all duration-200 focus:bg-white/10 focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/30"
        />
        {form.formState.errors.website && (
          <p className="text-xs text-red-400">{form.formState.errors.website.message}</p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan text-white font-semibold shadow-lg shadow-brand-blue/30 hover:shadow-xl active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-brand-cyan"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.form>
  );
}

function DPOStep({
  form,
  onSubmit,
  onBack,
}: {
  form: any;
  onSubmit: (data: DPOFormData) => void;
  onBack: () => void;
}) {
  return (
    <motion.form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <User className="w-6 h-6 text-brand-cyan" />
          Data Protection Officer
        </h2>
        <p className="text-sm text-gray-400">NDPA 2023 requires a designated DPO</p>
      </div>

      {/* DPO Name */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">DPO Name *</label>
        <input
          {...form.register("dpoName")}
          placeholder="John Doe"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 transition-all duration-200 focus:bg-white/10 focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/30"
        />
        {form.formState.errors.dpoName && (
          <p className="text-xs text-red-400">{form.formState.errors.dpoName.message}</p>
        )}
      </div>

      {/* DPO Email */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">DPO Email *</label>
        <input
          {...form.register("dpoEmail")}
          type="email"
          placeholder="dpo@company.com"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 transition-all duration-200 focus:bg-white/10 focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/30"
        />
        {form.formState.errors.dpoEmail && (
          <p className="text-xs text-red-400">{form.formState.errors.dpoEmail.message}</p>
        )}
      </div>

      {/* DPO Phone */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">DPO Phone *</label>
        <input
          {...form.register("dpoPhone")}
          placeholder="+234 123 456 7890"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 transition-all duration-200 focus:bg-white/10 focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/30"
        />
        {form.formState.errors.dpoPhone && (
          <p className="text-xs text-red-400">{form.formState.errors.dpoPhone.message}</p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-brand-cyan"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan text-white font-semibold shadow-lg shadow-brand-blue/30 hover:shadow-xl active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-brand-cyan"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.form>
  );
}

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
    { id: "postgresql", name: "PostgreSQL" },
    { id: "mysql", name: "MySQL" },
    { id: "mongodb", name: "MongoDB" },
    { id: "rest-api", name: "REST API" },
    { id: "aws-s3", name: "AWS S3" },
    { id: "other", name: "Other" },
  ];

  return (
    <motion.form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Database className="w-6 h-6 text-brand-cyan" />
          Connect Your First Data Source
        </h2>
        <p className="text-sm text-gray-400">Start auditing your data handling practices</p>
      </div>

      {/* Connector Name */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Connector Name *</label>
        <input
          {...form.register("connectorName")}
          placeholder="Production Database"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 transition-all duration-200 focus:bg-white/10 focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/30"
        />
        {form.formState.errors.connectorName && (
          <p className="text-xs text-red-400">{form.formState.errors.connectorName.message}</p>
        )}
      </div>

      {/* Connector Type */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Connector Type *</label>
        <select
          {...form.register("connectorType")}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white transition-all duration-200 focus:bg-white/10 focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/30"
        >
          <option value="">Select a connector type...</option>
          {connectorTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
        {form.formState.errors.connectorType && (
          <p className="text-xs text-red-400">{form.formState.errors.connectorType.message}</p>
        )}
      </div>

      {/* Connection String */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Connection String *</label>
        <input
          {...form.register("connectionString")}
          placeholder="postgresql://user:pass@host:5432/db"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 font-mono text-sm transition-all duration-200 focus:bg-white/10 focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/30"
        />
        {form.formState.errors.connectionString && (
          <p className="text-xs text-red-400">{form.formState.errors.connectionString.message}</p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-brand-cyan"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-status-success to-brand-emerald text-white font-semibold shadow-lg shadow-status-success/30 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-status-success"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Setting up...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Complete Setup
            </>
          )}
        </button>
      </div>
    </motion.form>
  );
}

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to CAR-Bot</h1>
          <p className="text-gray-600 mt-2">Let&apos;s get your organization set up for compliance</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {steps.map((s, i) => (
            <div key={s.number} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                  step > s.number
                    ? "bg-green-500 text-white"
                    : step === s.number
                    ? "bg-primary-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step > s.number ? <Check className="h-5 w-5" /> : s.number}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`w-20 h-1 mx-2 transition-colors ${
                    step > s.number ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-white rounded-lg shadow-lg p-8">
              {step === 1 && (
                <CompanyStep form={companyForm} onSubmit={handleCompanySubmit} />
              )}
              {step === 2 && (
                <DPOStep form={dpoForm} onSubmit={handleDPOSubmit} onBack={() => setStep(1)} />
              )}
              {step === 3 && (
                <ConnectorStep
                  form={connectorForm}
                  onSubmit={handleConnectorSubmit}
                  onBack={() => setStep(2)}
                  loading={loading}
                />
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function CompanyStep({ form, onSubmit, onBack }: { form: any; onSubmit: (data: any) => void; onBack?: () => void }) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center gap-x-3 mb-6">
        <Building className="h-6 w-6 text-primary-600" />
        <h2 className="text-xl font-semibold">Company Information</h2>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Company Name</label>
        <input
          {...form.register("companyName")}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none"
          placeholder="Your Company Ltd."
        />
        {form.formState.errors.companyName && (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.companyName.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Industry</label>
        <select
          {...form.register("industry")}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none"
        >
          <option value="">Select industry</option>
          <option value="banking">Banking & Finance</option>
          <option value="healthcare">Healthcare</option>
          <option value="telecom">Telecommunications</option>
          <option value="government">Government</option>
          <option value="education">Education</option>
          <option value="other">Other</option>
        </select>
        {form.formState.errors.industry && (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.industry.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Company Size</label>
        <select
          {...form.register("size")}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none"
        >
          <option value="">Select size</option>
          <option value="1-50">1-50 employees</option>
          <option value="51-200">51-200 employees</option>
          <option value="201-500">201-500 employees</option>
          <option value="501-1000">501-1000 employees</option>
          <option value="1000+">1000+ employees</option>
        </select>
        {form.formState.errors.size && (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.size.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Website (optional)</label>
        <input
          {...form.register("website")}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none"
          placeholder="https://www.company.com"
        />
        {form.formState.errors.website && (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.website.message}</p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="flex items-center gap-x-2 rounded-md bg-primary-600 px-6 py-2 text-sm font-semibold text-white hover:bg-primary-500"
        >
          Next
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}

function DPOStep({ form, onSubmit, onBack }: { form: any; onSubmit: (data: any) => void; onBack: () => void }) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center gap-x-3 mb-6">
        <User className="h-6 w-6 text-primary-600" />
        <h2 className="text-xl font-semibold">Data Protection Officer</h2>
      </div>

      <p className="text-sm text-gray-600">
        NDPA 2023 requires you to designate a Data Protection Officer (DPO).
      </p>

      <div>
        <label className="block text-sm font-medium text-gray-700">DPO Name</label>
        <input
          {...form.register("dpoName")}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none"
          placeholder="John Doe"
        />
        {form.formState.errors.dpoName && (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.dpoName.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">DPO Email</label>
        <input
          {...form.register("dpoEmail")}
          type="email"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none"
          placeholder="dpo@company.com"
        />
        {form.formState.errors.dpoEmail && (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.dpoEmail.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">DPO Phone</label>
        <input
          {...form.register("dpoPhone")}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none"
          placeholder="08012345678"
        />
        {form.formState.errors.dpoPhone && (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.dpoPhone.message}</p>
        )}
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-x-2 rounded-md border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          type="submit"
          className="flex items-center gap-x-2 rounded-md bg-primary-600 px-6 py-2 text-sm font-semibold text-white hover:bg-primary-500"
        >
          Next
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}

function ConnectorStep({ form, onSubmit, onBack, loading }: { form: any; onSubmit: (data: any) => void; onBack: () => void; loading: boolean }) {
  const connectorTypes = [
    { id: "postgresql", name: "PostgreSQL", icon: Database },
    { id: "mongodb", name: "MongoDB", icon: Database },
    { id: "rest-api", name: "REST API", icon: Database },
    { id: "mysql", name: "MySQL", icon: Database },
  ];

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center gap-x-3 mb-6">
        <Database className="h-6 w-6 text-primary-600" />
        <h2 className="text-xl font-semibold">Connect Your First Data Source</h2>
      </div>

      <p className="text-sm text-gray-600">
        Connect a database or API to start auditing your data handling practices.
      </p>

      <div>
        <label className="block text-sm font-medium text-gray-700">Connector Name</label>
        <input
          {...form.register("connectorName")}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none"
          placeholder="Production Database"
        />
        {form.formState.errors.connectorName && (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.connectorName.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Connector Type</label>
        <select
          {...form.register("connectorType")}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none"
        >
          <option value="">Select type</option>
          {connectorTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
        {form.formState.errors.connectorType && (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.connectorType.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Connection String</label>
        <input
          {...form.register("connectionString")}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none font-mono text-sm"
          placeholder="postgresql://user:pass@host:5432/db"
        />
        {form.formState.errors.connectionString && (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.connectionString.message}</p>
        )}
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-x-2 rounded-md border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-x-2 rounded-md bg-green-600 px-6 py-2 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-50"
        >
          <Check className="h-4 w-4" />
          {loading ? "Setting up..." : "Complete Setup"}
        </button>
      </div>
    </form>
  );
}
