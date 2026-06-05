"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { TopBar } from "@/components/dashboard/top-bar";
import { motion } from "framer-motion";
import { Building2, MapPin, Plus, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { api } from "@/lib/api";
import { uploadPropertyImage } from "@/lib/uploads";
import { useAlert } from "@/components/ui/app-alert";

interface Property {
  id: string;
  name: string;
  address: string;
  type: string;
  imageUrl?: string | null;
  units: Array<{ id: string; unitNumber: string; status: string }>;
}

interface PropertyManagerOption {
  id: string;
  user: { email: string };
  displayName?: string | null;
}

type ManagerMode = "none" | "existing" | "invite";

const initialForm = {
  name: "",
  address: "",
  type: "APARTMENT",
  unitCount: "1",
  managerMode: "none" as ManagerMode,
  propertyManagerId: "",
  inviteEmail: "",
  inviteDisplayName: "",
  inviteTitle: "",
};

export default function LandlordPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyManagers, setPropertyManagers] = useState<PropertyManagerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { showAlert } = useAlert();

  useEffect(() => {
    loadProperties();
    loadPropertyManagers();
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

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

  const loadPropertyManagers = async () => {
    try {
      const data = await api.get<PropertyManagerOption[]>("/property-managers");
      setPropertyManagers(data);
    } catch {
      setPropertyManagers([]);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setFormData(initialForm);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    const unitCount = Math.max(1, parseInt(formData.unitCount, 10) || 1);

    if (formData.managerMode === "existing" && !formData.propertyManagerId) {
      await showAlert("Select a property manager or choose a different option.");
      return;
    }
    if (formData.managerMode === "invite" && !formData.inviteEmail.trim()) {
      await showAlert("Enter an email to invite a property manager.");
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl: string | undefined;
      if (imageFile) {
        const uploaded = await uploadPropertyImage(imageFile);
        imageUrl = uploaded.url;
      }

      const payload: Record<string, unknown> = {
        name: formData.name,
        address: formData.address,
        type: formData.type,
        unitCount,
        imageUrl,
      };

      if (formData.managerMode === "existing" && formData.propertyManagerId) {
        payload.propertyManagerId = formData.propertyManagerId;
      }
      if (formData.managerMode === "invite") {
        payload.invitePropertyManager = {
          email: formData.inviteEmail.trim(),
          displayName: formData.inviteDisplayName.trim() || undefined,
          title: formData.inviteTitle.trim() || undefined,
        };
      }

      await api.post("/properties", payload);
      setIsModalOpen(false);
      resetForm();
      await loadProperties();
      await loadPropertyManagers();

      let message = "Property added successfully!";
      if (formData.managerMode === "invite") {
        message += " A property manager invitation was sent by email.";
      }
      await showAlert(message);
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
                  {property.imageUrl ? (
                    <Image
                      src={property.imageUrl}
                      alt={property.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : null}
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
                    {property.units.length} {property.units.length === 1 ? "unit" : "units"}
                  </p>
                  <div className="rounded-2xl bg-brand-mist p-4">
                    <p className="text-xs uppercase tracking-wide text-brand-slate">Occupancy</p>
                    <p className="mt-1 text-2xl font-semibold text-brand-dark">{calculateOccupancy(property)}</p>
                    <div className="mt-4 h-2 rounded-full bg-white">
                      <div className="h-full rounded-full bg-brand" style={{ width: calculateOccupancy(property) }} />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full bg-brand-mist"
                    onClick={() => (window.location.href = `/landlord/properties/${property.id}`)}
                  >
                    View details
                  </Button>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title="Add Property"
          size="lg"
        >
          <form onSubmit={handleAddProperty} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-dark mb-2">Property image (optional)</label>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="relative h-28 w-full sm:w-40 rounded-xl overflow-hidden bg-brand-mist border border-brand-mist flex items-center justify-center">
                  {imagePreview ? (
                    <Image src={imagePreview} alt="Preview" fill className="object-cover" unoptimized />
                  ) : (
                    <div className="text-center text-brand-slate p-2">
                      <ImageIcon className="h-8 w-8 mx-auto mb-1 opacity-50" />
                      <span className="text-xs">No image</span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="text-sm text-brand-slate file:mr-3 file:rounded-lg file:border-0 file:bg-brand file:px-3 file:py-2 file:text-white file:text-sm"
                />
              </div>
            </div>

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
            <div className="grid gap-4 sm:grid-cols-2">
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
              <div>
                <label htmlFor="unitCount" className="block text-sm font-medium text-brand-dark mb-2">
                  Number of units
                </label>
                <input
                  id="unitCount"
                  type="number"
                  min={1}
                  max={200}
                  required
                  value={formData.unitCount}
                  onChange={(e) => setFormData({ ...formData, unitCount: e.target.value })}
                  className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
                />
              </div>
            </div>

            <div className="rounded-xl border border-brand-mist p-4 space-y-3">
              <p className="text-sm font-medium text-brand-dark">Property manager (optional)</p>
              <div className="flex flex-wrap gap-2">
                {(["none", "existing", "invite"] as ManagerMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setFormData({ ...formData, managerMode: mode })}
                    className={`rounded-lg px-3 py-1.5 text-sm capitalize transition-colors ${
                      formData.managerMode === mode
                        ? "bg-brand text-white"
                        : "bg-brand-mist text-brand-slate hover:text-brand-dark"
                    }`}
                  >
                    {mode === "none" ? "None" : mode === "existing" ? "Assign existing" : "Invite new"}
                  </button>
                ))}
              </div>

              {formData.managerMode === "existing" && (
                <select
                  value={formData.propertyManagerId}
                  onChange={(e) => setFormData({ ...formData, propertyManagerId: e.target.value })}
                  className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
                >
                  <option value="">Select property manager</option>
                  {propertyManagers.map((pm) => (
                    <option key={pm.id} value={pm.id}>
                      {pm.displayName || pm.user.email}
                    </option>
                  ))}
                </select>
              )}

              {formData.managerMode === "invite" && (
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="manager@company.com"
                    value={formData.inviteEmail}
                    onChange={(e) => setFormData({ ...formData, inviteEmail: e.target.value })}
                    className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="Display name (optional)"
                    value={formData.inviteDisplayName}
                    onChange={(e) => setFormData({ ...formData, inviteDisplayName: e.target.value })}
                    className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
                  />
                  <p className="text-xs text-brand-slate">
                    They will receive an email invite. Assign them to this property after they accept.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
              >
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
