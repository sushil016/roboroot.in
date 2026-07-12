import type { Component, ComponentCategoryNode, ComponentFilters } from "@/types/marketplace.types";

export type SortOption = "name-asc" | "name-desc" | "price-asc" | "price-desc" | "createdAt-desc" | "createdAt-asc";

export const fallbackProductImage =
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80";

export function buildInitialFilters(): ComponentFilters {
  const params =
    typeof window !== "undefined" ? new URLSearchParams(window.location.search) : undefined;

  return {
    page: 1,
    limit: 15,
    sortBy: "name",
    sortOrder: "asc",
    inStock: true,
    search: params?.get("search") || undefined,
    category: params?.get("category") || undefined,
    subcategory: params?.get("subcategory") || undefined,
    isBestSeller: params?.get("isBestSeller") === "true" || undefined,
    isRobomaniacItem: params?.get("isRobomaniacItem") === "true" || undefined,
    isSoftware: params?.get("isSoftware") === "true" || undefined,
  };
}

export function sortValueFromFilters(filters: ComponentFilters): SortOption {
  return `${filters.sortBy || "name"}-${filters.sortOrder || "asc"}` as SortOption;
}

export function sortPatchFromValue(value: SortOption): Pick<ComponentFilters, "sortBy" | "sortOrder"> {
  const [sortBy, sortOrder] = value.split("-") as [
    "name" | "price" | "createdAt",
    "asc" | "desc",
  ];

  return { sortBy, sortOrder };
}

export function productImageUrl(component?: Pick<Component, "imageUrl">) {
  const url = component?.imageUrl;
  if (!url) {
    return fallbackProductImage;
  }
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) {
    return url;
  }
  return fallbackProductImage;
}

export function categoryHeroImage(category?: ComponentCategoryNode) {
  return productImageUrl(
    category?.subcategories.flatMap((subcategory) => subcategory.products).find((product) => product.imageUrl)
  );
}

export function visibleProductsFromCategoryTree(
  categoryTree: ComponentCategoryNode[] | undefined,
  categoryName?: string,
  subcategoryName?: string
) {
  const category = categoryTree?.find((item) => item.category === categoryName);

  if (!category) {
    return [];
  }

  if (subcategoryName) {
    return category.subcategories.find((item) => item.name === subcategoryName)?.products || [];
  }

  return category.subcategories.flatMap((subcategory) => subcategory.products);
}

export function compactProductType(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
