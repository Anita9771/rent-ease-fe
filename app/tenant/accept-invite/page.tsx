"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { getUserFriendlyError } from "@/lib/errors";

function TenantAcceptInvitePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams?.get("token") ?? "";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteToken) {
      setError("Invitation token missing. Please use the link provided in your email.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.post("/auth/accept-invite", {
        inviteToken,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
      });
      setSuccess(true);
      setTimeout(() => router.replace("/tenant/login"), 1500);
    } catch (err) {
      setError(getUserFriendlyError(err, "We couldn't complete your registration. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-mist flex items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg mx-auto"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-brand-slate hover:text-brand transition-colors mb-8"
        >
          ← Back to home
        </Link>

        <div className="rounded-3xl border border-brand-mist bg-white p-6 sm:p-8 shadow-glass">
          <div className="mb-6 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand text-white mb-4 font-heading text-2xl">
              RE
            </div>
            <h1 className="font-heading text-2xl text-brand-dark">Complete your tenant account</h1>
            <p className="mt-2 text-sm text-brand-slate">
              Set your password to join your landlord’s RentEase portal.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brand-dark mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
                placeholder="you@tenant.com"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-brand-dark mb-2">
                Phone (optional)
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-brand-dark mb-2">
                New password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
                placeholder="At least 8 characters"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-brand-dark mb-2">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
                placeholder="Re-enter password"
              />
            </div>
            {!inviteToken && (
              <p className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-700">
                Invitation token missing. Please use the original link from your email.
              </p>
            )}
            {error && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-600">{error}</div>
            )}
            {success && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-600">
                Invitation accepted! Redirecting you to sign in...
              </div>
            )}
            <Button type="submit" className="w-full h-12" disabled={loading || !inviteToken}>
              {loading ? "Submitting..." : "Activate account"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default function TenantAcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-brand-mist text-brand-slate">
          Loading...
        </div>
      }
    >
      <TenantAcceptInvitePageContent />
    </Suspense>
  );
}
