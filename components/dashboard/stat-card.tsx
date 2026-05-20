"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: string;
  trend?: string;
  icon?: ReactNode;
  delay?: number;
};

export function StatCard({ label, value, trend, icon, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay }}
      className="relative overflow-hidden rounded-3xl border border-brand-mist bg-white/80 p-6 shadow-sm backdrop-blur"
    >
      {icon && <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-mist">{icon}</div>}
      <p className="text-sm text-brand-slate">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-brand-dark">{value}</p>
      {trend && <p className={cn("mt-2 text-sm font-medium", trend.startsWith("+") ? "text-emerald-600" : "text-rose-500")}>{trend}</p>}
    </motion.div>
  );
}

