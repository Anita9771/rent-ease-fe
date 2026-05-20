"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/dashboard/top-bar";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Eye, Mail, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import { useAlert } from "@/components/ui/app-alert";
import { useRouter } from "next/navigation";

interface Tenant {
  id: string;
  user: {
    email: string;
  };
  leases: Array<{
    id: string;
    status: string;
    unit: {
      unitNumber: string;
      property: {
        id: string;
        name: string;
      };
    };
  }>;
}

interface AssignedProperty {
  id: string;
  name: string;
  address: string;
  units: Array<{
    id: string;
    unitNumber: string;
    leases: Array<{
      id: string;
      status: string;
      tenant: {
        id: string;
        user: {
          email: string;
        };
      };
    }>;
  }>;
}

export default function PropertyManagerTenantsPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEvictModalOpen, setIsEvictModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<{ tenantId: string; leaseId: string; name: string } | null>(null);
  const [evictFormData, setEvictFormData] = useState({
    reason: "",
    evictionDate: "",
  });
  const [evicting, setEvicting] = useState(false);
  const [properties, setProperties] = useState<AssignedProperty[]>([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePropertyId, setInvitePropertyId] = useState("");
  const [inviting, setInviting] = useState(false);
  const { showAlert } = useAlert();

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      setLoading(true);
      const assignedProperties = await api.get<AssignedProperty[]>("/property-managers/properties");
      setProperties(assignedProperties);
      if (assignedProperties.length > 0) {
        setInvitePropertyId(assignedProperties[0].id);
      }

      const allTenants: Tenant[] = [];
      assignedProperties.forEach((property) => {
        property.units?.forEach((unit) => {
          unit.leases?.forEach((lease) => {
            if (lease.status === "ACTIVE" && lease.tenant) {
              const existing = allTenants.find((t) => t.id === lease.tenant.id);
              if (!existing) {
                allTenants.push({
                  id: lease.tenant.id,
                  user: lease.tenant.user,
                  leases: [
                    {
                      id: lease.id,
                      status: lease.status,
                      unit: {
                        unitNumber: unit.unitNumber,
                        property: {
                          id: property.id,
                          name: property.name,
                        },
                      },
                    },
                  ],
                });
              } else {
                existing.leases.push({
                  id: lease.id,
                  status: lease.status,
                  unit: {
                    unitNumber: unit.unitNumber,
                    property: {
                      id: property.id,
                      name: property.name,
                    },
                  },
                });
              }
            }
          });
        });
      });

      setTenants(allTenants);
    } catch (error) {
      console.error("Failed to load tenants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitePropertyId) {
      await showAlert("Select a property for this tenant.");
      return;
    }
    try {
      setInviting(true);
      await api.post("/property-managers/tenants/invite", {
        email: inviteEmail,
        propertyId: invitePropertyId,
      });
      setIsInviteModalOpen(false);
      setInviteEmail("");
      await loadTenants();
      await showAlert("Invitation sent successfully!");
    } catch (error) {
      await showAlert(error);
    } finally {
      setInviting(false);
    }
  };

  const handleEvict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;
    try {
      setEvicting(true);
      await api.post("/property-managers/evict-tenant", {
        tenantId: selectedTenant.tenantId,
        leaseId: selectedTenant.leaseId,
        reason: evictFormData.reason,
        evictionDate: evictFormData.evictionDate,
      });
      setIsEvictModalOpen(false);
      setSelectedTenant(null);
      setEvictFormData({ reason: "", evictionDate: "" });
      await loadTenants();
      await showAlert("Tenant evicted successfully. Landlord has been notified.");
    } catch (error) {
      await showAlert(error);
    } finally {
      setEvicting(false);
    }
  };

  const openEvictModal = (tenant: Tenant, leaseId: string) => {
    setSelectedTenant({
      tenantId: tenant.id,
      leaseId,
      name: tenant.user.email.split("@")[0],
    });
    setEvictFormData({
      reason: "",
      evictionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    });
    setIsEvictModalOpen(true);
  };

  return (
    <>
      <TopBar title="Tenants" subtitle="Manage tenants in your assigned properties." />
      <section className="flex-1 space-y-8 px-8 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-heading text-xl text-brand-dark">Active Tenants</h2>
            <p className="text-sm text-brand-slate">View and manage tenants in your assigned properties.</p>
          </div>
          <Button
            className="shadow-brand/30 shadow-lg"
            onClick={async () => {
              if (properties.length === 0) {
                await showAlert("You need an assigned property before inviting tenants.");
                return;
              }
              setInvitePropertyId(properties[0].id);
              setIsInviteModalOpen(true);
            }}
          >
            Invite tenant
          </Button>
        </div>
        <div className="overflow-hidden rounded-3xl border border-brand-mist bg-white">
          {loading ? (
            <div className="p-8 text-center text-brand-slate">Loading tenants...</div>
          ) : tenants.length === 0 ? (
            <div className="p-8 text-center text-brand-slate">No tenants found in your assigned properties.</div>
          ) : (
            <table className="w-full">
              <thead className="border-b border-brand-mist bg-brand-mist/30">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-brand-dark">Tenant</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-brand-dark">Property & Unit</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-brand-dark">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-brand-dark">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-mist">
                {tenants.map((tenant, idx) => (
                  <motion.tr
                    key={tenant.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="hover:bg-brand-mist/20 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-brand-dark">{tenant.user.email.split("@")[0]}</div>
                      <div className="text-sm text-brand-slate">{tenant.user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      {tenant.leases.map((lease) => (
                        <div key={lease.id} className="text-sm text-brand-slate">
                          {lease.unit.property.name} • Unit {lease.unit.unitNumber}
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="bg-brand-mist/80"
                          onClick={() => (window.location.href = `mailto:${tenant.user.email}`)}
                        >
                          <Mail className="mr-2 h-4 w-4" /> Email
                        </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="bg-brand-mist/80"
                                onClick={() => router.push(`/property-manager/tenants/${tenant.id}`)}
                              >
                                <Eye className="mr-2 h-4 w-4" /> View
                              </Button>
                        {tenant.leases.length > 0 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="bg-rose-50 text-rose-600 hover:bg-rose-100"
                            onClick={() => openEvictModal(tenant, tenant.leases[0].id)}
                          >
                            <AlertTriangle className="mr-2 h-4 w-4" /> Evict
                          </Button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <Modal
          isOpen={isEvictModalOpen}
          onClose={() => {
            setIsEvictModalOpen(false);
            setSelectedTenant(null);
            setEvictFormData({ reason: "", evictionDate: "" });
          }}
          title={`Evict Tenant: ${selectedTenant?.name}`}
        >
          <form onSubmit={handleEvict} className="space-y-4">
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-brand-dark mb-2">
                Reason for Eviction
              </label>
              <textarea
                id="reason"
                required
                rows={4}
                value={evictFormData.reason}
                onChange={(e) => setEvictFormData({ ...evictFormData, reason: e.target.value })}
                className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
                placeholder="Enter the reason for eviction..."
              />
            </div>
            <div>
              <label htmlFor="evictionDate" className="block text-sm font-medium text-brand-dark mb-2">
                Eviction Date
              </label>
              <input
                id="evictionDate"
                type="date"
                required
                value={evictFormData.evictionDate}
                onChange={(e) => setEvictFormData({ ...evictFormData, evictionDate: e.target.value })}
                className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
              />
            </div>
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-700">
              <strong>Note:</strong> The landlord will be notified of this eviction.
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsEvictModalOpen(false);
                  setSelectedTenant(null);
                  setEvictFormData({ reason: "", evictionDate: "" });
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={evicting} className="bg-rose-600 hover:bg-rose-700">
                {evicting ? "Evicting..." : "Evict Tenant"}
              </Button>
            </div>
          </form>
        </Modal>

        <Modal
          isOpen={isInviteModalOpen}
          onClose={() => {
            setIsInviteModalOpen(false);
            setInviteEmail("");
          }}
          title="Invite Tenant"
        >
          <form onSubmit={handleInviteTenant} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-dark mb-2">Tenant email</label>
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
                placeholder="tenant@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-dark mb-2">Assign to property</label>
              <select
                value={invitePropertyId}
                onChange={(e) => setInvitePropertyId(e.target.value)}
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
              <Button type="button" variant="ghost" onClick={() => setIsInviteModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={inviting}>
                {inviting ? "Sending..." : "Send invite"}
              </Button>
            </div>
          </form>
        </Modal>
      </section>
    </>
  );
}

