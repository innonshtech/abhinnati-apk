const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('USERS:', users);
  const areas = await prisma.area.findMany();
  console.log('AREAS count:', areas.length);
  console.log('AREAS:', areas.map(a => ({ id: a.id, name: a.name })));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
}).finally(() => prisma.$disconnect());
