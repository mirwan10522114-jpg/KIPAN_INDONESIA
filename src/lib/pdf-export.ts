// ============================================================
// PDF Export Helper — Generate PDF laporan untuk SIM-KIPAN
// Menggunakan jsPDF + jspdf-autotable
// ============================================================
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface PdfColumn {
  header: string;
  dataKey: string;
}

interface PdfOptions {
  title: string;
  subtitle?: string;
  filename: string;
  columns: PdfColumn[];
  rows: any[];
  orientation?: "portrait" | "landscape";
  // Optional footer summary
  summary?: Array<{ label: string; value: string | number }>;
}

const COLORS = {
  primary: [30, 58, 138] as [number, number, number], // blue-900
  accent: [14, 165, 233] as [number, number, number], // sky-500
  light: [241, 245, 249] as [number, number, number], // slate-100
  dark: [15, 23, 42] as [number, number, number], // slate-900
  gray: [100, 116, 139] as [number, number, number], // slate-500
  emerald: [16, 185, 129] as [number, number, number],
  rose: [244, 63, 94] as [number, number, number],
  amber: [245, 158, 11] as [number, number, number],
};

export function exportToPdf({
  title,
  subtitle,
  filename,
  columns,
  rows,
  orientation = "portrait",
  summary,
}: PdfOptions) {
  const doc = new jsPDF({ orientation, unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // ============ HEADER ============
  // Top color bar
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 4, "F");

  // Logo box
  doc.setFillColor(...COLORS.accent);
  doc.roundedRect(margin, 10, 12, 12, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("KIPAN", margin + 6, 16, { align: "center" });
  doc.setFontSize(7);
  doc.text("INDONESIA", margin + 6, 19, { align: "center" });

  // Title
  doc.setTextColor(...COLORS.primary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(title, margin + 16, 16);

  // Subtitle (date / context)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.gray);
  const subtitleText = subtitle || `Dihasilkan: ${new Date().toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })}`;
  doc.text(subtitleText, margin + 16, 21);

  // Divider line
  doc.setDrawColor(...COLORS.light);
  doc.setLineWidth(0.5);
  doc.line(margin, 26, pageWidth - margin, 26);

  // ============ SUMMARY CARDS (optional) ============
  let yPos = 32;
  if (summary && summary.length > 0) {
    const cardWidth = (pageWidth - 2 * margin - (summary.length - 1) * 2) / summary.length;
    const cardHeight = 14;
    summary.forEach((s, i) => {
      const x = margin + i * (cardWidth + 2);
      doc.setFillColor(...COLORS.light);
      doc.roundedRect(x, yPos, cardWidth, cardHeight, 1.5, 1.5, "F");
      doc.setTextColor(...COLORS.gray);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.text(s.label.toUpperCase(), x + 2, yPos + 4);
      doc.setTextColor(...COLORS.primary);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(String(s.value), x + 2, yPos + 11);
    });
    yPos += cardHeight + 4;
  }

  // ============ TABLE ============
  autoTable(doc, {
    startY: yPos,
    head: [columns.map((c) => c.header)],
    body: rows.map((r) => columns.map((c) => r[c.dataKey] ?? "-")),
    margin: { left: margin, right: margin },
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 2,
      textColor: COLORS.dark,
      lineColor: COLORS.light,
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: COLORS.primary,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    didDrawPage: () => {
      // Footer with page number
      const pageStr = `Halaman ${doc.getNumberOfPages()}`;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...COLORS.gray);
      doc.text(pageStr, pageWidth - margin, pageHeight - 5, { align: "right" });
      doc.text("SIM-KIPAN — Sistem Informasi Keanggotaan KIPAN Indonesia", margin, pageHeight - 5);
    },
  });

  // ============ SAVE ============
  const finalFilename = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  doc.save(finalFilename);
}

// ============================================================
// Specialized exporters untuk setiap page
// ============================================================

export function exportWilayahPdf(data: any[], tab: "provinsi" | "kabupaten", filters?: { search?: string; status?: string; provinsi?: string }) {
  const isProvinsi = tab === "provinsi";
  const subtitleParts: string[] = [];
  if (filters?.search) subtitleParts.push(`Pencarian: "${filters.search}"`);
  if (filters?.status && filters.status !== "Semua") subtitleParts.push(`Status: ${filters.status}`);
  if (filters?.provinsi && filters.provinsi !== "Semua") subtitleParts.push(`Provinsi: ${filters.provinsi}`);
  const subtitle = subtitleParts.length > 0 ? `${subtitleParts.join(" • ")} • ${new Date().toLocaleDateString("id-ID")}` : `Semua data • ${new Date().toLocaleDateString("id-ID")}`;

  const totalAnggota = data.reduce((sum, d) => sum + (d.jumlahAnggota || 0), 0);
  const totalPengurus = data.reduce((sum, d) => sum + (d.jumlahPengurus || 0), 0);

  exportToPdf({
    title: `Data Wilayah — ${isProvinsi ? "Provinsi" : "Kabupaten/Kota"}`,
    subtitle,
    filename: `Data-Wilayah-${isProvinsi ? "Provinsi" : "Kabupaten"}-${new Date().toISOString().split("T")[0]}`,
    orientation: "landscape",
    summary: [
      { label: `Total ${isProvinsi ? "Provinsi" : "Kabupaten"}`, value: data.length },
      { label: "Aktif", value: data.filter((d) => d.status === "Aktif").length },
      { label: "Pembentukan", value: data.filter((d) => d.status === "Pembentukan").length },
      { label: "Total Anggota", value: totalAnggota },
      { label: "Total Pengurus", value: totalPengurus },
    ],
    columns: isProvinsi
      ? [
          { header: "Kode", dataKey: "kode" },
          { header: "Nama Provinsi", dataKey: "nama" },
          { header: "Ketua", dataKey: "ketua" },
          { header: "Status", dataKey: "status" },
          { header: "Kabupaten", dataKey: "jumlahKabupaten" },
          { header: "Anggota", dataKey: "jumlahAnggota" },
          { header: "Pengurus", dataKey: "jumlahPengurus" },
        ]
      : [
          { header: "Kode", dataKey: "kode" },
          { header: "Nama Kabupaten/Kota", dataKey: "nama" },
          { header: "Provinsi", dataKey: "provinsiNama" },
          { header: "Ketua", dataKey: "ketua" },
          { header: "Status", dataKey: "status" },
          { header: "Anggota", dataKey: "jumlahAnggota" },
          { header: "Pengurus", dataKey: "jumlahPengurus" },
        ],
    rows: data.map((d) => ({
      ...d,
      ketua: d.ketua || "-",
      jumlahKabupaten: d.jumlahKabupaten || 0,
      jumlahAnggota: d.jumlahAnggota || 0,
      jumlahPengurus: d.jumlahPengurus || 0,
    })),
  });
}

export function exportPengurusPdf(data: any[], filters?: { search?: string; level?: string; status?: string; provinsi?: string }) {
  const subtitleParts: string[] = [];
  if (filters?.search) subtitleParts.push(`Pencarian: "${filters.search}"`);
  if (filters?.level && filters.level !== "Semua") subtitleParts.push(`Level: ${filters.level}`);
  if (filters?.status && filters.status !== "Semua") subtitleParts.push(`Status: ${filters.status}`);
  if (filters?.provinsi && filters.provinsi !== "Semua") subtitleParts.push(`Provinsi: ${filters.provinsi}`);
  const subtitle = subtitleParts.length > 0 ? `${subtitleParts.join(" • ")} • ${new Date().toLocaleDateString("id-ID")}` : `Semua data • ${new Date().toLocaleDateString("id-ID")}`;

  const nasionalCount = data.filter((d) => (d.level || "").toLowerCase() === "nasional").length;
  const provinsiCount = data.filter((d) => (d.level || "").toLowerCase() === "provinsi").length;
  const kabupatenCount = data.filter((d) => (d.level || "").toLowerCase() === "kabupaten").length;
  const aktifCount = data.filter((d) => d.status === "Aktif").length;

  exportToPdf({
    title: "Data Pengurus KIPAN",
    subtitle,
    filename: `Data-Pengurus-${new Date().toISOString().split("T")[0]}`,
    orientation: "landscape",
    summary: [
      { label: "Total Pengurus", value: data.length },
      { label: "Nasional", value: nasionalCount },
      { label: "Provinsi", value: provinsiCount },
      { label: "Kabupaten", value: kabupatenCount },
      { label: "Aktif", value: aktifCount },
    ],
    columns: [
      { header: "Nama", dataKey: "nama" },
      { header: "Jabatan", dataKey: "jabatan" },
      { header: "Bidang", dataKey: "bidang" },
      { header: "Level", dataKey: "level" },
      { header: "Wilayah", dataKey: "wilayah" },
      { header: "Email", dataKey: "email" },
      { header: "HP", dataKey: "hp" },
      { header: "Status", dataKey: "status" },
    ],
    rows: data.map((d) => ({
      nama: d.nama || "-",
      jabatan: d.jabatan || "-",
      bidang: d.bidang || "-",
      level: d.level || "-",
      wilayah: d.wilayah || "-",
      email: d.email || "-",
      hp: d.hp || "-",
      status: d.status || "-",
    })),
  });
}

export function exportAnggotaPdf(data: any[], filters?: { search?: string; status?: string; provinsi?: string }) {
  const subtitleParts: string[] = [];
  if (filters?.search) subtitleParts.push(`Pencarian: "${filters.search}"`);
  if (filters?.status && filters.status !== "Semua") subtitleParts.push(`Status: ${filters.status}`);
  if (filters?.provinsi && filters.provinsi !== "Semua") subtitleParts.push(`Provinsi: ${filters.provinsi}`);
  const subtitle = subtitleParts.length > 0 ? `${subtitleParts.join(" • ")} • ${new Date().toLocaleDateString("id-ID")}` : `Semua data • ${new Date().toLocaleDateString("id-ID")}`;

  const aktifCount = data.filter((d) => d.status === "Aktif").length;
  const nonaktifCount = data.filter((d) => d.status !== "Aktif").length;
  const provinsiCount = new Set(data.map((d) => d.provinsi?.nama).filter(Boolean)).size;
  const kabupatenCount = new Set(data.map((d) => d.kabupaten?.nama).filter(Boolean)).size;

  exportToPdf({
    title: "Data Anggota KIPAN",
    subtitle,
    filename: `Data-Anggota-${new Date().toISOString().split("T")[0]}`,
    orientation: "landscape",
    summary: [
      { label: "Total Anggota", value: data.length },
      { label: "Aktif", value: aktifCount },
      { label: "Nonaktif", value: nonaktifCount },
      { label: "Provinsi", value: provinsiCount },
      { label: "Kabupaten", value: kabupatenCount },
    ],
    columns: [
      { header: "NIP", dataKey: "nia" },
      { header: "Nama", dataKey: "namaLengkap" },
      { header: "Jenis Kelamin", dataKey: "jenisKelamin" },
      { header: "Kabupaten", dataKey: "kabupaten" },
      { header: "Provinsi", dataKey: "provinsi" },
      { header: "Angkatan", dataKey: "angkatan" },
      { header: "Email", dataKey: "email" },
      { header: "HP", dataKey: "hp" },
      { header: "Status", dataKey: "status" },
    ],
    rows: data.map((d) => ({
      nia: d.nia || "-",
      namaLengkap: d.namaLengkap || "-",
      jenisKelamin: d.jenisKelamin === "L" ? "Laki-laki" : d.jenisKelamin === "P" ? "Perempuan" : "-",
      kabupaten: d.kabupaten?.nama || "-",
      provinsi: d.provinsi?.nama || "-",
      angkatan: d.angkatan || "-",
      email: d.email || "-",
      hp: d.hp || "-",
      status: d.status || "-",
    })),
  });
}
