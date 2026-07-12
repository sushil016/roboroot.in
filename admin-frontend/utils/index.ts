import type { Product, ProductForm } from "@/types";

export function priceLabel(cents: number) {
  return `₹${(cents / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export function tagsToArray(tags: string) {
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function productToForm(product: Product): ProductForm {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug || "",
    sku: product.sku || "",
    description: product.description || "",
    typicalUseCase: product.typicalUseCase || "",
    vendorLink: product.vendorLink || "",
    imageUrl: product.imageUrl || "",
    category: product.category,
    subcategory: product.subcategory,
    productType: product.productType,
    brand: product.brand || "",
    tags: product.tags.join(", "),
    unitPrice: String(product.unitPriceCents / 100),
    discountedPrice: product.discountedPriceCents ? String(product.discountedPriceCents / 100) : "",
    stockQuantity: String(product.stockQuantity),
    isBestSeller: product.isBestSeller,
    isRobomaniacItem: product.isRobomaniacItem,
    isSoftware: product.isSoftware,
    isActive: product.isActive,
  };
}

export function productImage(product?: Pick<Product, "imageUrl">) {
  const url = product?.imageUrl;
  if (!url) {
    return "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80";
  }
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) {
    return url;
  }
  return "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80";
}

export function compactType(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
