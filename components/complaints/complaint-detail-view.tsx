"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAlert } from "@/components/ui/app-alert";

export type ComplaintDetail = {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  tenant?: { id: string; user: { email: string } } | null;
  lease?: {
    unit: {
      unitNumber: string;
      property: { id: string; name: string } | null;
    };
  } | null;
  comments: Array<{
    id: string;
    message: string;
    createdAt: string;
    author: { id: string; email: string; role: string };
  }>;
};

type ComplaintDetailViewProps = {
  complaintId: string;
  backHref: string;
  backLabel: string;
  canUpdateStatus?: boolean;
};

const STATUS_OPTIONS = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

export function ComplaintDetailView({
  complaintId,
  backHref,
  backLabel,
  canUpdateStatus = false,
}: ComplaintDetailViewProps) {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const loadComplaint = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get<ComplaintDetail>(`/complaints/${complaintId}`);
      setComplaint(data);
    } catch (error) {
      await showAlert(error);
      router.push(backHref);
    } finally {
      setLoading(false);
    }
  }, [complaintId, backHref, router, showAlert]);

  useEffect(() => {
    loadComplaint();
  }, [loadComplaint]);

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    try {
      await api.post(`/complaints/${complaintId}/comments`, { message: message.trim() });
      setMessage("");
      await loadComplaint();
    } catch (error) {
      await showAlert(error);
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    setStatusUpdating(true);
    try {
      await api.patch(`/complaints/${complaintId}/status`, { status });
      await loadComplaint();
      await showAlert("Status updated");
    } catch (error) {
      await showAlert(error);
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading || !complaint) {
    return <div className="px-8 py-10 text-brand-slate">Loading conversation...</div>;
  }

  const tenantLabel = complaint.tenant?.user.email.split("@")[0] ?? "Tenant";
  const propertyLabel = complaint.lease?.unit.property?.name;
  const unitLabel = complaint.lease?.unit.unitNumber;

  return (
    <section className="flex-1 space-y-8 px-8 py-10">
      <Link href={backHref} className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:text-brand-dark">
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>

      <div className="rounded-3xl border border-brand-mist bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl text-brand-dark">{complaint.title}</h2>
            <p className="mt-2 text-sm text-brand-slate">
              {tenantLabel}
              {propertyLabel && unitLabel ? ` • ${propertyLabel} · Unit ${unitLabel}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-brand-mist px-3 py-1 text-xs font-semibold text-brand">
              {complaint.priority}
            </span>
            <span className="rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">{complaint.status}</span>
          </div>
        </div>
        <p className="mt-6 text-sm leading-relaxed text-brand-dark">{complaint.description}</p>

        {canUpdateStatus && (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-brand-dark">Update status:</span>
            {STATUS_OPTIONS.map((status) => (
              <Button
                key={status}
                type="button"
                size="sm"
                variant={complaint.status === status ? "primary" : "ghost"}
                className={complaint.status !== status ? "bg-brand-mist" : ""}
                disabled={statusUpdating || complaint.status === status}
                onClick={() => handleStatusChange(status)}
              >
                {status.replace("_", " ")}
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-brand-mist bg-white p-8 shadow-sm">
        <h3 className="font-heading text-lg text-brand-dark">Conversation</h3>
        <div className="mt-6 space-y-4 max-h-[400px] overflow-y-auto">
          {complaint.comments.length === 0 ? (
            <p className="text-sm text-brand-slate">No messages yet. Start the conversation below.</p>
          ) : (
            complaint.comments.map((comment) => (
              <div key={comment.id} className="rounded-2xl bg-brand-mist p-4">
                <div className="flex items-center justify-between gap-2 text-xs text-brand-slate">
                  <span className="font-semibold text-brand-dark">
                    {comment.author.email.split("@")[0]} · {comment.author.role.replace("_", " ")}
                  </span>
                  <span>{new Date(comment.createdAt).toLocaleString()}</span>
                </div>
                <p className="mt-2 text-sm text-brand-dark">{comment.message}</p>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSendComment} className="mt-6 flex gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write a reply..."
            className="flex-1 rounded-xl border border-brand-mist bg-white px-4 py-3 text-sm text-brand-dark focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
          <Button type="submit" disabled={sending || !message.trim()}>
            <Send className="mr-2 h-4 w-4" />
            {sending ? "Sending..." : "Send"}
          </Button>
        </form>
      </div>
    </section>
  );
}
