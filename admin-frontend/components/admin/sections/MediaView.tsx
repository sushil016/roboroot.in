"use client";

/* eslint-disable @next/next/no-img-element */

import type { Product } from "@/types";
import { productImage } from "@/utils";

export function MediaView({ products, onEditProduct }: { products: Product[]; onEditProduct: (product: Product) => void }) {
  return (
    <section className="admin-card">
      <div className="admin-card-header md:flex-row md:items-end md:justify-between">
        <div>
          <p className="admin-eyebrow">Images & Media</p>
          <h2 className="admin-card-title">Product image library</h2>
          <p className="admin-muted">Click any item to update image URL, vendor link, tags, and homepage flags.</p>
        </div>
      </div>
      <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6">
        {products.map((product) => (
          <button key={product.id} onClick={() => onEditProduct(product)} className="overflow-hidden rounded-xl border border-zinc-200 bg-white text-left transition hover:border-zinc-300 hover:bg-[#F2F2F0]">
            <div className="aspect-square bg-[#F2F2F0] p-3">
              <img src={productImage(product)} alt={product.name} className="h-full w-full object-contain" />
            </div>
            <div className="p-3">
              <p className="line-clamp-2 min-h-10 text-sm font-black">{product.name}</p>
              <p className="mt-1 text-xs font-semibold text-zinc-500">{product.imageUrl ? "Image set" : "Needs image"}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
