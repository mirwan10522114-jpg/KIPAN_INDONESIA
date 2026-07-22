import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Dunia Pool & Pond — Konstruksi, Renovasi & Perawatan Kolam Renang Sejak 1997",
  description:
    "Dunia Pool & Pond adalah kontraktor kolam renang & kolam hias terpercaya sejak 1997. Melayani pembangunan, renovasi, perawatan, sistem sirkulasi, water treatment, dan penyediaan perlengkapan kolam. Partner resmi Astral Pool S.A. Spanyol.",
  keywords: [
    "kolam renang",
    "kontraktor kolam renang",
    "renovasi kolam renang",
    "perawatan kolam renang",
    "sistem sirkulasi kolam",
    "water treatment kolam",
    "Dunia Pool and Pond",
    "Astral Pool",
    "kolam hias",
    "Bandung",
  ],
  authors: [{ name: "Dunia Pool & Pond" }],
  openGraph: {
    title: "Dunia Pool & Pond — Spesialis Kolam Renang Sejak 1997",
    description:
      "Solusi end-to-end kolam renang: konstruksi, renovasi, perawatan, sistem sirkulasi & perlengkapan. Partner resmi Astral Pool S.A. Spanyol.",
    siteName: "Dunia Pool & Pond",
    type: "website",
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dunia Pool & Pond — Spesialis Kolam Renang Sejak 1997",
    description:
      "Solusi end-to-end kolam renang: konstruksi, renovasi, perawatan, sistem sirkulasi & perlengkapan. Partner resmi Astral Pool S.A. Spanyol.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${playfair.variable} font-sans antialiased bg-white text-slate-800`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
