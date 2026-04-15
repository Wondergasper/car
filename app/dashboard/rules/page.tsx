"use client";

import { Shield, Check, AlertTriangle, Info } from "lucide-react";

const rules = [
  {
    id: "NDPA-2023-Art25",
    article: "Article 25",
    title: "Consent Management",
    category: "Data Privacy",
    description: "Data controllers must obtain explicit, informed consent before collecting or processing personal data.",
    status: "active",
  },
  {
    id: "NDPA-2023-Art27",
    article: "Article 27",
    title: "Data Minimization",
    category: "Data Privacy",
    description: "Personal data collected must be adequate, relevant, and limited to what is necessary.",
    status: "active",
  },
  {
    id: "NDPA-2023-Art28",
    article: "Article 28",
    title: "Purpose Limitation",
    category: "Data Privacy",
    description: "Personal data must be collected for specified, explicit, and legitimate purposes.",
    status: "active",
  },
  {
    id: "NDPA-2023-Art31",
    article: "Article 31",
    title: "Access Controls",
    category: "Access Control",
    description: "Appropriate technical and organizational measures must be implemented to control access to personal data.",
    status: "active",
  },
  {
    id: "NDPA-2023-Art32",
    article: "Article 32",
    title: "Authentication",
    category: "Access Control",
    description: "Strong authentication mechanisms must be implemented for systems processing personal data.",
    status: "active",
  },
  {
    id: "NDPA-2023-Art38",
    article: "Article 38",
    title: "Encryption",
    category: "Security",
    description: "Personal data must be encrypted both at rest and in transit using industry-standard encryption.",
    status: "active",
  },
  {
    id: "NDPA-2023-Art40",
    article: "Article 40",
    title: "Audit Logging",
    category: "Security",
    description: "Comprehensive audit logs must be maintained for all access to and processing of personal data.",
    status: "active",
  },
  {
    id: "NDPA-2023-Art42",
    article: "Article 42",
    title: "Breach Notification",
    category: "Security",
    description: "Data breaches must be reported to NDPC within 72 hours of becoming aware of the breach.",
    status: "active",
  },
  {
    id: "NDPA-2023-Art45",
    article: "Article 45",
    title: "Data Subject Access Requests",
    category: "Data Subject Rights",
    description: "Data subjects have the right to access their personal data and receive a copy within 30 days.",
    status: "active",
  },
  {
    id: "NDPA-2023-Art47",
    article: "Article 47",
    title: "Right to Erasure",
    category: "Data Subject Rights",
    description: "Data subjects have the right to have their personal data erased (right to be forgotten).",
    status: "active",
  },
];

const categoryIcons: Record<string, any> = {
  "Data Privacy": Shield,
  "Access Control": Check,
  Security: AlertTriangle,
  "Data Subject Rights": Info,
};

export default function RulesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Compliance Rules</h1>
        <p className="text-gray-500 mt-1">
          NDPA 2023 rules that CAR-Bot uses for compliance auditing
        </p>
      </div>

      <div className="space-y-4">
        {rules.map((rule) => {
          const Icon = categoryIcons[rule.category] || Shield;
          return (
            <div key={rule.id} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-x-4">
                <div className="rounded-lg bg-primary-50 p-3">
                  <Icon className="h-6 w-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{rule.title}</h3>
                      <p className="text-sm text-primary-600">{rule.article} • {rule.id}</p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      {rule.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{rule.description}</p>
                  <div className="mt-3 flex items-center gap-x-3">
                    <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600">
                      {rule.category}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
