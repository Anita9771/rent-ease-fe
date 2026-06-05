"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { api } from "@/lib/api";
import { getUserFriendlyError } from "@/lib/errors";
import type { AuthRoleConfig } from "@/lib/auth-role-config";

type ResetPasswordFormProps = {
  config: AuthRoleConfig;
};

function ResetPasswordFormContent({ config }: ResetPasswordFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Reset link is invalid or missing. Please request a new password reset email.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Reset link is invalid or missing.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      setSuccess(true);
      setTimeout(() => router.replace(config.loginHref), 2500);
    } catch (err) {
      setError(getUserFriendlyError(err, "We couldn't reset your password. Please request a new link."));
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
            <h1 className="font-heading text-2xl text-brand-dark">Set a new password</h1>
            <p className="mt-2 text-sm text-brand-slate">Choose a strong password for your {config.title.toLowerCase()} account.</p>
          </div>

          {success ? (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center text-sm text-emerald-700">
              Password updated successfully. Redirecting you to sign in...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-brand-dark mb-2">
                  New password
                </label>
                <PasswordInput
                  id="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  disabled={!token}
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-brand-dark mb-2">
                  Confirm password
                </label>
                <PasswordInput
                  id="confirmPassword"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  disabled={!token}
                />
              </div>

              {error && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-600">{error}</div>
              )}

              {!token && (
                <Link href={config.forgotHref} className="block text-center text-sm font-semibold text-brand hover:underline">
                  Request a new reset link
                </Link>
              )}

              <Button type="submit" className="w-full h-12 text-base" disabled={loading || !token}>
                {loading ? "Updating..." : "Update password"}
              </Button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export function ResetPasswordForm(props: ResetPasswordFormProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-brand-mist flex items-center justify-center text-brand-slate">Loading...</div>
      }
    >
      <ResetPasswordFormContent {...props} />
    </Suspense>
  );
}
