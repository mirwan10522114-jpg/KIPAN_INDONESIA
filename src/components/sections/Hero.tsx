"use client";

import { motion } from "framer-motion";
import { UserPlus, ChevronDown, Award, MapPin, ShieldCheck } from "lucide-react";
import { useContentStore } from "@/lib/content-store";
import SafeImage from "@/components/ui/safe-image";

export default function Hero() {
  const hero = useContentStore((s) => s.hero);
  const company = useContentStore((s) => s.company);
  const stats = useContentStore((s) => s.stats);

  return (
    <section
      id="beranda"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <SafeImage
          src={hero.backgroundImage}
          alt="KIPAN Indonesia"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-blue-900/75 to-blue-900/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 via-transparent to-blue-950/30" />
      </div>

      {/* Floating decorative shapes */}
      <div className="absolute top-1/4 right-10 w-72 h-72 bg-sky-400/20 rounded-full blur-3xl animate-wave" />
      <div className="absolute bottom-1/4 left-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="max-w-3xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mb-6"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span className="text-sky-50 text-xs sm:text-sm font-medium">
              {hero.badge}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight"
          >
            {hero.headlinePrefix}{" "}
            <span className="bg-gradient-to-r from-sky-300 to-cyan-500 bg-clip-text text-transparent">
              {hero.headlineHighlight}
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg lg:text-xl text-sky-100 leading-relaxed max-w-2xl"
          >
            {hero.subheadline}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row gap-4"
          >
            <a
              href="#pendaftaran"
              className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sky-400 to-blue-600 text-white font-semibold px-7 py-4 rounded-full shadow-2xl shadow-sky-500/40 hover:shadow-sky-500/60 hover:-translate-y-1 transition-all"
            >
              <UserPlus className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Daftar Menjadi Anggota
            </a>
            <a
              href="#program"
              className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md border border-white/30 text-white font-semibold px-7 py-4 rounded-full hover:bg-white/20 transition-all"
            >
              Lihat Program
              <ChevronDown className="w-4 h-4" />
            </a>
          </motion.div>

          {/* Mini stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-2xl"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center sm:text-left">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-sky-400">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-sky-200 mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Location badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-10 inline-flex items-center gap-2 text-sky-200 text-sm"
          >
            <MapPin className="w-4 h-4 text-sky-400" />
            Melayani seluruh Indonesia — dari Sabang sampai Merauke
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block"
      >
        <div className="flex flex-col items-center gap-2 text-sky-200">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-6 h-10 border-2 border-sky-200/50 rounded-full flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-sky-400 rounded-full"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
