import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const user = await prisma.user.findFirst({
    where: { name: { contains: 'Bandung Barat' } },
    include: { kabupaten: true }
  });
  console.log("User by name:", user);
  
  const userByEmail = await prisma.user.findFirst({
    where: { email: { contains: 'bandungbarat' } },
    include: { kabupaten: true }
  });
  console.log("User by email:", userByEmail);
  
  const allKabupatenAdmins = await prisma.user.findMany({
    where: { role: 'ADMIN_KABUPATEN' },
    include: { kabupaten: true }
  });
  console.log("All Kabupaten Admins:", allKabupatenAdmins.map(u => ({ email: u.email, name: u.name, kabupaten: u.kabupaten?.nama })));
  
  await prisma.$disconnect();
}
run();
