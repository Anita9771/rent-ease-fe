"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { TopBar } from "@/components/dashboard/top-bar";
import { motion } from "framer-motion";
import { Building2, MapPin, Users } from "lucide-react";
import { api } from "@/lib/api";
import Link from "next/link";

interface PropertyDetail {
  id: string;
  name: string;
  address: string;
  type: string;
  units: Array<{
    id: string;
    unitNumber: string;
    status: string;
    bedrooms: number | null;
    squareFeet: number | null;
  }>;
}

export default function PropertyDetailPage() {
  const params = useParams();
  const propertyId = params.id as string;
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (propertyId) {
      loadProperty();
    }
  }, [propertyId]);

  const loadProperty = async () => {
    try {
      setLoading(true);
      const data = await api.get<PropertyDetail>(`/properties/${propertyId}`);
      setProperty(data);
    } catch (error) {
      console.error("Failed to load property:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateOccupancy = () => {
    if (!property || property.units.length === 0) return "0%";
    const occupied = property.units.filter((u) => u.status === "OCCUPIED").length;
    return `${Math.round((occupied / property.units.length) * 100)}%`;
  };

  if (loading) {
    return (
      <>
        <TopBar title="Property Details" subtitle="View property information and units." />
        <section className="flex-1 space-y-10 px-8 py-10">
          <div className="text-center text-brand-slate py-12">Loading property...</div>
        </section>
      </>
    );
  }

  if (!property) {
    return (
      <>
        <TopBar title="Property Details" subtitle="View property information and units." />
        <section className="flex-1 space-y-10 px-8 py-10">
          <div className="text-center text-brand-slate py-12">Property not found</div>
        </section>
      </>
    );
  }

  return (
    <>
      <TopBar title={property.name} subtitle="View property information and units." />
      <section className="flex-1 space-y-10 px-8 py-10">
        <div className="grid gap-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl border border-brand-mist bg-white p-8 shadow-sm"
          >
            <h2 className="font-heading text-xl text-brand-dark mb-6">Property Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-brand" />
                <div>
                  <p className="text-sm text-brand-slate">Address</p>
                  <p className="font-semibold text-brand-dark">{property.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-brand" />
                <div>
                  <p className="text-sm text-brand-slate">Type</p>
                  <p className="font-semibold text-brand-dark">{property.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-brand" />
                <div>
                  <p className="text-sm text-brand-slate">Total Units</p>
                  <p className="font-semibold text-brand-dark">{property.units.length} units</p>
                </div>
              </div>
              <div className="rounded-2xl bg-brand-mist p-4 mt-6">
                <p className="text-xs uppercase tracking-wide text-brand-slate">Occupancy Rate</p>
                <p className="mt-1 text-2xl font-semibold text-brand-dark">{calculateOccupancy()}</p>
                <div className="mt-4 h-2 rounded-full bg-white">
                  <div className="h-full rounded-full bg-brand" style={{ width: calculateOccupancy() }} />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-3xl border border-brand-mist bg-white p-8 shadow-sm"
          >
            <h2 className="font-heading text-xl text-brand-dark mb-6">Units</h2>
            <div className="space-y-3">
              {property.units.length === 0 ? (
                <p className="text-sm text-brand-slate">No units yet</p>
              ) : (
                property.units.map((unit) => (
                  <div
                    key={unit.id}
                    className="flex items-center justify-between rounded-2xl bg-brand-mist px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-brand-dark">Unit {unit.unitNumber}</p>
                      <p className="text-xs text-brand-slate">
                        {unit.bedrooms ? `${unit.bedrooms} bed` : ""}
                        {unit.squareFeet ? ` • ${unit.squareFeet} sq ft` : ""}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        unit.status === "OCCUPIED"
                          ? "bg-brand text-white"
                          : unit.status === "AVAILABLE"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-brand-amber text-brand-dark"
                      }`}
                    >
                      {unit.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        <div className="flex justify-end">
          <Link
            href="/landlord/properties"
            className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:text-brand-dark transition-colors"
          >
            ← Back to Properties
          </Link>
        </div>
      </section>
    </>
  );
}

