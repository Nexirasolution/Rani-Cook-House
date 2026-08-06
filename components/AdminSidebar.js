"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

import {
  LayoutDashboard,
  Package,
  Grid3X3,
  Images,
  ShoppingCart,
  Boxes,
  Settings,
  LogOut,
  X,
} from "lucide-react";

const NAV = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: <LayoutDashboard size={18} />,
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: <Package size={18} />,
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: <Grid3X3 size={18} />,
  },
  {
    href: "/admin/banners",
    label: "Banners",
    icon: <Images size={18} />,
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: <ShoppingCart size={18} />,
  },
  {
    href: "/admin/inventory",
    label: "Inventory",
    icon: <Boxes size={18} />,
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: <Settings size={18} />,
  },
];

export default function AdminSidebar({ open, setOpen }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    router.push("/admin/login");
    router.refresh();
  }

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50
          h-screen w-72
          bg-[#7A1C1C]
          text-white
          flex flex-col
          shadow-2xl
          transform transition-transform duration-300

          ${
            open ? "translate-x-0" : "-translate-x-full"
          }

          lg:translate-x-0
        `}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 lg:hidden">
          <h2 className="font-semibold text-lg">
            Menu
          </h2>

          <button onClick={() => setOpen(false)}>
            <X />
          </button>
        </div>

        {/* Logo */}

        <div className="border-b border-white/10 px-6 py-7">

          <div className="flex items-center gap-4">

            <Image
              src="/images/logo.png"
              alt="Logo"
              width={55}
              height={55}
              className="rounded-full bg-white p-1"
            />

            <div>

              <h2 className="font-display text-xl">
                Rani's Cook House
              </h2>

              <p className="text-xs uppercase tracking-[0.25em] text-[#F3D28B]">
                Admin Panel
              </p>

            </div>

          </div>

        </div>

        {/* Navigation */}

        <nav className="flex-1 space-y-2 p-4">

          {NAV.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition

                ${
                  active
                    ? "bg-[#F3D28B] text-[#7A1C1C] font-semibold"
                    : "hover:bg-white/10 text-white/80"
                }
                `}
              >
                {item.icon}

                <span>{item.label}</span>
              </Link>
            );
          })}

        </nav>

        {/* Logout */}

        <div className="border-t border-white/10 p-4">

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 transition hover:bg-white/10"
          >
            <LogOut size={18} />

            Logout
          </button>

        </div>

      </aside>
    </>
  );
}