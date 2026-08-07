"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { LeafIcon, BagIcon } from "@/components/Icons";

function getCleanImageUrl(image) {
  if (!image) return "";

  // If image is already a string
  let url = typeof image === "string" ? image : image?.url || "";

  if (!url) return "";

  // Fix accidental Markdown format:
  // [https://example.com/image.jpg](https://example.com/image.jpg)
  const markdownMatch = url.match(/\]\((https?:\/\/[^)]+)\)/);

  if (markdownMatch?.[1]) {
    url = markdownMatch[1];
  }

  // Another possible Markdown format:
  // [https://example.com/image.jpg]
  if (url.startsWith("[") && url.endsWith("]")) {
    url = url.slice(1, -1);
  }

  return url.trim();
}

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    subtotal,
    hydrated,
  } = useCart();

  if (!hydrated) return null;

  return (
    <section className="min-h-screen bg-ivory px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="font-display text-3xl font-bold text-maroon sm:text-4xl">
          Your Cart
        </h1>

        {items.length === 0 ? (
          <div className="mt-16 flex flex-col items-center py-10 text-center">
            <span className="badge-stamp flex h-16 w-16 items-center justify-center border-gold/40 bg-champagne text-maroon">
              <BagIcon className="h-7 w-7" />
            </span>

            <p className="mt-4 font-display text-lg text-maroon">
              Your cart is empty
            </p>

            <Link
              href="/products"
              className="mt-6 rounded-full bg-maroon px-8 py-3 text-sm font-semibold text-ivory shadow-soft transition hover:bg-maroon/90"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-10 md:grid-cols-3">
            {/* CART ITEMS */}
            <div className="space-y-4 md:col-span-2">
              {items.map((item) => {
                const imageUrl = getCleanImageUrl(item.image);

                return (
                  <div
                    key={item.productId}
                    className="flex items-center gap-4 rounded-xl2 border border-gold/15 bg-white p-4 shadow-card"
                  >
                    {/* PRODUCT IMAGE */}
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-champagne">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={item.name || "Product"}
                          fill
                          unoptimized
                          sizes="80px"
                          className="object-cover"
                          onError={(e) => {
                            console.error(
                              "Cart image failed:",
                              imageUrl
                            );
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-maroon/30">
                          <LeafIcon className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    {/* PRODUCT DETAILS */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-sm font-semibold text-ink">
                        {item.name}
                      </p>

                      <p className="text-xs text-muted">
                        ₹{item.price}
                        {item.unit ? ` / ${item.unit}` : ""}
                      </p>

                      {/* QUANTITY */}
                      <div className="mt-2 flex w-fit items-center rounded-full border border-gold/30">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.quantity - 1
                            )
                          }
                          className="px-3 py-1 text-maroon transition hover:bg-champagne"
                        >
                          −
                        </button>

                        <span className="w-6 text-center text-xs font-semibold">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.quantity + 1
                            )
                          }
                          className="px-3 py-1 text-maroon transition hover:bg-champagne"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* PRICE */}
                    <div className="shrink-0 text-right">
                      <p className="font-display text-sm font-bold text-maroon">
                        ₹{item.price * item.quantity}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          removeItem(item.productId)
                        }
                        className="mt-2 text-xs text-terracotta hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ORDER SUMMARY */}
            <div className="h-fit rounded-xl2 border border-gold/15 bg-white p-6 shadow-card">
              <h2 className="font-display text-lg font-bold text-maroon">
                Order Summary
              </h2>

              <div className="mt-4 flex justify-between text-sm text-ink/80">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>

              <div className="mt-2 flex justify-between text-sm text-ink/80">
                <span>Shipping</span>
                <span className="text-maroon">
                  Calculated at checkout
                </span>
              </div>

              <div className="leaf-divider my-4" />

              <div className="flex justify-between font-display text-base font-bold text-maroon">
                <span>Total</span>
                <span>₹{subtotal}</span>
              </div>

              <Link
                href="/checkout"
                className="mt-6 block rounded-full bg-maroon px-8 py-3.5 text-center text-sm font-semibold text-ivory shadow-soft transition hover:bg-maroon/90"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}