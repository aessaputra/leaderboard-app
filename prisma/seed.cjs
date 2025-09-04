// prisma/seed.cjs
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@gmail.com';
  const adminPass = await bcrypt.hash('password', 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'Admin',
      email: adminEmail,
      password: adminPass,
      role: 'ADMIN',
      approved: true,
    },
  });

  const usersData = [{ name: 'Aes Saputra', email: 'aessaputra@yahoo.com' }];
  const hashes = await Promise.all(
    usersData.map(() => bcrypt.hash('password', 10))
  );

  const users = [];
  for (let i = 0; i < usersData.length; i++) {
    const u = await prisma.user.upsert({
      where: { email: usersData[i].email },
      update: {},
      create: {
        name: usersData[i].name,
        email: usersData[i].email,
        password: hashes[i],
        role: 'USER',
        approved: true,
      },
    });
    users.push(u);
  }

  const season = '2025/26';
  const awards = [
    { userId: users[0].id, competition: 'UCL' },
    { userId: users[0].id, competition: 'EUROPA' },
    { userId: users[0].id, competition: 'UCL' },
  ];

  for (const a of awards) {
    await prisma.trophyAward.create({
      data: {
        userId: a.userId,
        competition: a.competition,
        season,
        createdBy: admin.id,
      },
    });
  }

  console.log('✅ Seed selesai: admin & 1 user + trophy dibuat.');
  console.log('   Admin login →', adminEmail, '/ password');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
