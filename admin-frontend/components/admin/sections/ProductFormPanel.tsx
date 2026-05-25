"use client";

/* eslint-disable @next/next/no-img-element */

import type { FormEvent } from "react";
import type { ProductForm, ProductType } from "@/types";
import { productTypes } from "@/config/forms";
import { compactType, productImage } from "@/utils";
import { useAdmin } from "@/core/context/AdminContext";
import { ProductMediaManager } from "./ProductMediaManager";
import { API_BASE_URL } from "@/config/env";

export function ProductFormPanel({
  productForm,
  isLoading,
  onForm,
  onSubmit,
  onNew,
}: {
  productForm: ProductForm;
  isLoading: boolean;
  onForm: (value: ProductForm) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onNew: () => void;
}) {
  const { token } = useAdmin();

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={onSubmit} className="admin-card">
        <div className="flex items-start justify-between gap-4">
          <div className="admin-card-header flex-1 border-b-0 p-5">
            <p className="admin-eyebrow">Product Manager</p>
            <h2 className="admin-card-title">{productForm.id ? "Edit product" : "Create product"}</h2>
            <p className="admin-muted">Manage product data, pricing, inventory, and storefront flags.</p>
          </div>
          <button type="button" onClick={onNew} className="admin-action m-5">New</button>
        </div>

        <div className="mx-5 overflow-hidden rounded-lg border border-zinc-200 bg-[#F2F2F0]">
          <img src={productForm.imageUrl || productImage()} alt="" className="h-48 w-full object-contain" />
        </div>

        <div className="grid gap-3 p-5">
          <input className="admin-input" placeholder="Product name" value={productForm.name} onChange={(event) => onForm({ ...productForm, name: event.target.value })} required />
          <input className="admin-input" placeholder="SKU" value={productForm.sku} onChange={(event) => onForm({ ...productForm, sku: event.target.value })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="admin-input" placeholder="Category" value={productForm.category} onChange={(event) => onForm({ ...productForm, category: event.target.value })} required />
            <input className="admin-input" placeholder="Subcategory" value={productForm.subcategory} onChange={(event) => onForm({ ...productForm, subcategory: event.target.value })} required />
          </div>
          <select className="admin-input" value={productForm.productType} onChange={(event) => onForm({ ...productForm, productType: event.target.value as ProductType })}>
            {productTypes.map((type) => <option key={type} value={type}>{compactType(type)}</option>)}
          </select>
          <input className="admin-input" placeholder="Brand" value={productForm.brand} onChange={(event) => onForm({ ...productForm, brand: event.target.value })} />
          <textarea className="admin-textarea" placeholder="Description" value={productForm.description} onChange={(event) => onForm({ ...productForm, description: event.target.value })} />
          <textarea className="admin-textarea" placeholder="Typical use case" value={productForm.typicalUseCase} onChange={(event) => onForm({ ...productForm, typicalUseCase: event.target.value })} />

          {/* Image upload */}
          <div className="grid gap-1">
            <label className="text-xs font-semibold text-zinc-500">Upload Product Image</label>
            <input
              className="admin-input"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (file) {
                  // Show preview
                  const url = URL.createObjectURL(file);
                  onForm({ ...productForm, imageUrl: url });
                  
                  // Upload to server
                  const formData = new FormData();
                  formData.append("image", file);
                  try {
                    const res = await fetch(`${API_BASE_URL}/api/components/upload/image`, {
                      method: "POST",
                      headers: { Authorization: `Bearer ${token}` },
                      body: formData,
                    });
                    const json = await res.json();
                    if (json.success) {
                      onForm({ ...productForm, imageUrl: json.url });
                    } else {
                      alert("Upload failed: " + json.error);
                    }
                  } catch (err) {
                    alert("Upload error.");
                  }
                }
              }}
            />
            <p className="text-xs text-zinc-400">Recommended: 800 × 800 px, PNG/JPEG/WebP, max 7 MB</p>
          </div>
          <div className="grid gap-1">
            <label className="text-xs font-semibold text-zinc-500">Or paste image URL</label>
            <input
              className="admin-input"
              placeholder="https://..."
              value={productForm.imageUrl}
              onChange={(event) => onForm({ ...productForm, imageUrl: event.target.value })}
            />
          </div>

          <input className="admin-input" placeholder="Vendor link" value={productForm.vendorLink} onChange={(event) => onForm({ ...productForm, vendorLink: event.target.value })} />
          <input className="admin-input" placeholder="Tags, comma separated" value={productForm.tags} onChange={(event) => onForm({ ...productForm, tags: event.target.value })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1">
              <label className="text-xs font-semibold text-zinc-500">Price INR</label>
              <input
                className="admin-input"
                type="number"
                min="0"
                step="0.01"
                placeholder="Price INR"
                value={productForm.unitPrice}
                onChange={(event) => onForm({ ...productForm, unitPrice: event.target.value })}
                required
              />
            </div>
            <div className="grid gap-1">
              <label className="text-xs font-semibold text-zinc-500">Sale Price INR (leave empty = no discount)</label>
              <input
                className="admin-input"
                type="number"
                min="0"
                step="0.01"
                placeholder="Sale price (optional)"
                value={productForm.discountedPrice}
                onChange={(event) => onForm({ ...productForm, discountedPrice: event.target.value })}
              />
            </div>
          </div>
          <input
            className="admin-input"
            type="number"
            min="0"
            placeholder="Stock"
            value={productForm.stockQuantity}
            onChange={(event) => onForm({ ...productForm, stockQuantity: event.target.value })}
            required
          />
          <div className="grid gap-2 sm:grid-cols-2">
            {([
              ["Best seller", "isBestSeller"],
              ["Robomaniac item", "isRobomaniacItem"],
              ["Software", "isSoftware"],
              ["Active", "isActive"],
            ] as [string, keyof ProductForm][]).map(([label, key]) => (
              <label key={key} className="admin-checkbox-row">
                <input
                  type="checkbox"
                  checked={Boolean(productForm[key])}
                  onChange={(event) => onForm({ ...productForm, [key]: event.target.checked })}
                />
                {label}
              </label>
            ))}
          </div>
          <button className="admin-button admin-button-primary" disabled={isLoading}>
            {productForm.id ? "Update Product" : "Create Product"}
          </button>
        </div>
      </form>

      {/* Multi-media manager — only shown when editing an existing product */}
      {productForm.id && (
        <div className="admin-card p-5">
          <ProductMediaManager productId={productForm.id} token={token} />
        </div>
      )}
    </div>
  );
}
