"use client";

import { useState, useEffect } from "react";
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
  const storePengurus = useContentStore((s) => s.pengurus);
  const storeStats = useContentStore((s) => s.testimonialStats);
  const [filter, setFilter] = useState<string>("Semua");
  const [apiPengurus, setApiPengurus] = useState<any[]>([]);
  const [useApi, setUseApi] = useState(false);
  const [apiStats, setApiStats] = useState<any[] | null>(null);

  // Fetch pengurus & real stats from API for consistency with admin
  useEffect(() => {
    fetch("/api/pengurus?limit=50", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          const mapped = (json.data || []).map((p: any) => ({
            id: p.id,
            name: p.anggota?.namaLengkap || "-",
            role: "Pengurus",
            level: (p.level || "").toLowerCase() === "nasional" ? "Nasional" : (p.level || "").toLowerCase() === "provinsi" ? "Provinsi" : "Kabupaten",
            wilayah: (p.level || "").toLowerCase() === "nasional" ? "Indonesia" : (p.kabupaten?.nama || p.provinsi?.nama || p.anggota?.kabupaten?.nama || p.anggota?.provinsi?.nama || ""),
            photo: p.anggota?.foto || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
            kontak: p.anggota?.email || "",
          }));
          setApiPengurus(mapped);
          setUseApi(true);
        }
      })
      .catch(() => {});

    // Sinkronisasi 4 kartu statistik dengan data dashboard admin
    fetch("/api/dashboard", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.stats) {
          const s = json.data.stats;
          const totalP = s.totalPengurus || s.totalAnggota || 0;
          const aktifP = s.anggotaAktif || totalP;
          const activePercent = totalP > 0 ? `${Math.round((aktifP / totalP) * 100)}%` : "—";
          const nasionalValue = s.pengurusNasional > 0
            ? `${s.pengurusNasional}`
            : (totalP > 0 ? `${totalP}` : "—");
          const provValue = s.totalProvinsi > 0 ? String(s.totalProvinsi) : "—";

          setApiStats([
            { value: activePercent, label: "Pengurus Aktif", icon: "Users" },
            { value: nasionalValue, label: "Pengurus Nasional", icon: "Award" },
            { value: provValue, label: "Provinsi Tersebar", icon: "MapPin" },
          ]);
        }
      })
      .catch(() => {});
  }, []);

  const pengurus = useApi ? apiPengurus : [];
  const stats = apiStats || storeStats;

  const filtered =
    filter === "Semua"
      ? pengurus
      : pengurus.filter((p) => p.level === filter);

  return (
    <section
      id="pengurus"
      className="relative py-20 lg:py-28 bg-gradient-to-br from-sky-50 via-white to-cyan-50 overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-100/50 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-100/40 rounded-full blur-3xl" />

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
            <Users className="w-3.5 h-3.5" />
            Pengurus KIPAN
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-950 leading-tight">
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
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14 max-w-4xl mx-auto"
        >
          {stats.map((stat, idx) => {
            const Icon = STATS_ICON_MAP[stat.icon] || Star;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -5, scale: 1.03 }}
                className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm text-center"
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-sky-50 to-cyan-100 flex items-center justify-center mb-3">
                  <Icon className="w-6 h-6 text-blue-600" />
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
                  ? "bg-gradient-to-r from-blue-600 to-blue-600 text-white shadow-md shadow-sky-500/30"
                  : "bg-white text-slate-600 hover:bg-sky-50 border border-slate-200"
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
                    <div className="absolute inset-0 bg-gradient-to-br from-sky-400 to-blue-600 rounded-2xl blur-sm opacity-50" />
                    <SafeImage
                      src={p.photo}
                      alt={p.name}
                      className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-white shadow-lg"
                      loading="eager"
                    />
                    {/* Level badge */}
                    <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-sky-500 text-white text-[9px] font-bold border-2 border-white shadow">
                      {p.level}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="text-center sm:text-left flex-1 min-w-0">
                    <h3 className="font-bold text-blue-950 text-base leading-tight">
                      {p.name}
                    </h3>
                    <p className="text-sm text-blue-600 font-medium mt-1">
                      {p.role}
                    </p>
                    <div className="flex flex-col gap-1 mt-2 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1 justify-center sm:justify-start">
                        <MapPin className="w-3 h-3 text-sky-500" />
                        {p.wilayah}
                      </span>
                      <span className="inline-flex items-center gap-1 justify-center sm:justify-start truncate">
                        <Mail className="w-3 h-3 text-sky-500 shrink-0" />
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
          <div className="text-center py-16 px-6 bg-white/70 backdrop-blur-sm rounded-3xl border-2 border-dashed border-sky-200 max-w-lg mx-auto shadow-sm my-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-100 flex items-center justify-center mb-3 text-blue-600">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-blue-950 mb-1">
              Belum Ada Data Pengurus
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
              Data pengurus resmi KIPAN akan otomatis ditampilkan di sini setelah ditambahkan dan diverifikasi melalui database atau panel admin.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
