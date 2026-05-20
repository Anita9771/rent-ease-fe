"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const pillars = [
  {
    title: "Infrastructure",
    body: "RentEase runs on hardened cloud infrastructure with isolated tenant clusters, automated backups, and regional failover.",
  },
  {
    title: "Compliance",
    body: "We follow SOC 2 Type II controls, encrypt data at rest (AES-256) and in transit (TLS 1.2+), and undergo annual penetration tests.",
  },
  {
    title: "Access controls",
    body: "SSO, role-based permissions, audit trails, and least-privilege access keep landlord and tenant data protected.",
  },
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-brand-mist">
      <Header />
      <main className="px-4 py-16">
        <div className="mx-auto max-w-4xl rounded-3xl bg-white p-10 shadow-lg">
        <p className="text-sm uppercase tracking-[0.4em] text-brand-dark/60">Security</p>
        <h1 className="mt-4 font-heading text-4xl text-brand-dark">Built for mission-critical rent operations</h1>
        <p className="mt-4 text-brand-slate">
          Security is embedded across every surface area—from infrastructure and product design to vendor management and internal processes.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="rounded-2xl border border-brand-mist p-5">
              <p className="text-sm uppercase tracking-[0.3em] text-brand">{pillar.title}</p>
              <p className="mt-2 text-sm text-brand-slate">{pillar.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 text-sm text-brand-slate">
          Report a vulnerability or request a security review at{" "}
          <a href="mailto:security@rentease.com" className="text-brand font-semibold">
            security@rentease.com
          </a>
          .
        </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

