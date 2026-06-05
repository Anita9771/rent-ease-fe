"use client";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { authRoleConfigs } from "@/lib/auth-role-config";

export default function PropertyManagerForgotPasswordPage() {
  return <ForgotPasswordForm config={authRoleConfigs["property-manager"]} />;
}
