"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/dashboard/top-bar";
import { StatCard } from "@/components/dashboard/stat-card";
import { motion } from "framer-motion";
import { CreditCard, Receipt, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAlert } from "@/components/ui/app-alert";

interface Invoice {
  id: string;
  dueDate: string;
  amount: number;
  status: string;
}

interface Complaint {
  id: string;
  status: string;
}

export default function TenantDashboardPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const { showAlert } = useAlert();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invoicesData, complaintsData] = await Promise.all([
        api.get<Invoice[]>("/invoices"),
        api.get<Complaint[]>("/complaints"),
      ]);
      setInvoices(invoicesData);
      setComplaints(complaintsData);
    } catch (error) {
      console.error("Failed to load data:", error);
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

  const nextInvoice = invoices.find((inv) => inv.status === "PENDING" || inv.status === "OVERDUE");
  const balance = invoices
    .filter((inv) => inv.status === "PENDING" || inv.status === "OVERDUE")
    .reduce((sum, inv) => sum + inv.amount, 0);
  const openComplaints = complaints.filter((c) => c.status === "OPEN").length;

  const stats = [
    {
      label: "Next rent due",
      value: nextInvoice
        ? `${formatCurrency(nextInvoice.amount)} • ${new Date(nextInvoice.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
        : "No upcoming rent",
      icon: <CreditCard className="h-5 w-5 text-brand" />,
    },
    {
      label: "Balance",
      value: formatCurrency(balance),
      trend: balance === 0 ? "All paid" : `${invoices.filter((inv) => inv.status === "PENDING" || inv.status === "OVERDUE").length} pending`,
      icon: <Receipt className="h-5 w-5 text-brand" />,
    },
    {
      label: "Open issues",
      value: `${openComplaints}`,
      trend: openComplaints === 0 ? "All resolved" : "Awaiting landlord",
      icon: <Ticket className="h-5 w-5 text-brand" />,
    },
  ];

  // Get last 6 months of paid invoices for history
  const paidInvoices = invoices
    .filter((inv) => inv.status === "PAID")
    .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
    .slice(0, 6);
  return (
    <>
      <TopBar title="Welcome home" subtitle="Stay on top of rent, receipts, and maintenance in one place." />
      <section className="flex-1 space-y-10 px-8 py-10">
        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat, idx) => (
            <StatCard key={stat.label} {...stat} delay={idx * 0.05} />
          ))}
        </div>
        <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl border border-brand-mist bg-white p-8 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-xl text-brand-dark">Rent history</h2>
                <p className="text-sm text-brand-slate">Download receipts or share directly with your employer.</p>
              </div>
              <Button
                variant="ghost"
                className="bg-brand-mist"
                onClick={async () => {
                  try {
                    const receipts = await api.get<any[]>("/receipts");
                    await showAlert(`Downloading ${receipts.length} receipts...`);
                  } catch (error) {
                    await showAlert(error);
                  }
                }}
              >
                Download statements
              </Button>
            </div>
            <div className="mt-6 grid grid-cols-6 gap-4 text-center text-sm text-brand-slate">
              {loading ? (
                <div className="col-span-6 text-center py-4">Loading...</div>
              ) : paidInvoices.length === 0 ? (
                <div className="col-span-6 text-center py-4 text-brand-slate">No payment history</div>
              ) : (
                paidInvoices.map((invoice, idx) => {
                  const date = new Date(invoice.dueDate);
                  const month = date.toLocaleDateString("en-US", { month: "short" });
                  return (
                    <motion.div
                      key={invoice.id}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className="rounded-2xl bg-brand-mist px-4 py-5"
                    >
                      <div className="text-xs uppercase text-brand-slate/80">{month}</div>
                      <div className="mt-2 font-semibold text-brand-dark">{formatCurrency(invoice.amount)}</div>
                      <div className="mt-1 text-xs text-emerald-600">Paid</div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl border border-brand-mist bg-white p-8 shadow-sm"
          >
            <h2 className="font-heading text-xl text-brand-dark">Quick actions</h2>
            <div className="mt-6 space-y-4 text-sm">
              {nextInvoice && (
                <Button className="w-full" onClick={() => window.location.href = "/tenant/payments"}>
                  Pay rent now
                </Button>
              )}
              <Button variant="ghost" className="w-full bg-brand-mist" onClick={() => window.location.href = "/tenant/documents"}>
                Access lease documents
              </Button>
              <Button variant="ghost" className="w-full bg-brand-mist" onClick={() => window.location.href = "/tenant/complaints"}>
                Submit maintenance request
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}

