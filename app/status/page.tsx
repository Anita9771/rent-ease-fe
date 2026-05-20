"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const services = [
  { name: "API & automations", status: "Operational" },
  { name: "Web dashboards", status: "Operational" },
  { name: "Payments & payouts", status: "Operational" },
  { name: "Email + SMS notifications", status: "Degraded performance" },
];

export default function StatusPage() {
  return (
    <div className="min-h-screen bg-brand-mist">
      <Header />
      <main className="px-4 py-16">
        <div className="mx-auto max-w-4xl rounded-3xl bg-white p-10 shadow-lg">
        <p className="text-sm uppercase tracking-[0.4em] text-brand-dark/60">Status</p>
        <h1 className="mt-3 font-heading text-4xl text-brand-dark">System health</h1>
        <p className="mt-4 text-brand-slate">
          We provide real-time transparency into RentEase uptime. Subscribe to incidents or contact support for urgent updates.
        </p>
        <div className="mt-8 space-y-4">
          {services.map((service) => (
            <div key={service.name} className="rounded-2xl border border-brand-mist p-4 flex items-center justify-between">
              <p className="font-semibold text-brand-dark">{service.name}</p>
              <span
                className={`rounded-full px-4 py-1 text-xs font-semibold uppercase ${
                  service.status === "Operational" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                }`}
              >
                {service.status}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-8 text-sm text-brand-slate">
          Incident history and updates are posted to{" "}
          <a href="mailto:status@rentease.com" className="text-brand font-semibold">
            status@rentease.com
          </a>
          . Subscribe to notifications by emailing us.
        </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

