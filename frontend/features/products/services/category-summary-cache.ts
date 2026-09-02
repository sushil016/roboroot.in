import type { ComponentCategorySummaryNode } from '@/types/marketplace.types';

export const CATEGORY_SUMMARY_QUERY_KEY = ['component-category-summary'] as const;
export const CATEGORY_SUMMARY_STALE_TIME = 30 * 60 * 1000;
export const CATEGORY_SUMMARY_GC_TIME = 24 * 60 * 60 * 1000;

const STORAGE_KEY = 'roboroot-category-summary-v1';
const MAX_FALLBACK_AGE = 7 * 24 * 60 * 60 * 1000;

export type CategorySummaryCacheEntry = {
  data: ComponentCategorySummaryNode[];
  savedAt: number;
};

let memoryCache: CategorySummaryCacheEntry | null = null;
const listeners = new Set<() => void>();

function clearStoredCache() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage can be unavailable in restricted browsing contexts.
  }
}

function isCategorySummary(value: unknown): value is ComponentCategorySummaryNode[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item !== null &&
        typeof item === 'object' &&
        typeof (item as ComponentCategorySummaryNode).category === 'string' &&
        Array.isArray((item as ComponentCategorySummaryNode).subcategories),
    )
  );
}

export function readCategorySummaryCache(): CategorySummaryCacheEntry | null {
  if (memoryCache && Date.now() - memoryCache.savedAt <= MAX_FALLBACK_AGE) {
    return memoryCache;
  }
  if (typeof window === 'undefined') return null;

  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null') as
      | CategorySummaryCacheEntry
      | null;
    if (
      !parsed ||
      typeof parsed.savedAt !== 'number' ||
      Date.now() - parsed.savedAt > MAX_FALLBACK_AGE ||
      !isCategorySummary(parsed.data)
    ) {
      clearStoredCache();
      return null;
    }
    memoryCache = parsed;
    return parsed;
  } catch {
    return null;
  }
}

export function writeCategorySummaryCache(data: ComponentCategorySummaryNode[]) {
  if (!data.length) return;
  const entry = { data, savedAt: Date.now() } satisfies CategorySummaryCacheEntry;
  memoryCache = entry;
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
  } catch {
    // Browsing can continue with React Query's in-memory cache.
  }
  listeners.forEach((listener) => listener());
}

export function subscribeCategorySummaryCache(listener: () => void) {
  listeners.add(listener);
  const handleStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    memoryCache = null;
    listener();
  };
  if (typeof window !== 'undefined') window.addEventListener('storage', handleStorage);

  return () => {
    listeners.delete(listener);
    if (typeof window !== 'undefined') window.removeEventListener('storage', handleStorage);
  };
}

export function getServerCategorySummaryCache() {
  return null;
}
