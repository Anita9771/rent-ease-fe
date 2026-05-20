"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TopBar } from "@/components/dashboard/top-bar";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Clock, MessageSquare, User } from "lucide-react";
import { api } from "@/lib/api";

interface Complaint {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  tenant: {
    id: string;
    user: {
      email: string;
    };
  };
  createdAt: string;
  updatedAt?: string;
}

export default function LandlordComplaintsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenantFilter = searchParams?.get("tenant");
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const data = await api.get<Complaint[]>("/complaints");
      setComplaints(data);
    } catch (error) {
      console.error("Failed to load complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  const getTenantName = (complaint: Complaint) => {
    return complaint.tenant.user.email.split("@")[0];
  };

  const filteredComplaints = tenantFilter
    ? complaints.filter((c) => c.tenant.id === tenantFilter)
    : complaints;

  return (
    <>
      <TopBar title="Complaints & tickets" subtitle="Resolve tenant requests with transparent SLAs and messaging." />
      <section className="flex-1 space-y-8 px-8 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-heading text-xl text-brand-dark">Active tickets</h2>
            <p className="text-sm text-brand-slate">Collaborate with property managers and vendors in one thread.</p>
          </div>
          <Button className="shadow-brand/30 shadow-lg" onClick={() => router.push("/landlord/complaints/board")}>
            Open maintenance board
          </Button>
        </div>
        {loading ? (
          <div className="text-center text-brand-slate py-12">Loading complaints...</div>
        ) : filteredComplaints.length === 0 ? (
          <div className="text-center text-brand-slate py-12">
            {tenantFilter ? "No complaints for this tenant" : "No complaints yet"}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredComplaints.map((ticket, idx) => (
              <motion.article
                key={ticket.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.07 }}
                className="flex flex-col gap-4 rounded-3xl border border-brand-mist bg-white p-6 shadow-sm"
              >
                <div>
                  <h3 className="font-heading text-lg text-brand-dark">{ticket.title}</h3>
                  <p className="mt-1 flex items-center gap-2 text-sm text-brand-slate">
                    <User className="h-4 w-4 text-brand" />
                    {getTenantName(ticket)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-brand-mist px-3 py-1 text-brand">{ticket.priority}</span>
                  <span className="rounded-full bg-brand px-3 py-1 text-white">{ticket.status}</span>
                </div>
                <p className="flex items-center gap-2 text-xs text-brand-slate">
                  <Clock className="h-4 w-4" />
                  Updated {formatTimeAgo(ticket.updatedAt || ticket.createdAt)}
                </p>
                <Button variant="ghost" className="mt-auto w-full bg-brand-mist" onClick={() => router.push(`/landlord/complaints/${ticket.id}`)}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  View conversation
                </Button>
              </motion.article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

