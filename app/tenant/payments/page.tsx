"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/dashboard/top-bar";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAlert } from "@/components/ui/app-alert";

interface Invoice {
  id: string;
  period: string;
  amount: number;
  status: string;
  dueDate: string;
}

function PaymentMethodsSection() {
  const [methods, setMethods] = useState<Array<{ id: string; type: string; last4?: string; brand?: string; isDefault?: boolean }>>([]);
  const [loading, setLoading] = useState(true);
  const { showAlert } = useAlert();

  useEffect(() => {
    loadMethods();
  }, []);

  const loadMethods = async () => {
    try {
      setLoading(true);
      const data = await api.get<Array<{ id: string; type: string; last4?: string; brand?: string; isDefault?: boolean }>>("/payments/methods");
      setMethods(data);
    } catch (error) {
      console.error("Failed to load payment methods:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMethod = async () => {
    const type = prompt("Enter payment method type (e.g., CARD, BANK_TRANSFER):");
    const last4 = prompt("Enter last 4 digits (optional):");
    if (type) {
      try {
        await api.post("/payments/methods", {
          type,
          last4: last4 || undefined,
          brand: type === "CARD" ? "Visa" : undefined,
        });
        await showAlert("Payment method added successfully");
        await loadMethods();
      } catch (error) {
        await showAlert(error);
      }
    }
  };

  if (loading) {
    return <div className="mt-6 text-center text-brand-slate py-4">Loading payment methods...</div>;
  }

  return (
    <div className="mt-6 flex flex-wrap items-center gap-4">
      {methods.length === 0 ? (
        <p className="text-sm text-brand-slate">No payment methods saved</p>
      ) : (
        methods.map((method) => (
          <div key={method.id} className="flex items-center gap-3 rounded-2xl bg-brand-mist px-4 py-3 text-sm">
            <span className="font-semibold text-brand-dark">
              {method.brand || method.type} {method.last4 ? `ending ${method.last4}` : ""}
            </span>
            {method.isDefault && <span className="text-xs uppercase text-brand-slate">Default</span>}
          </div>
        ))
      )}
      <Button variant="ghost" className="bg-brand-mist" onClick={handleAddMethod}>
        Add payment method
      </Button>
    </div>
  );
}

export default function TenantPaymentsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await api.get<any[]>("/invoices");
      // Transform to match frontend format
      const transformed = data.map((inv) => {
        const dueDate = new Date(inv.dueDate);
        return {
          id: inv.id,
          period: dueDate.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
          amount: inv.amount,
          status: inv.status,
          dueDate: inv.dueDate,
        };
      });
      setInvoices(transformed);
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
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };
  return (
    <>
      <TopBar title="Payments" subtitle="Review upcoming rent, saved cards, and receipts." />
      <section className="flex-1 space-y-10 px-8 py-10">
        <div className="rounded-3xl border border-brand-mist bg-white p-8 shadow-sm">
          <h2 className="font-heading text-xl text-brand-dark">Invoices</h2>
          {loading ? (
            <div className="mt-6 text-center text-brand-slate py-8">Loading invoices...</div>
          ) : invoices.length === 0 ? (
            <div className="mt-6 text-center text-brand-slate py-8">No invoices found</div>
          ) : (
            <div className="mt-6 grid gap-4">
              {invoices.map((invoice, idx) => (
                <motion.div
                  key={invoice.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-brand-mist px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-semibold text-brand-dark">{invoice.period}</p>
                    <p className="text-brand-slate">Due {formatDate(invoice.dueDate)}</p>
                  </div>
                  <div className="font-semibold text-brand-dark">{formatCurrency(invoice.amount)}</div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-brand">
                    {invoice.status}
                  </div>
                  <Button variant="ghost" className="bg-white" onClick={() => window.location.href = `/tenant/payments/${invoice.id}`}>
                    View details
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-3xl border border-brand-mist bg-white p-8 shadow-sm">
          <h2 className="font-heading text-xl text-brand-dark">Saved payment methods</h2>
          <PaymentMethodsSection />
        </div>
      </section>
    </>
  );
}

