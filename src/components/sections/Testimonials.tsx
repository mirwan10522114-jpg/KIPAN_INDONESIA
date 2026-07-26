"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  MapPin,
  Users,
  Award,
  Star,
  type LucideIcon,
} from "lucide-react";
import { useContentStore } from "@/lib/content-store";
import SafeImage from "@/components/ui/safe-image";

const STATS_ICON_MAP: Record<string, LucideIcon> = {
  Users,
  Star,
  Award,
  MapPin,
};

const FILTERS = ["Semua", "Nasional", "Provinsi", "Kabupaten"] as const;

export default function Testimonials() {
  const pengurus = useContentStore((s) => s.pengurus);
  const stats = useContentStore((s) => s.testimonialStats);
  const [filter, setFilter] = useState<string>("Semua");

  const filtered =
    filter === "Semua"
      ? pengurus
      : pengurus.filter((p) => p.level === filter);

  return (
    <section
      id="pengurus"
      className="relative py-20 lg:py-28 bg-gradient-to-br from-emerald-50 via-white to-teal-50 overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-100/50 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-100/40 rounded-full blur-3xl" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-semibold tracking-wider uppercase rounded-full mb-4">
            <Users className="w-3.5 h-3.5" />
            Pengurus KIPAN
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-emerald-950 leading-tight">
            Pengurus{" "}
            <span className="text-gradient-water">Organisasi</span>
          </h2>
          <p className="mt-5 text-slate-600 text-base lg:text-lg leading-relaxed">
            Tim pengurus KIPAN dari tingkat nasional, provinsi, hingga
            kabupaten/kota yang menggerakkan organisasi.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14 max-w-5xl mx-auto"
        >
          {stats.map((stat, idx) => {
            const Icon = STATS_ICON_MAP[stat.icon] || Star;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -5, scale: 1.03 }}
                className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm text-center"
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center mb-3">
                  <Icon className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="text-2xl lg:text-3xl font-extrabold text-gradient-water">
                  {stat.value}
                </div>
                <div className="text-xs lg:text-sm text-slate-500 mt-1">
                  {stat.label}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap justify-center gap-2 mb-10"
        >
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === f
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/30"
                  : "bg-white text-slate-600 hover:bg-emerald-50 border border-slate-200"
              }`}
            >
              {f}
            </button>
          ))}
        </motion.div>

        {/* Pengurus grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((p, idx) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-5">
                  {/* Photo */}
                  <div className="relative shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl blur-sm opacity-50" />
                    <SafeImage
                      src={p.photo}
                      alt={p.name}
                      className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-white shadow-lg"
                      loading="eager"
                    />
                    {/* Level badge */}
                    <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold border-2 border-white shadow">
                      {p.level}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="text-center sm:text-left flex-1 min-w-0">
                    <h3 className="font-bold text-emerald-950 text-base leading-tight">
                      {p.name}
                    </h3>
                    <p className="text-sm text-emerald-600 font-medium mt-1">
                      {p.role}
                    </p>
                    <div className="flex flex-col gap-1 mt-2 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1 justify-center sm:justify-start">
                        <MapPin className="w-3 h-3 text-emerald-500" />
                        {p.wilayah}
                      </span>
                      <span className="inline-flex items-center gap-1 justify-center sm:justify-start truncate">
                        <Mail className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span className="truncate">{p.kontak}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Belum ada pengurus pada kategori ini.</p>
          </div>
        )}
      </div>
    </section>
  );
}
