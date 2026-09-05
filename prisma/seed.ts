import { prisma } from '@/lib/prisma';

async function main() {
  // Create a demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: { email: 'demo@example.com', name: 'Demo User' },
  });

  // Habits: daily and DoW
  const h1 = await prisma.habit.create({ data: { userId: user.id, name: 'Drink water', scheduleDow: 0b1111111 } });
  const h2 = await prisma.habit.create({ data: { userId: user.id, name: 'Run 5km', scheduleDow: 0b0101010 } });

  await prisma.habitMetrics.createMany({ data: [
    { habitId: h1.id, currentStreak: 0, longestStreak: 0 },
    { habitId: h2.id, currentStreak: 0, longestStreak: 0 },
  ]});

  console.log('Seeded demo data.');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
