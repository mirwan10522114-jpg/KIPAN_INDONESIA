import Navbar from "@/components/sections/Navbar";
import CekKeanggotaan from "@/components/sections/CekKeanggotaan";
import Footer from "@/components/sections/Footer";
import FloatingWhatsApp from "@/components/sections/FloatingWhatsApp";
import AdminPanel from "@/components/admin/AdminPanel";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cek Keanggotaan | KIPAN Indonesia",
  description: "Cek status keanggotaan Anda di database KIPAN Indonesia.",
};

export default function CekAnggotaPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 pt-20">
        <CekKeanggotaan />
      </main>
      <Footer />
      <FloatingWhatsApp />
      <AdminPanel />
    </div>
  );
}
