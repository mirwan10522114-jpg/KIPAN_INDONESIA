"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, ZoomIn, Upload, ImageOff, ChevronLeft, ChevronRight } from "lucide-react";
import { GALLERY_ITEMS, GALLERY_CATEGORIES, COMPANY } from "@/lib/data";
import type { GalleryItem } from "@/lib/data";
import { useContentStore } from "@/lib/content-store";
import SafeImage from "@/components/ui/safe-image";

export default function Gallery() {
  const [filter, setFilter] = useState<string>("Semua");
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const gallery = useContentStore((s) => s.gallery);
  const company = useContentStore((s) => s.company);

  const filtered =
    filter === "Semua"
      ? gallery
      : gallery.filter((item) => item.category === filter);

  const waLink = `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(
    "Halo Dunia Pool & Pond, saya ingin melihat portfolio lengkap proyek Anda."
  )}`;

  const openLightbox = (idx: number) => setLightboxIdx(idx);
  const closeLightbox = () => setLightboxIdx(null);
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIdx === null) return;
    setLightboxIdx((prev) => (prev === null ? null : (prev + 1) % filtered.length));
  };
  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIdx === null) return;
    setLightboxIdx((prev) =>
      prev === null ? null : (prev - 1 + filtered.length) % filtered.length
    );
  };

  return (
    <section
      id="galeri"
      className="relative py-20 lg:py-28 bg-gradient-to-b from-white via-sky-50/40 to-white overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-100/40 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sky-100/40 rounded-full blur-3xl" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12"
        >
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-100 text-cyan-700 text-xs font-semibold tracking-wider uppercase rounded-full mb-4">
              <ImageOff className="w-3.5 h-3.5" />
              Galeri Proyek
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-sky-950 leading-tight">
              Portofolio Karya{" "}
              <span className="text-gradient-water">Dunia Pool & Pond</span>
            </h2>
            <p className="mt-5 text-slate-600 text-base lg:text-lg leading-relaxed">
              Jelajahi beragam proyek kolam renang yang telah kami selesaikan —
              dari hunian pribadi hingga fasilitas komersial bintang lima.
            </p>
          </div>

          {/* Counter card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl p-4 border border-cyan-100 shadow-sm max-w-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center shadow-lg">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-sky-950">
                  {filtered.length}
                </div>
                <div className="text-xs text-slate-500">
                  Proyek ditampilkan
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Filter pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap gap-2 mb-10"
        >
          {GALLERY_CATEGORIES.map((cat) => (
            <motion.button
              key={cat}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(cat)}
              className={`relative px-5 py-2.5 rounded-full text-sm font-medium transition-all overflow-hidden ${
                filter === cat
                  ? "text-white shadow-lg shadow-cyan-500/30"
                  : "bg-white text-slate-600 hover:bg-sky-50 border border-slate-200"
              }`}
            >
              {filter === cat && (
                <motion.div
                  layoutId="activeFilter"
                  className="absolute inset-0 bg-gradient-to-r from-sky-700 to-cyan-600"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
              <span className="relative z-10">{cat}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Gallery grid — uniform square cells, no col-span (prevents gaps) */}
        <motion.div
          layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((item, idx) => (
              <motion.button
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                whileHover={{ y: -5 }}
                onClick={() => openLightbox(idx)}
                className="group relative overflow-hidden rounded-2xl bg-slate-200 shadow-sm hover:shadow-xl transition-shadow aspect-square"
              >
                <SafeImage
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-sky-950/80 via-sky-950/10 to-transparent opacity-70 group-hover:opacity-95 transition-opacity" />

                {/* Zoom icon */}
                <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                  <ZoomIn className="w-4 h-4 text-white" />
                </div>

                {/* Category tag */}
                <span className="absolute top-3 left-3 bg-gradient-to-r from-cyan-500 to-sky-600 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-md">
                  {item.category}
                </span>

                {/* Caption */}
                <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                  <h3 className="text-white font-semibold text-sm leading-tight line-clamp-1">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300">
                    <MapPin className="w-3 h-3 text-cyan-300 shrink-0" />
                    <span className="text-xs text-sky-100 truncate">
                      {item.location}
                    </span>
                  </div>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <ImageOff className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Belum ada foto pada kategori ini.</p>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mt-12"
        >
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-semibold px-7 py-4 rounded-full shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            Lihat Portfolio Lengkap via WhatsApp
          </a>
        </motion.div>
      </div>

      {/* Lightbox modal with prev/next navigation */}
      <AnimatePresence>
        {lightboxIdx !== null && filtered[lightboxIdx] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
            className="fixed inset-0 z-[100] bg-sky-950/95 backdrop-blur-md flex items-center justify-center p-4 lg:p-8"
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 lg:top-6 lg:right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Prev/Next buttons */}
            {filtered.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 lg:left-8 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 lg:right-8 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
                  aria-label="Next"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <motion.div
              key={filtered[lightboxIdx].id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="relative">
                <SafeImage
                  src={filtered[lightboxIdx]?.image}
                  alt={filtered[lightboxIdx]?.title || "Gallery image"}
                  className="w-full max-h-[70vh] object-contain bg-sky-950"
                  loading="eager"
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-sky-950/95 via-sky-950/80 to-transparent">
                  <span className="inline-block bg-gradient-to-r from-cyan-500 to-sky-600 text-white text-xs font-semibold px-3 py-1 rounded-full mb-2">
                    {filtered[lightboxIdx].category}
                  </span>
                  <h3 className="text-2xl font-bold text-white">
                    {filtered[lightboxIdx].title}
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-cyan-300" />
                      <span className="text-sm text-sky-100">
                        {filtered[lightboxIdx].location}
                      </span>
                    </div>
                    <span className="text-xs text-sky-300">
                      {lightboxIdx + 1} / {filtered.length}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
