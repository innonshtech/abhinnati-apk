const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany();
  console.log('Users count:', users.length);
  console.log('Users:', users.map(u => ({ id: u.id, name: u.name, phone: u.phone, role: u.role })));
}
main().catch(console.error).finally(() => prisma.$disconnect());
