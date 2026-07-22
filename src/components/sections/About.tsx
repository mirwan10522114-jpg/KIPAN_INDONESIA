"use client";

import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";
import {
  Award,
  Globe2,
  TrendingUp,
  Handshake,
  Calendar,
  MapPin,
  Sparkles,
  Building2,
} from "lucide-react";
import { STATS, COMPANY } from "@/lib/data";
import { useContentStore } from "@/lib/content-store";
import SafeImage from "@/components/ui/safe-image";

// Animated counter
function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => Math.round(latest));

  useEffect(() => {
    if (inView) {
      const controls = animate(motionValue, value, {
        duration: 2,
        ease: "easeOut",
      });
      return controls.stop;
    }
  }, [inView, value, motionValue]);

  useEffect(() => {
    return rounded.on("change", (v) => {
      if (ref.current) ref.current.textContent = v.toLocaleString("id-ID") + suffix;
    });
  }, [rounded, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

const MILESTONES = [
  {
    year: "1997",
    title: "Awal Mula di Cisarua",
    desc: "Berdiri pada 10 Agustus 1997 di Cisarua, Bandung Barat oleh Agus Setiawan.",
    icon: Calendar,
    color: "from-amber-400 to-orange-500",
  },
  {
    year: "2000s",
    title: "Ekspansi Layanan",
    desc: "Berkembang dari kontraktor lokal menjadi solusi end-to-end berskala nasional.",
    icon: TrendingUp,
    color: "from-cyan-400 to-sky-500",
  },
  {
    year: "2010s",
    title: "Kemitraan Astral Pool",
    desc: "Menjadi mitra resmi Astral Pool S.A. Barcelona, Spanyol — standar internasional.",
    icon: Handshake,
    color: "from-violet-400 to-purple-500",
  },
  {
    year: "Now",
    title: "1.000+ Proyek Selesai",
    desc: "Dipercaya klien di 34 provinsi seluruh Indonesia, dari Sabang sampai Merauke.",
    icon: Globe2,
    color: "from-emerald-400 to-teal-500",
  },
];

export default function About() {
  const about = useContentStore((s) => s.about);
  const company = useContentStore((s) => s.company);
  return (
    <section
      id="tentang"
      className="relative py-20 lg:py-28 overflow-hidden bg-gradient-to-br from-sky-950 via-sky-900 to-cyan-900"
    >
      {/* Decorative shapes */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-sky-500/15 rounded-full blur-3xl" />
      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-cyan-400/10 rounded-full blur-3xl animate-wave" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-500/20 backdrop-blur-sm border border-cyan-400/30 text-cyan-300 text-xs font-semibold tracking-wider uppercase rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Tentang Kami
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
            Dari Cisarua ke{" "}
            <span className="bg-gradient-to-r from-cyan-300 via-cyan-400 to-sky-400 bg-clip-text text-transparent">
              Seluruh Indonesia
            </span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mt-12">
          {/* Image side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-cyan-500/20 aspect-[4/5] sm:aspect-[5/4] border-4 border-white/10">
              <SafeImage
                src={about.image}
                alt="Proyek kolam renang villa oleh Dunia Pool & Pond"
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-sky-950/80 via-sky-950/20 to-transparent" />

              {/* Floating featured tag */}
              <div className="absolute top-4 left-4 bg-cyan-500/90 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                Featured Project
              </div>

              {/* Caption */}
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <p className="text-lg font-bold">Proyek Kolam Renang Villa</p>
                <p className="text-sm text-cyan-200">Dunia Pool & Pond</p>
              </div>
            </div>

            {/* Floating experience badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4, type: "spring" }}
              className="absolute -top-6 -right-6 lg:-right-10 bg-white rounded-2xl shadow-2xl p-5 border border-cyan-100 max-w-[200px] hover:scale-105 transition-transform"
            >
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-5 h-5 text-amber-500" />
                <div className="text-3xl font-extrabold text-gradient-water">
                  25+
                </div>
              </div>
              <div className="text-xs text-slate-600 font-medium leading-tight">
                Tahun Membangun Kepercayaan Klien
              </div>
            </motion.div>

            {/* Floating location badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5, type: "spring" }}
              className="absolute -bottom-4 -left-4 bg-gradient-to-br from-cyan-500 to-sky-600 rounded-2xl shadow-2xl p-4 flex items-center gap-3"
            >
              <MapPin className="w-6 h-6 text-white" />
              <div className="text-white">
                <div className="text-[10px] uppercase tracking-wider opacity-80">
                  Berbasis di
                </div>
                <div className="text-sm font-bold">Bandung Barat</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Text side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="order-1 lg:order-2"
          >
            <p className="text-sky-100/90 text-base lg:text-lg leading-relaxed">
              {about.paragraph1}
            </p>
            <p className="text-sky-100/90 text-base lg:text-lg leading-relaxed mt-4">
              {about.paragraph2}
            </p>
            <p className="text-sky-100/90 text-base lg:text-lg leading-relaxed mt-4">
              {about.paragraph3}
            </p>

            {/* Inline stats — colorful cards */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              {[
                { value: 25, suffix: "+", label: "Tahun Pengalaman", icon: Calendar, color: "text-amber-400", bg: "bg-amber-500/15", border: "border-amber-500/30" },
                { value: 1000, suffix: "+", label: "Proyek Selesai", icon: Building2, color: "text-cyan-400", bg: "bg-cyan-500/15", border: "border-cyan-500/30" },
                { value: 34, suffix: "", label: "Provinsi Dilayani", icon: Globe2, color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/30" },
                { value: 0, suffix: "", label: "Mitra Internasional", icon: Handshake, color: "text-violet-400", bg: "bg-violet-500/15", border: "border-violet-500/30", customText: "Astral Pool" },
              ].map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  whileHover={{ scale: 1.03, y: -3 }}
                  className={`bg-white/5 backdrop-blur-sm rounded-xl p-4 border ${stat.border} hover:bg-white/10 transition-all cursor-default`}
                >
                  <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div className="text-2xl lg:text-3xl font-extrabold text-white">
                    {stat.customText ? (
                      <span className="bg-gradient-to-r from-cyan-300 to-sky-400 bg-clip-text text-transparent text-xl">
                        {stat.customText}
                      </span>
                    ) : (
                      <Counter value={stat.value} suffix={stat.suffix} />
                    )}
                  </div>
                  <div className="text-xs lg:text-sm text-sky-200/80 mt-1">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Milestones timeline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="mt-20"
        >
          <h3 className="text-center text-2xl lg:text-3xl font-bold text-white mb-12">
            Perjalanan Kami{" "}
            <span className="text-cyan-300">Sejak 1997</span>
          </h3>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {MILESTONES.map((m, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                whileHover={{ y: -8 }}
                className="relative group"
              >
                {/* Connecting line */}
                {idx < MILESTONES.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-cyan-500/40 to-transparent" />
                )}

                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all hover:border-cyan-400/40">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${m.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform`}
                  >
                    <m.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-1">
                    {m.year}
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">{m.title}</h4>
                  <p className="text-sm text-sky-100/70 leading-relaxed">
                    {m.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
