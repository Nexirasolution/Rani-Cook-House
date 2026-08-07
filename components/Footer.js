"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  Youtube,
  MessageCircle,
} from "lucide-react";

export default function Footer({ settings }) {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="mt-24 bg-[#7A1C1C] text-white">
<div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 py-12 sm:py-14">
        {/* Top */}
        <div className="grid gap-12 md:grid-cols-2">

          {/* Left */}
          <div>

            <div className="flex items-center gap-4">

              <Image
                src="/images/logo.png"
                alt="Rani's Cook House"
                width={70}
                height={70}
                className="h-14 w-14 sm:h-[70px] sm:w-[70px] rounded-full bg-white object-cover"
              />

              <div>
                <h2 className="font-display text-2xl sm:text-3xl">                  
                  Rani's Cook House
                </h2>

                <p className="mt-1 text-sm tracking-[0.3em] uppercase text-[#F3D28B]">
                  Mom's Secret Taste
                </p>
              </div>

            </div>

            <p className="mt-6 max-w-lg text-sm sm:text-base leading-7 text-white/80">
              Authentic homemade pickles, dry fish powder,
              Avalose Podi, Sangu Sathai,
              dry fruits & nuts prepared using
              traditional family recipes from
              Nagercoil, Tamil Nadu.
            </p>

            <div className="mt-8 space-y-4">

              <div className="flex items-center gap-3">
                <Phone size={18} />
                <span>{settings?.phone || "+91 74180 58533"}</span>
              </div>

              <div className="flex items-center gap-3">
                <Mail size={18} />
                <span>{settings?.email || "ranipickles13@gmail.com"}</span>
              </div>

              <div className="flex items-center gap-3">
                <MapPin size={18} />
                <span>{settings?.address || "Nagercoil, Tamil Nadu"}</span>
              </div>

              <a
                href={`https://wa.me/${settings?.whatsapp || "917418058533"}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-[#F3D28B] hover:text-white"
              >
                <MessageCircle size={20} />
                WhatsApp Us
              </a>

            </div>

          </div>

          {/* Right */}
          <div>
        

              <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-5">

                {settings?.facebook && (
                  <a
                    href={settings.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#1877F2] transition hover:scale-110"
                  >
                    <Facebook size={26} />
                  </a>
                )}

                {settings?.instagram && (
                  <a
                    href={settings.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-pink-600 transition hover:scale-110"
                  >
                    <Instagram size={26} />
                  </a>
                )}

                {settings?.youtube && (
                  <a
                    href={settings.youtube}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-red-600 transition hover:scale-110"
                  >
                    <Youtube size={26} />
                  </a>
                )}

              </div>


          </div>

        </div>

      </div>

      {/* Bottom */}

<div className="border-t border-white/15 px-4 py-6 pb-28 text-center md:pb-6">

  <p className="text-xs sm:text-sm text-white/80">
    © {new Date().getFullYear()} Rani's Cook House. All rights reserved.
  </p>

  <p className="mt-2 text-xs sm:text-sm text-[#F3D28B]">
    Developed & Designed by{" "}
    <Link
      href="https://www.nexirasolution.in/"
      target="_blank"
      rel="noopener noreferrer"
      className="font-semibold hover:text-white transition"
    >
      Nexira Solution
    </Link>
  </p>

</div>

    </footer>
  );
}