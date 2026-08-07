"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500"],
});

const FALLBACK_SLIDE = {
  image: "/hero/hero-banner.png",
  heading: "Authentic Homemade",
  headingLine2: "Pickles",
  ctaLabel: "Shop Now",
  ctaHref: "/products",
};

export default function HeroSlider({ initialSlides }) {
  const [slides] = useState(
    initialSlides?.length ? initialSlides : [FALLBACK_SLIDE]
  );
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[active];

  return (
    <section className="relative h-[36vh] overflow-hidden sm:h-[55vh] lg:h-[70vh]">
      {/* Background */}
      <Image
        src={slide.image}
        alt={slide.heading || "Rani's Cook House"}
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/45" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-5 sm:px-10 lg:px-16">
        <div className="w-full max-w-[280px] sm:max-w-md md:max-w-xl lg:max-w-2xl">
          {slide.subtitle && (
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.1em] text-white/80 sm:mb-3 sm:text-sm sm:tracking-[0.2em]">
              {slide.subtitle}
            </p>
          )}

          <h1
            className={`${playfair.className} text-[1.65rem] font-normal leading-[1.2] tracking-normal text-white sm:text-4xl md:text-5xl lg:text-6xl`}
          >
            {slide.heading}
            {slide.headingLine2 && (
              <>
                <br />
                {slide.headingLine2}
              </>
            )}
          </h1>

          <div className="mt-5 flex flex-wrap gap-4 sm:mt-8">
            <Link
              href={slide.ctaHref}
              className="rounded-full bg-maroon px-6 py-2.5 text-xs font-medium text-white transition duration-300 hover:bg-[#651414] sm:px-8 sm:py-3.5 sm:text-sm"
            >
              {slide.ctaLabel}
            </Link>
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2 sm:bottom-6">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 sm:h-2 ${
                i === active ? "w-5 bg-white sm:w-6" : "w-1.5 bg-white/50 sm:w-2"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}