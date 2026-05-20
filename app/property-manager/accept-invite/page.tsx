"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserCheck } from "lucide-react";
import { api } from "@/lib/api";
import { getUserFriendlyError } from "@/lib/errors";

export default function PropertyManagerAcceptInvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams?.get("token");
  const [formData, setFormData] = useState({
    email: "",
    tempPassword: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!inviteToken) {
      setError("Invalid or missing invitation token.");
    }
  }, [inviteToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!inviteToken) {
      setError("Invitation token is missing.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/accept-invite", {
        inviteToken,
        email: formData.email,
        password: formData.tempPassword,
        phone: formData.phone || undefined,
      });
      setSuccess("Account setup complete! You can now log in.");
      setTimeout(() => {
        router.replace("/login?userType=property-manager");
      }, 2000);
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
        className="w-full max-w-md mx-auto"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-brand-slate hover:text-brand transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="rounded-3xl border border-brand-mist bg-white p-6 sm:p-8 shadow-glass">
          <div className="mb-8 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand text-white mb-4">
              <UserCheck className="h-8 w-8" />
            </div>
            <h1 className="font-heading text-2xl text-brand-dark">Accept Your Invitation</h1>
            <p className="mt-2 text-sm text-brand-slate">Set up your RentEase property manager account</p>
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
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-brand-dark mb-2">
                Phone number (Optional)
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
              <label htmlFor="tempPassword" className="block text-sm font-medium text-brand-dark mb-2">
                Temporary password
              </label>
              <input
                id="tempPassword"
                type="password"
                required
                value={formData.tempPassword}
                onChange={(e) => setFormData({ ...formData, tempPassword: e.target.value })}
                className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
                placeholder="Enter the password from your invite email"
              />
              <p className="mt-2 text-xs text-brand-slate">You can change this password later from Settings → Change password.</p>
            </div>

            {error && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-600">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-600">
                {success}
              </div>
            )}
            <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
              {loading ? "Setting up..." : "Accept Invitation"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-brand-slate">
            Already set up?{" "}
            <Link href="/login?userType=property-manager" className="font-medium text-brand hover:text-brand-dark transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

