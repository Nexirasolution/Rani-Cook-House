"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { BagIcon } from "./Icons";
import { Search, X } from "lucide-react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/track-order", label: "Track Order" },
];

function ShippingMarquee({ settings }) {
  const freeShipping = settings?.freeShipping ?? 999;

  const messages = [
    `🚚 FREE SHIPPING on orders above ₹${freeShipping}`,
    `❤️ Homemade with Love & Fresh Ingredients`,
    `✅ Pan India Delivery`,
  ];

  const track = [...messages, ...messages];

  return (
    <div className="relative w-full overflow-hidden bg-[#7A1C1C] py-2 text-xs text-[#FDF7ED]">
      <div className="marquee-track flex w-max whitespace-nowrap">
        {track.map((msg, idx) => (
          <span key={idx} className="mx-8">
            {msg}
          </span>
        ))}
      </div>

      <style jsx>{`
        .marquee-track {
          animation: marquee-scroll 22s linear infinite;
        }

        .relative:hover .marquee-track {
          animation-play-state: paused;
        }

        @keyframes marquee-scroll {
          0% {
            transform: translateX(0);
          }

          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}

export default function Navbar({ settings }) {
  const { count } = useCart();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  /*
   * BRAND NAME
   * Displays:
   *
   * RANI'S
   * COOK HOUSE
   */
  const storeName = "RANI'S Cook House";

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    if (query.trim()) {
      router.push(
        `/products?search=${encodeURIComponent(query.trim())}`
      );

      setSearchOpen(false);
      setOpen(false);
      setQuery("");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#D8C2A8] bg-[#FDF7ED]/95 backdrop-blur-md">
        {/* =========================
            MAIN NAVBAR
        ========================== */}

        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-4 py-2.5 sm:px-5 sm:py-3 md:px-8">

          {/* =========================
              LOGO + BRAND
          ========================== */}

          <Link
            href="/"
            className="flex min-w-0 shrink items-center gap-2 sm:gap-3"
          >
            <Image
              src="/images/logo.png"
              alt={storeName}
              width={65}
              height={65}
              priority
              className="h-10 w-10 shrink-0 rounded-full object-cover sm:h-14 sm:w-14"
            />

            {/* BRAND NAME */}
            <div className="min-w-0 leading-none">
              <h1 className="font-display text-lg font-bold text-[#6B1E1E] sm:text-2xl md:text-[34px]">
                RANI'S
              </h1>

              <p className="mt-1 whitespace-nowrap text-[8px] font-semibold uppercase tracking-[0.2em] text-[#B8872E] sm:text-[10px] sm:tracking-[0.3em] md:text-[12px] md:tracking-[0.4em]">
                COOK HOUSE
              </p>
            </div>
          </Link>

          {/* =========================
              DESKTOP NAVIGATION
          ========================== */}

          <nav className="hidden items-center gap-8 md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-[#3B3026] transition hover:text-[#7A1C1C]"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* =========================
              RIGHT SIDE
          ========================== */}

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">

            {/* =========================
                DESKTOP SEARCH
            ========================== */}

            <div className="hidden items-center md:flex">
              {searchOpen ? (
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex items-center overflow-hidden rounded-full border border-[#D8C2A8] bg-white px-3 py-1.5"
                >
                  <input
                    autoFocus
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-48 bg-transparent text-sm outline-none placeholder:text-gray-400"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setSearchOpen(false);
                      setQuery("");
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-[#7A1C1C] hover:bg-[#F5EBDD]"
                    aria-label="Close search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D8C2A8] text-[#7A1C1C] transition hover:bg-[#F5EBDD]"
                  aria-label="Search"
                >
                  <Search className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* =========================
                MOBILE SEARCH
            ========================== */}

            <button
              onClick={() => setSearchOpen((v) => !v)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#D8C2A8] text-[#7A1C1C] transition hover:bg-[#F5EBDD] md:hidden"
              aria-label="Search"
            >
              {searchOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </button>

            {/* =========================
                CART
            ========================== */}

            <Link
              href="/cart"
              className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#D8C2A8] text-[#7A1C1C] transition hover:bg-[#F5EBDD] sm:h-10 sm:w-10"
              aria-label="View cart"
            >
              <BagIcon className="h-4 w-4 sm:h-5 sm:w-5" />

              {count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#7A1C1C] text-[9px] font-semibold text-white sm:h-5 sm:w-5 sm:text-[10px]">
                  {count}
                </span>
              )}
            </Link>

            {/* =========================
                MOBILE MENU BUTTON
            ========================== */}

            <button
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#D8C2A8] text-[#7A1C1C] md:hidden"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
              aria-expanded={open}
            >
              <div className="flex h-4 w-5 flex-col justify-between">
                <span
                  className={`block h-0.5 w-5 bg-[#3B3026] transition-all duration-300 ${
                    open
                      ? "translate-y-[7px] rotate-45"
                      : ""
                  }`}
                />

                <span
                  className={`block h-0.5 w-5 bg-[#3B3026] transition-all duration-300 ${
                    open ? "opacity-0" : ""
                  }`}
                />

                <span
                  className={`block h-0.5 w-5 bg-[#3B3026] transition-all duration-300 ${
                    open
                      ? "-translate-y-[7px] -rotate-45"
                      : ""
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* =========================
            MOBILE SEARCH BAR
        ========================== */}

        {searchOpen && (
          <div className="border-t border-[#D8C2A8] bg-[#FDF7ED] px-4 py-3 sm:px-5 md:hidden">
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center gap-2 rounded-full border border-[#D8C2A8] bg-white px-4 py-2.5"
            >
              <Search className="h-4 w-4 shrink-0 text-gray-400" />

              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
            </form>
          </div>
        )}

        {/* =========================
            MOBILE MENU
        ========================== */}

        {open && (
          <nav className="flex flex-col gap-1 border-t border-[#D8C2A8] bg-[#FDF7ED] px-4 py-3 sm:px-5 md:hidden">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2 text-sm font-medium text-[#3B3026] transition hover:bg-[#F5EBDD] hover:text-[#7A1C1C]"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        )}
      </header>
    </>
  );
}