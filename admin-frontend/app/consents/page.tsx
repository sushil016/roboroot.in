"use client";

import { useCallback, useEffect, useState } from "react";
import { ConsentLogsView } from "@/components/admin/sections/ConsentLogsView";
import { downloadConsentExport, fetchConsentRecords } from "@/api/consents";
import { useAdmin } from "@/core/context/AdminContext";
import type { ConsentFilters, ConsentListData } from "@/types";

const initialFilters: ConsentFilters = { page: 1, limit: 25 };
const emptyData: ConsentListData = {
  records: [],
  pagination: { page: 1, limit: 25, total: 0, totalPages: 1 },
  summary: { total: 0, byType: {} },
};

export default function ConsentsPage() {
  const { token, setStatus, setIsLoading, isLoading } = useAdmin();
  const [filters, setFilters] = useState<ConsentFilters>(initialFilters);
  const [data, setData] = useState<ConsentListData>(emptyData);

  const load = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      setData(await fetchConsentRecords(filters, token));
      setStatus("Consent audit log loaded");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not load consent records");
    } finally {
      setIsLoading(false);
    }
  }, [filters, setIsLoading, setStatus, token]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), filters.search ? 250 : 0);
    return () => window.clearTimeout(timer);
  }, [load, filters.search]);

  async function handleExport() {
    if (!token) return;
    try {
      await downloadConsentExport(filters, token);
      setStatus("Consent CSV exported");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not export consent records");
    }
  }

  return (
    <ConsentLogsView
      data={data}
      filters={filters}
      isLoading={isLoading}
      onFiltersChange={setFilters}
      onRefresh={() => void load()}
      onExport={() => void handleExport()}
    />
  );
}
