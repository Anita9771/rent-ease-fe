"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const sections = [
  {
    title: "1. What data we collect",
    body: [
      "Account information such as name, company, email, and billing details.",
      "Tenant and property data provided by landlord teams to operate rent cycles.",
      "Usage data regarding feature adoption, device, and session analytics.",
    ],
  },
  {
    title: "2. How data is used",
    body: [
      "Provide and improve RentEase services, automations, and insights.",
      "Send tenant reminders, landlord summaries, and product announcements.",
      "Comply with legal obligations, fraud prevention, and security requirements.",
    ],
  },
  {
    title: "3. Your controls",
    body: [
      "Request a copy or deletion of your data by emailing privacy@rentease.com.",
      "Configure retention policies per tenant or property via the dashboard.",
      "Opt out of marketing communications through email unsubscribe links.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-brand-mist">
      <Header />
      <main className="px-4 py-16">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-10 shadow-lg">
        <p className="text-sm uppercase tracking-[0.4em] text-brand-dark/60">Privacy</p>
        <h1 className="mt-4 font-heading text-4xl text-brand-dark">RentEase Privacy Notice</h1>
        <p className="mt-4 text-brand-slate">
          We safeguard landlord and tenant information with enterprise-grade security. This privacy notice outlines what
          we collect, how we use it, and the controls available to you.
        </p>
        <div className="mt-10 space-y-8 text-sm leading-relaxed text-brand-slate">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-heading text-xl text-brand-dark">{section.title}</h2>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                {section.body.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <p className="mt-10 text-sm text-brand-slate">
          Questions? Contact{" "}
          <a href="mailto:privacy@rentease.com" className="text-brand font-semibold">
            privacy@rentease.com
          </a>
          .
        </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

