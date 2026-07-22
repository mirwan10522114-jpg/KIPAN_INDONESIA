"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { useContentStore } from "@/lib/content-store";

export default function FloatingWhatsApp() {
  const company = useContentStore((s) => s.company);
  const [show, setShow] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const waLink = `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(
    "Halo " + company.name + ", saya ingin berkonsultasi tentang proyek kolam renang."
  )}`;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3"
        >
          {/* Tooltip card */}
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="bg-white rounded-2xl shadow-2xl p-4 w-72 border border-slate-100"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-sky-950">
                        Tim Dunia Pool
                      </div>
                      <div className="text-xs text-emerald-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        Online sekarang
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-600 mb-3">
                  Halo! Ada yang bisa kami bantu? Konsultasi proyek kolam Anda
                  sekarang — gratis.
                </p>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:shadow-lg transition-shadow"
                >
                  Mulai Chat
                </a>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating button */}
          <button
            onClick={() => setOpen(!open)}
            className="relative w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-2xl shadow-emerald-500/40 flex items-center justify-center hover:scale-110 transition-transform"
            aria-label="WhatsApp"
          >
            <span className="absolute inset-0 rounded-full bg-emerald-400 animate-slow-ping" />
            {open ? (
              <X className="w-6 h-6 text-white relative" />
            ) : (
              <MessageCircle className="w-7 h-7 text-white relative" />
            )}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
