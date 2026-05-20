"use client";

import { useParams } from "next/navigation";
import { TopBar } from "@/components/dashboard/top-bar";
import { ComplaintDetailView } from "@/components/complaints/complaint-detail-view";

export default function PropertyManagerComplaintDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <>
      <TopBar title="Ticket details" subtitle="Coordinate maintenance for your assigned properties." />
      <ComplaintDetailView
        complaintId={id}
        backHref="/property-manager/complaints"
        backLabel="Back to complaints"
        canUpdateStatus
      />
    </>
  );
}
