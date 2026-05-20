"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const termsSections = [
  {
    title: "1. Agreement",
    text: "By using RentEase you agree to these Terms, our Privacy Notice, and any product-specific policies referenced here.",
  },
  {
    title: "2. Subscription",
    text: "Plans are billed monthly. You can cancel anytime by emailing billing@rentease.com. Refunds are issued per our SLA.",
  },
  {
    title: "3. Acceptable use",
    text: "You will not misuse data, run unauthorized automations, or attempt to access another customer’s content.",
  },
  {
    title: "4. Liability",
    text: "RentEase provides the platform as-is. We limit liability to fees paid in the prior 12 months except where prohibited.",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-brand-mist">
      <Header />
      <main className="px-4 py-16">
        <div className="mx-auto max-w-4xl rounded-3xl bg-white p-10 shadow-xl">
        <p className="text-sm uppercase tracking-[0.4em] text-brand-dark/60">Terms</p>
        <h1 className="mt-4 font-heading text-4xl text-brand-dark">RentEase Terms of Service</h1>
        <p className="mt-4 text-sm text-brand-slate">
          Effective date: January 1, 2025. These Terms govern your access to RentEase. Please review alongside our Privacy Notice.
        </p>
        <div className="mt-10 space-y-6 text-sm leading-relaxed text-brand-slate">
          {termsSections.map((section) => (
            <div key={section.title} className="rounded-2xl border border-brand-mist px-6 py-4">
              <h2 className="font-heading text-xl text-brand-dark">{section.title}</h2>
              <p className="mt-2">{section.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 text-sm text-brand-slate">
          Questions? Contact{" "}
          <a href="mailto:legal@rentease.com" className="text-brand font-semibold">
            legal@rentease.com
          </a>
          .
        </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

