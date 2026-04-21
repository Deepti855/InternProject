import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash('ecoPass123!', 10);

  const users = [
    {
      username: 'admin',
      email: 'admin@ecotrace.com',
      password: hashed,
      role: UserRole.ADMIN,
      home_lat: 40.7128,
      home_long: -74.0060,
    },
    {
      username: 'user',
      email: 'user@ecotrace.com',
      password: hashed,
      role: UserRole.BUYER,
      home_lat: 40.7128,
      home_long: -74.0060,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        password: user.password,
        role: user.role,
        home_lat: user.home_lat,
        home_long: user.home_long,
      },
      create: user,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
