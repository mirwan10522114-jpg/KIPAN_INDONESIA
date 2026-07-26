"use client";

import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";
import {
  Target,
  Eye,
  Heart,
  CheckCircle2,
  Sparkles,
  MapPin,
  Award,
} from "lucide-react";
import { useContentStore } from "@/lib/content-store";
import SafeImage from "@/components/ui/safe-image";

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

export default function About() {
  const about = useContentStore((s) => s.about);
  const company = useContentStore((s) => s.company);

  return (
    <section
      id="tentang"
      className="relative py-20 lg:py-28 overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-900"
    >
      {/* Decorative shapes */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-3xl" />
      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-sky-400/10 rounded-full blur-3xl animate-wave" />

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
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-sky-500/20 backdrop-blur-sm border border-sky-400/30 text-sky-300 text-xs font-semibold tracking-wider uppercase rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Tentang KIPAN
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
            Gerakan Pemuda{" "}
            <span className="bg-gradient-to-r from-sky-300 via-cyan-400 to-sky-400 bg-clip-text text-transparent">
              Anti Narkoba
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
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-sky-500/20 aspect-[4/5] sm:aspect-[5/4] border-4 border-white/10">
              <SafeImage
                src={about.image}
                alt="Kegiatan KIPAN Indonesia"
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 via-blue-950/20 to-transparent" />

              <div className="absolute top-4 left-4 bg-sky-500/90 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                Bersama BNN RI
              </div>

              <div className="absolute bottom-6 left-6 right-6 text-white">
                <p className="text-lg font-bold">KIPAN Indonesia</p>
                <p className="text-sm text-sky-200">{company.tagline}</p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4, type: "spring" }}
              className="absolute -top-6 -right-6 lg:-right-10 bg-white rounded-2xl shadow-2xl p-5 border border-sky-100 max-w-[200px] hover:scale-105 transition-transform"
            >
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-5 h-5 text-amber-500" />
                <div className="text-3xl font-extrabold text-gradient-water">
                  <Counter value={20} suffix="rb+" />
                </div>
              </div>
              <div className="text-xs text-slate-600 font-medium leading-tight">
                Pengurus Aktif Nasional di 38 Provinsi
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5, type: "spring" }}
              className="absolute -bottom-4 -left-4 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl shadow-2xl p-4 flex items-center gap-3"
            >
              <MapPin className="w-6 h-6 text-white" />
              <div className="text-white">
                <div className="text-[10px] uppercase tracking-wider opacity-80">
                  Sejak
                </div>
                <div className="text-sm font-bold">{company.establishedYear}</div>
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
            {about.paragraphs.map((p, i) => (
              <p
                key={i}
                className="text-sky-100/90 text-base lg:text-lg leading-relaxed mt-4 first:mt-0"
              >
                {p}
              </p>
            ))}

            {/* Visi */}
            <div className="mt-8 bg-white/5 backdrop-blur-sm border border-sky-400/30 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Visi</h3>
              </div>
              <p className="text-sky-50 text-sm lg:text-base italic leading-relaxed">
                &ldquo;{about.visi}&rdquo;
              </p>
            </div>

            {/* Misi */}
            <div className="mt-4 bg-white/5 backdrop-blur-sm border border-sky-400/30 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Misi</h3>
              </div>
              <ul className="space-y-2">
                {about.misi.map((m, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    className="flex items-start gap-2 text-sky-100 text-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <span>{m}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Nilai Organisasi */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="mt-20"
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl lg:text-3xl font-bold text-white">
              Nilai{" "}
              <span className="text-sky-300">Organisasi</span>
            </h3>
            <p className="text-sky-200/70 text-sm mt-2">
              Prinsip yang menjadi pegangan setiap kader KIPAN
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {about.nilai.map((n, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white/5 backdrop-blur-sm border border-sky-400/20 rounded-2xl p-5 hover:bg-white/10 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center mb-3 shadow-lg">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-bold text-white mb-1">{n.title}</h4>
                <p className="text-sm text-sky-100/70 leading-relaxed">{n.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tujuan */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="mt-16"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl lg:text-3xl font-bold text-white">
              Tujuan{" "}
              <span className="text-sky-300">KIPAN</span>
            </h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {about.tujuan.map((t, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="flex items-start gap-3 bg-white/5 border border-sky-400/20 rounded-xl p-4"
              >
                <div className="w-8 h-8 rounded-full bg-sky-500/20 border border-sky-400/40 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-sky-300">{idx + 1}</span>
                </div>
                <span className="text-sky-50 text-sm">{t}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
