"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Shield, MessageCircle, ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { useContentStore } from "@/lib/content-store";

const NAV_GROUPS = [
  { label: "Beranda", href: "/" },
  {
    label: "Profil",
    items: [
      { label: "Tentang", href: "/#tentang" },
      { label: "Struktur", href: "/#struktur" },
      { label: "Pengurus", href: "/#pengurus" },
    ]
  },
  {
    label: "Informasi",
    items: [
      { label: "Program", href: "/program" },
      { label: "Berita", href: "/berita" },
      { label: "Galeri", href: "/galeri" },
    ]
  },
  {
    label: "Keanggotaan",
    items: [
      { label: "Pendaftaran", href: "/pendaftaran" },
      { label: "Lacak Status", href: "/lacak-pendaftaran" },
      { label: "Cek Anggota", href: "/cek-anggota" },
    ]
  },
  { label: "Kontak", href: "/kontak" }
];

export default function Navbar() {
  const company = useContentStore((s) => s.company);
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const isLightMode = scrolled || !isHomePage;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const waLink = `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(
    "Halo " + company.name + ", saya ingin informasi lebih lanjut."
  )}`;

  // Removed desktopNavLinks calculation since we now use NAV_GROUPS directly

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 pt-[env(safe-area-inset-top,0px)] ${
        isLightMode
          ? "bg-white/95 backdrop-blur-md shadow-lg shadow-blue-900/5"
          : "bg-gradient-to-b from-blue-950/80 via-blue-950/30 to-transparent"
      }`}
    >
      <nav className="w-full px-4 sm:px-6 lg:px-8 2xl:px-12">
        <div className="flex items-center justify-between gap-4 h-16 lg:h-20">
          {/* Logo */}
          <a href="#beranda" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative">
              <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-sky-500/30 group-hover:scale-105 transition-transform">
                <Shield className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-sky-400 rounded-full ring-2 ring-white animate-pulse" />
            </div>
            <div className="flex flex-col leading-tight">
              <span
                className={`font-bold text-base lg:text-lg transition-colors tracking-tight ${
                  isLightMode ? "text-blue-950" : "text-white"
                }`}
              >
                {company.name} <span className="text-sky-400">Indonesia</span>
              </span>
              <span
                className={`text-[10px] lg:text-xs font-medium transition-colors ${
                  isLightMode ? "text-slate-500" : "text-sky-100/90"
                }`}
              >
                {company.tagline}
              </span>
            </div>
          </a>

          {/* Desktop nav — centered & uncluttered */}
          <ul className="hidden xl:flex items-center justify-center gap-0.5 2xl:gap-1.5 flex-1 mx-4">
            {NAV_GROUPS.map((group) => (
              <li key={group.label} className="relative group/nav">
                {group.items ? (
                  <>
                    <button
                      className={`flex items-center gap-1.5 px-4 py-2 text-sm xl:text-base font-medium rounded-lg transition-all whitespace-nowrap ${
                        isLightMode
                          ? "text-slate-700 hover:text-blue-700 hover:bg-sky-50"
                          : "text-sky-100 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {group.label}
                      <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover/nav:rotate-180" />
                    </button>
                    {/* Dropdown Menu */}
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-xl shadow-blue-900/10 border border-slate-100 opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all duration-200 transform origin-top-left scale-95 group-hover/nav:scale-100">
                      <div className="p-2 flex flex-col gap-1">
                        {group.items.map((subItem) => (
                          <a
                            key={subItem.href}
                            href={subItem.href}
                            className="px-4 py-2 text-sm xl:text-base font-medium text-slate-700 hover:text-blue-700 hover:bg-sky-50 rounded-lg transition-colors"
                          >
                            {subItem.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <a
                    href={group.href}
                    className={`px-4 py-2 text-sm xl:text-base font-medium rounded-lg transition-all whitespace-nowrap ${
                      isLightMode
                        ? "text-slate-700 hover:text-blue-700 hover:bg-sky-50"
                        : "text-sky-100 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {group.label}
                  </a>
                )}
              </li>
            ))}
          </ul>

          {/* Desktop CTA — docked to far right, guaranteed single-line */}
          <div className="hidden xl:flex items-center shrink-0">
            <a
              href="/pendaftaran"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm xl:text-base font-semibold px-6 py-2.5 rounded-full shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all whitespace-nowrap shrink-0 flex-nowrap"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap leading-none font-semibold">Daftar Anggota</span>
            </a>
          </div>

          {/* Mobile toggle with 44px touch target */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`xl:hidden min-w-[44px] min-h-[44px] p-2.5 rounded-xl flex items-center justify-center transition-colors ${
              isLightMode ? "text-blue-950 hover:bg-slate-100/80" : "text-white hover:bg-white/10"
            }`}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="xl:hidden overflow-hidden"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-4 my-2 border border-sky-100 max-h-[calc(100dvh-5.5rem)] overflow-y-auto overscroll-contain">
                <ul className="space-y-1">
                  {NAV_GROUPS.map((group) => (
                    <li key={group.label} className="flex flex-col gap-1">
                      {group.items ? (
                        <div className="space-y-1">
                          <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                            {group.label}
                          </div>
                          <div className="pl-2 space-y-1">
                            {group.items.map((sub) => (
                              <a
                                key={sub.href}
                                href={sub.href}
                                onClick={() => setMobileOpen(false)}
                                className="block px-4 py-2 text-sm font-medium text-slate-700 rounded-xl hover:bg-sky-50 hover:text-blue-700 active:bg-sky-100 transition-colors"
                              >
                                {sub.label}
                              </a>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <a
                          href={group.href}
                          onClick={() => setMobileOpen(false)}
                          className="block px-4 py-3 text-sm font-medium text-slate-700 rounded-xl hover:bg-sky-50 hover:text-blue-700 active:bg-sky-100 transition-colors"
                        >
                          {group.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
                <a
                  href="/pendaftaran"
                  onClick={() => setMobileOpen(false)}
                  className="mt-3 flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-lg shadow-sky-500/25 active:scale-[0.98] transition-transform"
                >
                  <MessageCircle className="w-4 h-4" />
                  Daftar Anggota
                </a>

                {/* Mobile Admin Link */}
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 px-2">
                  <span>KIPAN SIM v2.0</span>
                  <a
                    href="#admin"
                    onClick={() => setMobileOpen(false)}
                    className="text-sky-600 hover:text-blue-700 font-medium py-1 px-2 rounded-lg hover:bg-sky-50 transition-colors"
                  >
                    Login Admin →
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
