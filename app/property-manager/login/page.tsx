"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PropertyManagerLoginRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/login?userType=property-manager");
  }, [router]);
  return null;
}

