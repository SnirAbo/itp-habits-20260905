import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthedUserId } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/ratelimit';

const HabitCreate = z.object({
  name: z.string().min(1).max(100),
  notes: z.string().max(1000).optional(),
  scheduleDow: z.number().int().min(0).max(127).optional(),
});

export async function POST(req: Request) {
  const userId = await getAuthedUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rl = await rateLimit(`create:${userId}`, 10, 60);
  if (!rl.ok) return NextResponse.json({ error: 'Too Many Requests' }, { status: 429, headers: rl.headers });

  const json = await req.json().catch(() => null);
  const parsed = HabitCreate.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { name, notes, scheduleDow = 0 } = parsed.data;

  const habit = await prisma.habit.create({
    data: { name, notes, scheduleDow, userId },
  });
  await prisma.habitMetrics.create({ data: { habitId: habit.id, currentStreak: 0, longestStreak: 0 } });

  return NextResponse.json(habit, { status: 201 });
}

export async function GET() {
  const userId = await getAuthedUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const habits = await prisma.habit.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { metrics: true },
  });

  return NextResponse.json(habits);
}
