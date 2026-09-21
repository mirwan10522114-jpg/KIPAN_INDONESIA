// Check pendaftaran table schema
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const cols = await prisma.$queryRaw`SELECT name FROM pragma_table_info('pendaftaran')`;
  console.log("Pendaftaran columns:");
  cols.forEach(c => console.log("  -", c.name));
}
main().catch(console.error).finally(() => prisma.$disconnect());
