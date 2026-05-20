"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CalendarClock, CreditCard, Megaphone, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { TopBar } from "@/components/dashboard/top-bar";
import Link from "next/link";
import { api } from "@/lib/api";

interface DashboardData {
  metrics: {
    rentCollected: { value: number; trend: string };
    outstandingBalance: { value: number; trend: string };
    occupancyRate: { value: number; occupied: number; total: number };
    openComplaints: { value: number; urgent: number };
  };
  rentTimeline: number[];
  upcomingInvoices: Array<{
    id: string;
    tenant: string;
    unit: string;
    dueDate: string;
    amount: number;
    status: string;
  }>;
}

export default function LandlordDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const dashboardData = await api.get<DashboardData>("/dashboard");
      setData(dashboardData);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
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
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} days`;
    } else if (diffDays === 0) {
      return "Due today";
    } else if (diffDays === 1) {
      return "Due tomorrow";
    } else {
      return `Due in ${diffDays} days`;
    }
  };

  if (loading || !data) {
    return (
      <>
        <TopBar title="Overview" subtitle="Monitor collections, occupancy, and tenant health in real-time." />
        <section className="flex-1 space-y-10 px-8 py-10">
          <div className="text-center text-brand-slate">Loading dashboard...</div>
        </section>
      </>
    );
  }

  const metrics = [
    {
      label: "Rent collected this month",
      value: formatCurrency(data.metrics.rentCollected.value),
      trend: `${data.metrics.rentCollected.trend} vs last month`,
      icon: <TrendingUp className="h-5 w-5 text-brand" />,
    },
    {
      label: "Outstanding balance",
      value: formatCurrency(data.metrics.outstandingBalance.value),
      trend: `${data.metrics.outstandingBalance.trend} vs last month`,
      icon: <CreditCard className="h-5 w-5 text-brand" />,
    },
    {
      label: "Occupancy rate",
      value: `${Math.round(data.metrics.occupancyRate.value)}%`,
      trend: `${data.metrics.occupancyRate.occupied}/${data.metrics.occupancyRate.total} units occupied`,
      icon: <CalendarClock className="h-5 w-5 text-brand" />,
    },
    {
      label: "Open complaints",
      value: `${data.metrics.openComplaints.value}`,
      trend: `${data.metrics.openComplaints.urgent} urgent`,
      icon: <Megaphone className="h-5 w-5 text-brand" />,
    },
  ];
  return (
    <>
      <TopBar title="Overview" subtitle="Monitor collections, occupancy, and tenant health in real-time." />
      <section className="flex-1 space-y-10 px-8 py-10">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric, idx) => (
            <StatCard key={metric.label} {...metric} delay={idx * 0.05} />
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
                <h2 className="font-heading text-xl text-brand-dark">Rent collection cadence</h2>
                <p className="text-sm text-brand-slate">Percentage of invoices paid by week of the month</p>
              </div>
              <Link href="/landlord/invoices" className="text-sm font-medium text-brand">
                View all invoices →
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-4 gap-4">
              {data.rentTimeline.map((value, idx) => (
                <div key={idx} className="flex flex-col items-center gap-3">
                  <motion.div
                    initial={{ height: 0 }}
                    whileInView={{ height: `${value}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="relative w-full max-w-[40px] rounded-t-2xl bg-brand"
                    style={{ minHeight: "40px" }}
                  />
                  <div className="text-xs text-brand-slate">W{idx + 1}</div>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl border border-brand-mist bg-white p-8 shadow-sm"
          >
            <h2 className="font-heading text-xl text-brand-dark">Upcoming invoices</h2>
            <div className="mt-6 space-y-4">
              {data.upcomingInvoices.length === 0 ? (
                <p className="text-sm text-brand-slate">No upcoming invoices</p>
              ) : (
                data.upcomingInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex gap-4 rounded-2xl bg-brand-mist p-4">
                    <span className={`mt-1 h-2 w-2 rounded-full ${
                      invoice.status === "OVERDUE" ? "bg-rose-500" : 
                      invoice.status === "PENDING" ? "bg-brand" : 
                      "bg-brand-amber"
                    }`} />
                    <div>
                      <p className="text-sm font-semibold text-brand-dark">Rent due</p>
                      <p className="text-sm text-brand-slate">{invoice.unit}</p>
                      <p className="mt-2 text-xs font-medium uppercase tracking-wide text-brand-dark/70">
                        {formatDate(invoice.dueDate)}
                      </p>
                      <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand">
                        {formatCurrency(invoice.amount)} • {invoice.status}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl border border-brand-mist bg-white p-8 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-xl text-brand-dark">Tenant health</h2>
              <p className="text-sm text-brand-slate">Track NPS trends and respond to escalations.</p>
            </div>
            <Link href="/landlord/complaints" className="inline-flex items-center gap-2 text-sm font-semibold text-brand">
              Resolve issues <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {[
              `Open tickets: ${data.metrics.openComplaints.value}`,
              `Urgent: ${data.metrics.openComplaints.urgent}`,
              `Occupancy: ${Math.round(data.metrics.occupancyRate.value)}%`,
            ].map((stat) => (
              <div key={stat} className="rounded-2xl bg-brand-mist p-4 text-sm text-brand-dark">
                {stat}
              </div>
            ))}
          </div>
        </motion.div>
      </section>
    </>
  );
}

