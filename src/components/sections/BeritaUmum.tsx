"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Newspaper,
  Calendar,
  ArrowUpRight,
} from "lucide-react";
import SafeImage from "@/components/ui/safe-image";

export default function BeritaUmum() {
  const [apiBerita, setApiBerita] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/berita?status=Published&jenis=UMUM", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          const mapped = json.data.map((b: any) => ({
            id: b.id,
            title: b.judul,
            image: b.thumbnail || "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80",
            excerpt: b.excerpt,
            date: b.publishedAt ? new Date(b.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : new Date(b.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
            konten: b.konten
          }));
          setApiBerita(mapped);
        } else {
          setApiBerita([]);
        }
      })
      .catch(() => setApiBerita([]))
      .finally(() => setLoading(false));
  }, []);

  const [selected, setSelected] = useState<any | null>(null);

  return (
    <section
      id="berita-terkini"
      className="relative py-20 lg:py-28 bg-gradient-to-b from-white to-purple-50/30 overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-100/40 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-sky-100/40 rounded-full blur-3xl" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-100 text-purple-700 text-xs font-semibold tracking-wider uppercase rounded-full mb-4">
            <Newspaper className="w-3.5 h-3.5" />
            Berita & Artikel Umum
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-950 leading-tight">
            Berita Terkini <span className="text-gradient-water">Sosialisasi</span>
          </h2>
          <p className="mt-5 text-slate-600 text-base lg:text-lg leading-relaxed">
            Kumpulan artikel, berita, dan wawasan terbaru seputar bahaya narkoba, upaya pencegahan, dan edukasi untuk masyarakat luas.
          </p>
        </motion.div>

        {/* Berita grid */}
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : apiBerita.length === 0 ? (
          <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-100">
            <div className="bg-purple-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Newspaper className="w-8 h-8 text-purple-400" />
            </div>
            <p className="text-slate-500 font-medium text-lg">Belum ada berita yang dipublikasikan.</p>
            <p className="text-slate-400 text-sm mt-1">Berita akan muncul setelah admin mempublikasikan konten.</p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {apiBerita.map((b, idx) => (
                <motion.article
                  key={b.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  whileHover={{ y: -5 }}
                  onClick={() => setSelected(b)}
                  className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow cursor-pointer border border-slate-100 flex flex-col"
                >
                  <div className="relative aspect-video overflow-hidden bg-slate-100">
                    <SafeImage src={b.image} alt={b.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="absolute top-3 left-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-md">
                      Umum
                    </span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-2">
                      <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3 text-purple-500" /> {b.date}</span>
                    </div>
                    <h3 className="font-bold text-blue-950 text-base leading-tight mb-2 line-clamp-2 group-hover:text-purple-700 transition-colors">{b.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-3 flex-1">{b.excerpt}</p>
                    <div className="flex items-center text-purple-600 text-xs font-semibold group-hover:gap-1.5 transition-all">
                      Baca selengkapnya <ArrowUpRight className="w-3.5 h-3.5 ml-1 opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Modal / Dialog Berita */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)} className="absolute inset-0 bg-blue-950/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-3xl overflow-hidden w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
              <div className="relative aspect-video w-full shrink-0">
                <SafeImage src={selected.image} alt={selected.title} className="w-full h-full object-cover" />
                <button onClick={() => setSelected(null)} className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-rose-500 text-white rounded-full backdrop-blur-md transition-colors shadow-lg"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 md:p-8 overflow-y-auto">
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500 mb-4">
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">Umum</span>
                  <span className="inline-flex items-center gap-1.5"><Calendar className="w-4 h-4 text-purple-500" /> {selected.date}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-blue-950 mb-6 leading-tight">{selected.title}</h2>
                <div className="prose prose-sm md:prose-base prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {selected.konten || selected.excerpt}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
