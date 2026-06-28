import { Metadata } from "next";
import { ProductDetailPage } from "@/features/products";
import { componentApi } from "@/features/products/services/product.service";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const component = await componentApi.getComponentById(id);
    const priceInRupees = (component.discountedPriceCents || component.unitPriceCents) / 100;
    const description = component.description || `Buy ${component.name} online at RoboRoot. Best price in India.`;

    return {
      title: `${component.name} - Buy Online at ₹${priceInRupees} | RoboRoot`,
      description: description.substring(0, 160),
      alternates: {
        canonical: `https://roboroot.in/components/${id}`,
      },
      openGraph: {
        title: `${component.name} | RoboRoot India`,
        description: description.substring(0, 160),
        images: component.imageUrl ? [{ url: component.imageUrl }] : [],
        type: "website",
      },
    };
  } catch (error) {
    return {
      title: "Electronic Component | RoboRoot",
      description: "Buy high-quality electronic components online in India.",
    };
  }
}

export default async function Page({ params }: Props) {
  let jsonLd: any = null;

  try {
    const { id } = await params;
    const component = await componentApi.getComponentById(id);
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
        "url": `https://roboroot.in/components/${component.id}`,
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
    // Ignore error, render page without jsonLd
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
