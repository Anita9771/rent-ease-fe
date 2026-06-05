"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { ArrowLeft, Building2 } from "lucide-react";
import { api } from "@/lib/api";
import { setAuthSession } from "@/lib/auth";
import { uploadAvatar } from "@/lib/uploads";
import { getUserFriendlyError } from "@/lib/errors";

type RegisterLandlordResponse = {
  user: { id: string; email: string; role: string; landlordId: string };
  tokens: { accessToken: string; refreshToken: string };
};

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    phone: "",
    displayName: "",
    title: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setAvatarFile(null);
      setAvatarPreview(null);
      return;
    }
    setAvatarFile(file);
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post<RegisterLandlordResponse>("/auth/register-landlord", {
        email: formData.email,
        password: formData.password,
        companyName: formData.companyName,
        phone: formData.phone || undefined,
        displayName: formData.displayName,
        title: formData.title || undefined,
      });

      setAuthSession(response.tokens, "LANDLORD");

      if (avatarFile) {
        try {
          const uploadResponse = await uploadAvatar(avatarFile);
          await api.patch("/users/me", { avatarUrl: uploadResponse.url });
        } catch (uploadError) {
          setError(
            `${getUserFriendlyError(uploadError, "Your profile photo could not be uploaded.")} Your account was created — you can add a photo from Settings after signing in.`,
          );
          router.replace("/login?registered=true");
          return;
        }
      }

      router.replace("/landlord/dashboard");
    } catch (err) {
      setError(getUserFriendlyError(err, "We couldn't create your account. Please try again."));
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
              <Building2 className="h-8 w-8" />
            </div>
            <h1 className="font-heading text-2xl text-brand-dark">Start your free trial</h1>
            <p className="mt-2 text-sm text-brand-slate">Create your RentEase account in minutes</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-brand-dark mb-2">
                Company name
              </label>
              <input
                id="companyName"
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
                placeholder="Your company or property name"
              />
            </div>

            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-brand-dark mb-2">
                Full name
              </label>
              <input
                id="displayName"
                type="text"
                required
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
                placeholder="e.g., Amina Kalu"
              />
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-brand-dark mb-2">
                Job title (optional)
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
                placeholder="e.g., Property Manager, Managing Partner"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-dark mb-2">
                Profile photo (optional)
              </label>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-full border border-brand-mist bg-brand-mist">
                  {avatarPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarPreview} alt="Profile preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-brand">
                      <Building2 className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div>
                  <input
                    id="avatarUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="sr-only"
                  />
                  <label
                    htmlFor="avatarUpload"
                    className="inline-flex cursor-pointer items-center rounded-xl border border-brand px-4 py-2 text-sm font-semibold text-brand transition hover:bg-brand hover:text-white"
                  >
                    Choose photo
                  </label>
                  <p className="mt-1 text-xs text-brand-slate">
                    {avatarFile ? avatarFile.name : "JPG or PNG, up to 5MB."}
                  </p>
                </div>
              </div>
            </div>

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
              <label htmlFor="phone" className="block text-sm font-medium text-brand-dark mb-2">
                Phone number
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
                Password
              </label>
              <PasswordInput
                id="password"
                required
                autoComplete="new-password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="At least 8 characters"
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
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Re-enter your password"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-600">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-brand-slate">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-brand hover:text-brand-dark transition-colors">
              Log in
            </Link>
          </p>

          <p className="mt-4 text-center text-xs text-brand-slate">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="text-brand hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-brand hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

