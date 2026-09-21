import Navbar from "@/components/sections/Navbar";
import Gallery from "@/components/sections/Gallery";
import Footer from "@/components/sections/Footer";
import FloatingWhatsApp from "@/components/sections/FloatingWhatsApp";
import AdminPanel from "@/components/admin/AdminPanel";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Galeri Kegiatan | KIPAN Indonesia",
  description: "Dokumentasi dan galeri kegiatan KIPAN Indonesia.",
};

export default function GaleriPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 pt-20">
        <Gallery />
      </main>
      <Footer />
      <FloatingWhatsApp />
      <AdminPanel />
    </div>
  );
}
