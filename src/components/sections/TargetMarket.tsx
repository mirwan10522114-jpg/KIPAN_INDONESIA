"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Building2,
  Landmark,
  Building,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { TARGET_SEGMENTS, COMPANY } from "@/lib/data";
import { useContentStore } from "@/lib/content-store";
import SafeImage from "@/components/ui/safe-image";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  Building2,
  Landmark,
  Building,
};

export default function TargetMarket() {
  const [active, setActive] = useState(0);
  const segments = useContentStore((s) => s.targetSegments);
  const company = useContentStore((s) => s.company);
  const safeActive = Math.min(active, Math.max(0, segments.length - 1));
  const segment = segments[safeActive];
  const Icon = ICON_MAP[segment?.icon || "Home"] || Home;

  const waLink = `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(
    `Halo Dunia Pool & Pond, saya mewakili segmen "${segment?.title || ""}" dan ingin berkonsultasi.`
  )}`;

  return (
    <section
      id="target-pasar"
      className="relative py-20 lg:py-28 bg-gradient-to-b from-sky-50 to-white overflow-hidden"
    >
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mb-12"
        >
          <span className="inline-block px-4 py-1.5 bg-cyan-100 text-cyan-700 text-xs font-semibold tracking-wider uppercase rounded-full mb-4">
            Target Pasar
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-sky-950 leading-tight">
            Melayani Setiap{" "}
            <span className="text-gradient-water">Skala Proyek</span>
          </h2>
          <p className="mt-5 text-slate-600 text-base lg:text-lg leading-relaxed">
            Dari rumah pribadi hingga proyek institusi dan tender — pendekatan
            kami disesuaikan dengan kebutuhan spesifik masing-masing segmen.
          </p>
        </motion.div>

        {/* Tab selectors */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
          {segments.map((seg, idx) => {
            const SegIcon = ICON_MAP[seg.icon] || Home;
            const isActive = idx === active;
            return (
              <button
                key={seg.id}
                onClick={() => setActive(idx)}
                className={`group flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                  isActive
                    ? "bg-gradient-to-br from-sky-700 to-cyan-600 border-cyan-500 text-white shadow-xl shadow-cyan-500/30"
                    : "bg-white border-slate-200 text-slate-700 hover:border-cyan-300"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? "bg-white/20"
                      : "bg-cyan-50 group-hover:bg-cyan-100"
                  }`}
                >
                  <SegIcon
                    className={`w-5 h-5 ${
                      isActive ? "text-white" : "text-cyan-600"
                    }`}
                  />
                </div>
                <span
                  className={`text-sm font-semibold leading-tight ${
                    isActive ? "text-white" : "text-slate-700"
                  }`}
                >
                  {seg.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active segment detail */}
        <AnimatePresence mode="wait">
          <motion.div
            key={segment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center bg-white rounded-3xl p-6 lg:p-10 shadow-xl shadow-sky-900/5 border border-slate-100"
          >
            {/* Image */}
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-lg">
              <SafeImage
                src={segment?.image}
                alt={segment?.title || "Segment image"}
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-sky-950/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-500 flex items-center justify-center shadow-lg shrink-0">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {segment.title}
                  </h3>
                  <p className="text-cyan-300 text-xs">
                    Segmen {safeActive + 1} dari {segments.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div>
              <h3 className="text-2xl lg:text-3xl font-bold text-sky-950 mb-4">
                {segment.title}
              </h3>
              <p className="text-slate-600 text-base lg:text-lg leading-relaxed">
                {segment.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-6">
                {segment.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 bg-cyan-50 text-cyan-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-cyan-200"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-semibold px-6 py-3 rounded-full shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Konsultasi untuk Segmen Ini
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
