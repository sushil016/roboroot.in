"use client";

/* eslint-disable @next/next/no-img-element */

import type { Product } from "@/types";
import { productImage, priceLabel } from "@/utils";
import { useAdmin } from "@/core/context/AdminContext";
import { API_BASE_URL } from "@/config/env";
import { useRef } from "react";

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
  const { token, setStatus, setIsLoading } = useAdmin();
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleExportCSV() {
    if (!token) return;
    setIsLoading(true);
    setStatus("Exporting catalog...");
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/products/export`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to export products");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "roboroot-catalog-export.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setStatus("Catalog exported successfully");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Export failed");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleImportCSV(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !token) return;

    setIsLoading(true);
    setStatus("Importing products...");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/products/bulk-import`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Import failed");

      setStatus(json.message || "Bulk import completed successfully");
      // Reload page to show new products
      window.location.reload();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Import failed");
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportCSV}
            accept=".csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="admin-button border border-zinc-300 bg-white text-[#222222] hover:bg-zinc-50"
          >
            Bulk Import (CSV)
          </button>
          <button
            onClick={handleExportCSV}
            className="admin-button border border-zinc-300 bg-white text-[#222222] hover:bg-zinc-50"
          >
            Export Catalog (CSV)
          </button>
          <button onClick={onNew} className="admin-button admin-button-primary">
            Add New Product
          </button>
        </div>
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
