import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthedUserId } from '@/lib/session';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const userId = await getAuthedUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = Number(params.id);
  if (Number.isNaN(id)) return NextResponse.json({ error: 'Bad id' }, { status: 400 });

  const habit = await prisma.habit.findFirst({ where: { id, userId }, include: { metrics: true } });
  if (!habit) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(habit.metrics);
}
