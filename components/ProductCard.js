"use client";

import Link from "next/link";
import Image from "next/image";
import { LeafIcon } from "@/components/Icons";

export default function ProductCard({ product }) {
  const img = product.media?.[0]?.url;
  const outOfStock = product.stock <= 0;

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

        <div className="mt-3 flex items-center gap-2">
          <span className="text-lg font-bold text-maroon">
            ₹{product.price}
          </span>

          {product.compareAtPrice > product.price && (
            <span className="text-sm text-gray-400 line-through">
              ₹{product.compareAtPrice}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}