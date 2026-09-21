import Navbar from "@/components/sections/Navbar";
import Services from "@/components/sections/Services";
import Footer from "@/components/sections/Footer";
import FloatingWhatsApp from "@/components/sections/FloatingWhatsApp";
import AdminPanel from "@/components/admin/AdminPanel";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Program Kerja | KIPAN Indonesia",
  description: "Program kerja dan layanan unggulan KIPAN Indonesia.",
};

export default function ProgramPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 pt-20">
        <Services />
      </main>
      <Footer />
      <FloatingWhatsApp />
      <AdminPanel />
    </div>
  );
}
