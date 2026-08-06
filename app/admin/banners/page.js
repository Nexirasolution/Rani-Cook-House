"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Modal from "@/components/Modal";
import ImageUploader from "@/components/ImageUploader";

const EMPTY_FORM = {
  title: "",
  subtitle: "",
  image: [],
  ctaText: "",
  ctaLink: "",
  isActive: true,
  sortOrder: 0,
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadData() {
    setLoading(true);
    const res = await fetch("/api/banners");
    const data = await res.json();
    setBanners(data.banners || []);
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

  function openEdit(b) {
    setEditingId(b._id);
    setForm({
      title: b.title,
      subtitle: b.subtitle || "",
      image: b.image?.url ? [b.image] : [],
      ctaText: b.ctaText || "",
      ctaLink: b.ctaLink || "",
      isActive: b.isActive,
      sortOrder: b.sortOrder || 0,
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
        title: form.title,
        subtitle: form.subtitle,
        ctaText: form.ctaText,
        ctaLink: form.ctaLink,
        isActive: form.isActive,
        sortOrder: Number(form.sortOrder),
        image: form.image[0]
          ? { url: form.image[0].url, publicId: form.image[0].publicId }
          : { url: "", publicId: "" },
      };

      const res = await fetch(editingId ? `/api/banners/${editingId}` : "/api/banners", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save banner.");

      setModalOpen(false);
      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this banner?")) return;
    const res = await fetch(`/api/banners/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error);
      return;
    }
    loadData();
  }

  async function toggleActive(b) {
    const res = await fetch(`/api/banners/${b._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !b.isActive }),
    });
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
          <h1 className="font-display text-2xl font-bold text-maroon">Banners</h1>
          <p className="mt-1 text-sm text-muted">{banners.length} banners</p>
        </div>
        <button
          onClick={openAdd}
          className="rounded-full bg-maroon px-6 py-2 text-sm font-semibold text-white shadow-soft hover:bg-maroonDark"
        >
          + Add Banner
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {loading ? (
          <p className="text-muted">Loading...</p>
        ) : banners.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-card">
            <p className="text-muted">No banners yet.</p>
          </div>
        ) : (
          banners.map((b) => (
            <div
              key={b._id}
              className="rounded-3xl border border-gold/10 bg-white p-4 md:p-5 shadow-card hover:shadow-lg transition"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="h-20 w-32 shrink-0 overflow-hidden rounded-xl bg-champagne">
                    {b.image?.url ? (
                      <Image
                        src={b.image.url}
                        alt={b.title}
                        width={200}
                        height={120}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h2 className="font-display text-lg font-bold text-ink truncate">{b.title}</h2>
                    {b.subtitle && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted">{b.subtitle}</p>
                    )}
                    {b.ctaText && (
                      <p className="mt-1 text-xs text-maroon font-medium">
                        CTA: {b.ctaText} → {b.ctaLink || "(no link)"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-4">
                  <button
                    onClick={() => toggleActive(b)}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
  b.isActive
    ? "bg-maroon/10 text-maroon"
    : "bg-muted/10 text-muted"
}`}
                  >
                    {b.isActive ? "Active" : "Hidden"}
                  </button>

                  <button
                    title="Edit"
                    onClick={() => openEdit(b)}
                    className="text-maroon hover:scale-110 transition"
                  >
                    ✏️
                  </button>

                  <button
                    title="Delete"
                    onClick={() => handleDelete(b._id)}
                    className="text-red-600 hover:scale-110 transition"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Banner" : "Add Banner"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink/70">Title *</span>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-xl border border-gold/30 px-4 py-2.5 text-sm outline-none focus:border-maroon"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink/70">Subtitle</span>
            <textarea
              rows={2}
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              className="w-full rounded-xl border border-gold/30 px-4 py-2.5 text-sm outline-none focus:border-maroon"
            />
          </label>

          <div>
            <span className="mb-2 block text-xs font-semibold text-ink/70">Banner Image</span>
            <ImageUploader
              images={form.image}
              onChange={(imgs) => setForm({ ...form, image: imgs })}
              folder="kmc-banners"
              multiple={false}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink/70">CTA Button Text</span>
              <input
                value={form.ctaText}
                onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                placeholder="e.g. Shop Now"
                className="w-full rounded-xl border border-gold/30 px-4 py-2.5 text-sm outline-none focus:border-maroon"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink/70">CTA Link</span>
              <input
                value={form.ctaLink}
                onChange={(e) => setForm({ ...form, ctaLink: e.target.value })}
                placeholder="/products or https://..."
                className="w-full rounded-xl border border-gold/30 px-4 py-2.5 text-sm outline-none focus:border-maroon"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink/70">Sort Order</span>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
              className="w-full rounded-xl border border-gold/30 px-4 py-2.5 text-sm outline-none focus:border-maroon"
            />
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Active (visible on site)
          </label>

          {error && <p className="text-sm text-terracotta">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-full bg-maroon px-8 py-3 text-sm font-semibold text-white shadow-soft hover:bg-maroonDark disabled:opacity-60"
          >
            {saving ? "Saving..." : editingId ? "Save Changes" : "Add Banner"}
          </button>
        </form>
      </Modal>
    </div>
  );
}