import { LandingPage } from "@/features/dashboard/components/LandingPage";
import type { ComponentCategorySummaryNode } from "@/types/marketplace.types";

export const revalidate = 600;

async function getInitialCategories(): Promise<ComponentCategorySummaryNode[] | undefined> {
  const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  const apiBaseUrl = configuredApiUrl?.startsWith("http")
    ? configuredApiUrl
    : process.env.NODE_ENV === "production"
      ? "https://roboroot.in/_/backend"
      : "http://localhost:4000";

  try {
    const response = await fetch(`${apiBaseUrl}/api/components/categories/summary`, {
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return undefined;
    const payload = (await response.json()) as {
      data?: ComponentCategorySummaryNode[];
    };
    return Array.isArray(payload.data) ? payload.data : undefined;
  } catch {
    return undefined;
  }
}

export default async function Home() {
  const initialCategories = await getInitialCategories();
  return <LandingPage initialCategories={initialCategories} />;
}
