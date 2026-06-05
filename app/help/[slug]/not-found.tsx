"use client";

import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function HelpArticleNotFound() {
  return (
    <div className="min-h-screen bg-brand-mist">
      <Header />
      <main className="px-4 py-16">
        <div className="mx-auto max-w-lg rounded-3xl bg-white p-10 text-center shadow-lg">
          <h1 className="font-heading text-3xl text-brand-dark">Article not found</h1>
          <p className="mt-4 text-brand-slate">That help topic does not exist or may have moved.</p>
          <Link href="/help" className="mt-6 inline-block font-semibold text-brand hover:underline">
            Back to help center
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
