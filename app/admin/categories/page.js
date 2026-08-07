"use client";
import ImageUploader from "@/components/ImageUploader";
import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import { CATEGORY_ICONS, LeafIcon } from "@/components/Icons";

const EMPTY_FORM = {
  name: "",
  description: "",
  icon: "leaf",
  image: [],
  isActive: true,
  sortOrder: 0,
};
const ICON_OPTIONS = ["leaf", "bag", "pot", "wood", "drop", "herb"];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadData() {
    setLoading(true);
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data.categories || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setModalOpen(true);
  }

  function openEdit(c) {
    setEditingId(c._id);

    setForm({
      name: c.name,
      description: c.description || "",
      icon: c.icon || "leaf",
      image: c.image?.url ? [c.image] : [],
      isActive: c.isActive,
      sortOrder: c.sortOrder || 0,
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
        name: form.name,
        description: form.description,
        icon: form.icon,
        isActive: form.isActive,
        sortOrder: Number(form.sortOrder),
        image: form.image[0] ? { url: form.image[0].url, publicId: form.image[0].publicId } : { url: "", publicId: "" },
      };

      const res = await fetch(editingId ? `/api/categories/${editingId}` : "/api/categories", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save category.");
      setModalOpen(false);
      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this category?")) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error);
      return;
    }
    loadData();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-maroon">Categories</h1>
          <p className="mt-1 text-sm text-muted">{categories.length} categories</p>
        </div>
        <button onClick={openAdd} className="rounded-full bg-maroon px-6 py-2 text-sm font-semibold text-white shadow-soft hover:bg-maroonDark">
          + Add Category
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {loading ? (
          <p className="text-muted">Loading...</p>
        ) : categories.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-card">
            <p className="text-muted">No categories yet.</p>
          </div>
        ) : (
          categories.map((c) => {
            const Icon = CATEGORY_ICONS[c.icon] || LeafIcon;

            return (
              <div
                key={c._id}
                className="rounded-3xl border border-gold/10 bg-white p-4 md:p-5 shadow-card hover:shadow-lg transition"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                  {/* Left Side */}
                  <div className="flex items-center gap-4 flex-1">

                    <button className="hidden md:block text-gray-400 text-2xl">
                      ›
                    </button>

                    {c.image?.url ? (
                      <img
                        src={c.image.url}
                        alt={c.name}
                        className="h-16 w-16 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-champagne">
                        <Icon className="h-7 w-7 text-maroon" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <h2 className="font-display text-lg md:text-xl font-bold text-ink">
                        {c.name}
                      </h2>

                      <p className="text-sm text-muted">
                        /{c.name.toLowerCase().replace(/\s+/g, "-")}
                      </p>

                      {c.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-muted">
                          {c.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Side */}
                  <div className="flex items-center justify-end gap-5">

                    <button
                      title="Edit"
                      onClick={() => openEdit(c)}
                      className="text-maroon hover:scale-110 transition"
                    >
                      ✏️
                    </button>

                    <button
                      title="Delete"
                      onClick={() => handleDelete(c._id)}
                      className="text-red-600 hover:scale-110 transition"
                    >
                      🗑️
                    </button>

                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Category" : "Add Category"}>
        <form onSubmit={handleSave} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink/70">Category Name *</span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-gold/30 px-4 py-2.5 text-sm outline-none focus:border-maroon"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink/70">Description</span>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-xl border border-gold/30 px-4 py-2.5 text-sm outline-none focus:border-maroon"
            />
          </label>

          <div>
            <span className="mb-2 block text-xs font-semibold text-ink/70">Category Image</span>
            <ImageUploader
              images={form.image}
              onChange={(imgs) => setForm({ ...form, image: imgs })}
              folder="rani-categories"
              multiple={false}
            />
          </div>

          <div>
            <span className="mb-2 block text-xs font-semibold text-ink/70">Icon (fallback if no image)</span>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map((key) => {
                const Icon = CATEGORY_ICONS[key];
                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => setForm({ ...form, icon: key })}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border ${
  form.icon === key
    ? "border-maroon bg-maroon text-white"
    : "border-gold/30 text-maroon"
}`}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Active (visible in store)
          </label>

          {error && <p className="text-sm text-terracotta">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-full bg-maroon px-8 py-3 text-sm font-semibold text-white shadow-soft hover:bg-maroonDark disabled:opacity-60"
          >
            {saving ? "Saving..." : editingId ? "Save Changes" : "Add Category"}
          </button>
        </form>
      </Modal>
    </div>
  );
}