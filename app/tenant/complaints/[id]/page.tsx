"use client";

import { useParams } from "next/navigation";
import { TopBar } from "@/components/dashboard/top-bar";
import { ComplaintDetailView } from "@/components/complaints/complaint-detail-view";

export default function TenantComplaintDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <>
      <TopBar title="Issue details" subtitle="Follow progress and chat with your landlord." />
      <ComplaintDetailView complaintId={id} backHref="/tenant/complaints" backLabel="Back to issues" />
    </>
  );
}
