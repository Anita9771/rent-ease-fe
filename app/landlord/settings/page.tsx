"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { TopBar } from "@/components/dashboard/top-bar";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/api";
import { uploadAvatar } from "@/lib/uploads";
import { ManagePlanModal } from "@/components/subscriptions/manage-plan-modal";
import { getUserFriendlyError } from "@/lib/errors";

type ProfileState = {
  displayName: string;
  title: string;
  avatarUrl: string;
  phone: string;
  email: string;
};

const DEFAULT_AVATAR = "https://i.pravatar.cc/100?img=12";

export default function LandlordSettingsPage() {
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileState>({
    displayName: "",
    title: "",
    avatarUrl: "",
    phone: "",
    email: "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [subscriptionSummary, setSubscriptionSummary] = useState<{
    planName: string;
    status: string;
    periodEnd: string | null;
  } | null>(null);
  const [notificationPrefs, setNotificationPrefs] = useState({
    emailLandlordSummary: true,
    smsEscalations: true,
    tenantFeedbackDigest: false,
  });
  const [prefsSaving, setPrefsSaving] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      const data = await api.get<any>("/users/me");
      setProfileData({
        displayName: data?.landlord?.displayName ?? data?.email?.split("@")[0] ?? "",
        title: data?.landlord?.title ?? "",
        avatarUrl: data?.landlord?.avatarUrl ?? "",
        phone: data?.landlord?.phone ?? "",
        email: data?.email ?? "",
      });
    } catch (error) {
      setProfileError(getUserFriendlyError(error, "We couldn't load your profile. Please refresh the page."));
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const loadSubscription = useCallback(async () => {
    try {
      const sub = await api.get<{
        status: string;
        currentPeriodEnd: string | null;
        plan: { name: string };
      } | null>("/subscriptions/current");
      if (sub?.plan) {
        setSubscriptionSummary({
          planName: sub.plan.name,
          status: sub.status,
          periodEnd: sub.currentPeriodEnd,
        });
      }
    } catch {
      setSubscriptionSummary(null);
    }
  }, []);

  const loadNotificationPrefs = useCallback(async () => {
    try {
      const prefs = await api.get<typeof notificationPrefs>("/users/me/notification-preferences");
      setNotificationPrefs(prefs);
    } catch {
      // keep defaults
    }
  }, []);

  useEffect(() => {
    loadProfile();
    loadSubscription();
    loadNotificationPrefs();
  }, [loadProfile, loadSubscription, loadNotificationPrefs]);

  const handlePrefChange = async (key: keyof typeof notificationPrefs, value: boolean) => {
    const next = { ...notificationPrefs, [key]: value };
    setNotificationPrefs(next);
    setPrefsSaving(true);
    try {
      await api.patch("/users/me/notification-preferences", { [key]: value });
    } catch (error) {
      setNotificationPrefs(notificationPrefs);
      setProfileError(getUserFriendlyError(error, "We couldn't save that notification setting."));
    } finally {
      setPrefsSaving(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileMessage(null);
    setProfileSaving(true);

    try {
      await api.put("/users/me", {
        displayName: profileData.displayName,
        title: profileData.title || undefined,
        avatarUrl: profileData.avatarUrl || undefined,
        phone: profileData.phone || undefined,
      });
      setProfileMessage("Profile updated successfully!");
      window.dispatchEvent(new Event("profile-updated"));
      await loadProfile();
    } catch (error) {
      setProfileError(getUserFriendlyError(error, "We couldn't update your profile. Please try again."));
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setProfileError(null);
    setProfileMessage(null);
    setAvatarUploading(true);
    try {
      const upload = await uploadAvatar(file);
      setProfileData((prev) => ({ ...prev, avatarUrl: upload.url }));
      setProfileMessage("Photo uploaded. Click save to apply changes.");
    } catch (error) {
      setProfileError(getUserFriendlyError(error, "We couldn't upload your photo. Try a smaller JPG or PNG file."));
    } finally {
      setAvatarUploading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }

    setPasswordLoading(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordSuccess(true);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      setPasswordError(getUserFriendlyError(err, "We couldn't change your password. Check your current password and try again."));
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      const { clearAuth } = await import("@/lib/auth");
      clearAuth();
      setLoggingOut(false);
      router.replace("/login");
    }
  };

  return (
    <>
      <TopBar title="Settings & billing" subtitle="Manage subscription, branding, and notification preferences." />
      <section className="flex-1 space-y-10 px-8 py-10">
        <div className="lg:hidden rounded-3xl border border-brand-mist bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-brand-dark">Need to switch accounts?</p>
          <p className="text-xs text-brand-slate mt-1">Sign out safely from your phone.</p>
          <Button
            onClick={handleLogout}
            disabled={loggingOut}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-600 text-white hover:bg-rose-700"
          >
            <LogOut className="h-4 w-4" />
            {loggingOut ? "Logging out..." : "Log out"}
          </Button>
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="rounded-3xl border border-brand-mist bg-white p-8 shadow-sm"
          >
            <h2 className="font-heading text-xl text-brand-dark">Profile & branding</h2>
            <p className="mt-2 text-sm text-brand-slate">Update the information shown across dashboards and automations.</p>
            <form onSubmit={handleProfileSave} className="mt-6 space-y-4">
              <div className="flex items-center gap-4">
                <Image
                  src={profileData.avatarUrl || DEFAULT_AVATAR}
                  alt="Profile avatar"
                  width={64}
                  height={64}
                  className="rounded-2xl object-cover"
                />
                <div>
                  <p className="text-sm text-brand-slate">Profile photo</p>
                  <div className="mt-2 flex items-center gap-3">
                    <input
                      id="landlord-avatar"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="sr-only"
                    />
                    <label
                      htmlFor="landlord-avatar"
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
                  <p className="mt-1 text-xs text-brand-slate">JPG or PNG, up to 5MB.</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">Display name</label>
                <input
                  type="text"
                  required
                  value={profileData.displayName}
                  onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                  className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
                  placeholder="Amina Kalu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">Role or title</label>
                <input
                  type="text"
                  value={profileData.title}
                  onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
                  className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
                  placeholder="Managing Partner"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">Phone</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="w-full rounded-xl border border-brand-mist bg-brand-mist px-4 py-3 text-brand-dark"
                />
              </div>
              {profileError && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-600">{profileError}</div>
              )}
              {profileMessage && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-600">{profileMessage}</div>
              )}
              <Button type="submit" className="w-full" disabled={profileSaving || profileLoading}>
                {profileSaving ? "Saving..." : "Save profile"}
              </Button>
            </form>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="rounded-3xl border border-brand-mist bg-white p-8 shadow-sm"
          >
            <h2 className="font-heading text-xl text-brand-dark">Change password</h2>
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
              {passwordError && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-600">{passwordError}</div>
              )}
              {passwordSuccess && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-600">
                  Password updated successfully!
                </div>
              )}
              <Button type="submit" className="w-full" disabled={passwordLoading}>
                {passwordLoading ? "Updating..." : "Update password"}
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
            <h2 className="font-heading text-xl text-brand-dark">Subscription</h2>
            <p className="mt-2 text-sm text-brand-slate">
              {subscriptionSummary
                ? `Current plan: ${subscriptionSummary.planName} • ${subscriptionSummary.status.replace("_", " ")}`
                : "Loading subscription..."}
            </p>
            {subscriptionSummary?.periodEnd && (
              <p className="mt-1 text-xs text-brand-slate">
                Renews {new Date(subscriptionSummary.periodEnd).toLocaleDateString()}
              </p>
            )}
            <Button className="mt-6" onClick={() => setPlanModalOpen(true)}>
              Manage plan
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="rounded-3xl border border-brand-mist bg-white p-8 shadow-sm"
          >
            <h2 className="font-heading text-xl text-brand-dark">Notification preferences</h2>
            <div className="mt-6 space-y-4">
              <Preference
                label="Email landlord summary"
                description="Daily digest of rent status and tickets."
                checked={notificationPrefs.emailLandlordSummary}
                disabled={prefsSaving}
                onChange={(v) => handlePrefChange("emailLandlordSummary", v)}
              />
              <Preference
                label="SMS escalations"
                description="Urgent complaints and overdue rent alerts."
                checked={notificationPrefs.smsEscalations}
                disabled={prefsSaving}
                onChange={(v) => handlePrefChange("smsEscalations", v)}
              />
              <Preference
                label="Tenant feedback digest"
                description="Weekly NPS and survey responses."
                checked={notificationPrefs.tenantFeedbackDigest}
                disabled={prefsSaving}
                onChange={(v) => handlePrefChange("tenantFeedbackDigest", v)}
              />
            </div>
          </motion.div>
        </div>
      </section>
      <ManagePlanModal
        isOpen={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        onUpdated={loadSubscription}
      />
    </>
  );
}

function Preference({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-brand-mist px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-brand-dark">{label}</p>
        <p className="text-xs text-brand-slate">{description}</p>
      </div>
      <Switch checked={checked} disabled={disabled} onCheckedChange={onChange} />
    </div>
  );
}

