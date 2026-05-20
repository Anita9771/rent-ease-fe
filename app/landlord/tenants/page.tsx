"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/dashboard/top-bar";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Eye, Mail, MessageSquare, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAlert } from "@/components/ui/app-alert";
import { useRouter } from "next/navigation";

interface Tenant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  property?: {
    id: string;
    name: string;
    address: string;
  } | null;
  leases: Array<{
    id: string;
    unitId: string;
    status: string;
    unit?: {
      id: string;
      unitNumber: string;
      property?: {
        id: string;
        name: string;
        address: string;
      };
    };
  }>;
}

interface PropertyOption {
  id: string;
  name: string;
  address: string;
}

export default function LandlordTenantsPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const { showAlert } = useAlert();

  useEffect(() => {
    loadTenants();
    loadProperties();
  }, []);
  const loadProperties = async () => {
    try {
      const data = await api.get<PropertyOption[]>("/properties");
      setProperties(data);
      if (data.length > 0) {
        setSelectedPropertyId(data[0].id);
      }
    } catch (error) {
      console.error("Failed to load properties:", error);
    }
  };


  const loadTenants = async () => {
    try {
      setLoading(true);
      const data = await api.get<Tenant[]>("/tenants");
      setTenants(data);
    } catch (error) {
      console.error("Failed to load tenants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPropertyId) {
      await showAlert("Select a property for this tenant.");
      return;
    }
    try {
      setInviting(true);
      await api.post("/tenants/invite", { email, propertyId: selectedPropertyId });
      setIsModalOpen(false);
      setEmail("");
      await loadTenants();
      await showAlert("Tenant invitation sent successfully!");
    } catch (error) {
      await showAlert(error);
    } finally {
      setInviting(false);
    }
  };

  const getUnitInfo = (tenant: Tenant) => {
    if (tenant.leases.length === 0) {
      if (tenant.property) {
        return `${tenant.property.name} • Assigned (no unit yet)`;
      }
      return "No property assigned";
    }
    const activeLease = tenant.leases.find((l) => l.status === "ACTIVE");
    if (!activeLease || !activeLease.unit) return "Unit assigned";
    const unit = activeLease.unit;
    if (unit.property) {
      return `${unit.property.name} • ${unit.unitNumber}`;
    }
    return unit.unitNumber;
  };

  return (
    <>
      <TopBar title="Tenants" subtitle="Manage invitations, balances, and communication history." />
      <section className="flex-1 space-y-8 px-8 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-heading text-xl text-brand-dark">Active tenants</h2>
            <p className="text-sm text-brand-slate">Invite new tenants – they complete onboarding securely.</p>
          </div>
          <Button
            className="shadow-brand/30 shadow-lg"
            onClick={async () => {
              if (properties.length === 0) {
                await showAlert("Add a property before inviting tenants.");
                return;
              }
              setSelectedPropertyId(properties[0].id);
              setIsModalOpen(true);
            }}
          >
            Invite tenant
          </Button>
        </div>
        <div className="overflow-hidden rounded-3xl border border-brand-mist bg-white">
          {loading ? (
            <div className="p-8 text-center text-brand-slate">Loading tenants...</div>
          ) : tenants.length === 0 ? (
            <div className="p-8 text-center text-brand-slate">No tenants yet. Invite your first tenant!</div>
          ) : (
            <table className="min-w-full divide-y divide-brand-mist text-sm">
              <thead className="bg-brand-mist/80">
                <tr className="text-left text-brand-slate">
                  <th className="px-6 py-3 font-semibold">Tenant</th>
                  <th className="px-6 py-3 font-semibold">Unit</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-mist/60 bg-white">
                {tenants.map((tenant, idx) => (
                  <motion.tr
                    key={tenant.id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="text-brand-dark"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold">{tenant.name}</div>
                      <div className="text-xs text-brand-slate">{tenant.email}</div>
                    </td>
                    <td className="px-6 py-4 text-brand-slate">{getUnitInfo(tenant)}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-brand-mist px-3 py-1 text-xs font-semibold">{tenant.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="bg-brand-mist/80"
                          onClick={() => window.location.href = `mailto:${tenant.email}`}
                        >
                          <Mail className="mr-2 h-4 w-4" /> Email
                        </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="bg-brand-mist/80"
                                    onClick={() => router.push(`/landlord/tenants/${tenant.id}`)}
                                  >
                                    <Eye className="mr-2 h-4 w-4" /> View
                                  </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="bg-brand-mist/80"
                          onClick={() => router.push(`/landlord/complaints?tenant=${tenant.id}`)}
                        >
                          <MessageSquare className="mr-2 h-4 w-4" /> Message
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="bg-rose-50 text-rose-600 hover:bg-rose-100"
                          onClick={async () => {
                            if (confirm(`Are you sure you want to remove tenant ${tenant.email}?`)) {
                              try {
                                await api.delete(`/property-managers/tenants/${tenant.id}`);
                                await loadTenants();
                                await showAlert("Tenant removed successfully");
                              } catch (error) {
                                await showAlert(error);
                              }
                            }
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Remove
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Invite Tenant">
        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-brand-dark mb-2">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
              placeholder="tenant@example.com"
            />
            <p className="mt-2 text-xs text-brand-slate">
              The tenant will receive an email with temporary login credentials.
            </p>
          </div>
          <div>
            <label htmlFor="property" className="block text-sm font-medium text-brand-dark mb-2">
              Assign to property
            </label>
            <select
              id="property"
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
              required
            >
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name} — {property.address}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={inviting}>
              {inviting ? "Sending..." : "Send Invitation"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

