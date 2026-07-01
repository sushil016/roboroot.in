import { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProductDetailPage } from "@/features/products";
import { componentApi } from "@/features/products/services/product.service";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let component;

  try {
    component = await componentApi.getComponentBySlug(slug);
  } catch (error) {
    // Fallback metadata lookup using ID (important for SEO redirects)
    try {
      component = await componentApi.getComponentById(slug);
    } catch {
      return {
        title: "Electronic Component | RoboRoot",
        description: "Buy high-quality electronic components online in India.",
      };
    }
  }

  const priceInRupees = (component.discountedPriceCents || component.unitPriceCents) / 100;
  const description = (
    component.description ||
    `Buy ${component.name} online at RoboRoot. Best price ₹${priceInRupees} in India. Fast shipping.`
  ).substring(0, 160);

  return {
    title: `${component.name} – Buy Online at ₹${priceInRupees}`,
    description,
    alternates: {
      canonical: `https://roboroot.in/components/${component.slug}`,
    },
    openGraph: {
      title: `${component.name} | RoboRoot India`,
      description,
      images: component.imageUrl
        ? [{ url: component.imageUrl, alt: component.name }]
        : [],
      type: "website",
      url: `https://roboroot.in/components/${component.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${component.name} | RoboRoot India`,
      description,
      images: component.imageUrl ? [component.imageUrl] : [],
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  let component;
  let jsonLd: any = null;

  try {
    // 1. Try fetching by slug
    component = await componentApi.getComponentBySlug(slug);
  } catch (error) {
    // 2. Try fallback fetching by legacy ID
    try {
      component = await componentApi.getComponentById(slug);
      // 3. Issue a permanent redirect to the slug URL
      redirect(`/components/${component.slug}`);
    } catch {
      // 4. If not found by ID either, go back to components
      redirect("/components");
    }
  }

  try {
    const price = (component.discountedPriceCents || component.unitPriceCents) / 100;

    jsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": component.name,
      "image": component.imageUrl ? [component.imageUrl] : [],
      "description": component.description || `Buy ${component.name} at RoboRoot`,
      "sku": component.sku || component.id,
      "mpn": component.sku || component.id,
      "brand": {
        "@type": "Brand",
        "name": component.brand || "RoboRoot"
      },
      "offers": {
        "@type": "Offer",
        "url": `https://roboroot.in/components/${component.slug}`,
        "priceCurrency": "INR",
        "price": price,
        "priceValidUntil": "2030-12-31",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": component.stockQuantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "seller": {
          "@type": "Organization",
          "name": "RoboRoot"
        }
      }
    };
  } catch (e) {
    // Ignore schema generation error, render page anyway
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductDetailPage />
    </>
  );
}

