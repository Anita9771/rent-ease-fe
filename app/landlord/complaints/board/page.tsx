"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/dashboard/top-bar";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAlert } from "@/components/ui/app-alert";
import { ArrowLeft, MessageSquare } from "lucide-react";

type Complaint = {
  id: string;
  title: string;
  priority: string;
  status: string;
  tenant: { user: { email: string } };
  createdAt: string;
};

const COLUMNS: Array<{ status: string; label: string }> = [
  { status: "OPEN", label: "Open" },
  { status: "IN_PROGRESS", label: "In progress" },
  { status: "RESOLVED", label: "Resolved" },
  { status: "CLOSED", label: "Closed" },
];

export default function MaintenanceBoardPage() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [movingId, setMovingId] = useState<string | null>(null);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const data = await api.get<Complaint[]>("/complaints");
      setComplaints(data);
    } catch (error) {
      await showAlert(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const moveToStatus = async (complaintId: string, status: string) => {
    setMovingId(complaintId);
    try {
      await api.patch(`/complaints/${complaintId}/status`, { status });
      await loadComplaints();
    } catch (error) {
      await showAlert(error);
    } finally {
      setMovingId(null);
    }
  };

  return (
    <>
      <TopBar title="Maintenance board" subtitle="Drag tickets across columns or use quick actions to update status." />
      <section className="flex-1 space-y-6 px-8 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/landlord/complaints"
            className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:text-brand-dark"
          >
            <ArrowLeft className="h-4 w-4" />
            List view
          </Link>
        </div>

        {loading ? (
          <p className="text-brand-slate">Loading board...</p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-4">
            {COLUMNS.map((column) => {
              const columnTickets = complaints.filter((c) => c.status === column.status);
              return (
                <div key={column.status} className="rounded-3xl border border-brand-mist bg-brand-mist/40 p-4 min-h-[320px]">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-heading text-sm font-semibold text-brand-dark">{column.label}</h3>
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-brand">
                      {columnTickets.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {columnTickets.map((ticket) => (
                      <div key={ticket.id} className="rounded-2xl border border-brand-mist bg-white p-4 shadow-sm">
                        <p className="font-semibold text-sm text-brand-dark">{ticket.title}</p>
                        <p className="mt-1 text-xs text-brand-slate">{ticket.tenant.user.email.split("@")[0]}</p>
                        <span className="mt-2 inline-block rounded-full bg-brand-mist px-2 py-0.5 text-[10px] font-semibold text-brand">
                          {ticket.priority}
                        </span>
                        <div className="mt-3 flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="w-full bg-brand-mist text-xs"
                            onClick={() => router.push(`/landlord/complaints/${ticket.id}`)}
                          >
                            <MessageSquare className="mr-1 h-3 w-3" />
                            Open
                          </Button>
                          {COLUMNS.filter((c) => c.status !== ticket.status).map((target) => (
                            <button
                              key={target.status}
                              type="button"
                              disabled={movingId === ticket.id}
                              onClick={() => moveToStatus(ticket.id, target.status)}
                              className="text-left text-[10px] font-semibold uppercase tracking-wide text-brand hover:text-brand-dark disabled:opacity-50"
                            >
                              → {target.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    {columnTickets.length === 0 && (
                      <p className="text-xs text-brand-slate py-4 text-center">No tickets</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
