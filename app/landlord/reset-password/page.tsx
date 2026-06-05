"use client";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { authRoleConfigs } from "@/lib/auth-role-config";

export default function LandlordResetPasswordPage() {
  return <ResetPasswordForm config={authRoleConfigs.landlord} />;
}
