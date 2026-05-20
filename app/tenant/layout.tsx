"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { isAuthRoute } from "@/lib/auth";
import type { ReactNode } from "react";

export default function TenantLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Don't show sidebar on auth routes (login, register, accept-invite)
  if (isAuthRoute(pathname)) {
    return <>{children}</>;
  }

  // For all other routes, protect them and show sidebar
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-brand-mist">
        <div className="grid min-h-screen grid-cols-[auto,1fr]">
          <Sidebar variant="tenant" />
          <main className="flex min-h-screen flex-col bg-brand-mist/60 pb-20 lg:pb-0">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

