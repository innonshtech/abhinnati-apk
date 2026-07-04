import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const areas = await prisma.area.findMany();
  console.log('AREAS IN DB:', JSON.stringify(areas, null, 2));
}
run();
