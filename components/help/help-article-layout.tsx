"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import type { HelpArticle } from "@/lib/help-articles";

type HelpArticleLayoutProps = {
  article: HelpArticle;
};

export function HelpArticleLayout({ article }: HelpArticleLayoutProps) {
  return (
    <div className="min-h-screen bg-brand-mist">
      <Header />
      <main className="px-4 py-16">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-10 shadow-lg">
          <Link
            href="/help"
            className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to help center
          </Link>

          <p className="mt-8 text-sm uppercase tracking-[0.4em] text-brand-dark/60">{article.eyebrow}</p>
          <h1 className="mt-4 font-heading text-4xl text-brand-dark">{article.title}</h1>
          <p className="mt-4 text-brand-slate">{article.summary}</p>

          <div className="mt-10 space-y-8 text-sm leading-relaxed text-brand-slate">
            {article.sections.map((section) => (
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

          {article.tips && article.tips.length > 0 && (
            <div className="mt-10 rounded-2xl border border-brand/20 bg-brand-mist/50 p-6">
              <h2 className="font-heading text-lg text-brand-dark">Quick tips</h2>
              <ul className="mt-3 list-disc space-y-2 pl-6 text-sm text-brand-slate">
                {article.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {article.relatedLinks && article.relatedLinks.length > 0 && (
            <div className="mt-10 border-t border-brand-mist pt-8">
              <h2 className="font-heading text-lg text-brand-dark">Related</h2>
              <ul className="mt-3 space-y-2">
                {article.relatedLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="font-medium text-brand hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="mt-10 text-sm text-brand-slate">
            Still need help?{" "}
            <Link href="mailto:support@rentease.com" className="font-semibold text-brand">
              support@rentease.com
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
