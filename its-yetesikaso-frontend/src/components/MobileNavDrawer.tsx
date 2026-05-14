"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "Create", href: "/create" },
  { label: "Saved", href: "/saved" },
  { label: "Profile", href: "/profile" },
  { label: "Settings", href: "/settings" },
];

export default function MobileNavDrawer() {
  const [open, setOpen] = useState(false);

  const closeDrawer = () => setOpen(false);

  return (
    <>
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-white shadow-sm md:hidden">
        <div className="font-bold text-lg">YourBrand</div>

        <button onClick={() => setOpen(true)}>
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Overlay + Drawer */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/40 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDrawer}
            />

            {/* Drawer */}
            <motion.div
              className="fixed top-0 left-0 h-full w-[80%] max-w-sm bg-white z-50 shadow-xl p-6"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="font-bold text-lg">Menu</div>
                <button onClick={closeDrawer}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Nav Links */}
              <nav className="flex flex-col gap-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeDrawer}
                    className="text-lg font-medium text-[var(--foreground)] hover:text-[var(--foreground)] transition"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              {/* Footer section (optional future upgrade) */}
              <div className="absolute bottom-6 left-6 right-6 text-xs text-gray-400">
                v1.0 marketplace UI
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}