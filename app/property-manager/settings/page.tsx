"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { TopBar } from "@/components/dashboard/top-bar";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { uploadAvatar } from "@/lib/uploads";
import { getUserFriendlyError } from "@/lib/errors";
import Image from "next/image";

type ProfileState = {
  displayName: string;
  title: string;
  avatarUrl: string;
  phone: string;
  email: string;
};

const DEFAULT_AVATAR = "https://i.pravatar.cc/100?img=12";

export default function PropertyManagerSettingsPage() {
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
        displayName: data?.propertyManager?.displayName ?? data?.email?.split("@")[0] ?? "",
        title: data?.propertyManager?.title ?? "",
        avatarUrl: data?.propertyManager?.avatarUrl ?? "",
        phone: data?.propertyManager?.phone ?? "",
        email: data?.email ?? "",
      });
    } catch (error) {
      setProfileError(getUserFriendlyError(error, "We couldn't load your profile. Please refresh the page."));
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError(null);
    setProfileMessage(null);
    try {
      await api.patch("/users/me", {
        displayName: profileData.displayName || undefined,
        title: profileData.title || undefined,
        avatarUrl: profileData.avatarUrl || undefined,
        phone: profileData.phone || undefined,
      });
      setProfileMessage("Profile updated successfully!");
      window.dispatchEvent(new CustomEvent("profile-updated"));
      setTimeout(() => setProfileMessage(null), 3000);
    } catch (err) {
      setProfileError(getUserFriendlyError(err, "We couldn't update your profile. Please try again."));
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
      setProfileMessage("Photo uploaded. Save to confirm changes.");
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
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      const { clearAuth } = await import("@/lib/auth");
      clearAuth();
      setLoggingOut(false);
      router.replace("/login?userType=property-manager");
    }
  };

  return (
    <>
      <TopBar title="Settings" subtitle="Manage your profile and account preferences." />
      <section className="flex-1 space-y-10 px-8 py-10">
        <div className="lg:hidden rounded-3xl border border-brand-mist bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-brand-dark">Signed in as {profileData.email || "..."}</p>
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
            <h2 className="font-heading text-xl text-brand-dark">Personal info</h2>
            <p className="mt-2 text-sm text-brand-slate">Update your public profile details.</p>
            {profileLoading ? (
              <div className="mt-6 text-center text-brand-slate">Loading profile...</div>
            ) : (
              <form onSubmit={handleSaveProfile} className="mt-6 space-y-4">
                <div className="flex items-center gap-4">
                  <Image
                    src={profileData.avatarUrl || DEFAULT_AVATAR}
                    alt="Profile avatar"
                    width={64}
                    height={64}
                    className="rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm text-brand-slate">Profile photo</p>
                    <div className="mt-2 flex items-center gap-3">
                      <input
                        id="pm-avatar"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="sr-only"
                      />
                      <label
                        htmlFor="pm-avatar"
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
                  <label htmlFor="displayName" className="block text-sm font-medium text-brand-dark mb-2">
                    Display Name
                  </label>
                  <input
                    id="displayName"
                    type="text"
                    required
                    value={profileData.displayName}
                    onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                    className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-brand-dark mb-2">
                    Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={profileData.title}
                    onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
                    className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
                    placeholder="e.g., Property Manager"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-brand-dark mb-2">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-brand-dark mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={profileData.email}
                    readOnly
                    className="w-full rounded-xl border border-brand-mist bg-brand-mist px-4 py-3 text-brand-dark cursor-not-allowed"
                  />
                </div>
                {profileError && (
                  <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-600">
                    {profileError}
                  </div>
                )}
                {profileMessage && (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-600">
                    {profileMessage}
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={profileSaving}>
                  {profileSaving ? "Saving..." : "Save changes"}
                </Button>
              </form>
            )}
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
                <input
                  id="currentPassword"
                  type="password"
                  required
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-brand-dark mb-2">
                  New password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  required
                  minLength={8}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
                  placeholder="At least 8 characters"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-brand-dark mb-2">
                  Confirm new password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
                  placeholder="Re-enter new password"
                />
              </div>
              {passwordError && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-600">
                  {passwordError}
                </div>
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
        </div>
      </section>
    </>
  );
}

