"use client";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { authRoleConfigs } from "@/lib/auth-role-config";

export default function PropertyManagerResetPasswordPage() {
  return <ResetPasswordForm config={authRoleConfigs["property-manager"]} />;
}
