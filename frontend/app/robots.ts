import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/cart",
          "/checkout",
          "/profile",
          "/settings",
          "/orders",
          "/wishlist",
          "/(auth)/",
        ],
      },
    ],
    sitemap: "https://roboroot.in/sitemap.xml",
    host: "https://roboroot.in",
  };
}
