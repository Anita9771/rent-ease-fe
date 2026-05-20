"use client";

import { useParams } from "next/navigation";
import { TopBar } from "@/components/dashboard/top-bar";
import { ComplaintDetailView } from "@/components/complaints/complaint-detail-view";

export default function LandlordComplaintDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <>
      <TopBar title="Ticket details" subtitle="Review updates and reply to your tenant." />
      <ComplaintDetailView
        complaintId={id}
        backHref="/landlord/complaints"
        backLabel="Back to complaints"
        canUpdateStatus
      />
    </>
  );
}
