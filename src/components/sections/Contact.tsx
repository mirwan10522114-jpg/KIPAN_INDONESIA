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
    const text = `*Konsultasi Proyek Kolam - Dunia Pool & Pond*

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
    "Halo Dunia Pool & Pond, saya ingin konsultasi proyek kolam."
  )}`;

  const contactItems = [
    {
      icon: MapPin,
      label: "Alamat",
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
      color: "text-sky-500",
      bg: "bg-sky-50",
    },
  ];

  return (
    <section
      id="kontak"
      className="relative py-20 lg:py-28 bg-white overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-96 h-96 bg-sky-100/40 rounded-full blur-3xl" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mb-14"
        >
          <span className="inline-block px-4 py-1.5 bg-cyan-100 text-cyan-700 text-xs font-semibold tracking-wider uppercase rounded-full mb-4">
            Hubungi Kami
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-sky-950 leading-tight">
            Mulai Konsultasi{" "}
            <span className="text-gradient-water">Proyek Anda</span>
          </h2>
          <p className="mt-5 text-slate-600 text-base lg:text-lg leading-relaxed">
            Tim ahli kami siap mendampingi Anda dari konsep hingga kolam impian
            terwujud — termasuk perancangan sistem sirkulasi kolam secara gratis.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: contact info */}
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

            {/* Map embed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="rounded-2xl overflow-hidden shadow-md border border-slate-100"
            >
              <iframe
                title="Lokasi Dunia Pool & Pond"
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  company.currentAddress
                )}&output=embed`}
                width="100%"
                height="240"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </motion.div>
          </motion.div>

          {/* Right: form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-3xl p-6 lg:p-10 shadow-xl border border-sky-100"
          >
            <h3 className="text-2xl lg:text-3xl font-bold text-sky-950 mb-2">
              Kirim Pesan
            </h3>
            <p className="text-slate-600 text-sm mb-6">
              Konsultasikan proyek Anda — termasuk perancangan sistem sirkulasi
              kolam secara gratis.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Nama Lengkap
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Nama Anda"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  No. Telepon / WhatsApp
                </label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  placeholder="0812xxxxxxx"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="email@domain.com"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Ceritakan proyek kolam Anda...
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Saya ingin membangun kolam renang di..."
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-sky-600 text-white py-4 rounded-xl font-semibold hover:shadow-xl hover:shadow-cyan-500/30 transition-all flex items-center justify-center gap-2 group"
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
