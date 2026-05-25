"use client";

/* eslint-disable @next/next/no-img-element */

import type { Product } from "@/types";
import { productImage, priceLabel } from "@/utils";

export function ProductsView({
  products,
  productSearch,
  onSearch,
  onNew,
  onEdit,
  onArchive,
}: {
  products: Product[];
  productSearch: string;
  onSearch: (value: string) => void;
  onNew: () => void;
  onEdit: (product: Product) => void;
  onArchive: (product: Product) => void;
}) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
         <h1 className="text-2xl font-bold">Products</h1>
         <button onClick={onNew} className="admin-button admin-button-primary">Add New Product</button>
      </div>
      <div className="admin-card">
        <div className="admin-card-header md:flex-row md:items-end md:justify-between">
          <div>
            <p className="admin-eyebrow">Product Control</p>
            <h2 className="admin-card-title">All components and products</h2>
            <p className="admin-muted">Search, edit, or archive catalog items without changing product logic.</p>
          </div>
          <input className="admin-input md:w-80" placeholder="Search product, category, tag" value={productSearch} onChange={(event) => onSearch(event.target.value)} />
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-2 2xl:grid-cols-3">
          {products.map((product) => (
            <div key={product.id} className="flex gap-4 rounded-xl border border-zinc-200 bg-white p-3 transition hover:border-zinc-300 hover:bg-[#F2F2F0]">
              <div className="grid size-24 shrink-0 place-items-center rounded-lg border border-zinc-200 bg-white p-2">
                <img src={productImage(product)} alt={product.name} className="h-full w-full object-contain" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-[#222222]">{product.name}</p>
                <p className="text-xs font-semibold text-zinc-500">{product.category} / {product.subcategory}</p>
                <p className="mt-2 font-extrabold text-[#222222]">{priceLabel(product.unitPriceCents)}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="admin-action" onClick={() => onEdit(product)} type="button">Edit</button>
                  <button className="admin-action" onClick={() => onArchive(product)} type="button">Archive</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
