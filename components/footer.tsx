"use client";

import Link from "next/link";

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Testimonials", href: "/#testimonials" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help center", href: "/help" },
      { label: "Status", href: "/status" },
      { label: "Contact sales", href: "mailto:hello@rentease.com" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-brand-mist bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12 lg:flex-row lg:justify-between lg:px-12">
        <div className="max-w-md">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white font-heading text-xl font-bold">
              RE
            </div>
            <div>
              <p className="font-heading text-xl text-brand-dark">RentEase</p>
              <p className="text-xs uppercase tracking-[0.25em] text-brand-slate">For modern landlord teams</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-brand-slate">
            Manage rent cycles, maintenance, and tenant experience on autopilot. RentEase is the platform trusted by property teams on three continents.
          </p>
          <div className="mt-6 flex gap-4 text-sm text-brand-slate">
            <Link href="https://www.linkedin.com" className="hover:text-brand">
              LinkedIn
            </Link>
            <Link href="https://twitter.com" className="hover:text-brand">
              Twitter
            </Link>
            <Link href="mailto:hello@rentease.com" className="hover:text-brand">
              Email
            </Link>
          </div>
        </div>
        <div className="grid flex-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {footerLinks.map((section) => (
            <div key={section.title}>
              <p className="text-sm font-semibold uppercase tracking-widest text-brand-dark/70">{section.title}</p>
              <ul className="mt-4 space-y-2 text-sm text-brand-slate">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="transition-colors hover:text-brand-dark">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-brand-mist/70 bg-brand-mist/30">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 text-center text-xs text-brand-slate sm:flex-row sm:items-center sm:justify-between sm:text-left lg:px-12">
          <p>© {new Date().getFullYear()} RentEase. All rights reserved.</p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/privacy" className="hover:text-brand-dark">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-brand-dark">
              Terms
            </Link>
            <Link href="/security" className="hover:text-brand-dark">
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

