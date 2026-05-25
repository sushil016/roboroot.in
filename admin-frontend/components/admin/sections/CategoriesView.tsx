"use client";

import { useState } from "react";
import { 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  createSubcategory, 
  updateSubcategory, 
  deleteSubcategory,
  type CategoryPayload 
} from "@/api/categories";
import { API_BASE_URL } from "@/config/env";

export function CategoriesView({
  categories,
  token,
  onReload,
}: {
  categories: any[];
  token: string;
  onReload: () => void;
}) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  
  // Category Form State
  const [categoryName, setCategoryName] = useState("");
  const [categoryDesc, setCategoryDesc] = useState("");
  const [categoryImage, setCategoryImage] = useState("");
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);

  // Subcategory Form State
  const [subName, setSubName] = useState("");
  const [subDesc, setSubDesc] = useState("");
  const [subImage, setSubImage] = useState("");
  const [isSubmittingSub, setIsSubmittingSub] = useState(false);

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryName) return;
    setIsSubmittingCat(true);
    try {
      await createCategory({ name: categoryName, description: categoryDesc, imageUrl: categoryImage }, token);
      setCategoryName("");
      setCategoryDesc("");
      setCategoryImage("");
      onReload();
    } catch (err) {
      alert("Failed to create category");
    } finally {
      setIsSubmittingCat(false);
    }
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm("Are you sure? This will delete the category and its subcategories.")) return;
    try {
      await deleteCategory(id, token);
      if (selectedCategoryId === id) setSelectedCategoryId(null);
      onReload();
    } catch (err) {
      alert("Failed to delete category");
    }
  }

  async function handleCreateSubcategory(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCategoryId || !subName) return;
    setIsSubmittingSub(true);
    try {
      await createSubcategory(selectedCategoryId, { name: subName, description: subDesc, imageUrl: subImage }, token);
      setSubName("");
      setSubDesc("");
      setSubImage("");
      onReload();
    } catch (err) {
      alert("Failed to create subcategory");
    } finally {
      setIsSubmittingSub(false);
    }
  }

  async function handleDeleteSubcategory(categoryId: string, subId: string) {
    if (!confirm("Are you sure you want to delete this subcategory?")) return;
    try {
      await deleteSubcategory(categoryId, subId, token);
      onReload();
    } catch (err) {
      alert("Failed to delete subcategory");
    }
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[1fr_400px]">
      <div className="flex flex-col gap-6">
        <div className="admin-card p-5">
          <h2 className="admin-card-title mb-4">Categories</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <div 
                key={category.id} 
                onClick={() => setSelectedCategoryId(category.id)}
                className={`cursor-pointer overflow-hidden rounded-xl border bg-white text-left transition hover:shadow-sm ${
                  selectedCategoryId === category.id ? "border-zinc-400 ring-2 ring-zinc-200" : "border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <div className="relative h-28 bg-[#222222]">
                  {category.imageUrl && <img src={category.imageUrl} alt="" className="h-full w-full object-cover opacity-55" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent" />
                  <p className="absolute bottom-3 left-4 text-lg font-bold text-white">{category.name}</p>
                </div>
                <div className="p-4">
                  <p className="text-sm font-semibold text-zinc-500">{category.subcategories?.length || 0} subcategories</p>
                  <div className="mt-4 flex justify-end">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteCategory(category.id); }}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card p-5">
          <h3 className="admin-eyebrow mb-4">Create New Category</h3>
          <form onSubmit={handleCreateCategory} className="grid gap-4 max-w-lg">
            <input 
              className="admin-input" 
              placeholder="Category Name (e.g. Drones)" 
              value={categoryName} 
              onChange={e => setCategoryName(e.target.value)} 
              required 
            />
            <input 
              className="admin-input" 
              placeholder="Description (Optional)" 
              value={categoryDesc} 
              onChange={e => setCategoryDesc(e.target.value)} 
            />
            <div>
              <label className="text-xs font-semibold text-zinc-500 mb-1 block">Upload Category Image</label>
              <input 
                className="admin-input" 
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
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
                      setCategoryImage(json.url);
                    } else {
                      alert("Upload failed: " + json.error);
                    }
                  } catch (err) {
                    alert("Upload error.");
                  }
                }}
              />
            </div>
            {categoryImage && (
              <input 
                className="admin-input" 
                placeholder="Image URL" 
                value={categoryImage} 
                onChange={e => setCategoryImage(e.target.value)} 
              />
            )}
            <button disabled={isSubmittingCat || !categoryName} className="admin-button admin-button-primary">
              {isSubmittingCat ? "Creating..." : "Create Category"}
            </button>
          </form>
        </div>
      </div>

      <aside className="flex flex-col gap-6">
        {selectedCategory ? (
          <>
            <div className="admin-card p-5">
              <p className="admin-eyebrow">Subcategories for {selectedCategory.name}</p>
              <div className="mt-4 flex flex-col gap-3">
                {selectedCategory.subcategories?.map((sub: any) => (
                  <div key={sub.id} className="flex items-center justify-between rounded-md border border-zinc-200 px-3 py-2 text-sm font-semibold">
                    <span>{sub.name}</span>
                    <button 
                      onClick={() => handleDeleteSubcategory(selectedCategory.id, sub.id)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                ))}
                {(!selectedCategory.subcategories || selectedCategory.subcategories.length === 0) && (
                  <p className="text-sm text-zinc-500">No subcategories yet.</p>
                )}
              </div>
            </div>

            <div className="admin-card p-5">
              <p className="admin-eyebrow mb-4">Add Subcategory</p>
              <form onSubmit={handleCreateSubcategory} className="grid gap-4">
                <input 
                  className="admin-input" 
                  placeholder="Subcategory Name" 
                  value={subName} 
                  onChange={e => setSubName(e.target.value)} 
                  required 
                />
                <input 
                  className="admin-input" 
                  placeholder="Description (Optional)" 
                  value={subDesc} 
                  onChange={e => setSubDesc(e.target.value)} 
                />
                <div>
                  <label className="text-xs font-semibold text-zinc-500 mb-1 block">Upload Subcategory Image</label>
                  <input 
                    className="admin-input" 
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
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
                          setSubImage(json.url);
                        } else {
                          alert("Upload failed: " + json.error);
                        }
                      } catch (err) {
                        alert("Upload error.");
                      }
                    }}
                  />
                </div>
                {subImage && (
                  <input 
                    className="admin-input" 
                    placeholder="Image URL" 
                    value={subImage} 
                    onChange={e => setSubImage(e.target.value)} 
                  />
                )}
                <button disabled={isSubmittingSub || !subName} className="admin-button admin-button-primary">
                  {isSubmittingSub ? "Adding..." : "Add Subcategory"}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="admin-card p-5 text-center text-sm text-zinc-500">
            Select a category to view and manage its subcategories.
          </div>
        )}
      </aside>
    </section>
  );
}
