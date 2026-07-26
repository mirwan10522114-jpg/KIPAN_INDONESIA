"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Shield, MessageCircle } from "lucide-react";
import { NAV_LINKS } from "@/lib/kipan-data";
import { useContentStore } from "@/lib/content-store";

export default function Navbar() {
  const company = useContentStore((s) => s.company);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const waLink = `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(
    "Halo " + company.name + ", saya ingin informasi lebih lanjut."
  )}`;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-lg shadow-blue-900/5"
          : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="#beranda" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-sky-500/30 group-hover:scale-105 transition-transform">
                <Shield className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-sky-400 rounded-full ring-2 ring-white animate-pulse" />
            </div>
            <div className="flex flex-col leading-tight">
              <span
                className={`font-bold text-base lg:text-lg transition-colors ${
                  scrolled ? "text-blue-950" : "text-white"
                }`}
              >
                {company.name} <span className="text-sky-400">Indonesia</span>
              </span>
              <span
                className={`text-[10px] lg:text-xs font-medium transition-colors ${
                  scrolled ? "text-slate-500" : "text-sky-100"
                }`}
              >
                {company.tagline}
              </span>
            </div>
          </a>

          {/* Desktop nav */}
          <ul className="hidden xl:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all hover:bg-sky-50 ${
                    scrolled
                      ? "text-slate-700 hover:text-blue-700"
                      : "text-sky-50 hover:text-white"
                  }`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Desktop CTA */}
          <a
            href="#pendaftaran"
            className="hidden xl:inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-500/40 hover:-translate-y-0.5 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            Daftar Pengurus
          </a>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`xl:hidden p-2 rounded-lg transition-colors ${
              scrolled ? "text-blue-950" : "text-white"
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
              <div className="bg-white rounded-2xl shadow-xl p-4 my-3 border border-sky-100">
                <ul className="space-y-1">
                  {NAV_LINKS.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="block px-4 py-3 text-sm font-medium text-slate-700 rounded-lg hover:bg-sky-50 hover:text-blue-700 transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
                <a
                  href="#pendaftaran"
                  onClick={() => setMobileOpen(false)}
                  className="mt-3 flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-semibold px-5 py-3 rounded-full shadow-lg"
                >
                  <MessageCircle className="w-4 h-4" />
                  Daftar Pengurus
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
