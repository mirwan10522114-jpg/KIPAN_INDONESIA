// Delete existing pendaftaran rows so prisma db push can add required column
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const deleted = await prisma.pendaftaran.deleteMany({});
  console.log(`Deleted ${deleted.count} pendaftaran rows (untuk memungkinkan schema migration)`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
