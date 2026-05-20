"use client";

import { TopBar } from "@/components/dashboard/top-bar";
import { TenantProfileView } from "@/components/tenants/tenant-profile-view";

export default function PropertyManagerTenantProfilePage({ params }: { params: { id: string } }) {
  return (
    <>
      <TopBar title="Tenant profile" subtitle="Monitor tenant status across assigned properties." />
      <TenantProfileView tenantId={params.id} />
    </>
  );
}

