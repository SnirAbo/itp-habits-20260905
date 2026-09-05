import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAuthedUserId } from '@/lib/session';
import { computeLocalDate } from '@/lib/time';

const Body = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

async function recomputeMetrics(habitId: number) {
  // Simple recompute: count consecutive days from lastCompletedDate backward
  const completions = await prisma.habitCompletion.findMany({ where: { habitId }, orderBy: { dateLocal: 'desc' } });
  let currentStreak = 0;
  let longestStreak = 0;
  let lastDate: string | null = null;
  for (const c of completions) {
    if (!lastDate) {
      currentStreak = 1;
      lastDate = c.dateLocal;
      longestStreak = Math.max(longestStreak, currentStreak);
      continue;
    }
    const prev = new Date(lastDate);
    prev.setDate(prev.getDate() - 1);
    const prevStr = prev.toISOString().slice(0, 10);
    if (c.dateLocal === prevStr) {
      currentStreak += 1;
      lastDate = c.dateLocal;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      break;
    }
  }
  const last = completions[0]?.dateLocal ?? null;
  await prisma.habitMetrics.upsert({
    where: { habitId },
    update: { currentStreak, longestStreak, lastCompletedDate: last },
    create: { habitId, currentStreak, longestStreak, lastCompletedDate: last ?? undefined },
  });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const userId = await getAuthedUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = Number(params.id);
  if (Number.isNaN(id)) return NextResponse.json({ error: 'Bad id' }, { status: 400 });

  const habit = await prisma.habit.findFirst({ where: { id, userId } });
  if (!habit) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const date = parsed.data?.date ?? (await computeLocalDate(userId));

  await prisma.$transaction(async (tx) => {
    await tx.habitCompletion.upsert({
      where: { habitId_dateLocal: { habitId: id, dateLocal: date } },
      update: {},
      create: { habitId: id, dateLocal: date },
    });
  });
  await recomputeMetrics(id);

  const metrics = await prisma.habitMetrics.findUnique({ where: { habitId: id } });
  return NextResponse.json({ ...metrics, completed: true });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const userId = await getAuthedUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = Number(params.id);
  if (Number.isNaN(id)) return NextResponse.json({ error: 'Bad id' }, { status: 400 });

  const habit = await prisma.habit.findFirst({ where: { id, userId } });
  if (!habit) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const date = parsed.data?.date ?? (await computeLocalDate(userId));

  await prisma.$transaction(async (tx) => {
    await tx.habitCompletion.deleteMany({ where: { habitId: id, dateLocal: date } });
  });
  await recomputeMetrics(id);
  const metrics = await prisma.habitMetrics.findUnique({ where: { habitId: id } });
  return NextResponse.json({ ...metrics, completed: false });
}
