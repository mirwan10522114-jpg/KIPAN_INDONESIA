import Navbar from "@/components/sections/Navbar";
import LacakPendaftaran from "@/components/sections/LacakPendaftaran";
import Footer from "@/components/sections/Footer";
import FloatingWhatsApp from "@/components/sections/FloatingWhatsApp";
import AdminPanel from "@/components/admin/AdminPanel";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lacak Pendaftaran | KIPAN Indonesia",
  description: "Lacak status pendaftaran anggota KIPAN Indonesia.",
};

export default function LacakPendaftaranPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 pt-20">
        <LacakPendaftaran />
      </main>
      <Footer />
      <FloatingWhatsApp />
      <AdminPanel />
    </div>
  );
}
