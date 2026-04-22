import Link from "next/link";

const sections = [
  {
    title: "Information We Collect",
    body:
      "We collect account details, organisation metadata, connector configuration supplied by your team, and audit evidence required to generate compliance findings and reports.",
  },
  {
    title: "How We Use Data",
    body:
      "Your data is used to authenticate users, run compliance checks, generate reports, and improve the accuracy of the CAR-Bot workflow inside your organisation.",
  },
  {
    title: "Security and Retention",
    body:
      "CAR-Bot is designed to store only the data needed to operate the service. Access is restricted to authorised users, and audit artefacts should be reviewed and removed according to your retention obligations.",
  },
  {
    title: "Your Responsibilities",
    body:
      "You are responsible for ensuring your organisation has the legal basis to upload personal data and for configuring connectors so they align with NDPA 2023 and any sector-specific obligations.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[color:var(--background)] px-4 py-16">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-3">
          <Link href="/login" className="text-sm font-medium text-brand-cyan hover:text-brand-blue transition-colors">
            Back to sign in
          </Link>
          <h1 className="text-4xl font-bold tracking-tight text-white">Privacy Policy</h1>
          <p className="text-sm leading-7 text-gray-400">
            This summary explains how CAR-Bot handles information inside the platform. It is intended as an in-app policy page so navigation does not end in a missing route.
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
