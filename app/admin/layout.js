"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Menu } from "lucide-react";

import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({ children }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Hide sidebar on login page
  if (pathname === "/admin/login") {
    return children;
  }

  return (
    <div className="min-h-screen bg-[#F8F4EE]">

      {/* Mobile Header */}

      <header className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm lg:hidden">

        <div className="flex items-center gap-3">

          <button
            onClick={() => setOpen(true)}
            className="rounded-lg p-2 transition hover:bg-gray-100"
          >
            <Menu size={24} className="text-[#7A1C1C]" />
          </button>

          <Image
            src="/images/logo.png"
            alt="Rani's Cook House"
            width={40}
            height={40}
            className="rounded-full bg-white"
          />

          <div>
            <h1 className="font-display text-lg text-[#7A1C1C]">
              Rani's Cook House
            </h1>

            <p className="text-[10px] uppercase tracking-[0.2em] text-[#B8860B]">
              Admin Panel
            </p>
          </div>

        </div>

      </header>

      {/* Sidebar */}

      <AdminSidebar
        open={open}
        setOpen={setOpen}
      />

      {/* Main Content */}

      <main
        className="
          min-h-screen
          pt-20
          px-4
          pb-6
          lg:ml-72
          lg:pt-8
          lg:px-8
        "
      >
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>

    </div>
  );
}