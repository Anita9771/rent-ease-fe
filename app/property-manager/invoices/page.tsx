"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/dashboard/top-bar";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Bell, CheckCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useAlert } from "@/components/ui/app-alert";

interface Invoice {
  id: string;
  tenant: string;
  tenantUserId?: string;
  unit: string;
  dueDate: string;
  status: string;
  amount: number;
}

export default function PropertyManagerInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNudgeModalOpen, setIsNudgeModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<{ invoiceId: string; tenantId: string; type: string } | null>(null);
  const [nudgeFormData, setNudgeFormData] = useState({
    message: "",
  });
  const [nudging, setNudging] = useState(false);
  const { showAlert } = useAlert();

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await api.get<Invoice[]>("/invoices");
      setInvoices(data);
    } catch (error) {
      console.error("Failed to load invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const handleNudge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    try {
      setNudging(true);
      await api.post("/property-managers/nudge", {
        type: selectedInvoice.type,
        targetUserId: selectedInvoice.tenantId,
        invoiceId: selectedInvoice.invoiceId,
        message: nudgeFormData.message || undefined,
      });
      setIsNudgeModalOpen(false);
      setSelectedInvoice(null);
      setNudgeFormData({ message: "" });
      await showAlert("Nudge sent successfully!");
    } catch (error) {
      await showAlert(error);
    } finally {
      setNudging(false);
    }
  };

  const openNudgeModal = async (invoice: Invoice, type: "TENANT_PAYMENT" | "LANDLORD_RECEIPT") => {
    if (!invoice.tenantUserId && type === "TENANT_PAYMENT") {
      await showAlert("Unable to get tenant information. Please try again.");
      return;
    }
    setSelectedInvoice({
      invoiceId: invoice.id,
      tenantId: invoice.tenantUserId || "",
      type,
    });
    setNudgeFormData({ message: "" });
    setIsNudgeModalOpen(true);
  };

  return (
    <>
      <TopBar title="Invoices" subtitle="View invoices and send nudges to tenants or landlord." />
      <section className="flex-1 space-y-8 px-8 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-heading text-xl text-brand-dark">Invoices</h2>
            <p className="text-sm text-brand-slate">Manage rent invoices for your assigned properties.</p>
          </div>
        </div>
        <div className="overflow-hidden rounded-3xl border border-brand-mist bg-white">
          {loading ? (
            <div className="p-8 text-center text-brand-slate">Loading invoices...</div>
          ) : invoices.length === 0 ? (
            <div className="p-8 text-center text-brand-slate">No invoices found</div>
          ) : (
            <table className="w-full">
              <thead className="border-b border-brand-mist bg-brand-mist/30">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-brand-dark">Tenant</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-brand-dark">Unit</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-brand-dark">Due Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-brand-dark">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-brand-dark">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-brand-dark">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-mist">
                {invoices.map((invoice, idx) => (
                  <motion.tr
                    key={invoice.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="hover:bg-brand-mist/20 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-brand-dark">{invoice.tenant}</td>
                    <td className="px-6 py-4 text-brand-slate">{invoice.unit}</td>
                    <td className="px-6 py-4 text-brand-slate">{formatDate(invoice.dueDate)}</td>
                    <td className="px-6 py-4 font-semibold text-brand-dark">{formatCurrency(invoice.amount)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          invoice.status === "PAID"
                            ? "bg-emerald-100 text-emerald-700"
                            : invoice.status === "OVERDUE"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-brand-amber text-brand-dark"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {invoice.status === "PENDING" || invoice.status === "OVERDUE" ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="bg-brand-mist/80"
                            onClick={() => openNudgeModal(invoice, "TENANT_PAYMENT")}
                          >
                            <Bell className="mr-2 h-4 w-4" /> Nudge Tenant
                          </Button>
                        ) : invoice.status === "PAID" ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="bg-brand-mist/80"
                            onClick={() => openNudgeModal(invoice, "LANDLORD_RECEIPT")}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" /> Nudge Landlord
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <Modal
          isOpen={isNudgeModalOpen}
          onClose={() => {
            setIsNudgeModalOpen(false);
            setSelectedInvoice(null);
            setNudgeFormData({ message: "" });
          }}
          title={selectedInvoice?.type === "TENANT_PAYMENT" ? "Nudge Tenant to Pay" : "Nudge Landlord for Receipt"}
        >
          <form onSubmit={handleNudge} className="space-y-4">
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-brand-dark mb-2">
                Message (Optional)
              </label>
              <textarea
                id="message"
                rows={4}
                value={nudgeFormData.message}
                onChange={(e) => setNudgeFormData({ ...nudgeFormData, message: e.target.value })}
                className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
                placeholder={
                  selectedInvoice?.type === "TENANT_PAYMENT"
                    ? "Please make your rent payment..."
                    : "Please issue receipt for payment..."
                }
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsNudgeModalOpen(false);
                  setSelectedInvoice(null);
                  setNudgeFormData({ message: "" });
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={nudging}>
                {nudging ? "Sending..." : "Send Nudge"}
              </Button>
            </div>
          </form>
        </Modal>
      </section>
    </>
  );
}

