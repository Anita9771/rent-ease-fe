"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/dashboard/top-bar";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { api } from "@/lib/api";
import { useAlert } from "@/components/ui/app-alert";

interface Complaint {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  comments?: Array<{ id: string }>;
}

export default function TenantComplaintsPage() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
  });
  const [submitting, setSubmitting] = useState(false);
  const { showAlert } = useAlert();

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

  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/complaints", formData);
      setIsModalOpen(false);
      setFormData({ title: "", description: "", priority: "MEDIUM" });
      await loadComplaints();
      await showAlert("Complaint submitted successfully!");
    } catch (error) {
      await showAlert(error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };
  return (
    <>
      <TopBar title="Issues" subtitle="Track maintenance requests and chat with your landlord." />
      <section className="flex-1 space-y-8 px-8 py-10">
        <div className="flex justify-between gap-4">
          <div>
            <h2 className="font-heading text-xl text-brand-dark">Open issues</h2>
            <p className="text-sm text-brand-slate">Transparent updates and attachments keep everyone aligned.</p>
          </div>
          <Button className="shadow-brand/30 shadow-lg" onClick={() => setIsModalOpen(true)}>New request</Button>
        </div>
        {loading ? (
          <div className="text-center text-brand-slate py-12">Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <div className="text-center text-brand-slate py-12">No complaints yet. Create your first maintenance request!</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {complaints.map((ticket, idx) => (
              <motion.article
                key={ticket.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="rounded-3xl border border-brand-mist bg-white p-6 shadow-sm"
              >
                <h3 className="font-heading text-lg text-brand-dark">{ticket.title}</h3>
                <p className="mt-2 text-xs uppercase tracking-wide text-brand">{ticket.status}</p>
                <p className="mt-4 text-sm text-brand-slate">Updated {formatTimeAgo(ticket.createdAt)}</p>
                <p className="mt-4 text-xs text-brand-slate">{ticket.comments?.length || 0} messages</p>
                <Button variant="ghost" className="mt-6 w-full bg-brand-mist" onClick={() => router.push(`/tenant/complaints/${ticket.id}`)}>
                  View thread
                </Button>
              </motion.article>
            ))}
          </div>
        )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Maintenance Request">
        <form onSubmit={handleCreateComplaint} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-brand-dark mb-2">
              Title
            </label>
            <input
              id="title"
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
              placeholder="e.g., Heating not working"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-brand-dark mb-2">
              Description
            </label>
            <textarea
              id="description"
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
              placeholder="Describe the issue in detail..."
            />
          </div>
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-brand-dark mb-2">
              Priority
            </label>
            <select
              id="priority"
              required
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </Modal>
      </section>
    </>
  );
}

