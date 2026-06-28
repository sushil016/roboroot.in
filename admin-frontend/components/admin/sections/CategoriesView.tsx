"use client";

import { useState } from "react";
import { 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  createSubcategory, 
  updateSubcategory, 
  deleteSubcategory,
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
  
  // Category Form State (Create)
  const [categoryName, setCategoryName] = useState("");
  const [categoryDesc, setCategoryDesc] = useState("");
  const [categoryImage, setCategoryImage] = useState("");
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Category Form State (Edit)
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [editCatName, setEditCatName] = useState("");
  const [editCatDesc, setEditCatDesc] = useState("");
  const [editCatImage, setEditCatImage] = useState("");

  // Subcategory Form State (Create)
  const [subName, setSubName] = useState("");
  const [subDesc, setSubDesc] = useState("");
  const [isSubmittingSub, setIsSubmittingSub] = useState(false);

  // Subcategory Form State (Edit)
  const [editingSubcategory, setEditingSubcategory] = useState<any | null>(null);
  const [editSubName, setEditSubName] = useState("");
  const [editSubDesc, setEditSubDesc] = useState("");

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

  async function handleUpdateCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCategory || !editCatName) return;
    setIsSubmittingCat(true);
    try {
      await updateCategory(editingCategory.id, { name: editCatName, description: editCatDesc, imageUrl: editCatImage }, token);
      setEditingCategory(null);
      onReload();
    } catch (err) {
      alert("Failed to update category");
    } finally {
      setIsSubmittingCat(false);
    }
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm("Are you sure? This will delete the category and its subcategories.")) return;
    try {
      await deleteCategory(id, token);
      if (selectedCategoryId === id) setSelectedCategoryId(null);
      if (editingCategory?.id === id) setEditingCategory(null);
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
      await createSubcategory(selectedCategoryId, { name: subName, description: subDesc }, token);
      setSubName("");
      setSubDesc("");
      onReload();
    } catch (err) {
      alert("Failed to create subcategory");
    } finally {
      setIsSubmittingSub(false);
    }
  }

  async function handleUpdateSubcategory(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCategoryId || !editingSubcategory || !editSubName) return;
    setIsSubmittingSub(true);
    try {
      await updateSubcategory(selectedCategoryId, editingSubcategory.id, { name: editSubName, description: editSubDesc }, token);
      setEditingSubcategory(null);
      onReload();
    } catch (err) {
      alert("Failed to update subcategory");
    } finally {
      setIsSubmittingSub(false);
    }
  }

  async function handleDeleteSubcategory(categoryId: string, subId: string) {
    if (!confirm("Are you sure you want to delete this subcategory?")) return;
    try {
      await deleteSubcategory(categoryId, subId, token);
      if (editingSubcategory?.id === subId) setEditingSubcategory(null);
      onReload();
    } catch (err) {
      alert("Failed to delete subcategory");
    }
  }

  const startEditCategory = (category: any) => {
    setEditingCategory(category);
    setEditCatName(category.name);
    setEditCatDesc(category.description || "");
    setEditCatImage(category.imageUrl || "");
  };

  const startEditSubcategory = (sub: any) => {
    setEditingSubcategory(sub);
    setEditSubName(sub.name);
    setEditSubDesc(sub.description || "");
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_400px] font-sans">
      <div className="flex flex-col gap-6">
        {/* Categories List */}
        <div className="admin-card p-6 bg-white border border-zinc-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold tracking-tight text-[#222222]">Categories</h2>
            <span className="text-xs bg-zinc-100 font-semibold px-2.5 py-1 rounded-full text-zinc-600">
              Total {categories.length}
            </span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <div 
                key={category.id} 
                onClick={() => setSelectedCategoryId(category.id)}
                className={`group relative flex flex-col cursor-pointer overflow-hidden rounded-xl border bg-white text-left transition duration-200 hover:shadow-md ${
                  selectedCategoryId === category.id 
                    ? "border-[#222222] ring-2 ring-zinc-950/5" 
                    : "border-zinc-200 hover:border-zinc-300"
                }`}
              >
                {/* Image background block */}
                <div className="relative h-32 bg-zinc-900 overflow-hidden">
                  {category.imageUrl ? (
                    <img 
                      src={category.imageUrl} 
                      alt={category.name} 
                      className="h-full w-full object-cover opacity-60 transition duration-300 group-hover:scale-105" 
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-zinc-100 text-zinc-400">
                      <span className="text-xs font-semibold uppercase tracking-wider">No Image</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent" />
                  <p className="absolute bottom-3 left-4 text-base font-bold text-white tracking-tight leading-none">
                    {category.name}
                  </p>
                </div>

                <div className="p-4 flex flex-1 flex-col justify-between">
                  <p className="text-xs font-medium text-zinc-500">
                    {category.subcategories?.length || 0} subcategories
                  </p>
                  
                  {category.description && (
                    <p className="mt-1 text-xs text-zinc-400 line-clamp-1">
                      {category.description}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-zinc-100 flex justify-end gap-3">
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        startEditCategory(category); 
                      }}
                      className="text-xs font-bold text-[#1CA2D1] hover:underline"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleDeleteCategory(category.id); 
                      }}
                      className="text-xs font-bold text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create / Edit Category Panel */}
        {editingCategory ? (
          <div className="admin-card p-6 bg-white border border-zinc-200 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold tracking-tight text-[#222222]">Edit Category: <span className="text-[#1CA2D1]">{editingCategory.name}</span></h3>
              <button 
                onClick={() => setEditingCategory(null)} 
                className="text-xs font-bold text-zinc-500 hover:underline"
              >
                Cancel
              </button>
            </div>
            
            <form onSubmit={handleUpdateCategory} className="grid gap-4 max-w-lg">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-500">Category Name</label>
                <input 
                  className="admin-input" 
                  placeholder="Category Name" 
                  value={editCatName} 
                  onChange={e => setEditCatName(e.target.value)} 
                  required 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-500">Description</label>
                <input 
                  className="admin-input" 
                  placeholder="Description (Optional)" 
                  value={editCatDesc} 
                  onChange={e => setEditCatDesc(e.target.value)} 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-500">Upload Category Image</label>
                <input 
                  className="admin-input py-1.5 cursor-pointer" 
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  disabled={isUploading}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setIsUploading(true);
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
                        setEditCatImage(json.url);
                      } else {
                        alert("Upload failed: " + json.error);
                      }
                    } catch (err) {
                      alert("Upload error.");
                    } finally {
                      setIsUploading(false);
                    }
                  }}
                />
              </div>

              {editCatImage && (
                <div className="flex items-center gap-4 mt-1">
                  <div className="relative w-28 h-20 rounded-lg overflow-hidden border border-zinc-200 shrink-0">
                    <img src={editCatImage} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditCatImage("")}
                    className="text-xs font-bold text-red-500 hover:underline border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
                  >
                    Remove Image
                  </button>
                </div>
              )}

              <button 
                disabled={isSubmittingCat || isUploading || !editCatName} 
                className="admin-button admin-button-primary mt-2"
              >
                {isUploading ? "Uploading Image..." : isSubmittingCat ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        ) : (
          <div className="admin-card p-6 bg-white border border-zinc-200 rounded-2xl shadow-xs">
            <h3 className="text-lg font-bold tracking-tight text-[#222222] mb-5">Create New Category</h3>
            
            <form onSubmit={handleCreateCategory} className="grid gap-4 max-w-lg">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-500">Category Name</label>
                <input 
                  className="admin-input" 
                  placeholder="Category Name (e.g. Drones & Aerospace)" 
                  value={categoryName} 
                  onChange={e => setCategoryName(e.target.value)} 
                  required 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-500">Description</label>
                <input 
                  className="admin-input" 
                  placeholder="Description (Optional)" 
                  value={categoryDesc} 
                  onChange={e => setCategoryDesc(e.target.value)} 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-500">Upload Category Image</label>
                <input 
                  className="admin-input py-1.5 cursor-pointer" 
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  disabled={isUploading}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setIsUploading(true);
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
                    } finally {
                      setIsUploading(false);
                    }
                  }}
                />
              </div>

              {categoryImage && (
                <div className="flex items-center gap-4 mt-1">
                  <div className="relative w-28 h-20 rounded-lg overflow-hidden border border-zinc-200 shrink-0">
                    <img src={categoryImage} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setCategoryImage("")}
                    className="text-xs font-bold text-red-500 hover:underline border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
                  >
                    Remove Image
                  </button>
                </div>
              )}

              <button 
                disabled={isSubmittingCat || isUploading || !categoryName} 
                className="admin-button admin-button-primary mt-2"
              >
                {isUploading ? "Uploading Image..." : isSubmittingCat ? "Creating..." : "Create Category"}
              </button>
            </form>
          </div>
        )}
      </div>

      <aside className="flex flex-col gap-6">
        {selectedCategory ? (
          <>
            {/* Subcategories Panel */}
            <div className="admin-card p-6 bg-white border border-zinc-200 rounded-2xl shadow-xs">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400 mb-4">
                Subcategories for {selectedCategory.name}
              </p>
              
              <div className="flex flex-col gap-3">
                {selectedCategory.subcategories?.map((sub: any) => (
                  <div 
                    key={sub.id} 
                    className="flex flex-col gap-1 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 transition hover:bg-zinc-50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span className="font-bold text-sm text-[#222222]">{sub.name}</span>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => startEditSubcategory(sub)}
                          className="text-xs font-bold text-[#1CA2D1] hover:underline"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteSubcategory(selectedCategory.id, sub.id)}
                          className="text-xs font-bold text-red-500 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    {sub.description && (
                      <p className="text-xs text-zinc-500 mt-1 font-medium leading-relaxed">
                        {sub.description}
                      </p>
                    )}
                  </div>
                ))}
                
                {(!selectedCategory.subcategories || selectedCategory.subcategories.length === 0) && (
                  <div className="py-6 text-center text-xs font-semibold text-zinc-400">
                    No subcategories yet.
                  </div>
                )}
              </div>
            </div>

            {/* Create / Edit Subcategory Panel */}
            {editingSubcategory ? (
              <div className="admin-card p-6 bg-white border border-zinc-200 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
                    Edit Subcategory
                  </p>
                  <button 
                    onClick={() => setEditingSubcategory(null)} 
                    className="text-xs font-bold text-zinc-500 hover:underline"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleUpdateSubcategory} className="grid gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-zinc-500">Subcategory Name</label>
                    <input 
                      className="admin-input" 
                      placeholder="Subcategory Name" 
                      value={editSubName} 
                      onChange={e => setEditSubName(e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-zinc-500">Description</label>
                    <input 
                      className="admin-input" 
                      placeholder="Description (Optional)" 
                      value={editSubDesc} 
                      onChange={e => setEditSubDesc(e.target.value)} 
                    />
                  </div>

                  <button 
                    disabled={isSubmittingSub || !editSubName} 
                    className="admin-button admin-button-primary mt-1"
                  >
                    {isSubmittingSub ? "Saving..." : "Save Changes"}
                  </button>
                </form>
              </div>
            ) : (
              <div className="admin-card p-6 bg-white border border-zinc-200 rounded-2xl shadow-xs">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400 mb-4">
                  Add Subcategory
                </p>

                <form onSubmit={handleCreateSubcategory} className="grid gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-zinc-500">Subcategory Name</label>
                    <input 
                      className="admin-input" 
                      placeholder="Subcategory Name" 
                      value={subName} 
                      onChange={e => setSubName(e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-zinc-500">Description</label>
                    <input 
                      className="admin-input" 
                      placeholder="Description (Optional)" 
                      value={subDesc} 
                      onChange={e => setSubDesc(e.target.value)} 
                    />
                  </div>

                  <button 
                    disabled={isSubmittingSub || !subName} 
                    className="admin-button admin-button-primary mt-1"
                  >
                    {isSubmittingSub ? "Adding..." : "Add Subcategory"}
                  </button>
                </form>
              </div>
            )}
          </>
        ) : (
          <div className="admin-card p-8 bg-white border border-zinc-200 rounded-2xl shadow-xs text-center text-xs font-bold tracking-wide text-zinc-400">
            Select a category to view and manage its subcategories.
          </div>
        )}
      </aside>
    </div>
  );
}
