"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Quote, CheckCircle2, Award, PenLine } from "lucide-react";
import { useContentStore } from "@/lib/content-store";
import SafeImage from "@/components/ui/safe-image";

export default function LeaderMessage() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const leader = useContentStore((s) => s.leader);

  // Parallax effect on photo
  const photoY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const badgeRotate = useTransform(scrollYProgress, [0, 1], [-8, 8]);

  return (
    <section
      id="pimpinan"
      ref={sectionRef}
      className="relative py-20 lg:py-28 bg-gradient-to-br from-sky-950 via-sky-900 to-cyan-950 overflow-hidden"
    >
      {/* Decorative water pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl animate-wave" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl" />
      </div>

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Watermark quote */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <Quote
          className="absolute top-10 right-10 w-40 h-40 text-cyan-400/10"
          strokeWidth={1}
        />
      </motion.div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Photo side (left) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-5"
          >
            <motion.div
              style={{ y: photoY }}
              className="relative max-w-md mx-auto lg:mx-0"
            >
              {/* Decorative frame */}
              <div className="absolute -inset-3 bg-gradient-to-br from-cyan-400/40 via-sky-500/30 to-cyan-600/40 rounded-3xl blur-2xl animate-pulse" />

              {/* Photo card with tilt on hover */}
              <motion.div
                whileHover={{ rotateY: -5, rotateX: 3 }}
                transition={{ type: "spring", stiffness: 300 }}
                style={{ transformStyle: "preserve-3d", perspective: 1000 }}
                className="relative rounded-3xl overflow-hidden shadow-2xl shadow-cyan-500/20 border-4 border-white/10"
              >
                <SafeImage
                  src={leader.photo}
                  alt={`${leader.name} - ${leader.role}`}
                  className="w-full aspect-[3/4] object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-sky-950/95 via-sky-950/30 to-transparent" />

                {/* Verified badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                  className="absolute top-4 right-4 bg-emerald-500/90 backdrop-blur-md rounded-full p-2 shadow-lg flex items-center gap-1.5 pr-3"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span className="text-xs text-white font-semibold">Verified Founder</span>
                </motion.div>

                {/* Name overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="text-white">
                    <h3 className="text-2xl font-bold font-serif tracking-tight">
                      {leader.name}
                    </h3>
                    <p className="text-cyan-300 text-sm mt-1 font-medium tracking-wide">
                      {leader.role}
                    </p>
                    <div className="mt-3 inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full">
                      <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                      <span className="text-xs text-sky-100">
                        Founder sejak 1997
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating experience badge */}
              <motion.div
                style={{ rotate: badgeRotate }}
                className="absolute -bottom-4 -right-4 bg-gradient-to-br from-cyan-500 to-sky-600 text-white rounded-2xl px-5 py-4 shadow-2xl shadow-cyan-500/40"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-4 h-4" />
                  <span className="text-[10px] uppercase tracking-widest opacity-90">
                    Pengalaman
                  </span>
                </div>
                <div className="text-3xl font-extrabold leading-none">25+</div>
                <div className="text-xs opacity-90 mt-1">Tahun</div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Message side (right) */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="lg:col-span-7"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-500/20 backdrop-blur-sm border border-cyan-400/30 text-cyan-300 text-xs font-semibold tracking-wider uppercase rounded-full mb-4">
              <PenLine className="w-3.5 h-3.5" />
              Pesan dari Pimpinan
            </span>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Quote className="w-14 h-14 text-cyan-400/60 mb-6 fill-cyan-400/20" />
            </motion.div>

            <blockquote className="text-sky-50 text-lg lg:text-xl leading-relaxed font-light italic font-serif">
              {leader.message}
            </blockquote>

            {/* Highlights */}
            <div className="mt-8 space-y-3">
              {leader.highlights.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 + idx * 0.1 }}
                  whileHover={{ x: 6 }}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center shrink-0 group-hover:bg-cyan-500/30 transition-colors">
                    <CheckCircle2 className="w-4 h-4 text-cyan-300" />
                  </div>
                  <span className="text-sky-100 text-sm lg:text-base">
                    {item}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Signature line — formal & professional serif */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-10 pt-6 border-t border-white/10"
            >
              {/* Decorative line above signature */}
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "120px" }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="h-0.5 bg-gradient-to-r from-cyan-400 to-transparent mb-3"
              />
              <div
                className="text-3xl lg:text-4xl text-white font-serif italic font-medium tracking-wide"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                {leader.name}
              </div>
              <div className="text-sky-200 text-sm mt-2 font-medium tracking-wide">
                {leader.role}, Dunia Pool & Pond
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
