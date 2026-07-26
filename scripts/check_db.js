const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  try {
    // Get raw schema info
    const result = await prisma.$queryRaw`SELECT sql FROM sqlite_master WHERE type='table' AND name='pengurus'`;
    console.log("PENGURUS TABLE SCHEMA:");
    console.log(result[0].sql);
    console.log('\n---\n');
    
    const jabatanResult = await prisma.$queryRaw`SELECT sql FROM sqlite_master WHERE type='table' AND name='jabatan'`;
    console.log("JABATAN TABLE SCHEMA:");
    console.log(jabatanResult[0]?.sql || 'NOT EXISTS');
  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    await prisma.$disconnect();
  }
})();
