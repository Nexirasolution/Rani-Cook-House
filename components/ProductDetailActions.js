"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function ProductDetailActions({ product }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const outOfStock = product.stock <= 0;

  function handleAdd() {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  function handleBuyNow() {
    addItem(product, qty);
    router.push("/cart");
  }

  return (
    <div className="mt-8">
      {!outOfStock && (
        <div className="mb-6 flex items-center gap-4">
          <span className="text-sm font-semibold text-ink">Quantity</span>
          <div className="flex items-center rounded-full border border-gold/30">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="px-4 py-2 text-lg text-maroon"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-8 text-center text-sm font-semibold">{qty}</span>
            <button
              onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
              className="px-4 py-2 text-lg text-maroon"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleAdd}
          disabled={outOfStock}
          className="flex-1 rounded-full border border-maroon px-8 py-3.5 text-sm font-semibold text-maroon transition hover:bg-champagne disabled:cursor-not-allowed disabled:border-muted/40 disabled:text-muted"
        >
          {outOfStock ? "Out of Stock" : added ? "Added to Cart ✓" : "Add to Cart"}
        </button>
        <button
          onClick={handleBuyNow}
          disabled={outOfStock}
          className="flex-1 rounded-full bg-maroon px-8 py-3.5 text-sm font-semibold text-ivory shadow-soft transition hover:bg-maroon-light disabled:cursor-not-allowed disabled:bg-muted/40"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
