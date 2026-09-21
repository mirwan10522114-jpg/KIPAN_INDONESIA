import Navbar from "@/components/sections/Navbar";
import CTASection from "@/components/sections/CTASection";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";
import FloatingWhatsApp from "@/components/sections/FloatingWhatsApp";
import AdminPanel from "@/components/admin/AdminPanel";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontak | KIPAN Indonesia",
  description: "Hubungi KIPAN Indonesia.",
};

export default function KontakPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 pt-20">
        <CTASection />
        <Contact />
      </main>
      <Footer />
      <FloatingWhatsApp />
      <AdminPanel />
    </div>
  );
}
