"use client";

import { Suspense, useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { ArrowLeft, Building2, ShieldCheck, User } from "lucide-react";
import { cn } from "@/lib/cn";
import { api } from "@/lib/api";
import { getUserFriendlyError } from "@/lib/errors";
import {
  clearAuth,
  dashboardPathForRole,
  setAuthSession,
  type UserRole,
} from "@/lib/auth";
import { useRedirectIfAuthenticated } from "@/components/auth/protected-route";

type UserType = "landlord" | "tenant" | "property-manager";

const userTypeToRole: Record<UserType, UserRole> = {
  landlord: "LANDLORD",
  tenant: "TENANT",
  "property-manager": "PROPERTY_MANAGER",
};

const roleLabels: Record<UserRole, string> = {
  LANDLORD: "landlord",
  TENANT: "tenant",
  PROPERTY_MANAGER: "property manager",
};

function LoginPageContent() {
  const searchParams = useSearchParams();
  const [userType, setUserType] = useState<UserType>(() => {
    const param = searchParams?.get("userType");
    if (param === "tenant" || param === "property-manager") {
      return param;
    }
    return "landlord";
  });
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useRedirectIfAuthenticated();

  useEffect(() => {
    const param = searchParams?.get("userType");
    if (param === "tenant" || param === "property-manager") {
      setUserType(param);
    }
    const registered = searchParams?.get("registered") === "true";
    if (registered) {
      setSuccess("Account created successfully! Please sign in.");
      const url = new URL(window.location.href);
      url.searchParams.delete("registered");
      window.history.replaceState({}, "", url.pathname);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post<{
        user: { role: UserRole; landlordId?: string; tenantId?: string };
        tokens: { accessToken: string; refreshToken: string };
      }>("/auth/login", formData);

      const expectedRole = userTypeToRole[userType];
      if (response.user.role !== expectedRole) {
        clearAuth();
        setError(
          `This email is registered as a ${roleLabels[response.user.role]} account. Switch to the "${roleLabels[response.user.role]}" tab above, or sign in from the correct portal.`,
        );
        return;
      }

      setAuthSession(response.tokens, response.user.role);
      router.replace(dashboardPathForRole(response.user.role));
    } catch (err) {
      setError(getUserFriendlyError(err, "We couldn't sign you in. Please check your email and password."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-mist flex items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-brand-slate hover:text-brand transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="rounded-3xl border border-brand-mist bg-white p-6 sm:p-8 shadow-glass">
          <div className="mb-8 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand text-white mb-4">
              {userType === "landlord" ? (
                <Building2 className="h-8 w-8" />
              ) : userType === "tenant" ? (
                <User className="h-8 w-8" />
              ) : (
                <ShieldCheck className="h-8 w-8" />
              )}
            </div>
            <h1 className="font-heading text-2xl text-brand-dark">Welcome back</h1>
            <p className="mt-2 text-sm text-brand-slate">Sign in to your RentEase account</p>
          </div>

          <div className="mb-6 flex rounded-xl bg-brand-mist p-1">
            {(["landlord", "tenant", "property-manager"] as UserType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setUserType(type)}
                className={cn(
                  "flex-1 rounded-lg px-4 py-2 text-sm font-medium capitalize transition-all",
                  userType === type ? "bg-white text-brand-dark shadow-sm" : "text-brand-slate hover:text-brand-dark"
                )}
              >
                {type.replace("-", " ")}
              </button>
            ))}
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
                placeholder="you@company.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-brand-dark">
                  Password
                </label>
                <Link
                  href={
                    userType === "landlord"
                      ? "/landlord/forgot-password"
                      : userType === "tenant"
                      ? "/tenant/forgot-password"
                      : "/property-manager/forgot-password"
                  }
                  className="text-sm text-brand hover:text-brand-dark transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                id="password"
                required
                autoComplete="current-password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter your password"
              />
            </div>

            {success && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-600">
                {success}
              </div>
            )}
            {error && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-600">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-brand-slate">
            {userType === "landlord" && (
              <>
                Don't have an account?{" "}
                <Link href="/landlord/register" className="font-medium text-brand hover:text-brand-dark transition-colors">
                  Start free trial
                </Link>
              </>
            )}
            {userType === "tenant" && (
              <>
                Tenants join by invitation only.{" "}
                <Link href="/tenant/register" className="font-medium text-brand hover:text-brand-dark transition-colors">
                  Learn how to get invited →
                </Link>
              </>
            )}
            {userType === "property-manager" && (
              <>
                Property managers are invited by a landlord.{" "}
                <span className="font-medium text-brand">Check your inbox for an invitation link.</span>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-brand-mist text-brand-slate">
          Loading...
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
