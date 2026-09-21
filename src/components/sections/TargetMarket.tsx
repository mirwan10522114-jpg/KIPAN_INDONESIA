"use client";

import { motion } from "framer-motion";
import {
  FileText,
  ClipboardCheck,
  GraduationCap,
  Award,
  BadgeCheck,
  ArrowRight,
} from "lucide-react";
import { useContentStore } from "@/lib/content-store";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText,
  ClipboardCheck,
  GraduationCap,
  Award,
  BadgeCheck,
};

export default function TargetMarket() {
  const flow = useContentStore((s) => s.pendaftaranFlow);

  return (
    <section
      id="alur-pendaftaran"
      className="relative py-20 lg:py-28 bg-gradient-to-br from-sky-50 to-cyan-50 overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-sky-100/50 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-100/50 rounded-full blur-3xl" />

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
            <FileText className="w-3.5 h-3.5" />
            Alur Pendaftaran
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-950 leading-tight">
            5 Langkah Menjadi{" "}
            <span className="text-gradient-water">Pengurus KIPAN</span>
          </h2>
          <p className="mt-5 text-slate-600 text-base lg:text-lg leading-relaxed">
            Dari pendaftaran online hingga pengangkatan sebagai pengurus aktif
            dengan kartu pengurus digital dan penempatan jabatan di bidang/divisi.
          </p>
        </motion.div>

        {/* Flow steps */}
        <div className="max-w-6xl mx-auto">
          {flow.map((step, idx) => {
            const Icon = ICON_MAP[step.icon] || FileText;
            const isLast = idx === flow.length - 1;
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative flex items-stretch gap-3 sm:gap-4 lg:gap-6 mb-4 last:mb-0"
              >
                {/* Step number circle */}
                <div className="relative flex flex-col items-center">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-xl shadow-sky-500/30 shrink-0"
                  >
                    <Icon className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
                  </motion.div>
                  {/* Connector */}
                  {!isLast && (
                    <div className="w-0.5 flex-1 bg-gradient-to-b from-sky-400 to-sky-200 mt-2 min-h-[30px] sm:min-h-[40px]" />
                  )}
                </div>

                {/* Content card */}
                <motion.div
                  whileHover={{ y: -3 }}
                  className="flex-1 bg-white rounded-2xl shadow-lg border border-sky-100 p-4 sm:p-5 lg:p-6 mb-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                        Step {step.step}
                      </span>
                      <span className="hidden sm:inline text-sky-300">•</span>
                    </div>
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-blue-950 flex-1">
                      {step.title}
                    </h3>
                    <span className="self-start sm:self-auto inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-sky-50 text-blue-700 border border-sky-200">
                      {step.status}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 sm:mt-3 leading-relaxed">
                    {step.desc}
                  </p>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mt-10 sm:mt-12"
        >
          <a
            href="/pendaftaran"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold px-7 py-4 rounded-full shadow-lg shadow-sky-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            Mulai Pendaftaran Sekarang
            <ArrowRight className="w-5 h-5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
