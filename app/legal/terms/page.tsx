import Link from "next/link";

const sections = [
  {
    title: "Service Scope",
    body:
      "CAR-Bot provides compliance monitoring, audit support, and reporting workflows. It does not replace legal advice or regulatory determinations made by counsel or supervisory authorities.",
  },
  {
    title: "Account Use",
    body:
      "You must keep login credentials secure, use the platform only for authorised business purposes, and ensure invited users have permission to access the underlying compliance data.",
  },
  {
    title: "Customer Data",
    body:
      "You retain ownership of your organisation data. By using the service, you authorise CAR-Bot to process that data only as required to operate the application and generate compliance outputs.",
  },
  {
    title: "Availability",
    body:
      "We aim to keep the platform available and reliable, but access may occasionally be interrupted for maintenance, upgrades, or issues outside the control of the application.",
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[color:var(--background)] px-4 py-16">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-3">
          <Link href="/login" className="text-sm font-medium text-brand-cyan hover:text-brand-blue transition-colors">
            Back to sign in
          </Link>
          <h1 className="text-4xl font-bold tracking-tight text-white">Terms of Service</h1>
          <p className="text-sm leading-7 text-gray-400">
            This page provides an in-app terms summary so the authentication flow and footer links resolve correctly during onboarding and sign-in.
          </p>
        </div>

        <div className="space-y-6">
          {sections.map((section) => (
            <section key={section.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-lg font-semibold text-white">{section.title}</h2>
              <p className="mt-2 text-sm leading-7 text-gray-300">{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
