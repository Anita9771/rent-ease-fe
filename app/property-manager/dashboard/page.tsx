"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarClock, CreditCard, Megaphone, TrendingUp, Building2, Users } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { TopBar } from "@/components/dashboard/top-bar";
import { api } from "@/lib/api";

interface DashboardData {
  properties: number;
  totalUnits: number;
  occupiedUnits: number;
  occupancyRate: number;
  totalTenants: number;
  overdueInvoices: number;
}

export default function PropertyManagerDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const dashboardData = await api.get<DashboardData>("/property-managers/dashboard");
      setData(dashboardData);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <>
        <TopBar title="Overview" subtitle="Monitor your assigned properties, tenants, and rent collection." />
        <section className="flex-1 space-y-10 px-8 py-10">
          <div className="text-center text-brand-slate">Loading dashboard...</div>
        </section>
      </>
    );
  }

  const metrics = [
    {
      label: "Assigned Properties",
      value: `${data.properties}`,
      trend: `${data.totalUnits} total units`,
      icon: <Building2 className="h-5 w-5 text-brand" />,
    },
    {
      label: "Occupancy Rate",
      value: `${Math.round(data.occupancyRate)}%`,
      trend: `${data.occupiedUnits}/${data.totalUnits} units occupied`,
      icon: <CalendarClock className="h-5 w-5 text-brand" />,
    },
    {
      label: "Total Tenants",
      value: `${data.totalTenants}`,
      trend: "Active leases",
      icon: <Users className="h-5 w-5 text-brand" />,
    },
    {
      label: "Overdue Invoices",
      value: `${data.overdueInvoices}`,
      trend: "Requires attention",
      icon: <CreditCard className="h-5 w-5 text-brand" />,
    },
  ];

  return (
    <>
      <TopBar title="Overview" subtitle="Monitor your assigned properties, tenants, and rent collection." />
      <section className="flex-1 space-y-10 px-8 py-10">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric, idx) => (
            <StatCard key={metric.label} {...metric} delay={idx * 0.05} />
          ))}
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
              <h2 className="font-heading text-xl text-brand-dark">Quick Actions</h2>
              <p className="text-sm text-brand-slate">Manage your properties and tenants efficiently.</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <a
              href="/property-manager/properties"
              className="rounded-2xl bg-brand-mist p-4 text-sm font-semibold text-brand-dark hover:bg-brand/10 transition-colors"
            >
              View Properties →
            </a>
            <a
              href="/property-manager/tenants"
              className="rounded-2xl bg-brand-mist p-4 text-sm font-semibold text-brand-dark hover:bg-brand/10 transition-colors"
            >
              Manage Tenants →
            </a>
            <a
              href="/property-manager/complaints"
              className="rounded-2xl bg-brand-mist p-4 text-sm font-semibold text-brand-dark hover:bg-brand/10 transition-colors"
            >
              View Complaints →
            </a>
          </div>
        </motion.div>
      </section>
    </>
  );
}

