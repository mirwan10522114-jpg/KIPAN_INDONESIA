import Navbar from "@/components/sections/Navbar";
import BeritaUmum from "@/components/sections/BeritaUmum";
import Footer from "@/components/sections/Footer";
import FloatingWhatsApp from "@/components/sections/FloatingWhatsApp";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Berita Terkini | KIPAN Indonesia",
  description: "Berita dan wawasan umum seputar kenarkobaan dari KIPAN Indonesia.",
};

export default function BeritaTerkiniPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 pt-20">
        <BeritaUmum />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
