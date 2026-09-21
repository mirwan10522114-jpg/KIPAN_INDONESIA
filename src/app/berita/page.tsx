import Navbar from "@/components/sections/Navbar";
import Products from "@/components/sections/Products";
import Testimonials from "@/components/sections/Testimonials";
import Footer from "@/components/sections/Footer";
import FloatingWhatsApp from "@/components/sections/FloatingWhatsApp";
import AdminPanel from "@/components/admin/AdminPanel";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Berita & Artikel | KIPAN Indonesia",
  description: "Berita dan artikel terbaru dari KIPAN Indonesia.",
};

export default function BeritaPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 pt-20">
        <Products />
        <Testimonials />
      </main>
      <Footer />
      <FloatingWhatsApp />
      <AdminPanel />
    </div>
  );
}
