"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const openings = [
  { title: "Senior Full-stack Engineer", location: "Remote · Africa + Europe", type: "Full time" },
  { title: "Product Marketing Lead", location: "Remote · North America", type: "Full time" },
  { title: "Customer Success Manager", location: "Lagos or Remote", type: "Full time" },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-brand-mist">
      <Header />
      <main className="px-4 py-16">
        <div className="mx-auto max-w-4xl rounded-3xl bg-white p-10 shadow-lg">
        <p className="text-sm uppercase tracking-[0.4em] text-brand-dark/60">Careers</p>
        <h1 className="mt-4 font-heading text-4xl text-brand-dark">Join the RentEase team</h1>
        <p className="mt-4 text-brand-slate">
          We’re a globally distributed team building the modern rent operating system. We value curiosity, responsible
          autonomy, and fanatical customer empathy.
        </p>
        <div className="mt-10 grid gap-4">
          {openings.map((role) => (
            <div key={role.title} className="rounded-2xl border border-brand-mist p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-heading text-xl text-brand-dark">{role.title}</p>
                  <p className="text-sm text-brand-slate">{role.location}</p>
                </div>
                <span className="rounded-full bg-brand-mist px-4 py-2 text-sm font-semibold text-brand">{role.type}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-10 text-sm text-brand-slate">
          Don’t see a role that fits? Email{" "}
          <a href="mailto:careers@rentease.com" className="text-brand font-semibold">
            careers@rentease.com
          </a>{" "}
          with your portfolio and what you’d like to build.
        </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

