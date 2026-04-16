"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Building, User, Mail, Phone, Database, ArrowRight, ArrowLeft, Check } from "lucide-react";

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
    { number: 1, title: "Company Info" },
    { number: 2, title: "DPO Details" },
    { number: 3, title: "First Connector" },
  ];

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
