"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Instagram,
  Globe,
  Send,
  MessageCircle,
} from "lucide-react";
import { useContentStore } from "@/lib/content-store";

export default function Contact() {
  const company = useContentStore((s) => s.company);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `*Pesan untuk KIPAN Indonesia*

*Nama:* ${form.name}
*Telepon:* ${form.phone}
*Email:* ${form.email}

*Pesan:*
${form.message}

Mohon segera dihubungi. Terima kasih.`;
    const waUrl = `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(
      text
    )}`;
    window.open(waUrl, "_blank");
  };

  const directWa = `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(
    "Halo KIPAN Indonesia, saya ingin informasi lebih lanjut."
  )}`;

  const contactItems = [
    {
      icon: MapPin,
      label: "Alamat Sekretariat",
      value: company.currentAddress,
      href: `https://maps.google.com/?q=${encodeURIComponent(
        company.currentAddress
      )}`,
      color: "text-rose-500",
      bg: "bg-rose-50",
    },
    {
      icon: Phone,
      label: "Telepon / WhatsApp",
      value: company.phone,
      href: directWa,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      icon: Mail,
      label: "Email",
      value: company.email,
      href: `mailto:${company.email}`,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      icon: Instagram,
      label: "Instagram",
      value: company.instagram,
      href: company.instagramUrl,
      color: "text-pink-500",
      bg: "bg-pink-50",
    },
    {
      icon: Globe,
      label: "Website",
      value: company.website,
      href: company.websiteUrl,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <section
      id="kontak"
      className="relative py-20 lg:py-28 bg-white overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mb-14"
        >
          <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-semibold tracking-wider uppercase rounded-full mb-4">
            Hubungi Kami
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-emerald-950 leading-tight">
            Butuh Informasi?{" "}
            <span className="text-gradient-water">Hubungi KIPAN</span>
          </h2>
          <p className="mt-5 text-slate-600 text-base lg:text-lg leading-relaxed">
            Tim pengurus KIPAN siap menjawab pertanyaan Anda seputar
            pendaftaran anggota, program, atau kerja sama.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="space-y-4"
          >
            {contactItems.map((item, idx) => (
              <a
                key={idx}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}
                >
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {item.label}
                  </div>
                  <div className="text-slate-800 font-medium mt-1 break-words">
                    {item.value}
                  </div>
                </div>
              </a>
            ))}
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-6 lg:p-10 shadow-xl border border-emerald-100"
          >
            <h3 className="text-2xl lg:text-3xl font-bold text-emerald-950 mb-2">
              Kirim Pesan
            </h3>
            <p className="text-slate-600 text-sm mb-6">
              Sampaikan pertanyaan atau pesan Anda. Pesan akan dikirim via
              WhatsApp ke sekretariat KIPAN.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Nama Anda"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  No. Telepon / WhatsApp
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  placeholder="0812xxxxxxx"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="email@domain.com"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Pesan Anda
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Saya ingin bertanya tentang..."
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-xl font-semibold hover:shadow-xl hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 group"
              >
                <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                Kirim Pesan via WhatsApp
              </button>
              <a
                href={directWa}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-white border border-slate-200 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-emerald-500" />
                Atau Chat Langsung
              </a>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
