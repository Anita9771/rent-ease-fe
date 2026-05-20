"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, CreditCard, FileChartColumn, Home, Megaphone, Settings, Users, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { cn } from "@/lib/cn";
import { api } from "@/lib/api";

const landlordNav = [
  { href: "/landlord/dashboard", label: "Dashboard", icon: Home },
  { href: "/landlord/properties", label: "Properties", icon: Building2 },
  { href: "/landlord/tenants", label: "Tenants", icon: Users },
  { href: "/landlord/invoices", label: "Rent & Invoices", icon: CreditCard },
  { href: "/landlord/expenses", label: "Expenses & Reports", icon: FileChartColumn },
  { href: "/landlord/complaints", label: "Complaints", icon: Megaphone },
  { href: "/landlord/settings", label: "Settings", icon: Settings },
];

type SidebarProps = {
  variant: "landlord" | "tenant" | "property-manager";
};

const tenantNav = [
  { href: "/tenant/dashboard", label: "Dashboard", icon: Home },
  { href: "/tenant/payments", label: "Payments", icon: CreditCard },
  { href: "/tenant/complaints", label: "Issues", icon: Megaphone },
  { href: "/tenant/documents", label: "Documents", icon: FileChartColumn },
  { href: "/tenant/profile", label: "Profile", icon: Settings },
];

const propertyManagerNav = [
  { href: "/property-manager/dashboard", label: "Dashboard", icon: Home },
  { href: "/property-manager/properties", label: "Properties", icon: Building2 },
  { href: "/property-manager/tenants", label: "Tenants", icon: Users },
  { href: "/property-manager/complaints", label: "Complaints", icon: Megaphone },
  { href: "/property-manager/invoices", label: "Invoices", icon: CreditCard },
  { href: "/property-manager/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ variant }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const nav = variant === "landlord" ? landlordNav : variant === "property-manager" ? propertyManagerNav : tenantNav;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      const { clearAuth } = await import("@/lib/auth");
      clearAuth();
      setLoggingOut(false);
      router.replace(
        variant === "tenant"
          ? "/login?userType=tenant"
          : variant === "property-manager"
          ? "/login?userType=property-manager"
          : "/login"
      );
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex h-full flex-col gap-8 border-r border-brand-mist bg-white/60 p-6 backdrop-blur transition-all duration-300",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className={cn("flex items-center justify-between", isCollapsed && "justify-center")}>
          {!isCollapsed && (
            <div>
              <Link href="/" className="block text-2xl font-heading text-brand-dark">
                RentEase
              </Link>
              <p className="mt-1 text-sm text-brand-slate">
                {variant === "landlord" ? "Landlord HQ" : variant === "property-manager" ? "Property Manager" : "Tenant Portal"}
              </p>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-slate hover:bg-brand-mist transition-colors"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
        <nav className="space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  active ? "text-brand-dark" : "text-brand-slate hover:text-brand-dark",
                  isCollapsed && "justify-center"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                {active && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-brand-mist"
                    transition={{ type: "spring", stiffness: 260, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-brand-mist/60 text-brand flex-shrink-0">
                  <Icon className="h-4 w-4" />
                </span>
                {!isCollapsed && <span className="relative z-10">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-4">
          {!isCollapsed && (
            <div className="rounded-2xl bg-brand-mist p-4 text-sm text-brand-dark">
              <p className="font-semibold">Need help?</p>
              <p className="mt-1 text-brand-slate">Reach support 24/7 in the concierge desk.</p>
              <Link href="mailto:support@rentease.com" className="mt-3 inline-flex text-brand">
                Chat with support →
              </Link>
            </div>
          )}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className={cn(
              "flex items-center gap-3 rounded-xl border border-brand-mist px-3 py-2 text-sm font-semibold text-brand-dark transition-colors hover:bg-brand-mist",
              isCollapsed && "justify-center"
            )}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-mist/60 text-brand">
              <LogOut className="h-4 w-4" />
            </span>
            {!isCollapsed && <span>{loggingOut ? "Logging out..." : "Log out"}</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-brand-mist bg-white/95 backdrop-blur-md lg:hidden">
        <div className="flex items-center justify-around px-1 py-1.5">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-center rounded-lg p-1.5 transition-colors flex-1 min-w-0",
                  active ? "text-brand" : "text-brand-slate"
                )}
                title={item.label}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg transition-colors flex-shrink-0",
                    active ? "bg-brand text-white" : "bg-brand-mist text-brand-slate"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

