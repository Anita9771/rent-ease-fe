/**
 * Authentication utilities
 */

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  const token = localStorage.getItem('accessToken');
  return !!token;
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('accessToken');
}

export function clearAuth(): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

export function setAuthTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

/**
 * Check if a path is an authentication route (login, register, accept-invite)
 */
export function isAuthRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  
  const authRoutes = [
    '/login',
    '/landlord/register',
    '/tenant/register',
    '/tenant/accept-invite',
    '/property-manager/login',
    '/property-manager/accept-invite',
  ];
  
  return authRoutes.some(route => pathname.startsWith(route));
}

/**
 * Check if a path is a dashboard route
 */
export function isDashboardRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  
  const dashboardRoutes = [
    '/landlord/dashboard',
    '/tenant/dashboard',
    '/property-manager/dashboard',
  ];
  
  return dashboardRoutes.some(route => pathname.startsWith(route));
}

