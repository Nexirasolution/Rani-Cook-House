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
  const hasDiscount = product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;
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
      {/* Product Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-champagne">
        {img ? (
          <Image
            src={img}
            alt={product.name}
            width={500}
            height={667}
            unoptimized
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <LeafIcon className="h-10 w-10 text-maroon/30" />
          </div>
        )}

        {/* Out of Stock */}
        {outOfStock && (
          <span className="absolute left-3 top-3 rounded-full bg-maroon px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            Out of Stock
          </span>
        )}

        {/* Discount badge */}
        {!outOfStock && hasDiscount && (
          <span className="absolute right-3 top-3 rounded-full bg-terracotta px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            {discountPercent}% OFF
          </span>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4">
        <h3 className="line-clamp-2 font-display text-lg font-semibold text-maroon">
          {product.name}
        </h3>

        {product.unit && (
          <p className="mt-1 text-xs text-muted">{product.unit}</p>
        )}

        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-lg font-bold text-maroon">
              ₹{product.price}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">
                ₹{product.compareAtPrice}
              </span>
            )}
          </div>

          {/* Add Button */}
          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            aria-label={
              outOfStock
                ? "Sold out"
                : added
                ? "Added to cart"
                : `Add ${product.name} to cart`
            }
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
              outOfStock
                ? "cursor-not-allowed bg-gray-100 text-gray-400"
                : added
                ? "bg-green-600 text-white"
                : "bg-maroon text-white hover:bg-[#651414]"
            }`}
          >
            {added ? (
              <Check className="h-4 w-4" />
            ) : (
              <ShoppingBag className="h-4 w-4" />
            )}
          </button>
        </div>

        {!outOfStock && product.stock <= (product.lowStockThreshold ?? 5) && (
          <p className="mt-1 text-xs font-semibold text-terracotta">
            Only {product.stock} left
          </p>
        )}
      </div>
    </Link>
  );
}