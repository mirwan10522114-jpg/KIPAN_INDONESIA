"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Newspaper,
  MapPin,
  Calendar,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import { useContentStore } from "@/lib/content-store";
import type { Berita } from "@/lib/kipan-data";
import SafeImage from "@/components/ui/safe-image";

const BERITA_CATEGORIES = ["Semua", "Nasional", "Provinsi", "Kabupaten"] as const;

export default function Products() {
  const berita = useContentStore((s) => s.berita);
  const [filter, setFilter] = useState<string>("Semua");
  const [selected, setSelected] = useState<Berita | null>(null);

  const filtered =
    filter === "Semua"
      ? berita
      : berita.filter((b) => b.category === filter);

  return (
    <section
      id="berita"
      className="relative py-20 lg:py-28 bg-gradient-to-b from-white to-sky-50/30 overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-sky-100/40 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyan-100/40 rounded-full blur-3xl" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-sky-100 text-blue-700 text-xs font-semibold tracking-wider uppercase rounded-full mb-4">
            <Newspaper className="w-3.5 h-3.5" />
            Berita & Kegiatan
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-950 leading-tight">
            Kabar Terbaru{" "}
            <span className="text-gradient-water">KIPAN</span>
          </h2>
          <p className="mt-5 text-slate-600 text-base lg:text-lg leading-relaxed">
            Ikuti perkembangan kegiatan KIPAN di seluruh Indonesia — dari tingkat
            nasional, provinsi, hingga kabupaten/kota.
          </p>
        </motion.div>

        {/* Filter pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap justify-center gap-2 mb-10"
        >
          <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 mr-2">
            <Filter className="w-3.5 h-3.5" />
            Filter:
          </div>
          {BERITA_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === cat
                  ? "bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-md shadow-sky-500/30"
                  : "bg-white text-slate-600 hover:bg-sky-50 border border-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Berita grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((b, idx) => (
              <motion.article
                key={b.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                whileHover={{ y: -5 }}
                onClick={() => setSelected(b)}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow cursor-pointer border border-slate-100"
              >
                {/* Image */}
                <div className="relative aspect-video overflow-hidden bg-slate-100">
                  <SafeImage
                    src={b.image}
                    alt={b.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <span className="absolute top-3 left-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-md">
                    {b.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-2">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-sky-500" />
                      {b.date}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-sky-500" />
                      {b.location}
                    </span>
                  </div>
                  <h3 className="font-bold text-blue-950 text-base leading-tight mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors">
                    {b.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-3">
                    {b.excerpt}
                  </p>
                  <div className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:gap-2 transition-all">
                    Baca selengkapnya
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Counter */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mt-10 text-sm text-slate-500"
        >
          Menampilkan{" "}
          <span className="font-semibold text-blue-700">{filtered.length}</span>{" "}
          dari{" "}
          <span className="font-semibold text-blue-700">{berita.length}</span>{" "}
          berita
        </motion.div>
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-[100] bg-blue-950/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-3xl overflow-hidden shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-slate-600 hover:bg-white hover:scale-110 transition-all"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative">
                <div className="relative h-64 md:h-80 overflow-hidden">
                  <SafeImage
                    src={selected.image}
                    alt={selected.title}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 via-blue-950/30 to-transparent" />

                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
                      <Newspaper className="w-3 h-3" />
                      {selected.category}
                    </span>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h2 className="text-2xl lg:text-3xl font-bold leading-tight">
                      {selected.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-sky-100">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-sky-300" />
                        {selected.date}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-sky-300" />
                        {selected.location}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 lg:p-8">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Ringkasan
                  </h3>
                  <p className="text-slate-600 text-sm lg:text-base leading-relaxed">
                    {selected.excerpt}
                  </p>
                  <p className="text-slate-600 text-sm lg:text-base leading-relaxed mt-4">
                    Berita lengkap akan segera tersedia. Hubungi pengurus KIPAN
                    setempat untuk informasi lebih detail.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
