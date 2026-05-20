"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { TopBar } from "@/components/dashboard/top-bar";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import Link from "next/link";
import { useAlert } from "@/components/ui/app-alert";

interface InvoiceDetail {
  id: string;
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  amountDue: number;
  amountPaid: number;
  status: string;
  tenant: {
    user: {
      email: string;
    };
  };
  lease: {
    unit: {
      unitNumber: string;
      property?: {
        name: string;
      } | null;
    };
  };
  payments: Array<{
    id: string;
    amount: number;
    method: string;
    status: string;
    receivedAt: string;
  }>;
}

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceId = params.id as string;
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const { showAlert } = useAlert();

  useEffect(() => {
    if (invoiceId) {
      loadInvoice();
    }
  }, [invoiceId]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      const data = await api.get<InvoiceDetail>(`/invoices/${invoiceId}`);
      setInvoice(data);
    } catch (error) {
      console.error("Failed to load invoice:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleConfirmPayment = async (paymentId: string) => {
    if (confirm("Confirm payment for this invoice?")) {
      try {
        await api.post(`/payments/${paymentId}/confirm`, {});
        await loadInvoice();
        await showAlert("Payment confirmed successfully");
      } catch (error) {
        await showAlert(error);
      }
    }
  };

  if (loading) {
    return (
      <>
        <TopBar title="Invoice Details" subtitle="View invoice information and payment history." />
        <section className="flex-1 space-y-10 px-8 py-10">
          <div className="text-center text-brand-slate py-12">Loading invoice...</div>
        </section>
      </>
    );
  }

  if (!invoice) {
    return (
      <>
        <TopBar title="Invoice Details" subtitle="View invoice information and payment history." />
        <section className="flex-1 space-y-10 px-8 py-10">
          <div className="text-center text-brand-slate py-12">Invoice not found</div>
        </section>
      </>
    );
  }

  const outstandingBalance = invoice.amountDue - invoice.amountPaid;

  return (
    <>
      <TopBar title="Invoice Details" subtitle="View invoice information and payment history." />
      <section className="flex-1 space-y-10 px-8 py-10">
        <div className="grid gap-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl border border-brand-mist bg-white p-8 shadow-sm"
          >
            <h2 className="font-heading text-xl text-brand-dark mb-6">Invoice Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-brand-slate">Tenant</p>
                <p className="font-semibold text-brand-dark">{invoice.tenant.user.email}</p>
              </div>
              <div>
                <p className="text-sm text-brand-slate">Unit</p>
                <p className="font-semibold text-brand-dark">
                  {invoice.lease.unit.property
                    ? `${invoice.lease.unit.property.name} • Unit ${invoice.lease.unit.unitNumber}`
                    : `Unit ${invoice.lease.unit.unitNumber}`}
                </p>
              </div>
              <div>
                <p className="text-sm text-brand-slate">Period</p>
                <p className="font-semibold text-brand-dark">
                  {formatDate(invoice.periodStart)} - {formatDate(invoice.periodEnd)}
                </p>
              </div>
              <div>
                <p className="text-sm text-brand-slate">Due Date</p>
                <p className="font-semibold text-brand-dark">{formatDate(invoice.dueDate)}</p>
              </div>
              <div className="rounded-2xl bg-brand-mist p-4 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-brand-slate">Amount Due</p>
                  <p className="text-xl font-semibold text-brand-dark">{formatCurrency(invoice.amountDue)}</p>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-brand-slate">Amount Paid</p>
                  <p className="text-lg font-semibold text-brand-dark">{formatCurrency(invoice.amountPaid)}</p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-white">
                  <p className="text-sm font-semibold text-brand-dark">Outstanding Balance</p>
                  <p className="text-xl font-semibold text-brand-dark">{formatCurrency(outstandingBalance)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-brand-slate">Status</p>
                <span
                  className={`inline-block mt-1 rounded-full px-3 py-1 text-xs font-semibold ${
                    invoice.status === "PAID"
                      ? "bg-emerald-100 text-emerald-700"
                      : invoice.status === "OVERDUE"
                      ? "bg-rose-100 text-rose-700"
                      : "bg-brand-amber text-brand-dark"
                  }`}
                >
                  {invoice.status}
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-3xl border border-brand-mist bg-white p-8 shadow-sm"
          >
            <h2 className="font-heading text-xl text-brand-dark mb-6">Payment History</h2>
            <div className="space-y-3">
              {invoice.payments.length === 0 ? (
                <p className="text-sm text-brand-slate">No payments yet</p>
              ) : (
                invoice.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between rounded-2xl bg-brand-mist px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-brand-dark">{formatCurrency(payment.amount)}</p>
                      <p className="text-xs text-brand-slate">
                        {payment.method} • {formatDate(payment.receivedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          payment.status === "CONFIRMED"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-brand-amber text-brand-dark"
                        }`}
                      >
                        {payment.status}
                      </span>
                      {payment.status === "PENDING_CONFIRMATION" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="bg-white"
                          onClick={() => handleConfirmPayment(payment.id)}
                        >
                          Confirm
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        <div className="flex justify-end">
          <Link
            href="/landlord/invoices"
            className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:text-brand-dark transition-colors"
          >
            ← Back to Invoices
          </Link>
        </div>
      </section>
    </>
  );
}

