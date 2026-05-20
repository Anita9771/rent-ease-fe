"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/dashboard/top-bar";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Mail, Trash2, Building2, Settings } from "lucide-react";
import { api } from "@/lib/api";
import { useAlert } from "@/components/ui/app-alert";

interface PropertyManager {
  id: string;
  user: {
    id: string;
    email: string;
    status: string;
  };
  displayName?: string;
  title?: string;
  phone?: string;
  assignedProperties: Array<{
    property: {
      id: string;
      name: string;
      address: string;
    };
  }>;
}

interface Property {
  id: string;
  name: string;
  address: string;
}

export default function LandlordPropertyManagersPage() {
  const [propertyManagers, setPropertyManagers] = useState<PropertyManager[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState<PropertyManager | null>(null);
  const [inviteFormData, setInviteFormData] = useState({
    email: "",
    displayName: "",
    title: "",
  });
  const [assignFormData, setAssignFormData] = useState<string[]>([]);
  const [inviting, setInviting] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const { showAlert } = useAlert();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [managersData, propertiesData] = await Promise.all([
        api.get<PropertyManager[]>("/property-managers"),
        api.get<Property[]>("/properties"),
      ]);
      setPropertyManagers(managersData);
      setProperties(propertiesData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setInviting(true);
      await api.post("/property-managers/invite", inviteFormData);
      setIsInviteModalOpen(false);
      setInviteFormData({ email: "", displayName: "", title: "" });
      await loadData();
      await showAlert("Property manager invitation sent successfully!");
    } catch (error) {
      await showAlert(error);
    } finally {
      setInviting(false);
    }
  };

  const handleAssignProperties = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedManager) return;
    try {
      setAssigning(true);
      await api.post(`/property-managers/${selectedManager.id}/assign-properties`, {
        propertyIds: assignFormData,
      });
      setIsAssignModalOpen(false);
      setSelectedManager(null);
      setAssignFormData([]);
      await loadData();
      await showAlert("Properties assigned successfully!");
    } catch (error) {
      await showAlert(error);
    } finally {
      setAssigning(false);
    }
  };

  const handleRemove = async (managerId: string) => {
    if (!confirm("Are you sure you want to remove this property manager?")) return;
    try {
      await api.delete(`/property-managers/${managerId}`);
      await loadData();
      await showAlert("Property manager removed successfully");
    } catch (error) {
      await showAlert(error);
    }
  };

  const openAssignModal = (manager: PropertyManager) => {
    setSelectedManager(manager);
    setAssignFormData(manager.assignedProperties.map((ap) => ap.property.id));
    setIsAssignModalOpen(true);
  };

  return (
    <>
      <TopBar title="Property Managers" subtitle="Invite and manage property managers for your properties." />
      <section className="flex-1 space-y-8 px-8 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-heading text-xl text-brand-dark">Property Managers</h2>
            <p className="text-sm text-brand-slate">Invite property managers and assign properties to them.</p>
          </div>
          <Button className="shadow-brand/30 shadow-lg" onClick={() => setIsInviteModalOpen(true)}>
            Invite Property Manager
          </Button>
        </div>
        <div className="overflow-hidden rounded-3xl border border-brand-mist bg-white">
          {loading ? (
            <div className="p-8 text-center text-brand-slate">Loading property managers...</div>
          ) : propertyManagers.length === 0 ? (
            <div className="p-8 text-center text-brand-slate">No property managers yet. Invite your first one!</div>
          ) : (
            <table className="w-full">
              <thead className="border-b border-brand-mist bg-brand-mist/30">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-brand-dark">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-brand-dark">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-brand-dark">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-brand-dark">Assigned Properties</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-brand-dark">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-brand-dark">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-mist">
                {propertyManagers.map((manager, idx) => (
                  <motion.tr
                    key={manager.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="hover:bg-brand-mist/20 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-brand-dark">
                        {manager.displayName || manager.user.email.split("@")[0]}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-brand-slate">{manager.user.email}</td>
                    <td className="px-6 py-4 text-brand-slate">{manager.title || "-"}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {manager.assignedProperties.length === 0 ? (
                          <span className="text-xs text-brand-slate">No properties assigned</span>
                        ) : (
                          manager.assignedProperties.map((ap) => (
                            <span
                              key={ap.property.id}
                              className="inline-flex items-center gap-1 rounded-full bg-brand-mist px-2 py-1 text-xs text-brand-dark"
                            >
                              <Building2 className="h-3 w-3" />
                              {ap.property.name}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {manager.user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="bg-brand-mist/80"
                          onClick={() => openAssignModal(manager)}
                        >
                          <Settings className="mr-2 h-4 w-4" /> Assign
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="bg-rose-50 text-rose-600 hover:bg-rose-100"
                          onClick={() => handleRemove(manager.id)}
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

        <Modal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} title="Invite Property Manager">
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brand-dark mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={inviteFormData.email}
                onChange={(e) => setInviteFormData({ ...inviteFormData, email: e.target.value })}
                className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
                placeholder="manager@example.com"
              />
            </div>
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-brand-dark mb-2">
                Display Name (Optional)
              </label>
              <input
                id="displayName"
                type="text"
                value={inviteFormData.displayName}
                onChange={(e) => setInviteFormData({ ...inviteFormData, displayName: e.target.value })}
                className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-brand-dark mb-2">
                Title (Optional)
              </label>
              <input
                id="title"
                type="text"
                value={inviteFormData.title}
                onChange={(e) => setInviteFormData({ ...inviteFormData, title: e.target.value })}
                className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
                placeholder="Property Manager"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="ghost" onClick={() => setIsInviteModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={inviting}>
                {inviting ? "Sending..." : "Send Invitation"}
              </Button>
            </div>
          </form>
        </Modal>

        <Modal
          isOpen={isAssignModalOpen}
          onClose={() => {
            setIsAssignModalOpen(false);
            setSelectedManager(null);
            setAssignFormData([]);
          }}
          title={`Assign Properties to ${selectedManager?.displayName || selectedManager?.user.email}`}
        >
          <form onSubmit={handleAssignProperties} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-dark mb-2">Select Properties</label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {properties.map((property) => (
                  <label
                    key={property.id}
                    className="flex items-center gap-3 rounded-xl border border-brand-mist bg-white p-3 hover:bg-brand-mist/30 transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={assignFormData.includes(property.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAssignFormData([...assignFormData, property.id]);
                        } else {
                          setAssignFormData(assignFormData.filter((id) => id !== property.id));
                        }
                      }}
                      className="rounded border-brand-mist text-brand focus:ring-brand"
                    />
                    <div>
                      <div className="font-semibold text-brand-dark">{property.name}</div>
                      <div className="text-xs text-brand-slate">{property.address}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsAssignModalOpen(false);
                  setSelectedManager(null);
                  setAssignFormData([]);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={assigning}>
                {assigning ? "Assigning..." : "Assign Properties"}
              </Button>
            </div>
          </form>
        </Modal>
      </section>
    </>
  );
}

