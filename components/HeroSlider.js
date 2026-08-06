"use client";

import Image from "next/image";
import Link from "next/link";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500"],
});

export default function HeroSlider() {
  return (
    <section className="relative h-[50vh] overflow-hidden sm:h-[60vh] lg:h-[70vh]">
      {/* Background */}
      <Image
        src="/hero/hero-banner.png"
        alt="Rani's Cook House"
        fill
        priority
        className="object-cover object-center"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/45" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-6 sm:px-10 lg:px-16">
        <div className="max-w-2xl">

          {/* Tagline */}
          

          {/* Heading */}
          <h1
            className={`${playfair.className} text-4xl font-normal leading-[1.1] tracking-tight text-white sm:text-12xl md:text-6xl lg:text-7xl xl:text-8xl`}
          >
            Authentic Homemade
            <br />
            Pickles & Traditional Foods
          </h1>

          

          {/* Buttons */}
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/products"
              className="rounded-full bg-maroon px-8 py-3.5 text-sm font-medium text-white transition duration-300 hover:bg-[#651414]"
            >
              Shop Now
            </Link>

            <Link
              href="/categories"
              className="rounded-full border border-white px-8 py-3.5 text-sm font-medium text-white transition duration-300 hover:bg-white hover:text-maroon"
            >
              Explore Categories
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}