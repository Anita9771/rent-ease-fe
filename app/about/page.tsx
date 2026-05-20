"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Image from "next/image";

const milestones = [
  { year: "2022", label: "RentEase founded", detail: "Built by property operators tired of spreadsheets." },
  { year: "2023", label: "Series A", detail: "Backed by A-list fintech and proptech investors." },
  { year: "2024", label: "Global launch", detail: "Serving landlords across 12 countries." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-brand-mist">
      <Header />
      <main className="px-4 py-20">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white p-10 shadow-xl">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-brand-dark/60">About us</p>
            <h1 className="mt-4 font-heading text-4xl text-brand-dark">
              A calmer rent cycle for every landlord team
            </h1>
            <p className="mt-6 text-brand-slate">
              We started RentEase after running multi-city property portfolios with disjointed tools. Rent reminders lived
              in email, maintenance in WhatsApp, approvals in Slack. Cash flow clarity was a spreadsheet guess. Landlords
              needed a single modern operating system. Tenants deserved delightful updates.
            </p>
            <p className="mt-4 text-brand-slate">
              Today thousands of units run rent ops on RentEase—automating rent, reporting, maintenance, and tenant
              experience with thoughtful workflows.
            </p>
          </div>
          <div className="relative">
            <Image
              src="https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=80"
              alt="RentEase team"
              width={900}
              height={600}
              className="rounded-3xl object-cover shadow-lg"
            />
          </div>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {milestones.map((item) => (
            <div key={item.year} className="rounded-2xl border border-brand-mist p-5">
              <p className="text-sm uppercase tracking-[0.3em] text-brand">{item.year}</p>
              <p className="mt-2 font-heading text-xl text-brand-dark">{item.label}</p>
              <p className="mt-1 text-sm text-brand-slate">{item.detail}</p>
            </div>
          ))}
        </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

