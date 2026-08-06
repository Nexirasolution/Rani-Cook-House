"use client";

import Image from "next/image";
import Link from "next/link";

export default function HeroSlider() {
  return (
    <section className="relative min-h-[70vh] md:h-[85vh] overflow-hidden">
      {/* Background Image */}
      <Image
        src="/hero/hero-banner.png"
        alt="Rani's Cook House"
        fill
        priority
        className="object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[70vh] md:h-full max-w-7xl items-center px-6 sm:px-8 lg:px-12">
        <div className="max-w-xl lg:max-w-2xl">

          

          <h1 className="font-display text-xl sm:text-3xl md:text-6xl lg:text-7xl font-medium leading-tight text-white">
            Authentic Homemade
            <br />
            Pickles & Traditional Foods
          </h1>

          

          <Link
            href="/products"
            className="mt-8 inline-flex rounded-full bg-[#7A1C1C] px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-medium text-white transition hover:bg-[#5E1515]"
          >
            Shop Now
          </Link>

        </div>
      </div>
    </section>
  );
}