"use client";

import { TopBar } from "@/components/dashboard/top-bar";
import { TenantProfileView } from "@/components/tenants/tenant-profile-view";

export default function LandlordTenantProfilePage({ params }: { params: { id: string } }) {
  return (
    <>
      <TopBar title="Tenant profile" subtitle="Review tenant details, history, and activity." />
      <TenantProfileView tenantId={params.id} />
    </>
  );
}

