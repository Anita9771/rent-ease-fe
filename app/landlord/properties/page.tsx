"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/dashboard/top-bar";
import { motion } from "framer-motion";
import { Building2, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { api } from "@/lib/api";
import { useAlert } from "@/components/ui/app-alert";

interface Property {
  id: string;
  name: string;
  address: string;
  type: string;
  units: Array<{ id: string; unitNumber: string; status: string }>;
}

export default function LandlordPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    type: "APARTMENT",
  });
  const [submitting, setSubmitting] = useState(false);
  const { showAlert } = useAlert();

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const data = await api.get<Property[]>("/properties");
      setProperties(data);
    } catch (error) {
      console.error("Failed to load properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/properties", formData);
      setIsModalOpen(false);
      setFormData({ name: "", address: "", type: "APARTMENT" });
      await loadProperties();
      await showAlert("Property added successfully!");
    } catch (error) {
      await showAlert(error);
    } finally {
      setSubmitting(false);
    }
  };

  const calculateOccupancy = (property: Property) => {
    if (property.units.length === 0) return "0%";
    const occupied = property.units.filter((u) => u.status === "OCCUPIED").length;
    return `${Math.round((occupied / property.units.length) * 100)}%`;
  };
  return (
    <>
      <TopBar title="Properties" subtitle="Track occupancy, units, and maintenance health by building." />
      <section className="flex-1 space-y-10 px-8 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-heading text-xl text-brand-dark">Portfolio overview</h2>
            <p className="text-sm text-brand-slate">Manage estates and launch unit onboarding workflows.</p>
          </div>
          <Button className="shadow-brand/30 shadow-lg" onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-5 w-5" />
            Add property
          </Button>
        </div>
        {loading ? (
          <div className="text-center text-brand-slate py-12">Loading properties...</div>
        ) : properties.length === 0 ? (
          <div className="text-center text-brand-slate py-12">No properties yet. Add your first property!</div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {properties.map((property, idx) => (
            <motion.article
              key={property.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.08 }}
              className="overflow-hidden rounded-3xl border border-brand-mist bg-white shadow-sm"
            >
              <div className="relative h-48 bg-gradient-to-br from-brand to-brand-amber">
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                  <h3 className="font-heading text-xl">{property.name}</h3>
                  <p className="flex items-center gap-2 text-xs text-white/70">
                    <MapPin className="h-4 w-4" />
                    {property.address}
                  </p>
                </div>
              </div>
              <div className="space-y-4 p-6 text-sm text-brand-slate">
                <p className="flex items-center gap-2 text-brand-dark">
                  <Building2 className="h-4 w-4 text-brand" />
                  {property.units.length} units
                </p>
                <div className="rounded-2xl bg-brand-mist p-4">
                  <p className="text-xs uppercase tracking-wide text-brand-slate">Occupancy</p>
                  <p className="mt-1 text-2xl font-semibold text-brand-dark">{calculateOccupancy(property)}</p>
                  <div className="mt-4 h-2 rounded-full bg-white">
                    <div className="h-full rounded-full bg-brand" style={{ width: calculateOccupancy(property) }} />
                  </div>
                </div>
                <Button variant="ghost" className="w-full bg-brand-mist" onClick={() => window.location.href = `/landlord/properties/${property.id}`}>
                  View details
                </Button>
              </div>
            </motion.article>
            ))}
          </div>
        )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Property">
        <form onSubmit={handleAddProperty} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-brand-dark mb-2">
              Property name
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
              placeholder="Harbor View Estates"
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-brand-dark mb-2">
              Address
            </label>
            <input
              id="address"
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
              placeholder="201 Seaside Blvd, Lagos"
            />
          </div>
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-brand-dark mb-2">
              Property type
            </label>
            <select
              id="type"
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
            >
              <option value="APARTMENT">Apartment</option>
              <option value="HOUSE">House</option>
              <option value="CONDO">Condo</option>
              <option value="TOWNHOUSE">Townhouse</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Adding..." : "Add Property"}
            </Button>
          </div>
        </form>
      </Modal>
      </section>
    </>
  );
}

