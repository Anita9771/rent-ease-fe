"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LandlordIndexPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/landlord/dashboard");
  }, [router]);
  return null;
}

