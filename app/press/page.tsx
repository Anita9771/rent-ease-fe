"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";

const pressReleases = [
  {
    title: "RentEase raises $25M to modernize landlord finance ops",
    date: "May 12, 2024",
    summary: "New funding accelerates product development and global expansion across Africa, Europe, and North America.",
  },
  {
    title: "RentEase partners with Stripe to power instant rent payouts",
    date: "Jan 30, 2024",
    summary: "Landlords can now offer tenants advanced payment options and receive funds instantly in local currencies.",
  },
  {
    title: "Modern rent experience: RentEase launches tenant super-app",
    date: "Sep 08, 2023",
    summary: "Tenants get a unified workspace for rent, maintenance, documents, and secure communication.",
  },
];

const mediaAssets = [
  { label: "Brand guidelines", href: "/assets/rentease-brand.pdf" },
  { label: "Logos & screenshots", href: "/assets/rentease-media.zip" },
  { label: "Executive bios", href: "/about" },
];

export default function PressPage() {
  return (
    <div className="min-h-screen bg-brand-mist">
      <Header />
      <main className="px-4 py-16">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white p-10 shadow-lg">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-brand-dark/60">Press</p>
          <h1 className="mt-4 font-heading text-4xl text-brand-dark">News & announcements</h1>
          <p className="mt-4 text-brand-slate">
            For press inquiries, reach{" "}
            <Link href="mailto:press@rentease.com" className="text-brand font-semibold">
              press@rentease.com
            </Link>
            .
          </p>
        </div>
        <div className="mt-10 space-y-8">
          {pressReleases.map((release) => (
            <article key={release.title} className="rounded-3xl border border-brand-mist p-6">
              <p className="text-xs uppercase tracking-[0.4em] text-brand-dark/60">{release.date}</p>
              <h2 className="mt-2 font-heading text-2xl text-brand-dark">{release.title}</h2>
              <p className="mt-3 text-sm text-brand-slate">{release.summary}</p>
              <Link href="/press" className="mt-4 inline-flex text-brand font-semibold">
                Read more →
              </Link>
            </article>
          ))}
        </div>
        <div className="mt-12 rounded-3xl bg-brand-mist/70 p-6">
          <h3 className="font-heading text-xl text-brand-dark">Media resources</h3>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-brand">
            {mediaAssets.map((asset) => (
              <Link key={asset.label} href={asset.href} className="rounded-full border border-brand px-4 py-2 hover:bg-brand/10">
                {asset.label}
              </Link>
            ))}
          </div>
        </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

