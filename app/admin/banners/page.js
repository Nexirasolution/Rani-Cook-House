"use client";

import { useEffect, useState } from "react";
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
    try {
      setLoading(true);

      const res = await fetch("/api/banners", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load banners.");
      }

      setBanners(data.banners || []);
    } catch (err) {
      console.error("Load banners error:", err);
      setError(err.message || "Failed to load banners.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function openAdd() {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      image: [],
    });
    setError("");
    setModalOpen(true);
  }

  function openEdit(banner) {
    setEditingId(banner._id);

    setForm({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      image: banner.image?.url
        ? [
            {
              url: banner.image.url,
              publicId: banner.image.publicId || "",
            },
          ]
        : [],
      ctaText: banner.ctaText || "",
      ctaLink: banner.ctaLink || "",
      isActive: banner.isActive ?? true,
      sortOrder: banner.sortOrder ?? 0,
    });

    setError("");
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();

    setSaving(true);
    setError("");

    try {
      if (!form.title.trim()) {
        throw new Error("Title is required.");
      }

      const image = form.image?.[0]
        ? {
            url: form.image[0].url,
            publicId: form.image[0].publicId || "",
          }
        : {
            url: "",
            publicId: "",
          };

      const payload = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        image,
        ctaText: form.ctaText.trim(),
        ctaLink: form.ctaLink.trim(),
        isActive: Boolean(form.isActive),
        sortOrder: Number(form.sortOrder) || 0,
      };

      const res = await fetch(
        editingId ? `/api/banners/${editingId}` : "/api/banners",
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save banner.");
      }

      setModalOpen(false);
      setEditingId(null);
      setForm({
        ...EMPTY_FORM,
        image: [],
      });

      await loadData();
    } catch (err) {
      console.error("Save banner error:", err);
      setError(err.message || "Failed to save banner.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this banner?")) return;

    try {
      const res = await fetch(`/api/banners/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete banner.");
      }

      await loadData();
    } catch (err) {
      console.error("Delete banner error:", err);
      alert(err.message || "Failed to delete banner.");
    }
  }

  async function toggleActive(banner) {
    try {
      const res = await fetch(`/api/banners/${banner._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !banner.isActive,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update banner.");
      }

      await loadData();
    } catch (err) {
      console.error("Toggle banner error:", err);
      alert(err.message || "Failed to update banner.");
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-maroon">
            Banners
          </h1>

          <p className="mt-1 text-sm text-muted">
            {banners.length} {banners.length === 1 ? "banner" : "banners"}
          </p>
        </div>

        <button
          onClick={openAdd}
          className="rounded-full bg-maroon px-6 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-maroonDark"
        >
          + Add Banner
        </button>
      </div>

      {/* Banner List */}
      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-card">
            <p className="text-muted">Loading banners...</p>
          </div>
        ) : banners.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-card">
            <p className="text-muted">No banners yet.</p>
          </div>
        ) : (
          banners.map((banner) => (
            <div
              key={banner._id}
              className="rounded-3xl border border-gold/10 bg-white p-4 shadow-card transition hover:shadow-lg md:p-5"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                {/* Image + Details */}
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="h-20 w-32 shrink-0 overflow-hidden rounded-xl bg-champagne">
                    {banner.image?.url ? (
                      <img
                        src={banner.image.url}
                        alt={banner.title || "Banner"}
                        width={160}
                        height={100}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate font-display text-lg font-bold text-ink">
                      {banner.title}
                    </h2>

                    {banner.subtitle && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted">
                        {banner.subtitle}
                      </p>
                    )}

                    {banner.ctaText && (
                      <p className="mt-1 text-xs font-medium text-maroon">
                        CTA: {banner.ctaText}{" "}
                        {banner.ctaLink
                          ? `→ ${banner.ctaLink}`
                          : "→ (no link)"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4">
                  <button
                    onClick={() => toggleActive(banner)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      banner.isActive
                        ? "bg-maroon/10 text-maroon"
                        : "bg-muted/10 text-muted"
                    }`}
                  >
                    {banner.isActive ? "Active" : "Hidden"}
                  </button>

                  <button
                    type="button"
                    title="Edit"
                    onClick={() => openEdit(banner)}
                    className="text-maroon transition hover:scale-110"
                  >
                    ✏️
                  </button>

                  <button
                    type="button"
                    title="Delete"
                    onClick={() => handleDelete(banner._id)}
                    className="text-red-600 transition hover:scale-110"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => {
          if (!saving) {
            setModalOpen(false);
          }
        }}
        title={editingId ? "Edit Banner" : "Add Banner"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {/* Title */}
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink/70">
              Title *
            </span>

            <input
              required
              value={form.title}
              onChange={(e) =>
                setForm({
                  ...form,
                  title: e.target.value,
                })
              }
              placeholder="e.g. Traditional Conch Meat"
              className="w-full rounded-xl border border-gold/30 px-4 py-2.5 text-sm outline-none focus:border-maroon"
            />
          </label>

          {/* Subtitle */}
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink/70">
              Subtitle
            </span>

            <textarea
              rows={2}
              value={form.subtitle}
              onChange={(e) =>
                setForm({
                  ...form,
                  subtitle: e.target.value,
                })
              }
              placeholder="e.g. Authentic coastal flavors, traditionally prepared"
              className="w-full rounded-xl border border-gold/30 px-4 py-2.5 text-sm outline-none focus:border-maroon"
            />
          </label>

          {/* Banner Image */}
          <div>
            <span className="mb-2 block text-xs font-semibold text-ink/70">
              Banner Image
            </span>

            <ImageUploader
              images={form.image}
              onChange={(imgs) =>
                setForm({
                  ...form,
                  image: imgs,
                })
              }
              folder="rani-banners"
              multiple={false}
            />
          </div>

          {/* CTA */}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink/70">
                CTA Button Text
              </span>

              <input
                value={form.ctaText}
                onChange={(e) =>
                  setForm({
                    ...form,
                    ctaText: e.target.value,
                  })
                }
                placeholder="e.g. Shop Now"
                className="w-full rounded-xl border border-gold/30 px-4 py-2.5 text-sm outline-none focus:border-maroon"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink/70">
                CTA Link
              </span>

              <input
                value={form.ctaLink}
                onChange={(e) =>
                  setForm({
                    ...form,
                    ctaLink: e.target.value,
                  })
                }
                placeholder="/products"
                className="w-full rounded-xl border border-gold/30 px-4 py-2.5 text-sm outline-none focus:border-maroon"
              />
            </label>
          </div>

          {/* Sort Order */}
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink/70">
              Sort Order
            </span>

            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) =>
                setForm({
                  ...form,
                  sortOrder: e.target.value,
                })
              }
              className="w-full rounded-xl border border-gold/30 px-4 py-2.5 text-sm outline-none focus:border-maroon"
            />
          </label>

          {/* Active */}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm({
                  ...form,
                  isActive: e.target.checked,
                })
              }
            />

            Active (visible on site)
          </label>

          {/* Error */}
          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-full bg-maroon px-8 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-maroonDark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Saving..."
              : editingId
              ? "Save Changes"
              : "Add Banner"}
          </button>
        </form>
      </Modal>
    </div>
  );
}