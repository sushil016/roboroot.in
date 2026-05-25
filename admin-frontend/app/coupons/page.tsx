"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "@/core/context/AdminContext";
import { CouponsView } from "@/components/admin/sections/CouponsView";
import type { Coupon } from "@/types";
import { listCoupons } from "@/api/coupons";

export default function CouponsPage() {
  const { token, setStatus, setIsLoading, isLoading } = useAdmin();
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  async function loadCoupons() {
    if (!token) return;
    setIsLoading(true);
    try {
      const couponList = await listCoupons(token);
      setCoupons(couponList);
      setStatus("Coupons loaded");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to load coupons");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadCoupons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <CouponsView
      coupons={coupons}
      isLoading={isLoading}
      token={token || ""}
      onReload={() => void loadCoupons()}
    />
  );
}
