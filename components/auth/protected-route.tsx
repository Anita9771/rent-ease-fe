"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAuthenticated, isAuthRoute } from "@/lib/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * ProtectedRoute component that redirects unauthenticated users to login
 * Only renders children if user is authenticated
 */
export function ProtectedRoute({ children, redirectTo }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    // Don't protect auth routes
    if (isAuthRoute(pathname)) {
      setIsAuth(true);
      setIsChecking(false);
      return;
    }

    // Check authentication
    const authenticated = isAuthenticated();
    setIsAuth(authenticated);
    setIsChecking(false);

    if (!authenticated) {
      // Determine redirect URL based on current path
      let loginUrl = "/login";
      if (pathname?.startsWith("/tenant")) {
        loginUrl = "/login?userType=tenant";
      } else if (pathname?.startsWith("/property-manager")) {
        loginUrl = "/login?userType=property-manager";
      } else if (pathname?.startsWith("/landlord")) {
        loginUrl = "/login?userType=landlord";
      }

      router.replace(redirectTo || loginUrl);
    }
  }, [pathname, router, redirectTo]);

  // Show nothing while checking
  if (isChecking) {
    return null;
  }

  // Only render children if authenticated or on auth route
  if (!isAuth && !isAuthRoute(pathname)) {
    return null;
  }

  return <>{children}</>;
}

