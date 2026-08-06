"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Modal from "@/components/Modal";
import MediaUploader from "@/components/MediaUploader";
import BulkUploadModal from "@/components/BulkUploadModal";

const EMPTY_FORM = {
  name: "",
  sku: "",
  category: "",
  price: "",
  compareAtPrice: "",
  unit: "piece",
  stock: 0,
  lowStockThreshold: 5,
  description: "",
  isFeatured: false,
  isActive: true,
  media: [],
};

const PAGE_SIZE = 20;

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  async function loadProducts() {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
    if (search) params.set("search", search);
    const res = await fetch(`/api/products?${params.toString()}`);
    const data = await res.json();
    setProducts(data.products || []);
    setPagination(data.pagination || null);
    setLoading(false);
  }

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []));
  }, []);

  // Reset to page 1 whenever the search term changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  function openAdd() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, category: categories[0]?._id || "" });
    setError("");
    setModalOpen(true);
  }

  function openEdit(p) {
  setEditingId(p._id);
  setForm({
    name: p.name || "",
    sku: p.sku || "",
    category: p.category?._id || "",
    price: p.price || "",
    compareAtPrice: p.compareAtPrice || "",
    unit: p.unit || "piece",
    stock: p.stock ?? 0,
    lowStockThreshold: p.lowStockThreshold ?? 5,
    description: p.description || "",
    isFeatured: p.isFeatured ?? false,
    isActive: p.isActive ?? true,
    media: p.media || [],
  });
    setError("");
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        sku: form.sku.trim().toUpperCase(),
        price: Number(form.price),
        compareAtPrice: Number(form.compareAtPrice) || 0,
        stock: Number(form.stock),
        lowStockThreshold: Number(form.lowStockThreshold),
      };
      const res = await fetch(editingId ? `/api/products/${editingId}` : "/api/products", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save product.");
      setModalOpen(false);
      loadProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    // If this was the last item on the current page, step back a page
    if (products.length === 1 && page > 1) {
      setPage((p) => p - 1);
    } else {
      loadProducts();
    }
  }

  function goToPage(p) {
    if (p < 1 || (pagination && p > pagination.totalPages)) return;
    setPage(p);
  }

  const totalPages = pagination?.totalPages || 1;

  function getPageNumbers() {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-maroon">Products</h1>
          <p className="mt-1 text-sm text-muted">
            {pagination ? `${pagination.total} products total` : "Loading..."}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-full border border-gold/30 bg-white px-4 py-2 text-sm outline-none focus:border-maroon"
          />
          <button
            onClick={() => setBulkOpen(true)}
            disabled={categories.length === 0}
            className="rounded-full border border-forest px-6 py-2 text-sm font-semibold text-maroon hover:bg-forest/5 disabled:opacity-50"
            title={categories.length === 0 ? "Add a category first" : ""}
          >
            Bulk Upload
          </button>
          <button
            onClick={openAdd}
            disabled={categories.length === 0}
            className="rounded-full bg-forest px-6 py-2 text-sm font-semibold text-ivory shadow-soft hover:bg-forest-light disabled:opacity-50"
            title={categories.length === 0 ? "Add a category first" : ""}
          >
            + Add Product
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl2 border border-gold/15 bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gold/15 bg-champagne/50 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted">Loading...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted">
                {search ? "No products match your search." : "No products yet. Add your first product."}
              </td></tr>
            ) : (
              products.map((p) => (
                <tr key={p._id} className="border-b border-gold/10 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-ink/70">{p.sku}</td>
                  <td className="flex items-center gap-3 px-4 py-3">
                    <div className="h-10 w-10 overflow-hidden rounded-lg bg-champagne">
                     {p.media?.[0] &&
                        (p.media[0].type === "video" ? (
                          <video
                            src={p.media[0].url}
                            className="h-full w-full object-cover"
                            muted
                          />
                        ) : (
                          <Image
                            src={p.media[0].url}
                            alt=""
                            width={40}
                            height={40}
                            className="h-full w-full object-cover"
                          />
                        ))}
                    </div>
                    <span className="font-medium text-ink">{p.name}</span>
                  </td>
                  <td className="px-4 py-3 text-ink/70">{p.category?.name}</td>
                  <td className="px-4 py-3 text-ink/70">₹{p.price}</td>
                  <td className="px-4 py-3">
                    <span className={p.stock <= p.lowStockThreshold ? "font-semibold text-terracotta" : "text-ink/70"}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${p.isActive ? "bg-forest/10 text-maroon" : "bg-muted/10 text-muted"}`}>
                      {p.isActive ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(p)} className="mr-3 text-xs font-semibold text-maroon hover:underline">Edit</button>
                    <button onClick={() => handleDelete(p._id)} className="text-xs font-semibold text-terracotta hover:underline">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <p className="text-xs text-muted">
            Showing {(pagination.page - 1) * pagination.limit + 1}–
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} products
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              className="rounded-full border border-gold/30 px-3 py-1.5 text-xs font-semibold text-ink/70 hover:bg-champagne disabled:cursor-not-allowed disabled:opacity-40"
            >
              &larr; Prev
            </button>

            {getPageNumbers().map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} className="px-2 text-xs text-muted">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`h-8 w-8 rounded-full text-xs font-semibold transition ${
                    p === page
                      ? "bg-forest text-ivory"
                      : "border border-gold/30 text-ink/70 hover:bg-champagne"
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
              className="rounded-full border border-gold/30 px-3 py-1.5 text-xs font-semibold text-ink/70 hover:bg-champagne disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next &rarr;
            </button>
          </div>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Product" : "Add Product"} wide>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Product Name" required value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <FormField
              label="SKU"
              required
              value={form.sku}
              onChange={(v) => setForm({ ...form, sku: v.toUpperCase() })}
              placeholder="e.g. HC-OIL-001"
            />
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink/70">Category *</span>
            <select
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded-xl border border-gold/30 px-4 py-2.5 text-sm outline-none focus:border-maroon"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-4">
            <FormField label="Price (₹)" required type="number" value={form.price} onChange={(v) => setForm({ ...form, price: v })} />
            <FormField label="Compare Price" type="number" value={form.compareAtPrice} onChange={(v) => setForm({ ...form, compareAtPrice: v })} />
            <FormField label="Unit" value={form.unit} onChange={(v) => setForm({ ...form, unit: v })} placeholder="e.g. 500 ml" />
            <FormField label="Stock" required type="number" value={form.stock} onChange={(v) => setForm({ ...form, stock: v })} />
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink/70">Description</span>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-xl border border-gold/30 px-4 py-2.5 text-sm outline-none focus:border-maroon"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink/70">Product Images / Videos</span>
              <MediaUploader
                media={form.media}
                onChange={(media) =>
                  setForm({
                    ...form,
                    media,
                  })
                }
              />          
              </label>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isFeatured ?? false}
                onChange={(e) =>
                  setForm({
                    ...form,
                    isFeatured: e.target.checked,
                  })
                }
              />
              Featured on homepage
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
              type="checkbox"
              checked={form.isActive ?? true}
              onChange={(e) =>
                setForm({
                  ...form,
                  isActive: e.target.checked,
                })
              }
            />
              Active (visible in store)
            </label>
          </div>

          {error && <p className="text-sm text-terracotta">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-full bg-forest px-8 py-3 text-sm font-semibold text-ivory shadow-soft hover:bg-forest-light disabled:opacity-60"
          >
            {saving ? "Saving..." : editingId ? "Save Changes" : "Add Product"}
          </button>
        </form>
      </Modal>

      <BulkUploadModal
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        onDone={loadProducts}
      />
    </div>
  );
}

function FormField({ label, value, onChange, required, type = "text", placeholder }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-ink/70">
        {label} {required && <span className="text-terracotta">*</span>}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gold/30 px-4 py-2.5 text-sm outline-none focus:border-maroon"
      />
    </label>
  );
}