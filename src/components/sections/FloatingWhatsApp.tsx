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
    "Halo " + company.name + " Indonesia, saya ingin informasi lebih lanjut."
  )}`;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] right-[calc(1.25rem+env(safe-area-inset-right,0px))] z-50 flex flex-col items-end gap-3"
        >
          {/* Tooltip card */}
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="bg-white rounded-2xl shadow-2xl p-4 w-72 max-w-[calc(100vw-2.5rem)] border border-slate-100"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-sky-950">
                        Sekretariat KIPAN
                      </div>
                      <div className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        Online aktif
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                    aria-label="Tutup"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                  Halo! Ada yang ingin ditanyakan seputar pendaftaran pengurus atau program kerja KIPAN Indonesia?
                </p>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:shadow-lg transition-shadow active:scale-[0.98]"
                >
                  Mulai Chat WhatsApp
                </a>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating button */}
          <button
            onClick={() => setOpen(!open)}
            className="relative w-14 h-14 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 shadow-2xl shadow-sky-500/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            aria-label="WhatsApp"
          >
            <span className="absolute inset-0 rounded-full bg-sky-400 animate-slow-ping pointer-events-none" />
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
