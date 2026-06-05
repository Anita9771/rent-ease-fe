/**
 * Authentication utilities
 */

export type UserRole = "LANDLORD" | "TENANT" | "PROPERTY_MANAGER";

export function decodeRoleFromToken(accessToken: string): UserRole | null {
  try {
    const payload = accessToken.split(".")[1];
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    const role = decoded.role as string;
    if (role === "LANDLORD" || role === "TENANT" || role === "PROPERTY_MANAGER") {
      return role;
    }
    return null;
  } catch {
    return null;
  }
}

export function dashboardPathForRole(role: UserRole | string | null): string {
  switch (role) {
    case "LANDLORD":
      return "/landlord/dashboard";
    case "TENANT":
      return "/tenant/dashboard";
    case "PROPERTY_MANAGER":
      return "/property-manager/dashboard";
    default:
      return "/login";
  }
}

export function loginPathForRole(role: UserRole | string | null): string {
  switch (role) {
    case "LANDLORD":
      return "/login?userType=landlord";
    case "TENANT":
      return "/login?userType=tenant";
    case "PROPERTY_MANAGER":
      return "/login?userType=property-manager";
    default:
      return "/login";
  }
}

export function roleForPathPrefix(pathname: string | null): UserRole | null {
  if (!pathname) return null;
  if (pathname.startsWith("/landlord")) return "LANDLORD";
  if (pathname.startsWith("/tenant")) return "TENANT";
  if (pathname.startsWith("/property-manager")) return "PROPERTY_MANAGER";
  return null;
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return !!localStorage.getItem("accessToken");
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem("accessToken");
}

export function getAuthRole(): UserRole | null {
  if (typeof window === "undefined") {
    return null;
  }
  const stored = localStorage.getItem("userRole") as UserRole | null;
  if (stored === "LANDLORD" || stored === "TENANT" || stored === "PROPERTY_MANAGER") {
    return stored;
  }
  const token = localStorage.getItem("accessToken");
  if (!token) return null;
  return decodeRoleFromToken(token);
}

export function clearAuth(): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userRole");
}

export function setAuthTokens(accessToken: string, refreshToken: string, role?: UserRole | string): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
  const resolvedRole = role ?? decodeRoleFromToken(accessToken);
  if (resolvedRole) {
    localStorage.setItem("userRole", resolvedRole);
  }
}

export function setAuthSession(
  tokens: { accessToken: string; refreshToken: string },
  role: UserRole | string,
): void {
  setAuthTokens(tokens.accessToken, tokens.refreshToken, role);
}

export function roleMatchesPath(pathname: string | null, role: UserRole | null): boolean {
  const required = roleForPathPrefix(pathname);
  if (!required || !role) return true;
  return required === role;
}

/**
 * Check if a path is an authentication route (login, register, accept-invite)
 */
export function isAuthRoute(pathname: string | null): boolean {
  if (!pathname) return false;

  const authRoutes = [
    "/login",
    "/landlord/register",
    "/landlord/forgot-password",
    "/landlord/reset-password",
    "/tenant/register",
    "/tenant/login",
    "/tenant/accept-invite",
    "/tenant/forgot-password",
    "/tenant/reset-password",
    "/property-manager/login",
    "/property-manager/accept-invite",
    "/property-manager/forgot-password",
    "/property-manager/reset-password",
  ];

  return authRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function isDashboardRoute(pathname: string | null): boolean {
  if (!pathname) return false;

  const dashboardRoutes = [
    "/landlord/dashboard",
    "/tenant/dashboard",
    "/property-manager/dashboard",
  ];

  return dashboardRoutes.some((route) => pathname.startsWith(route));
}
