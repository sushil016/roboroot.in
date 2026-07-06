"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal } from "lucide-react";
import { componentApi } from "@/features/products/services/product.service";
import type { ComponentFilters } from "@/types/marketplace.types";
import {
  sortPatchFromValue,
  sortValueFromFilters,
  type SortOption,
} from "@/features/products/data/catalog";
import { CatalogHero } from "@/features/products/components/CatalogHero";
import { CatalogSidebar } from "@/features/products/components/CatalogSidebar";
import { ProductCard } from "@/features/products/components/ProductCard";
import { ProductRevealCardSkeleton } from "@/components/ui/product-reveal-card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";


function buildPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "ellipsis", total];
  if (current >= total - 3) return [1, "ellipsis", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "ellipsis", current - 1, current, current + 1, "ellipsis", total];
}

function filtersFromParams(params: URLSearchParams): ComponentFilters {
  return {
    page: 1,
    limit: 15,
    sortBy: "name",
    sortOrder: "asc",
    inStock: true,
    search: params.get("search") || undefined,
    category: params.get("category") || undefined,
    subcategory: params.get("subcategory") || undefined,
    isBestSeller: params.get("isBestSeller") === "true" || undefined,
    isRobomaniacItem: params.get("isRobomaniacItem") === "true" || undefined,
    isSoftware: params.get("isSoftware") === "true" || undefined,
  };
}

export function MarketplacePage() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<ComponentFilters>(() => filtersFromParams(searchParams));
  const [minPrice, setMinPrice] = useState(filters.minPrice ? String(filters.minPrice / 100) : "");
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice ? String(filters.maxPrice / 100) : "");

  // Re-sync filters when the URL changes (e.g. navigating from a category card)
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setFilters(filtersFromParams(searchParams));
      setMinPrice("");
      setMaxPrice("");
    });
    return () => window.cancelAnimationFrame(frame);
  }, [searchParams]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const componentsQuery = useQuery({
    queryKey: ["components", filters],
    queryFn: () => componentApi.getComponents(filters),
  });

  const categoryTreeQuery = useQuery({
    queryKey: ["component-category-tree"],
    queryFn: () => componentApi.getCategoryTree(),
  });

  const categories = categoryTreeQuery.data || [];

  const breadcrumb = useMemo(() => {
    return ["Home", filters.category, filters.subcategory].filter(Boolean).join(" / ");
  }, [filters.category, filters.subcategory]);

  function handleFilterChange(patch: Partial<ComponentFilters>) {
    setFilters((prev) => ({ ...prev, ...patch, page: 1 }));
  }

  function handleApplyPrice() {
    handleFilterChange({
      minPrice: minPrice ? Math.round(Number(minPrice) * 100) : undefined,
      maxPrice: maxPrice ? Math.round(Number(maxPrice) * 100) : undefined,
    });
  }

  function handlePageChange(page: number) {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const currentPage = filters.page || 1;
  const totalPages = componentsQuery.data?.totalPages ?? 0;
  const pageNumbers = buildPageNumbers(currentPage, totalPages);

  return (
    <div className="bg-white text-slate-950">
      <CatalogHero
        categories={categories}
        filters={filters}
        onFilterChange={handleFilterChange}
        totalProducts={componentsQuery.data?.total}
      />

      <div className="mx-auto grid max-w-[1500px] lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="hidden lg:block">
          <CatalogSidebar
            categories={categories}
            filters={filters}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinPrice={setMinPrice}
            onMaxPrice={setMaxPrice}
            onFilterChange={handleFilterChange}
            onApplyPrice={handleApplyPrice}
          />
        </div>

        {/* Mobile filters overlay */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 bg-white lg:hidden">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <p className="font-bold text-[#222222]">Filters</p>
              <button
                className="text-sm font-semibold text-[#1CA2D1]"
                onClick={() => setMobileFiltersOpen(false)}
              >
                Done
              </button>
            </div>
            <CatalogSidebar
              categories={categories}
              filters={filters}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinPrice={setMinPrice}
              onMaxPrice={setMaxPrice}
              onFilterChange={handleFilterChange}
              onApplyPrice={handleApplyPrice}
            />
          </div>
        )}

        <main className="min-w-0 px-4 py-8 sm:px-6">
          {/* Toolbar */}
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                {breadcrumb}
              </p>
              <p className="mt-1 text-sm font-bold text-slate-700">
                {componentsQuery.data
                  ? `Showing ${componentsQuery.data.components.length} of ${componentsQuery.data.total} products`
                  : componentsQuery.isLoading
                  ? "Loading products..."
                  : "No products found"}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold lg:hidden hover:border-slate-300 transition-colors"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </button>
              <select
                value={sortValueFromFilters(filters)}
                onChange={(e) =>
                  handleFilterChange(sortPatchFromValue(e.target.value as SortOption))
                }
                className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none hover:border-slate-300 transition-colors bg-white"
              >
                <option value="name-asc">Name A–Z</option>
                <option value="name-desc">Name Z–A</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Skeleton grid */}
          {componentsQuery.isLoading && (
            <div className="mt-8 grid gap-3 sm:gap-5 grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <ProductRevealCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error state */}
          {componentsQuery.error && (
            <div className="flex flex-col items-center gap-3 py-24 text-center">
              <p className="text-lg font-bold text-red-600">Failed to load products</p>
              <p className="text-sm text-slate-500">Please refresh and try again.</p>
            </div>
          )}

          {/* Empty state */}
          {!componentsQuery.isLoading && componentsQuery.data?.components.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-24 text-center">
              <p className="text-lg font-bold text-[#222222]">No components found</p>
              <p className="text-sm text-slate-500">
                Try changing category, subcategory, or search terms.
              </p>
            </div>
          )}

          {/* Product grid */}
          {!!componentsQuery.data?.components.length && (
            <>
              <div className="mt-8 grid gap-3 sm:gap-5 grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {componentsQuery.data.components.map((component) => (
                  <ProductCard key={component.id} component={component} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) handlePageChange(currentPage - 1);
                          }}
                          className={
                            currentPage <= 1
                              ? "pointer-events-none opacity-40"
                              : "cursor-pointer hover:bg-[#E8E8E6]"
                          }
                          aria-disabled={currentPage <= 1}
                        />
                      </PaginationItem>

                      {pageNumbers.map((page, i) =>
                        page === "ellipsis" ? (
                          <PaginationItem key={`ellipsis-${i}`}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        ) : (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              isActive={page === currentPage}
                              onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(page);
                              }}
                              className={
                                page === currentPage
                                  ? "border-[#222222] bg-[#222222] text-white hover:bg-[#1CA2D1] hover:border-[#1CA2D1]"
                                  : "cursor-pointer hover:bg-[#E8E8E6] border-transparent"
                              }
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      )}

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) handlePageChange(currentPage + 1);
                          }}
                          className={
                            currentPage >= totalPages
                              ? "pointer-events-none opacity-40"
                              : "cursor-pointer hover:bg-[#E8E8E6]"
                          }
                          aria-disabled={currentPage >= totalPages}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                  <p className="mt-3 text-center text-xs text-slate-400">
                    Page {currentPage} of {totalPages}
                  </p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
