"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

type Notification = {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  sentAt: string;
  readAt: string | null;
};

type NotificationsPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
};

function complaintsBasePath(role?: string) {
  if (role === "TENANT") return "/tenant/complaints";
  if (role === "PROPERTY_MANAGER") return "/property-manager/complaints";
  return "/landlord/complaints";
}

function formatNotification(n: Notification, role?: string): { title: string; body: string; href?: string } {
  const p = n.payload ?? {};
  const base = complaintsBasePath(role);
  switch (n.type) {
    case "COMPLAINT_CREATED":
      return {
        title: "New maintenance request",
        body: String(p.title ?? "A tenant opened a ticket"),
        href: p.complaintId ? `${base}/${p.complaintId}` : base,
      };
    case "COMPLAINT_STATUS_UPDATED":
      return {
        title: "Ticket status updated",
        body: `Status: ${String(p.status ?? "updated")}`,
        href: p.complaintId ? `${base}/${p.complaintId}` : base,
      };
    case "COMPLAINT_COMMENT":
      return {
        title: "New ticket message",
        body: "Someone replied on a maintenance thread",
        href: p.complaintId ? `${base}/${p.complaintId}` : base,
      };
    default:
      return { title: n.type.replace(/_/g, " "), body: "You have a new notification" };
  }
}

export function NotificationsPanel({ isOpen, onClose, userRole }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<Notification[]>("/notifications");
      setNotifications(data);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen, load]);

  const markRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)),
      );
    } catch {
      // ignore
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
    } catch {
      // ignore
    }
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} aria-hidden />
      <div className="fixed right-4 top-20 z-50 w-full max-w-sm rounded-3xl border border-brand-mist bg-white shadow-glass">
        <div className="flex items-center justify-between border-b border-brand-mist px-5 py-4">
          <h3 className="font-heading text-lg text-brand-dark">Notifications</h3>
          {unreadCount > 0 && (
            <button type="button" onClick={markAllRead} className="text-xs font-semibold text-brand hover:text-brand-dark">
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto p-2">
          {loading ? (
            <p className="px-4 py-8 text-center text-sm text-brand-slate">Loading...</p>
          ) : notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-brand-slate">No notifications yet</p>
          ) : (
            notifications.map((n) => {
              const { title, body, href } = formatNotification(n, userRole);
              const content = (
                <div
                  className={`rounded-2xl px-4 py-3 text-left transition hover:bg-brand-mist ${
                    !n.readAt ? "bg-brand-mist/60" : ""
                  }`}
                >
                  <p className="text-sm font-semibold text-brand-dark">{title}</p>
                  <p className="mt-1 text-xs text-brand-slate">{body}</p>
                  <p className="mt-2 text-[10px] text-brand-slate">{new Date(n.sentAt).toLocaleString()}</p>
                </div>
              );
              return (
                <div key={n.id} className="mb-1">
                  {href ? (
                    <Link
                      href={href}
                      onClick={() => {
                        if (!n.readAt) markRead(n.id);
                        onClose();
                      }}
                    >
                      {content}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="w-full"
                      onClick={() => {
                        if (!n.readAt) markRead(n.id);
                      }}
                    >
                      {content}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
