"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";

const helpTopics = [
  {
    title: "Getting started",
    description: "Set up your RentEase account, invite teammates, and onboard your first properties.",
    links: [
      { label: "Create landlord account", href: "/landlord/register" },
      { label: "Invite property managers", href: "/help/property-managers" },
      { label: "Tenant onboarding guide", href: "/help/tenant-onboarding" },
    ],
  },
  {
    title: "Rent operations",
    description: "Learn how to configure rent cycles, automate reminders, and confirm payments.",
    links: [
      { label: "Rent automation basics", href: "/help/rent-automation" },
      { label: "Invoice and receipt workflows", href: "/help/invoices" },
      { label: "Handling offline payments", href: "/help/offline-payments" },
    ],
  },
  {
    title: "Support channels",
    description: "Need extra help? Chat with concierge support or reach our implementation team.",
    links: [
      { label: "Email support", href: "mailto:support@rentease.com" },
      { label: "Status page", href: "/status" },
      { label: "Book onboarding", href: "/help/onboarding" },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-brand-mist">
      <Header />
      <main className="px-4 py-16">
        <div className="mx-auto max-w-4xl rounded-3xl bg-white p-10 shadow-lg">
        <h1 className="font-heading text-4xl text-brand-dark">Help center</h1>
        <p className="mt-4 text-brand-slate">
          Browse guides for landlords and property teams. Need a human? Email{" "}
          <Link href="mailto:support@rentease.com" className="text-brand font-semibold">
            support@rentease.com
          </Link>
          .
        </p>
        <div className="mt-10 space-y-8">
          {helpTopics.map((topic) => (
            <section key={topic.title} className="rounded-2xl border border-brand-mist p-6">
              <h2 className="font-heading text-2xl text-brand-dark">{topic.title}</h2>
              <p className="mt-2 text-sm text-brand-slate">{topic.description}</p>
              <ul className="mt-4 list-disc space-y-2 pl-6 text-brand">
                {topic.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="font-medium hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

