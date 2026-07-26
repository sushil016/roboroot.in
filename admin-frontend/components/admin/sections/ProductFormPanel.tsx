"use client";

/* eslint-disable @next/next/no-img-element */

import { useState, useRef, type FormEvent } from "react";
import type { ProductForm, ProductType } from "@/types";
import { productTypes } from "@/config/forms";
import { compactType, productImage } from "@/utils";
import { useAdmin } from "@/core/context/AdminContext";
import { ProductMediaManager } from "./ProductMediaManager";
import { API_BASE_URL } from "@/config/env";
import { RichTextEditor } from "../RichTextEditor";

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
  const { token, setStatus, setIsLoading } = useAdmin();
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [uploadingImage, setUploadingImage] = useState(false);
  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);

  // AI Auto-Fill Handler
  async function handleAiGenerate() {
    if (!productForm.name.trim() || !token) return;
    setIsLoading(true);
    setStatus("AI is generating product details...");
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/products/ai-generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: productForm.name }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Generation failed");

      const data = json.data;
      onForm({
        ...productForm,
        description: data.description || productForm.description,
        typicalUseCase: data.typicalUseCase || productForm.typicalUseCase,
        category: data.category || productForm.category,
        subcategory: data.subcategory || productForm.subcategory,
        brand: data.brand || productForm.brand,
        tags: Array.isArray(data.tags) ? data.tags.join(", ") : productForm.tags,
        unitPrice: data.suggestedPriceINR ? data.suggestedPriceINR.toString() : productForm.unitPrice,
      });
      setStatus("Product details auto-filled by AI!");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "AI generation failed");
    } finally {
      setIsLoading(false);
    }
  }

  // Markdown Formatting Helper
  const insertFormatting = (prefix: string, suffix: string = "", defaultPlaceholder: string = "text") => {
    const textarea = descriptionTextareaRef.current;
    const currentValue = productForm.description || "";

    if (!textarea) {
      onForm({ ...productForm, description: currentValue + `${prefix}${defaultPlaceholder}${suffix}` });
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = currentValue.substring(start, end) || defaultPlaceholder;
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newValue = currentValue.substring(0, start) + replacement + currentValue.substring(end);
    onForm({ ...productForm, description: newValue });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  };

  // Simple Markdown renderer for Live Preview
  const renderMarkdownPreview = (text: string) => {
    if (!text) return <p className="text-zinc-400 italic">Nothing to preview yet.</p>;

    const lines = text.split("\n");
    return lines.map((line, idx) => {
      if (line.startsWith("# ")) {
        return <h1 key={idx} className="text-2xl font-black text-[#222222] my-2">{line.replace("# ", "")}</h1>;
      }
      if (line.startsWith("## ")) {
        return <h2 key={idx} className="text-xl font-extrabold text-[#222222] my-2">{line.replace("## ", "")}</h2>;
      }
      if (line.startsWith("### ")) {
        return <h3 key={idx} className="text-lg font-bold text-[#222222] my-1.5">{line.replace("### ", "")}</h3>;
      }
      if (line.startsWith("- ")) {
        return <li key={idx} className="ml-4 list-disc text-sm text-zinc-700 font-medium my-0.5">{line.replace("- ", "")}</li>;
      }
      if (line.startsWith("> ")) {
        return <blockquote key={idx} className="border-l-4 border-[#1CA2D1] pl-3 italic text-zinc-600 my-2">{line.replace("> ", "")}</blockquote>;
      }
      if (line.startsWith("```")) {
        return <pre key={idx} className="bg-zinc-900 text-zinc-200 p-3 rounded-lg text-xs font-mono my-2 overflow-x-auto">{line.replace(/```/g, "")}</pre>;
      }

      if (!line.trim()) return <br key={idx} />;

      return (
        <p key={idx} className="text-sm leading-relaxed text-zinc-800 font-medium my-1">
          {line}
        </p>
      );
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      
      {/* HEADER SECTION CARD */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-xs font-black uppercase text-[#1CA2D1] tracking-wider mb-2">
            <span>Storefront Catalog</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#222222]">
            {productForm.id ? `Edit: ${productForm.name || "Untitled Product"}` : "Create New Product"}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 font-semibold mt-1">
            Manage product specs, pricing, inventory stock, and media gallery.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {productForm.category && (
            <span className="h-8 px-3 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-bold text-zinc-700 inline-flex items-center">
              {productForm.category}
            </span>
          )}
          <span className="h-8 px-3 rounded-full bg-cyan-50 border border-cyan-200 text-xs font-bold text-[#1CA2D1] inline-flex items-center">
            {compactType(productForm.productType)}
          </span>
          {productForm.isBestSeller && (
            <span className="h-8 px-3 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-600 inline-flex items-center">
              ★ Best Seller
            </span>
          )}
          <button
            type="button"
            onClick={onNew}
            className="h-8 px-4 rounded-full bg-[#222222] hover:bg-[#1CA2D1] text-xs font-bold text-white transition cursor-pointer"
          >
            + New
          </button>
        </div>
      </div>

      {/* CARD 1: CORE IDENTIFICATION & CLASSIFICATION */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div>
            <h2 className="text-lg font-extrabold text-[#222222]">Product Identification & Category</h2>
            <p className="text-xs text-zinc-500 font-medium">Names, SKU, category, and brand details</p>
          </div>
          <button
            type="button"
            disabled={!productForm.name.trim() || isLoading}
            onClick={handleAiGenerate}
            className="h-9 px-4 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-extrabold transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-2xs"
          >
            <span>✨ AI Auto-Fill Specs</span>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-500 mb-1.5 block">Product Name *</label>
            <input
              className="w-full h-11 px-4 text-sm font-semibold rounded-xl border border-zinc-300 focus:outline-none focus:border-[#1CA2D1] bg-zinc-50 focus:bg-white transition"
              placeholder="e.g. ESP32-S3 WROOM Dual-Core Wi-Fi & Bluetooth Module"
              value={productForm.name}
              onChange={(e) => onForm({ ...productForm, name: e.target.value })}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-zinc-500 mb-1.5 block">SKU / Stock Keeping Unit</label>
              <input
                className="w-full h-11 px-4 text-sm font-semibold rounded-xl border border-zinc-300 focus:outline-none focus:border-[#1CA2D1] bg-zinc-50 focus:bg-white transition"
                placeholder="e.g. RR-ESP32-S3-WROOM"
                value={productForm.sku}
                onChange={(e) => onForm({ ...productForm, sku: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-500 mb-1.5 block">URL Slug (Optional)</label>
              <input
                className="w-full h-11 px-4 text-sm font-semibold rounded-xl border border-zinc-300 focus:outline-none focus:border-[#1CA2D1] bg-zinc-50 focus:bg-white transition"
                placeholder="e.g. esp32-s3-wroom-module"
                value={productForm.slug}
                onChange={(e) => onForm({ ...productForm, slug: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-zinc-500 mb-1.5 block">Category *</label>
              <input
                className="w-full h-11 px-4 text-sm font-semibold rounded-xl border border-zinc-300 focus:outline-none focus:border-[#1CA2D1] bg-zinc-50 focus:bg-white transition"
                placeholder="e.g. Microcontrollers"
                value={productForm.category}
                onChange={(e) => onForm({ ...productForm, category: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-500 mb-1.5 block">Subcategory *</label>
              <input
                className="w-full h-11 px-4 text-sm font-semibold rounded-xl border border-zinc-300 focus:outline-none focus:border-[#1CA2D1] bg-zinc-50 focus:bg-white transition"
                placeholder="e.g. ESP32 Boards"
                value={productForm.subcategory}
                onChange={(e) => onForm({ ...productForm, subcategory: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-zinc-500 mb-1.5 block">Product Type *</label>
              <select
                className="w-full h-11 px-3.5 text-sm font-semibold rounded-xl border border-zinc-300 focus:outline-none focus:border-[#1CA2D1] bg-zinc-50 focus:bg-white transition cursor-pointer"
                value={productForm.productType}
                onChange={(e) => onForm({ ...productForm, productType: e.target.value as ProductType })}
              >
                {productTypes.map((type) => (
                  <option key={type} value={type}>
                    {compactType(type)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-500 mb-1.5 block">Brand / Manufacturer</label>
              <input
                className="w-full h-11 px-4 text-sm font-semibold rounded-xl border border-zinc-300 focus:outline-none focus:border-[#1CA2D1] bg-zinc-50 focus:bg-white transition"
                placeholder="e.g. Espressif / Robomaniac"
                value={productForm.brand}
                onChange={(e) => onForm({ ...productForm, brand: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-500 mb-1.5 block">Tags (comma separated)</label>
            <input
              className="w-full h-11 px-4 text-sm font-semibold rounded-xl border border-zinc-300 focus:outline-none focus:border-[#1CA2D1] bg-zinc-50 focus:bg-white transition"
              placeholder="e.g. esp32, wifi, bluetooth, dual-core, microcontroller"
              value={productForm.tags}
              onChange={(e) => onForm({ ...productForm, tags: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* CARD 2: RICH TEXT DESCRIPTION WITH WYSIWYG CONTROLS */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="border-b border-zinc-100 pb-3">
          <h2 className="text-lg font-extrabold text-[#222222]">Description & Usage Info</h2>
          <p className="text-xs text-zinc-500 font-medium">Full product specification description and typical use cases</p>
        </div>

        <RichTextEditor
          value={productForm.description}
          onChange={(val) => onForm({ ...productForm, description: val })}
          placeholder="Write detailed product description, pinout specifications, and technical features..."
          minHeight="220px"
        />

        <div>
          <label className="text-xs font-bold text-zinc-500 mb-1.5 block">Typical Use Case & Applications</label>
          <textarea
            className="w-full min-h-[90px] p-3.5 text-xs font-semibold leading-relaxed rounded-2xl border border-zinc-300 focus:outline-none focus:border-[#1CA2D1] bg-zinc-50 focus:bg-white"
            placeholder="e.g. Suitable for smart home automation, drone telemetry, and wireless sensor nodes."
            value={productForm.typicalUseCase}
            onChange={(e) => onForm({ ...productForm, typicalUseCase: e.target.value })}
          />
        </div>
      </div>

      {/* CARD 3: PRICING, INVENTORY & VENDOR INFO */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="border-b border-zinc-100 pb-3">
          <h2 className="text-lg font-extrabold text-[#222222]">Pricing, Stock & Sourcing</h2>
          <p className="text-xs text-zinc-500 font-medium">Unit pricing in INR, discount sale price, stock, and supplier link</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-xs font-bold text-zinc-500 mb-1.5 block">Unit Price (₹ INR) *</label>
            <input
              className="w-full h-11 px-4 text-sm font-semibold rounded-xl border border-zinc-300 focus:outline-none focus:border-[#1CA2D1] bg-zinc-50 focus:bg-white transition"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 499"
              value={productForm.unitPrice}
              onChange={(e) => onForm({ ...productForm, unitPrice: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-500 mb-1.5 block">Sale Price (₹ INR - Optional)</label>
            <input
              className="w-full h-11 px-4 text-sm font-semibold rounded-xl border border-zinc-300 focus:outline-none focus:border-[#1CA2D1] bg-zinc-50 focus:bg-white transition"
              type="number"
              min="0"
              step="0.01"
              placeholder="Discounted price"
              value={productForm.discountedPrice}
              onChange={(e) => onForm({ ...productForm, discountedPrice: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-500 mb-1.5 block">Stock Quantity *</label>
            <input
              className="w-full h-11 px-4 text-sm font-semibold rounded-xl border border-zinc-300 focus:outline-none focus:border-[#1CA2D1] bg-zinc-50 focus:bg-white transition"
              type="number"
              min="0"
              placeholder="e.g. 50"
              value={productForm.stockQuantity}
              onChange={(e) => onForm({ ...productForm, stockQuantity: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-zinc-500 mb-1.5 block">Vendor / Supplier Link (Optional)</label>
          <input
            className="w-full h-11 px-4 text-sm font-semibold rounded-xl border border-zinc-300 focus:outline-none focus:border-[#1CA2D1] bg-zinc-50 focus:bg-white transition"
            placeholder="https://..."
            value={productForm.vendorLink}
            onChange={(e) => onForm({ ...productForm, vendorLink: e.target.value })}
          />
        </div>
      </div>

      {/* CARD 4: PRODUCT MEDIA & MULTI-IMAGE GALLERY */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
        <div className="border-b border-zinc-100 pb-3">
          <h2 className="text-lg font-extrabold text-[#222222]">Product Main Image & Media Gallery</h2>
          <p className="text-xs text-zinc-500 font-medium">Main storefront image and additional product photos or videos</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-12 items-start">
          {/* Main Image Preview Box */}
          <div className="sm:col-span-4 flex flex-col items-center">
            <div className="size-48 rounded-2xl border border-zinc-200 bg-zinc-50 p-2 flex items-center justify-center overflow-hidden shadow-xs">
              <img
                src={productForm.imageUrl || productImage()}
                alt="Product Main Preview"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <p className="text-[11px] font-bold text-zinc-400 mt-2">Main Product Image Preview</p>
          </div>

          {/* Upload Controls */}
          <div className="sm:col-span-8 space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-500 mb-1.5 block">Upload Primary Image</label>
              <input
                className="w-full text-xs text-zinc-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#222222] file:text-white hover:file:bg-[#1CA2D1] file:cursor-pointer cursor-pointer"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    setUploadingImage(true);
                    const url = URL.createObjectURL(file);
                    onForm({ ...productForm, imageUrl: url });
                    
                    const formData = new FormData();
                    formData.append("file", file);
                    try {
                      const res = await fetch(`${API_BASE_URL}/api/components/upload/image`, {
                        method: "POST",
                        headers: { Authorization: `Bearer ${token}` },
                        body: formData,
                      });
                      const json = await res.json();
                      if (json.success && json.data?.url) {
                        onForm({ ...productForm, imageUrl: json.data.url });
                      } else {
                        alert("Upload failed: " + (json.error || "Error"));
                      }
                    } catch {
                      alert("Upload error.");
                    } finally {
                      setUploadingImage(false);
                    }
                  }
                }}
              />
              <p className="text-[11px] text-zinc-400 font-medium mt-1">Recommended: Square 800×800px PNG/JPEG/WebP</p>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-500 mb-1.5 block">Or Paste Image URL</label>
              <input
                className="w-full h-11 px-4 text-xs font-semibold rounded-xl border border-zinc-300 focus:outline-none focus:border-[#1CA2D1] bg-zinc-50 focus:bg-white"
                placeholder="https://..."
                value={productForm.imageUrl}
                onChange={(e) => onForm({ ...productForm, imageUrl: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Product Media Manager (Multi-Image + Video Gallery) */}
        {productForm.id && token && (
          <div className="pt-5 border-t border-zinc-100">
            <ProductMediaManager productId={productForm.id} token={token} />
          </div>
        )}
      </div>

      {/* CARD 5: STOREFRONT FLAGS & VISIBILITY */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="border-b border-zinc-100 pb-3">
          <h2 className="text-lg font-extrabold text-[#222222]">Storefront Flags & Visibility</h2>
          <p className="text-xs text-zinc-500 font-medium">Control featured badges and catalog visibility</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-3 p-4 rounded-2xl border border-zinc-200 bg-zinc-50 cursor-pointer hover:border-zinc-300 transition">
            <input
              type="checkbox"
              className="size-4 rounded text-[#1CA2D1] focus:ring-0"
              checked={Boolean(productForm.isBestSeller)}
              onChange={(e) => onForm({ ...productForm, isBestSeller: e.target.checked })}
            />
            <div>
              <p className="text-xs font-extrabold text-[#222222]">Best Seller Item</p>
              <p className="text-[10px] font-semibold text-zinc-500">Showcase in Bestseller section</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 rounded-2xl border border-zinc-200 bg-zinc-50 cursor-pointer hover:border-zinc-300 transition">
            <input
              type="checkbox"
              className="size-4 rounded text-[#1CA2D1] focus:ring-0"
              checked={Boolean(productForm.isRobomaniacItem)}
              onChange={(e) => onForm({ ...productForm, isRobomaniacItem: e.target.checked })}
            />
            <div>
              <p className="text-xs font-extrabold text-[#222222]">Robomaniac Branded Item</p>
              <p className="text-[10px] font-semibold text-zinc-500">Flag as official Robomaniac course product</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 rounded-2xl border border-zinc-200 bg-zinc-50 cursor-pointer hover:border-zinc-300 transition">
            <input
              type="checkbox"
              className="size-4 rounded text-[#1CA2D1] focus:ring-0"
              checked={Boolean(productForm.isSoftware)}
              onChange={(e) => onForm({ ...productForm, isSoftware: e.target.checked })}
            />
            <div>
              <p className="text-xs font-extrabold text-[#222222]">Software Product</p>
              <p className="text-[10px] font-semibold text-zinc-500">BlockSquare / software download item</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 rounded-2xl border border-zinc-200 bg-zinc-50 cursor-pointer hover:border-zinc-300 transition">
            <input
              type="checkbox"
              className="size-4 rounded text-[#1CA2D1] focus:ring-0"
              checked={Boolean(productForm.isActive)}
              onChange={(e) => onForm({ ...productForm, isActive: e.target.checked })}
            />
            <div>
              <p className="text-xs font-extrabold text-[#222222]">Active (Visible in Store)</p>
              <p className="text-[10px] font-semibold text-zinc-500">Visible to customers in storefront catalog</p>
            </div>
          </label>
        </div>
      </div>

      {/* STICKY BOTTOM ACTION BAR */}
      <div className="sticky bottom-4 z-20 bg-[#222222] text-white border border-zinc-800 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4 backdrop-blur-md">
        <div className="min-w-0 hidden sm:block">
          <p className="text-xs font-black truncate">{productForm.name || "Untitled Product"}</p>
          <p className="text-[10px] text-zinc-400 font-semibold">
            ₹{productForm.unitPrice || "0"} • Stock: {productForm.stockQuantity || "0"}
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading || uploadingImage}
          className="h-11 px-8 rounded-xl bg-[#1CA2D1] hover:bg-cyan-500 text-xs font-black text-white transition flex items-center justify-center gap-2 shadow-sm cursor-pointer ml-auto disabled:opacity-50"
        >
          {uploadingImage ? (
            <span>Uploading Image...</span>
          ) : isLoading ? (
            <span>Saving Product...</span>
          ) : (
            <span>{productForm.id ? "Save & Update Product" : "Publish New Product"}</span>
          )}
        </button>
      </div>

    </form>
  );
}
