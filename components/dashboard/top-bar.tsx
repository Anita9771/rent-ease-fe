"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, Search } from "lucide-react";
import { NotificationsPanel } from "@/components/dashboard/notifications-panel";
import Image from "next/image";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

type TopBarProps = {
  title: string;
  subtitle?: string;
};

type CurrentUserResponse = {
  email: string;
  role?: string;
  landlord?: {
    displayName?: string | null;
    title?: string | null;
    avatarUrl?: string | null;
    phone?: string | null;
  } | null;
  tenant?: {
    id: string;
  } | null;
  propertyStaff?: {
    displayName?: string | null;
    title?: string | null;
    avatarUrl?: string | null;
    phone?: string | null;
  } | null;
};

export function TopBar({ title, subtitle }: TopBarProps) {
  const [profile, setProfile] = useState<CurrentUserResponse | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await api.get<CurrentUserResponse>("/users/me");
      setProfile(data);
    } catch {
      // ignore errors
    }
  }, []);

  const fetchUnread = useCallback(async () => {
    try {
      const data = await api.get<Array<{ readAt: string | null }>>("/notifications");
      setUnreadCount(data.filter((n) => !n.readAt).length);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchUnread();
    const handler = () => fetchProfile();
    window.addEventListener("profile-updated", handler);
    return () => {
      window.removeEventListener("profile-updated", handler);
    };
  }, [fetchProfile, fetchUnread]);

  const displayName =
    profile?.landlord?.displayName ||
    profile?.propertyStaff?.displayName ||
    profile?.email?.split("@")[0] ||
    "Admin";
  const titleLabel =
    profile?.landlord?.title ||
    profile?.propertyStaff?.title ||
    (profile?.landlord
      ? "Landlord"
      : profile?.propertyStaff
      ? "Property Manager"
      : profile?.tenant
      ? "Tenant"
      : "Admin");
  const avatarUrl =
    profile?.landlord?.avatarUrl ||
    profile?.propertyStaff?.avatarUrl ||
    "https://i.pravatar.cc/64?img=12";

  return (
    <div className="flex flex-col gap-6 border-b border-brand-mist bg-white/70 px-8 py-6 backdrop-blur lg:flex-row lg:items-center lg:justify-between">
      <div>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="font-heading text-2xl text-brand-dark"
        >
          {title}
        </motion.h1>
        {subtitle && <p className="mt-2 text-sm text-brand-slate">{subtitle}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-slate" />
          <input
            className="h-10 w-64 rounded-full border border-brand-mist bg-brand-mist pl-10 pr-4 text-sm outline-none transition focus:border-brand"
            placeholder="Search tenants, invoices..."
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setNotificationsOpen((o) => !o);
            if (!notificationsOpen) fetchUnread();
          }}
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-brand-mist text-brand"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-brand-amber text-[10px] font-semibold text-brand-dark">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
        <NotificationsPanel
          isOpen={notificationsOpen}
          userRole={profile?.role}
          onClose={() => {
            setNotificationsOpen(false);
            fetchUnread();
          }}
        />
        <div className="flex items-center gap-3 rounded-full bg-brand-mist px-3 py-2">
          <Image
            src={avatarUrl}
            alt="User avatar"
            width={32}
            height={32}
            className="rounded-full object-cover"
          />
          <div className="text-sm">
            <div className="font-semibold text-brand-dark">{displayName}</div>
            <div className="text-brand-slate">{titleLabel}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

