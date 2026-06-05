"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  clearAuth,
  getAuthRole,
  isAuthRoute,
  isAuthenticated,
  loginPathForRole,
  roleForPathPrefix,
  roleMatchesPath,
  dashboardPathForRole,
} from "@/lib/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * Protects routes by auth token and user role (landlord / tenant / property manager).
 */
export function ProtectedRoute({ children, redirectTo }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (isAuthRoute(pathname)) {
      setAllowed(true);
      setIsChecking(false);
      return;
    }

    const authenticated = isAuthenticated();
    const role = getAuthRole();

    if (!authenticated || !role) {
      setAllowed(false);
      setIsChecking(false);
      let loginUrl = "/login";
      if (pathname?.startsWith("/tenant")) {
        loginUrl = "/login?userType=tenant";
      } else if (pathname?.startsWith("/property-manager")) {
        loginUrl = "/login?userType=property-manager";
      } else if (pathname?.startsWith("/landlord")) {
        loginUrl = "/login?userType=landlord";
      }
      router.replace(redirectTo || loginUrl);
      return;
    }

    if (!roleMatchesPath(pathname, role)) {
      clearAuth();
      setAllowed(false);
      setIsChecking(false);
      const required = roleForPathPrefix(pathname);
      router.replace(required ? loginPathForRole(required) : "/login");
      return;
    }

    setAllowed(true);
    setIsChecking(false);
  }, [pathname, router, redirectTo]);

  if (isChecking) {
    return null;
  }

  if (!allowed && !isAuthRoute(pathname)) {
    return null;
  }

  return <>{children}</>;
}

/** Redirect already-authenticated users away from login to their dashboard. */
export function useRedirectIfAuthenticated() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated()) return;
    const role = getAuthRole();
    if (!role || pathname !== "/login") return;
    router.replace(dashboardPathForRole(role));
  }, [pathname, router]);
}
