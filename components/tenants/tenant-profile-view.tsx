"use client";

import { Children, ReactNode, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { getUserFriendlyError } from "@/lib/errors";

type TenantProfile = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  phone?: string | null;
  emergencyContact?: { name?: string; phone?: string } | null;
  property?: { id: string; name: string; address: string } | null;
  leases: Array<{
    id: string;
    status: string;
    startDate: string;
    endDate: string;
    rentAmount: number | null;
    unit: {
      unitNumber?: string;
      property?: { name: string; address: string } | null;
    } | null;
  }>;
  invoices: Array<{ id: string; dueDate: string; amountDue: number | null; amountPaid: number | null; status: string }>;
  payments: Array<{ id: string; amount: number | null; method: string; status: string; receivedAt: string }>;
  complaints: Array<{ id: string; title: string; status: string; priority: string; createdAt: string }>;
  createdAt: string;
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function TenantProfileView({ tenantId }: { tenantId: string }) {
  const [tenant, setTenant] = useState<TenantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.get<TenantProfile>(`/tenants/${tenantId}`);
        if (isMounted) {
          setTenant(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(getUserFriendlyError(err, "We couldn't load this tenant's profile."));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [tenantId]);

  const emergencyContact = useMemo(() => {
    if (!tenant?.emergencyContact) return null;
    return tenant.emergencyContact as { name?: string; phone?: string } | null;
  }, [tenant]);

  if (loading) {
    return (
      <section className="flex-1 px-8 py-10">
        <div className="rounded-3xl border border-brand-mist bg-white p-6 text-brand-slate shadow-sm">
          Loading tenant profile...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex-1 px-8 py-10">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-sm">{error}</div>
      </section>
    );
  }

  if (!tenant) {
    return (
      <section className="flex-1 px-8 py-10">
        <div className="rounded-3xl border border-brand-mist bg-white p-6 text-brand-slate shadow-sm">
          Tenant not found.
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 space-y-8 px-8 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-3xl border border-brand-mist bg-white p-6 shadow-sm"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Image
              src={tenant.avatarUrl || "https://i.pravatar.cc/100?img=31"}
              alt={tenant.name}
              width={72}
              height={72}
              unoptimized
              className="rounded-2xl object-cover"
            />
            <div>
              <p className="text-xs uppercase tracking-wide text-brand-slate">Tenant profile</p>
              <p className="text-2xl font-semibold text-brand-dark">{tenant.name}</p>
              <p className="text-sm text-brand-slate">{tenant.email}</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoItem label="Phone" value={tenant.phone || "Not provided"} />
            <InfoItem label="Emergency contact" value={formatEmergencyContact(emergencyContact)} />
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem label="Property" value={tenant.property ? tenant.property.name : "Unassigned"} />
          <InfoItem label="Address" value={tenant.property?.address || "—"} />
          <InfoItem label="Customer since" value={new Date(tenant.createdAt).toLocaleDateString()} />
        </div>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-2">
        <DataCard title="Active & past leases" emptyMessage="No leases recorded yet.">
          {tenant.leases.map((lease) => (
            <div key={lease.id} className="flex items-center justify-between rounded-2xl bg-brand-mist/70 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-brand-dark">
                  {lease.unit?.property?.name || "Property"} • {lease.unit?.unitNumber || "Unit"}
                </p>
                <p className="text-xs text-brand-slate">
                  {new Date(lease.startDate).toLocaleDateString()} – {new Date(lease.endDate).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-brand-dark">{formatCurrency(lease.rentAmount)}</p>
                <p className="text-xs uppercase tracking-wide text-brand-slate">{lease.status}</p>
              </div>
            </div>
          ))}
        </DataCard>

        <DataCard title="Recent invoices" emptyMessage="No invoices yet.">
          {tenant.invoices.map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between rounded-2xl border border-brand-mist px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-brand-dark">
                  Due {new Date(invoice.dueDate).toLocaleDateString()}
                </p>
                <p className="text-xs text-brand-slate">Status: {invoice.status}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-brand-dark">{formatCurrency(invoice.amountDue)}</p>
                <p className="text-xs text-brand-slate">Paid {formatCurrency(invoice.amountPaid)}</p>
              </div>
            </div>
          ))}
        </DataCard>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <DataCard title="Recent payments" emptyMessage="No payments logged.">
          {tenant.payments.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
              <div>
                <p className="text-sm font-semibold text-brand-dark">{payment.method}</p>
                <p className="text-xs text-brand-slate">{new Date(payment.receivedAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-brand-dark">{formatCurrency(payment.amount)}</p>
                <p className="text-xs uppercase tracking-wide text-brand-slate">{payment.status}</p>
              </div>
            </div>
          ))}
        </DataCard>

        <DataCard title="Complaints & tickets" emptyMessage="No complaints from this tenant.">
          {tenant.complaints.map((complaint) => (
            <div key={complaint.id} className="rounded-2xl border border-brand-mist px-4 py-3">
              <p className="text-sm font-semibold text-brand-dark">{complaint.title}</p>
              <p className="text-xs text-brand-slate">
                {complaint.priority} • {new Date(complaint.createdAt).toLocaleDateString()}
              </p>
              <span className="mt-2 inline-flex rounded-full bg-brand-mist px-3 py-1 text-xs font-semibold uppercase text-brand-dark">
                {complaint.status}
              </span>
            </div>
          ))}
        </DataCard>
      </div>
    </section>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-brand-slate">{label}</p>
      <p className="text-sm font-semibold text-brand-dark">{value || "—"}</p>
    </div>
  );
}

function DataCard({ title, emptyMessage, children }: { title: string; emptyMessage: string; children: ReactNode }) {
  const isEmpty = Children.count(children) === 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="rounded-3xl border border-brand-mist bg-white p-6 shadow-sm space-y-3"
    >
      <h3 className="font-heading text-lg text-brand-dark">{title}</h3>
      {isEmpty ? (
        <p className="text-sm text-brand-slate">{emptyMessage}</p>
      ) : (
        <div className="space-y-3">{children}</div>
      )}
    </motion.div>
  );
}

function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "—";
  }
  return currency.format(value);
}

function formatEmergencyContact(contact: { name?: string; phone?: string } | null) {
  if (!contact) return "Not provided";
  const parts = [contact.name, contact.phone].filter(Boolean);
  return parts.length ? parts.join(" • ") : "Not provided";
}

