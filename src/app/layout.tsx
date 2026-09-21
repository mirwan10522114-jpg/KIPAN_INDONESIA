import type { Metadata, Viewport } from "next";
import { Poppins, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0284c7" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export const metadata: Metadata = {
  title: "KIPAN Indonesia — Kader Inti Pemuda Anti Narkoba",
  description:
    "KIPAN (Kader Inti Pemuda Anti Narkoba) adalah komunitas pemuda Indonesia yang berkomitmen mencegah penyalahgunaan narkoba. Bergabunglah menjadi anggota di 38 provinsi dan 514 kabupaten/kota.",
  keywords: [
    "KIPAN",
    "Kader Inti Pemuda Anti Narkoba",
    "anti narkoba",
    "pencegahan narkoba",
    "pemuda anti narkoba",
    "BNN",
    "organisasi pemuda",
    "keanggotaan",
    "pendaftaran anggota",
  ],
  authors: [{ name: "KIPAN Indonesia" }],
  openGraph: {
    title: "KIPAN Indonesia — Kader Inti Pemuda Anti Narkoba",
    description:
      "Komunitas pemuda Indonesia yang berkomitmen mencegah penyalahgunaan narkoba. Bergabung menjadi anggota di 38 provinsi dan 514 kabupaten/kota.",
    siteName: "KIPAN Indonesia",
    type: "website",
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: "KIPAN Indonesia — Kader Inti Pemuda Anti Narkoba",
    description:
      "Komunitas pemuda Indonesia yang berkomitmen mencegah penyalahgunaan narkoba.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth overflow-x-hidden" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${playfair.variable} font-sans antialiased bg-white text-slate-800 overflow-x-hidden w-full max-w-full`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
