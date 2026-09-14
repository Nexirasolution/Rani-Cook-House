"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Modal from "@/components/Modal";

const STATUSES = ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled"];

const STATUS_COLORS = {
  pending: "bg-gold/20 text-goldDark",
  confirmed: "bg-maroon/10 text-maroon",
  packed: "bg-maroon/10 text-maroon",
  shipped: "bg-clay/10 text-clay",
  delivered: "bg-maroon text-white",
  cancelled: "bg-gray-100 text-gray-600",
};

const PAYMENT_STATUS_LABELS = {
  created: "Awaiting payment",
  paid: "Paid",
  failed: "Payment failed",
};

const PAYMENT_STATUS_COLORS = {
  created: "bg-gold/20 text-goldDark",
  paid: "bg-forest/10 text-forest",
  failed: "bg-red-100 text-red-700",
};

const EMPTY_TRACKING = { courier: "", trackingNumber: "", trackingUrl: "" };

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [includePending, setIncludePending] = useState(false);
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [zoomImage, setZoomImage] = useState(null); // { src, alt } | null
  const [tracking, setTracking] = useState(EMPTY_TRACKING);
  const [trackingSaved, setTrackingSaved] = useState(false);

  async function loadOrders() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter) params.set("status", filter);
    if (includePending) params.set("includePending", "true");
    const res = await fetch(`/api/orders?${params.toString()}`);
    const data = await res.json();
    setOrders(data.orders || []);
    setLoading(false);
  }

  useEffect(() => {
    loadOrders();
  }, [filter, includePending]);

  // Sync the tracking form whenever a different order is opened
  useEffect(() => {
    if (selected) {
      setTracking({
        courier: selected.tracking?.courier || "",
        trackingNumber: selected.tracking?.trackingNumber || "",
        trackingUrl: selected.tracking?.trackingUrl || "",
      });
      setTrackingSaved(false);
    } else {
      setTracking(EMPTY_TRACKING);
    }
  }, [selected]);

  async function updateStatus(id, status) {
    setUpdating(true);
    const res = await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    setUpdating(false);
    if (res.ok) {
      setSelected(data.order);
      loadOrders();
    } else {
      alert(data.error);
    }
  }

  async function syncPayment(id) {
    setUpdating(true);
    const res = await fetch(`/api/orders/${id}/sync-payment`, { method: "POST" });
    const data = await res.json();
    setUpdating(false);
    if (res.ok) {
      setSelected(data.order);
      loadOrders();
    } else {
      alert(data.error);
    }
  }

  async function deleteOrder(id) {
    if (!window.confirm("Delete this order? This cannot be undone.")) return;
    setUpdating(true);
    const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
    const data = await res.json();
    setUpdating(false);
    if (res.ok) {
      if (selected?._id === id) setSelected(null);
      loadOrders();
    } else {
      alert(data.error);
    }
  }

  async function saveTracking() {
    if (!selected) return;
    setUpdating(true);
    setTrackingSaved(false);
    const res = await fetch(`/api/orders/${selected._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tracking }),
    });
    const data = await res.json();
    setUpdating(false);
    if (res.ok) {
      setSelected(data.order);
      loadOrders();
      setTrackingSaved(true);
      setTimeout(() => setTrackingSaved(false), 2500);
    } else {
      alert(data.error);
    }
  }

  const filtered = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.phone.includes(search) ||
      o.customer.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-maroon">Orders</h1>
          <p className="mt-1 text-sm text-muted">{orders.length} orders</p>
        </div>
        <input
          type="text"
          placeholder="Search by name, phone, order #..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-full border border-gold/30 bg-white px-4 py-2 text-sm outline-none focus:border-maroon sm:w-72"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilter("")}
          className={`rounded-full border px-4 py-1.5 text-xs font-semibold ${filter === "" ? "border-maroon bg-maroon text-white" : "border-gold/30 text-ink/70"}`}
        >
          All
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold capitalize ${filter === s ? "border-foresborder-maroon bg-maroon text-whitet bg-maroon text-ivory" : "border-gold/30 text-ink/70"}`}
          >
            {s}
          </button>
        ))}

        <label className="ml-2 flex items-center gap-2 text-xs font-medium text-ink/70">
          <input
            type="checkbox"
            checked={includePending}
            onChange={(e) => setIncludePending(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-gold/40 text-maroon focus:ring-maroon"
          />
          Show unpaid attempts
        </label>
      </div>

      {/* Desktop table (hidden on mobile) */}
      <div className="mt-6 hidden overflow-x-auto rounded-xl2 border border-gold/15 bg-white shadow-card md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gold/15 bg-champagne/50 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Order #</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-muted">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-muted">No orders found.</td></tr>
            ) : (
              filtered.map((o) => (
                <tr key={o._id} className="border-b border-gold/10 last:border-0">
                  <td className="px-4 py-3 font-semibold text-ink">{o.orderNumber}</td>
                  <td className="px-4 py-3 text-ink/70">{o.customer.name}</td>
                  <td className="px-4 py-3 text-ink/70">{o.customer.phone}</td>
                  <td className="px-4 py-3 text-ink/70">₹{o.total}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${PAYMENT_STATUS_COLORS[o.paymentStatus] || "bg-gray-100 text-gray-600"}`}
                    >
                      {PAYMENT_STATUS_LABELS[o.paymentStatus] || o.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${STATUS_COLORS[o.status]}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink/70">
                    {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/orders/${o._id}/label`}
                        className="text-xs font-semibold text-terracotta hover:underline"
                      >
                        Print label
                      </Link>
                      <button onClick={() => setSelected(o)} className="text-xs font-semibold text-maroon hover:underline">
                        View
                      </button>
                      <button
                        onClick={() => deleteOrder(o._id)}
                        disabled={updating}
                        className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card list (hidden on desktop) */}
      <div className="mt-6 space-y-3 md:hidden">
        {loading ? (
          <p className="py-8 text-center text-sm text-muted">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">No orders found.</p>
        ) : (
          filtered.map((o) => (
            <div key={o._id} className="rounded-2xl border border-gold/15 bg-white p-4 shadow-card">
              <button onClick={() => setSelected(o)} className="block w-full text-left">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink truncate">{o.orderNumber}</p>
                    <p className="mt-0.5 text-sm text-ink/70 truncate">{o.customer.name}</p>
                    <p className="text-xs text-muted">{o.customer.phone}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${STATUS_COLORS[o.status]}`}
                    >
                      {o.status}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${PAYMENT_STATUS_COLORS[o.paymentStatus] || "bg-gray-100 text-gray-600"}`}
                    >
                      {PAYMENT_STATUS_LABELS[o.paymentStatus] || o.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-gold/10 pt-3 text-sm">
                  <span className="text-muted">
                    {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </span>
                  <span className="font-semibold text-maroon">₹{o.total}</span>
                </div>
              </button>

              <div className="mt-3 flex gap-2">
                <Link
                  href={`/admin/orders/${o._id}/label`}
                  className="flex-1 rounded-full border border-terracotta/40 py-2 text-center text-xs font-semibold text-terracotta"
                >
                  Print shipping label
                </Link>
                <button
                  onClick={() => deleteOrder(o._id)}
                  disabled={updating}
                  className="rounded-full border border-red-300 px-4 py-2 text-xs font-semibold text-red-600 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.orderNumber || ""} wide>
        {selected && (
          <div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase text-muted">Customer</p>
                <p className="mt-1 text-sm text-ink">{selected.customer.name}</p>
                <p className="text-sm text-ink/70">{selected.customer.phone}</p>
                {selected.customer.email && <p className="text-sm text-ink/70 break-all">{selected.customer.email}</p>}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted">Delivery Address</p>
                <p className="mt-1 text-sm text-ink/70">
                  {selected.customer.address}, {selected.customer.city} {selected.customer.pincode}, {selected.customer.state}
                </p>
              </div>
            </div>

            <div className="leaf-divider my-5" />

            <p className="text-xs font-semibold uppercase text-muted">Items</p>
            <div className="mt-2 space-y-3">
              {selected.items.map((item, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  {item.image ? (
                    <button
                      type="button"
                      onClick={() => setZoomImage({ src: item.image, alt: item.name })}
                      className="shrink-0 rounded-lg border border-gold/15 focus:outline-none focus:ring-2 focus:ring-forest/50"
                      aria-label={`Zoom image of ${item.name}`}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    </button>
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-gold/15 bg-champagne text-[10px] text-muted">
                      No image
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="break-words leading-snug text-ink/90" title={item.name}>
                      {item.name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {item.sku ? `SKU: ${item.sku}` : "SKU: —"} · Qty {item.quantity}
                    </p>
                  </div>
                  <span className="shrink-0 self-start text-ink">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-gold/15 pt-3">
              <div className="flex items-center gap-2 font-display text-sm font-bold text-maroon">
                <span>Total ({selected.paymentMethod})</span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${PAYMENT_STATUS_COLORS[selected.paymentStatus] || "bg-gray-100 text-gray-600"}`}
                >
                  {PAYMENT_STATUS_LABELS[selected.paymentStatus] || selected.paymentStatus}
                </span>
                {selected.paymentStatus !== "paid" && (
                  <button
                    onClick={() => syncPayment(selected._id)}
                    disabled={updating}
                    className="rounded-full border border-maroon/30 px-3 py-1 text-xs font-semibold text-maroon hover:bg-champagne disabled:opacity-50"
                  >
                    Check payment status
                  </button>
                )}
              </div>
              <span className="font-display text-sm font-bold text-maroon">₹{selected.total}</span>
            </div>

            <div className="leaf-divider my-5" />

            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase text-muted">Update Status</p>
              <div className="flex gap-2">
                <Link
                  href={`/admin/orders/${selected._id}/label`}
                  className="rounded-full border border-terracotta/40 px-4 py-1.5 text-xs font-semibold text-terracotta"
                >
                  Print shipping label
                </Link>
                <button
                  onClick={() => deleteOrder(selected._id)}
                  disabled={updating}
                  className="rounded-full border border-red-300 px-4 py-1.5 text-xs font-semibold text-red-600 disabled:opacity-50"
                >
                  Delete order
                </button>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  disabled={updating || selected.status === s}
                  onClick={() => updateStatus(selected._id, s)}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold capitalize transition disabled:cursor-default sm:py-1.5 ${
                    selected.status === s ? "border-maroon bg-maroon text-white" : "border-gold/30 text-ink/70 hover:bg-champagne"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="leaf-divider my-5" />

            <p className="text-xs font-semibold uppercase text-muted">Tracking Details</p>
            <p className="mt-1 text-xs text-muted">
              Shown to the customer on the Track Order page once saved.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-ink/70">Courier</label>
                <input
                  type="text"
                  placeholder="e.g. Delhivery, India Post"
                  value={tracking.courier}
                  onChange={(e) => setTracking((t) => ({ ...t, courier: e.target.value }))}
                  className="mt-1 w-full rounded-full border border-gold/30 bg-white px-4 py-2 text-sm outline-none focus:border-maroon"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-ink/70">Tracking / AWB number</label>
                <input
                  type="text"
                  placeholder="e.g. 1234567890"
                  value={tracking.trackingNumber}
                  onChange={(e) => setTracking((t) => ({ ...t, trackingNumber: e.target.value }))}
                  className="mt-1 w-full rounded-full border border-gold/30 bg-white px-4 py-2 text-sm outline-none focus:border-maroon"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-ink/70">Tracking URL (optional)</label>
                <input
                  type="text"
                  placeholder="https://courier-site.com/track/..."
                  value={tracking.trackingUrl}
                  onChange={(e) => setTracking((t) => ({ ...t, trackingUrl: e.target.value }))}
                  className="mt-1 w-full rounded-full border border-gold/30 bg-white px-4 py-2 text-sm outline-none focus:border-maroon"
                />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={saveTracking}
                disabled={updating}
                className="rounded-full bg-maroon px-5 py-2 text-xs font-semibold text-ivory shadow-card disabled:opacity-60"
              >
                {updating ? "Saving..." : "Save tracking"}
              </button>
              {trackingSaved && <span className="text-xs font-medium text-maroon">Saved ✓</span>}
            </div>
          </div>
        )}
      </Modal>

      {/* Image zoom lightbox */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/80 p-4"
          onClick={() => setZoomImage(null)}
        >
          <button
            onClick={() => setZoomImage(null)}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-3xl leading-none text-ivory hover:bg-white/20"
          >
            ×
          </button>
          <img
            src={zoomImage.src}
            alt={zoomImage.alt}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-full rounded-xl2 object-contain shadow-2xl"
          />
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-ivory/90">
            {zoomImage.alt}
          </p>
        </div>
      )}
    </div>
  );
}