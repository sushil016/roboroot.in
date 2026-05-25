"use client";

/* eslint-disable @next/next/no-img-element */

import type { Product } from "@/types";
import { productImage, priceLabel } from "@/utils";

export function ProductTile({
  product,
  onEdit,
  onArchive,
}: {
  product: Product;
  onEdit: (product: Product) => void;
  onArchive: (product: Product) => void;
}) {
  return (
    <article className="group admin-card overflow-hidden transition hover:border-zinc-300 hover:shadow-md">
      <div className="relative flex aspect-square w-full items-center justify-center bg-[#F2F2F0] p-4">
        {product.isBestSeller && (
          <span className="admin-pill absolute right-3 top-3 z-10 border-zinc-300 bg-white">Best</span>
        )}
        <img src={productImage(product)} alt={product.name} className="h-full w-full object-contain transition group-hover:scale-105" />
        <div className="absolute inset-x-3 bottom-3 hidden gap-2 group-hover:flex">
          <button onClick={() => onEdit(product)} className="flex-1 rounded-md bg-[#222222] px-3 py-2 text-xs font-black text-white">Edit</button>
          <button onClick={() => onArchive(product)} className="flex-1 rounded-md bg-white px-3 py-2 text-xs font-black text-[#222222] shadow">Archive</button>
        </div>
      </div>
      <div className="p-4 text-left">
        <h3 className="line-clamp-2 min-h-11 text-sm font-bold leading-5 text-[#222222]">{product.name}</h3>
        <p className="mt-1 truncate text-xs font-semibold text-zinc-500">{product.brand || product.productType}</p>
        <p className="mt-3 text-sm font-extrabold text-[#222222]">{priceLabel(product.unitPriceCents)}</p>
      </div>
    </article>
  );
}
