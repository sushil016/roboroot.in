import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://roboroot.in";

  // 1. High-priority core pages
  const corePagesHigh = [
    "",           // homepage
    "/components",
    "/categories",
    "/pcb",
    "/3d-printing",
    "/projects",
    "/stem-store",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.9,
  }));

  // 2. Secondary informational pages
  const corePagesLow = [
    "/about",
    "/contact",
    "/faq",
    "/bulk-order",
    "/careers",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  // 3. Legal pages (low priority, monthly)
  const legalPages = [
    "/privacy",
    "/terms",
    "/shipping",
    "/refund-policy",
    "/returns",
    "/help",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.3,
  }));

  // 4. Fetch active components from backend
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const isProduction = process.env.NODE_ENV === "production";
    const apiUrl = isProduction
      ? "https://roboroot.in/_/backend"
      : "http://localhost:4000";
    const res = await fetch(`${apiUrl}/api/components?limit=1000`, {
      next: { revalidate: 86400 }, // Cache sitemap data for 24 hours
    });
    if (res.ok) {
      const payload = await res.json();
      const components = payload.data || [];
      productRoutes = components.map((c: { id: string; slug?: string; updatedAt?: string }) => ({
        url: `${baseUrl}/components/${c.slug || c.id}`,
        lastModified: new Date(c.updatedAt || new Date()),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
    }
  } catch {
    // sitemap generation continues without product routes
  }

  // 5. Fetch projects from backend
  let projectRoutes: MetadataRoute.Sitemap = [];
  try {
    const isProduction = process.env.NODE_ENV === "production";
    const apiUrl = isProduction
      ? "https://roboroot.in/_/backend"
      : "http://localhost:4000";
    const res = await fetch(`${apiUrl}/api/projects?limit=500`, {
      next: { revalidate: 86400 },
    });
    if (res.ok) {
      const payload = await res.json();
      const projects = payload.data || [];
      projectRoutes = projects.map((p: { id: string; slug?: string; updatedAt?: string }) => ({
        url: `${baseUrl}/projects/${p.slug || p.id}`,
        lastModified: new Date(p.updatedAt || new Date()),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
    }
  } catch {
    // Continue without project routes
  }

  return [
    ...corePagesHigh,
    ...corePagesLow,
    ...legalPages,
    ...productRoutes,
    ...projectRoutes,
  ];
}
