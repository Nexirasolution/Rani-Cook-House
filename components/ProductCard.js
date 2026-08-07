"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { LeafIcon } from "@/components/Icons";
import { ShoppingBag, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function ProductCard({ product }) {
  const img = product.media?.[0]?.url;
  const outOfStock = product.stock <= 0;
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;

    addItem(product, 1);

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block overflow-hidden rounded-2xl border border-gold/20 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-square overflow-hidden bg-champagne">
        {img ? (
          <Image
            src={img}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-maroon/30">
            <LeafIcon className="h-12 w-12" />
          </div>
        )}

        {outOfStock && (
          <span className="absolute left-3 top-3 rounded-full bg-maroon px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            Out of Stock
          </span>
        )}

        {!outOfStock && (
          <button
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} to cart`}
            className={`absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full shadow-md transition-all duration-300 ${
              added
                ? "bg-green-600 text-white opacity-100"
                : "bg-white text-maroon opacity-0 hover:bg-maroon hover:text-white group-hover:opacity-100"
            }`}
          >
            {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
          </button>
        )}
      </div>

      <div className="p-4">
        <h3 className="line-clamp-2 font-display text-lg font-semibold text-maroon">
          {product.name}
        </h3>

        {product.unit && (
          <p className="mt-1 text-xs text-gray-500">
            {product.unit}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-maroon">
              ₹{product.price}
            </span>

            {product.compareAtPrice > product.price && (
              <span className="text-sm text-gray-400 line-through">
                ₹{product.compareAtPrice}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              outOfStock
                ? "cursor-not-allowed bg-gray-100 text-gray-400"
                : added
                ? "bg-green-600 text-white"
                : "bg-maroon text-white hover:bg-[#651414]"
            }`}
          >
            {outOfStock ? "Sold Out" : added ? "Added ✓" : "Add"}
          </button>
        </div>
      </div>
    </Link>
  );
}