"use client";

import { motion } from "framer-motion";
import {
  Landmark,
  Map,
  Building2,
  Users,
  User,
  ChevronDown,
  Network,
} from "lucide-react";
import { useContentStore } from "@/lib/content-store";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Landmark,
  Map,
  Building2,
  Users,
  User,
};

export default function StrukturOrganisasi() {
  const levels = useContentStore((s) => s.strukturLevels);

  return (
    <section
      id="struktur"
      className="relative py-20 lg:py-28 bg-white overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-96 h-96 bg-sky-100/40 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-100/40 rounded-full blur-3xl" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-sky-100 text-blue-700 text-xs font-semibold tracking-wider uppercase rounded-full mb-4">
            <Network className="w-3.5 h-3.5" />
            Struktur Organisasi
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-950 leading-tight">
            Hierarki{" "}
            <span className="text-gradient-water">KIPAN Indonesia</span>
          </h2>
          <p className="mt-5 text-slate-600 text-base lg:text-lg leading-relaxed">
            Dari pusat hingga daerah, KIPAN memiliki struktur berjenjang yang
            terintegrasi dalam satu sistem nasional.
          </p>
        </motion.div>

        {/* Hierarchy diagram */}
        <div className="max-w-5xl mx-auto">
          {levels.map((level, idx) => {
            const Icon = ICON_MAP[level.icon] || Landmark;
            const isLast = idx === levels.length - 1;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="relative"
              >
                {/* Connector line */}
                {!isLast && (
                  <div className="flex justify-center mb-2">
                    <div className="flex flex-col items-center">
                      <div className="w-0.5 h-8 bg-gradient-to-b from-sky-400 to-sky-300" />
                      <ChevronDown className="w-5 h-5 text-sky-400 -mt-2" />
                    </div>
                  </div>
                )}

                {/* Card */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -3 }}
                  className={`relative bg-white rounded-2xl sm:rounded-3xl shadow-xl border-2 border-sky-100 p-5 sm:p-6 lg:p-8 max-w-3xl mx-auto transition-all hover:border-sky-300 hover:shadow-2xl ${
                    idx === 0 ? "ring-4 ring-sky-100" : ""
                  }`}
                >
                  <div className="flex flex-col sm:grid sm:grid-cols-[auto_1fr_auto] gap-4 sm:gap-6 items-start sm:items-center">
                    <div className="flex items-center justify-between w-full sm:w-auto gap-3">
                      {/* Icon */}
                      <div
                        className={`w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br ${level.color} flex items-center justify-center shadow-lg shrink-0`}
                      >
                        <Icon className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
                      </div>
                      {/* Mobile count badge */}
                      <div className="sm:hidden bg-sky-50 border border-sky-200 rounded-xl px-3 py-1.5 text-right">
                        <div className="text-[10px] text-blue-600 uppercase tracking-wider font-semibold">
                          Cakupan
                        </div>
                        <div className="text-sm font-extrabold text-blue-700">
                          {level.count}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="w-full">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                          Level {idx + 1}: {level.level}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg lg:text-xl font-bold text-blue-950 mb-1">
                        {level.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {level.desc}
                      </p>
                    </div>

                    {/* Desktop count badge */}
                    <div className="hidden sm:block bg-sky-50 border border-sky-200 rounded-2xl px-4 py-3 text-center shrink-0">
                      <div className="text-xs text-blue-600 uppercase tracking-wider font-semibold">
                        Cakupan
                      </div>
                      <div className="text-lg font-extrabold text-blue-700">
                        {level.count}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Info card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto mt-12 bg-gradient-to-r from-sky-50 to-cyan-50 border border-sky-200 rounded-2xl p-6 text-center"
        >
          <p className="text-sm text-slate-700 leading-relaxed">
            <strong className="text-blue-700">Sistem Informasi Manajemen Kepengurusan KIPAN (SIM-KIPAN)</strong> mengelola seluruh siklus hidup pengurus—mulai dari pendaftaran, verifikasi berjenjang, pelatihan, hingga pengangkatan dengan jabatan di bidang/divisi dan kartu pengurus digital.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
