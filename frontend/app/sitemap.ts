import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://roboroot.in";

  // 1. Define static routes
  const staticRoutes = [
    "",
    "/components",
    "/categories",
    "/pcb",
    "/projects",
    "/cart",
    "/track-order",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // 2. Fetch active components from backend
  let productRoutes: any[] = [];
  try {
    const isProduction = process.env.NODE_ENV === "production";
    const apiUrl = isProduction ? "https://roboroot.in/_/backend" : "http://localhost:4000";
    const res = await fetch(`${apiUrl}/api/components?limit=500`, {
      next: { revalidate: 86400 }, // Cache sitemap data for 24 hours
    });
    if (res.ok) {
      const payload = await res.json();
      const components = payload.data || [];
      productRoutes = components.map((c: any) => ({
        url: `${baseUrl}/components/${c.id}`,
        lastModified: new Date(c.updatedAt || new Date()),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
    }
  } catch (error) {
    console.error("Failed to generate product routes for sitemap:", error);
  }

  return [...staticRoutes, ...productRoutes];
}
