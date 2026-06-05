"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { getUserFriendlyError } from "@/lib/errors";
import type { AuthRoleConfig } from "@/lib/auth-role-config";

type ForgotPasswordFormProps = {
  config: AuthRoleConfig;
};

export function ForgotPasswordForm({ config }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [devResetLink, setDevResetLink] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDevResetLink(null);
    setLoading(true);

    try {
      const response = await api.post<{ message: string; resetLink?: string }>("/auth/forgot-password", {
        email,
        role: config.apiRole,
      });
      setDevResetLink(response.resetLink ?? null);
      setSubmitted(true);
    } catch (err) {
      setError(getUserFriendlyError(err, "We couldn't process your request. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const Icon = config.Icon;

  return (
    <div className="min-h-screen bg-brand-mist flex items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md mx-auto"
      >
        <Link
          href={config.loginHref}
          className="inline-flex items-center gap-2 text-sm text-brand-slate hover:text-brand transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>

        <div className="rounded-3xl border border-brand-mist bg-white p-6 sm:p-8 shadow-glass">
          <div className="mb-8 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand text-white mb-4">
              <Icon className="h-8 w-8" />
            </div>
            <h1 className="font-heading text-2xl text-brand-dark">Forgot password</h1>
            <p className="mt-2 text-sm text-brand-slate">{config.subtitle}</p>
          </div>

          {submitted ? (
            <div className="space-y-4 text-center">
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-700">
                If an account exists for <strong>{email}</strong>, you will receive a password reset link shortly.
                Check your inbox and spam folder.
              </div>
              {devResetLink && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-900">
                  <p className="font-semibold">Email could not be sent (local/dev)</p>
                  <p className="mt-2 break-all">
                    Use this reset link:{" "}
                    <Link href={devResetLink} className="font-medium text-brand underline">
                      {devResetLink}
                    </Link>
                  </p>
                  <p className="mt-2 text-xs text-amber-800">
                    With Resend&apos;s test sender (onboarding@resend.dev), mail only delivers to your Resend account
                    email until you verify a domain.
                  </p>
                </div>
              )}
              <p className="text-sm text-brand-slate">
                The link expires in 1 hour. Did not get an email?{" "}
                <button
                  type="button"
                  className="font-semibold text-brand hover:underline"
                  onClick={() => {
                    setSubmitted(false);
                    setDevResetLink(null);
                  }}
                >
                  Try again
                </button>
              </p>
              <Link href={config.loginHref} className="inline-block text-sm font-semibold text-brand hover:underline">
                Return to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-brand-dark mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
                  placeholder="you@company.com"
                />
              </div>

              {error && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-600">{error}</div>
              )}

              <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
                {loading ? "Sending..." : "Send reset link"}
              </Button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
