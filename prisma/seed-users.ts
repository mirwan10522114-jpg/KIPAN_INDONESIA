import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Mulai menyemai (seeding) pengguna admin...");

  // Hapus semua pengguna lama (Opsional, tapi diminta untuk membuat baru)
  await prisma.user.deleteMany({});
  console.log("Berhasil menghapus pengguna lama.");

  const passwordHash = await bcrypt.hash("123", 10);

  const createdEmails = new Set<string>();

  // 1. Super Admin (2 akun)
  console.log("Membuat Super Admin...");
  for (let i = 1; i <= 2; i++) {
    const email = `superadminkipan${i}`;
    createdEmails.add(email);
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: `Super Admin ${i}`,
        role: "SUPER_ADMIN",
      },
    });
  }

  // 2. Admin Nasional (5 akun)
  console.log("Membuat Admin Nasional...");
  for (let i = 1; i <= 5; i++) {
    const email = `adminnasionalkipan${i}`;
    createdEmails.add(email);
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: `Admin Nasional ${i}`,
        role: "ADMIN_NASIONAL",
      },
    });
  }

  // Ambil data provinsi dari database untuk Admin Provinsi
  const provinsiList = await prisma.provinsi.findMany();
  
  // 3. Admin Provinsi (sesuai jumlah provinsi yang ada di DB)
  console.log(`Membuat Admin Provinsi untuk ${provinsiList.length} provinsi...`);
  for (const prov of provinsiList) {
    let cleanName = prov.nama.toLowerCase().replace(/[^a-z0-9]/g, "");
    let email = `adminprovinsikipan_${cleanName}`;
    let counter = 1;
    while (createdEmails.has(email)) {
      email = `adminprovinsikipan_${cleanName}${counter}`;
      counter++;
    }
    createdEmails.add(email);

    await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: `Admin Provinsi ${prov.nama}`,
        role: "ADMIN_PROVINSI",
        provinsiId: prov.id,
      },
    });
  }

  // Ambil data kabupaten dari database untuk Admin Kabupaten/Kota
  const kabupatenList = await prisma.kabupaten.findMany();
  
  // 4. Admin Kabupaten/Kota (sesuai jumlah kabupaten yang ada di DB)
  console.log(`Membuat Admin Kabupaten/Kota untuk ${kabupatenList.length} kabupaten...`);
  for (const kab of kabupatenList) {
    let cleanName = kab.nama.toLowerCase().replace(/[^a-z0-9]/g, "");
    let email = `adminkabupatenkotakipan_${cleanName}`;
    let counter = 1;
    while (createdEmails.has(email)) {
      email = `adminkabupatenkotakipan_${cleanName}${counter}`;
      counter++;
    }
    createdEmails.add(email);

    await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: `Admin ${kab.nama}`,
        role: "ADMIN_KABUPATEN",
        provinsiId: kab.provinsiId,
        kabupatenId: kab.id,
      },
    });
  }

  console.log("Seeding pengguna selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
