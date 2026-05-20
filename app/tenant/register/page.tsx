"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, User } from "lucide-react";

export default function TenantRegisterPage() {
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
              <User className="h-8 w-8" />
            </div>
            <h1 className="font-heading text-2xl text-brand-dark">Tenant Registration</h1>
            <p className="mt-2 text-sm text-brand-slate">Get started with RentEase</p>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl bg-brand-mist p-6 text-center">
              <Mail className="h-12 w-12 text-brand mx-auto mb-4" />
              <h2 className="font-heading text-lg text-brand-dark mb-2">
                Contact Your Landlord
              </h2>
              <p className="text-sm text-brand-slate mb-4">
                Tenant accounts are created by invitation only. Please reach out to your landlord or property manager to receive an invitation email.
              </p>
              <p className="text-sm text-brand-slate">
                Once you receive the invitation, you'll be able to set up your account and access your tenant portal.
              </p>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl bg-brand-mist/60 p-4">
                <p className="text-sm font-semibold text-brand-dark mb-1">What to expect:</p>
                <ul className="text-xs text-brand-slate space-y-1 list-disc list-inside">
                  <li>An email invitation from your landlord</li>
                  <li>Temporary login credentials</li>
                  <li>Ability to set your own password</li>
                  <li>Access to your tenant dashboard</li>
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-brand-mist">
              <p className="text-center text-sm text-brand-slate mb-4">
                Already have an account?
              </p>
              <Link href="/login?userType=tenant">
                <Button className="w-full">
                  Sign in
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

