"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { TopBar } from "@/components/dashboard/top-bar";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/api";
import Image from "next/image";
import { uploadAvatar } from "@/lib/uploads";
import { getUserFriendlyError } from "@/lib/errors";

const DEFAULT_AVATAR = "https://i.pravatar.cc/100?img=24";

export default function TenantProfilePage() {
  const router = useRouter();
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    emergencyContact: "",
    avatarUrl: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const user = await api.get<any>("/users/me");
      setProfileData({
        name: user.email.split("@")[0],
        email: user.email,
        phone: user.tenant?.primaryContactPhone || "",
        emergencyContact: user.tenant?.emergencyContact
          ? `${user.tenant.emergencyContact.name || ""} • ${user.tenant.emergencyContact.phone || ""}`
          : "",
        avatarUrl: user.tenant?.avatarUrl || "",
      });
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const [name, phone] = profileData.emergencyContact.split(" • ");
      await api.put("/users/me", {
        phone: profileData.phone || undefined,
        emergencyContact: profileData.emergencyContact
          ? {
              name: name || undefined,
              phone: phone || undefined,
            }
          : undefined,
        avatarUrl: profileData.avatarUrl || undefined,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(getUserFriendlyError(err, "We couldn't save your profile. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setSuccess(true);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(getUserFriendlyError(err, "We couldn't change your password. Check your current password and try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      const { clearAuth } = await import("@/lib/auth");
      clearAuth();
      setLoggingOut(false);
      router.replace("/login?userType=tenant");
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    setAvatarUploading(true);
    try {
      const upload = await uploadAvatar(file);
      setProfileData((prev) => ({ ...prev, avatarUrl: upload.url }));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Failed to upload photo");
    } finally {
      setAvatarUploading(false);
    }
  };

  return (
    <>
      <TopBar title="Profile" subtitle="Update personal details and notification preferences." />
      <section className="flex-1 space-y-8 px-8 py-10">
        <div className="lg:hidden rounded-3xl border border-brand-mist bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-brand-dark">Signed in as</p>
          <p className="text-xs text-brand-slate">{profileData.email}</p>
          <Button
            onClick={handleLogout}
            disabled={loggingOut}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-600 text-white hover:bg-rose-700"
          >
            <LogOut className="h-4 w-4" />
            {loggingOut ? "Logging out..." : "Log out"}
          </Button>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="rounded-3xl border border-brand-mist bg-white p-8 shadow-sm"
        >
          <h2 className="font-heading text-xl text-brand-dark">Personal info</h2>
          <form onSubmit={handleSaveProfile}>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 flex items-center gap-4">
                <Image
                  src={profileData.avatarUrl || DEFAULT_AVATAR}
                  alt="Profile photo"
                  width={64}
                  height={64}
                  className="rounded-full object-cover"
                />
                <div>
                  <p className="text-sm text-brand-slate">Profile photo</p>
                  <div className="mt-2 flex items-center gap-3">
                    <input
                      id="tenant-avatar"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="sr-only"
                    />
                    <label
                      htmlFor="tenant-avatar"
                      className="inline-flex cursor-pointer items-center rounded-xl border border-brand px-4 py-2 text-xs font-semibold text-brand transition hover:bg-brand hover:text-white"
                    >
                      {avatarUploading ? "Uploading..." : "Upload photo"}
                    </label>
                    {profileData.avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setProfileData((prev) => ({ ...prev, avatarUrl: "" }))}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-brand-slate">JPG/PNG up to 5MB.</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">Full name</label>
                <input
                  type="text"
                  value={profileData.name}
                  readOnly
                  className="w-full rounded-xl border border-brand-mist bg-brand-mist px-4 py-2 text-sm text-brand-dark cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  readOnly
                  className="w-full rounded-xl border border-brand-mist bg-brand-mist px-4 py-2 text-sm text-brand-dark cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">Phone</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full rounded-xl border border-brand-mist bg-white px-4 py-2 text-sm text-brand-dark focus:border-brand focus:outline-none"
                  placeholder="+234 803 555 2211"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">Emergency contact</label>
                <input
                  type="text"
                  value={profileData.emergencyContact}
                  onChange={(e) => setProfileData({ ...profileData, emergencyContact: e.target.value })}
                  className="w-full rounded-xl border border-brand-mist bg-white px-4 py-2 text-sm text-brand-dark focus:border-brand focus:outline-none"
                  placeholder="Name • Phone"
                />
              </div>
            </div>
            {error && (
              <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-600">
                {error}
              </div>
            )}
            {success && (
              <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-600">
                Profile updated successfully!
          </div>
            )}
            <Button type="submit" className="mt-6" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </form>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="rounded-3xl border border-brand-mist bg-white p-8 shadow-sm"
        >
          <h2 className="font-heading text-xl text-brand-dark">Change Password</h2>
          <p className="mt-2 text-sm text-brand-slate">Update your account password</p>
          <form onSubmit={handlePasswordChange} className="mt-6 space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-brand-dark mb-2">
                Current password
              </label>
              <PasswordInput
                id="currentPassword"
                required
                autoComplete="current-password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-brand-dark mb-2">
                New password
              </label>
              <PasswordInput
                id="newPassword"
                required
                minLength={8}
                autoComplete="new-password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="At least 8 characters"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-brand-dark mb-2">
                Confirm new password
              </label>
              <PasswordInput
                id="confirmPassword"
                required
                autoComplete="new-password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="Re-enter new password"
              />
            </div>
            {error && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-600">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-600">
                Password updated successfully!
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Updating..." : "Update password"}
            </Button>
          </form>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="rounded-3xl border border-brand-mist bg-white p-8 shadow-sm"
        >
          <h2 className="font-heading text-xl text-brand-dark">Notifications</h2>
          <div className="mt-6 space-y-4">
            <Preference label="Email reminders" description="Upcoming rent and receipt delivery." defaultChecked />
            <Preference label="SMS alerts" description="Urgent maintenance and overdue updates." />
            <Preference label="Push notifications" description="Real-time portal updates on mobile." defaultChecked />
          </div>
        </motion.div>
      </section>
    </>
  );
}

function Input({ label, value }: { label: string; value: string }) {
  return (
    <label className="text-sm text-brand-dark">
      {label}
      <input
        className="mt-2 w-full rounded-xl border border-brand-mist bg-brand-mist px-4 py-2 text-sm text-brand-dark focus:border-brand focus:outline-none"
        defaultValue={value}
      />
    </label>
  );
}

function Preference({ label, description, defaultChecked }: { label: string; description: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-brand-mist px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-brand-dark">{label}</p>
        <p className="text-xs text-brand-slate">{description}</p>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}

