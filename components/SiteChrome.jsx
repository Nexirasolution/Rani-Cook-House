"use client";

import { usePathname } from "next/navigation";

import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import BottomNav from "@/components/BottomNav";

export default function SiteChrome({ settings, children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <CartProvider>{children}</CartProvider>;
  }

  return (
    <CartProvider>
      <Navbar settings={settings} />
      {children}
      <Footer settings={settings} />
      <FloatingWhatsApp />
      <BottomNav />
    </CartProvider>
  );
}