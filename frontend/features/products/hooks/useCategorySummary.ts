"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ComponentCategorySummaryNode } from "@/types/marketplace.types";
import { componentApi } from "@/features/products/services/product.service";
import {
  CATEGORY_SUMMARY_GC_TIME,
  CATEGORY_SUMMARY_QUERY_KEY,
  CATEGORY_SUMMARY_STALE_TIME,
  getServerCategorySummaryCache,
  readCategorySummaryCache,
  subscribeCategorySummaryCache,
  writeCategorySummaryCache,
} from "@/features/products/services/category-summary-cache";

let activeRequest: Promise<ComponentCategorySummaryNode[]> | null = null;

function fetchCategorySummary() {
  if (activeRequest) return activeRequest;
  activeRequest = componentApi
    .getCategorySummary()
    .then((data) => {
      writeCategorySummaryCache(data);
      return data;
    })
    .catch((error) => {
      const cached = readCategorySummaryCache();
      if (cached?.data.length) return cached.data;
      throw error;
    })
    .finally(() => {
      activeRequest = null;
    });
  return activeRequest;
}

export function useCategorySummary(serverInitialData?: ComponentCategorySummaryNode[]) {
  const queryClient = useQueryClient();
  const cached = useSyncExternalStore(
    subscribeCategorySummaryCache,
    readCategorySummaryCache,
    getServerCategorySummaryCache,
  );
  const [mountedAt] = useState(() => Date.now());
  const initialData = cached?.data.length ? cached.data : serverInitialData;
  const initialDataUpdatedAt = cached?.savedAt ?? (serverInitialData?.length ? mountedAt : undefined);

  const query = useQuery({
    queryKey: CATEGORY_SUMMARY_QUERY_KEY,
    queryFn: fetchCategorySummary,
    initialData,
    initialDataUpdatedAt,
    staleTime: CATEGORY_SUMMARY_STALE_TIME,
    gcTime: CATEGORY_SUMMARY_GC_TIME,
    retry: 3,
    retryDelay: (attempt) => Math.min(500 * 2 ** attempt, 4000),
    placeholderData: (previous) => previous,
  });

  useEffect(() => {
    if (!serverInitialData?.length) return;
    if (!queryClient.getQueryData(CATEGORY_SUMMARY_QUERY_KEY)) {
      queryClient.setQueryData(CATEGORY_SUMMARY_QUERY_KEY, serverInitialData);
    }
    writeCategorySummaryCache(serverInitialData);
  }, [queryClient, serverInitialData]);

  const data = query.data ?? serverInitialData ?? cached?.data ?? [];
  return {
    ...query,
    data,
    isLoading: query.isLoading && data.length === 0,
  };
}
