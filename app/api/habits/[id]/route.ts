import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAuthedUserId } from '@/lib/session';

const HabitUpdate = z.object({
  name: z.string().min(1).max(100).optional(),
  notes: z.string().max(1000).nullable().optional(),
  scheduleDow: z.number().int().min(0).max(127).optional(),
  archivedAt: z.string().datetime().nullable().optional(),
});

export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
  const userId = await getAuthedUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = Number(params.id);
  if (Number.isNaN(id)) return NextResponse.json({ error: 'Bad id' }, { status: 400 });

  const body = await _req.json().catch(() => null);
  const parsed = HabitUpdate.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const existing = await prisma.habit.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updated = await prisma.habit.update({ where: { id }, data: parsed.data });
  return NextResponse.json(updated);
}
