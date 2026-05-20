"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/dashboard/top-bar";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { api } from "@/lib/api";
import { useAlert } from "@/components/ui/app-alert";

interface Invoice {
  id: string;
  tenant: string;
  unit: string;
  dueDate: string;
  status: string;
  amount: number;
}

export default function LandlordInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
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
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
  return (
    <>
      <TopBar title="Rent & invoices" subtitle="Centralise rent reminders, payment confirmations, and receipts." />
      <section className="flex-1 space-y-8 px-8 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-heading text-xl text-brand-dark">Current cycle</h2>
            <p className="text-sm text-brand-slate">Automations running for April 2025 rent.</p>
          </div>
          <div className="flex gap-3">
            <Button
              className="shadow-brand/30 shadow-lg"
              onClick={async () => {
                if (confirm("Generate invoices for all active leases?")) {
                  try {
                    await api.post("/invoices/generate");
                    await loadInvoices();
                    await showAlert("Invoices generated successfully");
                  } catch (error) {
                    await showAlert(error);
                  }
                }
              }}
            >
              Generate invoices
            </Button>
            <Button
              variant="ghost"
              className="bg-brand-mist"
              onClick={async () => {
                if (confirm("Send reminders to all tenants with pending invoices?")) {
                  try {
                    const pendingInvoices = invoices.filter((inv) => inv.status === "PENDING");
                    for (const invoice of pendingInvoices) {
                      try {
                        await api.post(`/invoices/${invoice.id}/remind`, { channel: "EMAIL" });
                      } catch (err) {
                        console.error(`Failed to send reminder for invoice ${invoice.id}:`, err);
                      }
                    }
                    await showAlert("Reminders sent successfully");
                  } catch (error) {
                    await showAlert(error);
                  }
                }
              }}
            >
              Send reminder batch
            </Button>
          </div>
        </div>
        <div className="overflow-hidden rounded-3xl border border-brand-mist bg-white">
          <table className="min-w-full divide-y divide-brand-mist text-sm">
            <thead className="bg-brand-mist/80 text-brand-slate">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Tenant</th>
                <th className="px-6 py-3 text-left font-semibold">Unit</th>
                <th className="px-6 py-3 text-left font-semibold">Due</th>
                <th className="px-6 py-3 text-left font-semibold">Status</th>
                <th className="px-6 py-3 text-left font-semibold">Amount</th>
                <th className="px-6 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-mist/60 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-brand-slate">
                    Loading invoices...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-brand-slate">
                    No invoices found
                  </td>
                </tr>
              ) : (
                invoices.map((invoice, idx) => (
                  <motion.tr
                    key={invoice.id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-brand-dark">{invoice.tenant}</div>
                    </td>
                    <td className="px-6 py-4 text-brand-slate">{invoice.unit}</td>
                    <td className="px-6 py-4 text-brand-slate">{formatDate(invoice.dueDate)}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={invoice.status} />
                    </td>
                    <td className="px-6 py-4 font-semibold text-brand-dark">{formatCurrency(invoice.amount)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" className="bg-brand-mist" onClick={() => window.location.href = `/landlord/invoices/${invoice.id}`}>
                          View
                        </Button>
                        {invoice.status === "PENDING" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="bg-brand-mist"
                            onClick={async () => {
                              try {
                                const payments = await api.get<any[]>("/payments");
                                const payment = payments.find((p: any) => p.invoiceId === invoice.id);
                                if (payment) {
                                  if (confirm("Confirm payment for this invoice?")) {
                                    await api.post(`/payments/${payment.id}/confirm`, {});
                                    await loadInvoices();
                                    await showAlert("Payment confirmed successfully.");
                                  }
                                } else {
                                  await showAlert("No payment found for this invoice");
                                }
                              } catch (error) {
                                await showAlert(error);
                              }
                            }}
                          >
                            Confirm payment
                          </Button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map = {
    Pending: { color: "bg-brand-amber/20 text-brand-amber", icon: <Clock className="h-4 w-4" /> },
    Paid: { color: "bg-emerald-100 text-emerald-600", icon: <CheckCircle2 className="h-4 w-4" /> },
    Overdue: { color: "bg-rose-100 text-rose-600", icon: <AlertTriangle className="h-4 w-4" /> },
  } as const;
  const variant = map[status as keyof typeof map] ?? map.Pending;
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${variant.color}`}>
      {variant.icon}
      {status}
    </span>
  );
}

