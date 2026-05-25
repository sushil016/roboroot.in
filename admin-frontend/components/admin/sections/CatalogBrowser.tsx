"use client";

/* eslint-disable @next/next/no-img-element */

import type { CategoryNode, Product } from "@/types";
import { productImage } from "@/utils";
import { ProductTile } from "./ProductTile";

const categoryBackdrop =
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80";

export function CatalogBrowser({
  categories,
  selectedCategory,
  selectedSubcategory,
  products,
  search,
  onSearch,
  onSelectCategory,
  onSelectSubcategory,
  onEditProduct,
  onArchiveProduct,
}: {
  categories: CategoryNode[];
  selectedCategory?: CategoryNode;
  selectedSubcategory: string;
  products: Product[];
  search: string;
  onSearch: (value: string) => void;
  onSelectCategory: (value: string) => void;
  onSelectSubcategory: (value: string) => void;
  onEditProduct: (product: Product) => void;
  onArchiveProduct: (product: Product) => void;
}) {
  const firstProduct = selectedCategory?.subcategories.flatMap((subcategory) => subcategory.products).find((product) => product.imageUrl);

  return (
    <div className="admin-card overflow-hidden">
      <section className="border-b border-zinc-100 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="admin-eyebrow">Browse Catalog</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#222222]">{selectedCategory?.category || "Catalog"}</h2>
            <p className="admin-muted mt-1">Browse category groups, subcategories, and product cards from one clean view.</p>
          </div>
          <div className="relative hidden h-20 w-40 overflow-hidden rounded-xl border border-zinc-200 bg-[#222222] lg:block">
            <img src={firstProduct ? productImage(firstProduct) : categoryBackdrop} alt="" className="h-full w-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-[#222222]/35" />
          </div>
        </div>
        <div className="mt-5 flex gap-3 overflow-x-auto pb-1">
            {categories.map((category) => (
              <button
                key={category.category}
                onClick={() => onSelectCategory(category.category)}
                className={`flex shrink-0 items-center gap-3 rounded-xl border px-3 py-2 text-left transition ${
                  selectedCategory?.category === category.category
                    ? "border-[#222222] bg-[#222222] text-white"
                    : "border-zinc-200 bg-white text-[#222222] hover:bg-[#F2F2F0]"
                }`}
              >
                <span className="flex size-9 items-center justify-center rounded-lg border border-current/20 bg-current/5 text-xs font-bold">
                  {category.category.slice(0, 2).toUpperCase()}
                </span>
                <span>
                  <span className="block text-sm font-bold">{category.category}</span>
                  <span className="text-xs opacity-70">{category.count} Products</span>
                </span>
              </button>
            ))}
        </div>
      </section>

      <section className="grid gap-0 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="border-b border-zinc-200 p-5 lg:border-b-0 lg:border-r">
          <h3 className="text-sm font-bold text-[#222222]">Stock Status</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm font-semibold text-zinc-500">
            <label className="admin-checkbox-row"><input type="checkbox" /> In stock</label>
            <label className="admin-checkbox-row"><input type="checkbox" /> Best seller</label>
            <label className="admin-checkbox-row"><input type="checkbox" /> Robomaniac</label>
          </div>

          <div className="my-6 border-t border-zinc-200" />
          <h3 className="text-sm font-bold text-[#222222]">Subcategories</h3>
          <div className="mt-4 flex flex-col gap-1">
            <button
              onClick={() => onSelectSubcategory("")}
              className={`block w-full rounded-md px-3 py-2 text-left text-sm font-semibold ${
                !selectedSubcategory ? "bg-[#F2F2F0] text-[#222222]" : "text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              All in {selectedCategory?.category || "category"}
            </button>
            {selectedCategory?.subcategories.map((subcategory) => (
              <button
                key={subcategory.name}
                onClick={() => onSelectSubcategory(subcategory.name)}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-semibold ${
                  selectedSubcategory === subcategory.name ? "bg-[#F2F2F0] text-[#222222]" : "text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                <span>{subcategory.name}</span>
                <span className="text-xs text-zinc-400">{subcategory.count}</span>
              </button>
            ))}
          </div>
        </aside>

        <div className="p-5">
          <div className="flex flex-col gap-4 border-b border-zinc-200 pb-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="text-sm font-semibold text-zinc-500">
              Home / {selectedCategory?.category || "Catalog"} {selectedSubcategory ? `/ ${selectedSubcategory}` : ""}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="admin-pill">{products.length} visible</span>
              <input className="admin-input w-72" value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search visible products" />
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
            {products.map((product) => (
              <ProductTile key={product.id} product={product} onEdit={onEditProduct} onArchive={onArchiveProduct} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
