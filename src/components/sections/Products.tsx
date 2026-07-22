"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShoppingBag,
  Tag,
  CheckCircle2,
  MessageCircle,
  Boxes,
  Filter,
} from "lucide-react";
import { useContentStore } from "@/lib/content-store";
import { PRODUCT_CATEGORIES } from "@/lib/products-data";
import type { ProductItem } from "@/lib/content-store";
import { COMPANY } from "@/lib/data";
import SafeImage from "@/components/ui/safe-image";

export default function Products() {
  const products = useContentStore((s) => s.products);
  const [filter, setFilter] = useState<string>("Semua");
  const [selected, setSelected] = useState<ProductItem | null>(null);

  const filtered =
    filter === "Semua"
      ? products
      : products.filter((p) => p.category === filter);

  const waLink = (productName: string) =>
    `https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent(
      `Halo Dunia Pool & Pond, saya tertarik dengan produk "${productName}". Mohon info ketersediaan, harga, dan detail lebih lanjut.`
    )}`;

  return (
    <section
      id="produk"
      className="relative py-20 lg:py-28 bg-gradient-to-b from-white via-sky-50/40 to-white overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-100/40 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-sky-100/40 rounded-full blur-3xl" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-100 text-cyan-700 text-xs font-semibold tracking-wider uppercase rounded-full mb-4">
            <Boxes className="w-3.5 h-3.5" />
            Katalog Produk
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-sky-950 leading-tight">
            Perlengkapan Kolam{" "}
            <span className="text-gradient-water">Lengkap</span>
          </h2>
          <p className="mt-5 text-slate-600 text-base lg:text-lg leading-relaxed">
            20+ kategori produk perlengkapan kolam renang berkualitas dari merek
            ternama dunia. Klik setiap produk untuk melihat detail spesifikasi.
          </p>
        </motion.div>

        {/* Filter pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap justify-center gap-2 mb-10"
        >
          <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 mr-2">
            <Filter className="w-3.5 h-3.5" />
            Filter:
          </div>
          {PRODUCT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === cat
                  ? "bg-gradient-to-r from-sky-700 to-cyan-600 text-white shadow-md shadow-cyan-500/30"
                  : "bg-white text-slate-600 hover:bg-sky-50 border border-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Product grid */}
        <motion.div
          layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((product, idx) => (
              <motion.button
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                whileHover={{ y: -5 }}
                onClick={() => setSelected(product)}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow text-left"
              >
                {/* Product image */}
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  <SafeImage
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-sky-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Category badge */}
                  <span className="absolute top-2 left-2 bg-gradient-to-r from-cyan-500 to-sky-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-md">
                    {product.category}
                  </span>

                  {/* Number badge */}
                  <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-xs font-bold text-sky-700 shadow-md">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* Product info */}
                <div className="p-3">
                  <h3 className="font-bold text-sky-950 text-sm leading-tight line-clamp-2 min-h-[2.5rem]">
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {product.shortDesc}
                  </p>

                  {/* Brand count or spec count */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {product.brands && product.brands.length > 0
                        ? `${product.brands.length} merek`
                        : product.specs.length > 0
                        ? `${product.specs[0].options.length} pilihan`
                        : "Lihat detail"}
                    </span>
                    <span className="text-[10px] font-semibold text-cyan-600 group-hover:text-cyan-700 transition-colors">
                      Detail →
                    </span>
                  </div>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <Boxes className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Belum ada produk pada kategori ini.</p>
          </div>
        )}

        {/* Counter */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mt-10 text-sm text-slate-500"
        >
          Menampilkan{" "}
          <span className="font-semibold text-sky-700">{filtered.length}</span>{" "}
          dari{" "}
          <span className="font-semibold text-sky-700">{products.length}</span>{" "}
          produk
        </motion.div>
      </div>

      {/* Product detail modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-[100] bg-sky-950/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-3xl overflow-hidden shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Close button */}
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-slate-600 hover:bg-white hover:scale-110 transition-all"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid md:grid-cols-2 gap-0">
                {/* Left: Image */}
                <div className="relative h-64 md:h-full min-h-[400px] overflow-hidden">
                  <SafeImage
                    src={selected?.image}
                    alt={selected?.name || "Product image"}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-sky-950/40 to-transparent" />

                  {/* Category badge */}
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-sky-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
                      <Tag className="w-3 h-3" />
                      {selected.category}
                    </span>
                  </div>
                </div>

                {/* Right: Detail */}
                <div className="p-6 lg:p-8 flex flex-col">
                  {/* Title */}
                  <h2 className="text-2xl lg:text-3xl font-extrabold text-sky-950 leading-tight">
                    {selected.name}
                  </h2>
                  <p className="text-slate-500 mt-2 text-sm lg:text-base">
                    {selected.shortDesc}
                  </p>

                  {/* Long description */}
                  <div className="mt-5">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Deskripsi Produk
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {selected.longDesc}
                    </p>
                  </div>

                  {/* Brands */}
                  {selected.brands && selected.brands.length > 0 && (
                    <div className="mt-5">
                      <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Pilihan Merek
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selected.brands.map((brand) => (
                          <span
                            key={brand}
                            className="inline-flex items-center gap-1.5 bg-sky-50 text-sky-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-sky-200"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500" />
                            {brand}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Specs */}
                  {selected.specs.length > 0 && (
                    <div className="mt-5 space-y-3">
                      <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Spesifikasi & Pilihan
                      </h3>
                      {selected.specs.map((spec, idx) => (
                        <div key={idx}>
                          <div className="text-xs font-semibold text-slate-500 mb-1.5">
                            {spec.label}
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {spec.options.map((opt) => (
                              <span
                                key={opt}
                                className="inline-block bg-cyan-50 text-cyan-700 text-xs font-medium px-2.5 py-1 rounded-md border border-cyan-200"
                              >
                                {opt}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CTA */}
                  <a
                    href={waLink(selected.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto pt-6"
                  >
                    <span className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                      <MessageCircle className="w-5 h-5" />
                      Tanya Ketersediaan via WhatsApp
                    </span>
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
