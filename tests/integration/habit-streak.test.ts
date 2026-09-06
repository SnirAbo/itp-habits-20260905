import * as handler from '@/app/api/habits/[id]/complete/route';
import { prisma } from '@/lib/prisma';
import { getAuthedUserId } from '@/lib/session';

vi.mock('@/lib/session', () => ({
  getAuthedUserId: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    habit: { findFirst: vi.fn() },
    habitCompletion: { findMany: vi.fn(), upsert: vi.fn(), deleteMany: vi.fn() },
    habitMetrics: { upsert: vi.fn(), findUnique: vi.fn() },
    $transaction: vi.fn(async (cb: any) =>
      cb({
        habitCompletion: { upsert: vi.fn(), deleteMany: vi.fn() },
      }),
    ),
  },
}));

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/habits/5/complete', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

const params = { params: { id: '5' } };

beforeEach(() => {
  vi.clearAllMocks();
  (getAuthedUserId as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(1);
  (prisma.habit.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 5, userId: 1 });
  (prisma.habitMetrics.findUnique as unknown as ReturnType<typeof vi.fn>).mockImplementation(async () => {
    // Return whatever was last written via upsert, defaulting to zeros.
    const calls = (prisma.habitMetrics.upsert as unknown as ReturnType<typeof vi.fn>).mock.calls;
    const last = calls[calls.length - 1]?.[0]?.update;
    return last ?? { currentStreak: 0, longestStreak: 0, lastCompletedDate: null };
  });
});

describe('POST /api/habits/:id/complete (streak recomputation)', () => {
  it('rejects unauthenticated requests', async () => {
    (getAuthedUserId as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const res = await handler.POST(makeRequest({ date: '2024-05-10' }), params);
    expect(res.status).toBe(401);
  });

  it('rejects a non-numeric habit id', async () => {
    const res = await handler.POST(makeRequest({ date: '2024-05-10' }), { params: { id: 'abc' } });
    expect(res.status).toBe(400);
  });

  it('returns 404 when the habit does not belong to the user', async () => {
    (prisma.habit.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const res = await handler.POST(makeRequest({ date: '2024-05-10' }), params);
    expect(res.status).toBe(404);
  });

  it('rejects a malformed date', async () => {
    const res = await handler.POST(makeRequest({ date: 'not-a-date' }), params);
    expect(res.status).toBe(400);
  });

  it('computes a streak of 1 for a single completion', async () => {
    (prisma.habitCompletion.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
      { dateLocal: '2024-05-10' },
    ]);

    const res = await handler.POST(makeRequest({ date: '2024-05-10' }), params);
    expect(res.status).toBe(200);
    const upsertArgs = (prisma.habitMetrics.upsert as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(upsertArgs.update).toEqual({
      currentStreak: 1,
      longestStreak: 1,
      lastCompletedDate: '2024-05-10',
    });
  });

  it('counts consecutive days (desc order) as a growing streak', async () => {
    (prisma.habitCompletion.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
      { dateLocal: '2024-05-10' },
      { dateLocal: '2024-05-09' },
      { dateLocal: '2024-05-08' },
    ]);

    const res = await handler.POST(makeRequest({ date: '2024-05-10' }), params);
    const body = await res.json();
    expect(body.currentStreak).toBe(3);
    expect(body.longestStreak).toBe(3);
    expect(body.lastCompletedDate).toBe('2024-05-10');
    expect(body.completed).toBe(true);
  });

  it('stops counting the streak at the first gap in dates', async () => {
    (prisma.habitCompletion.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
      { dateLocal: '2024-05-10' },
      { dateLocal: '2024-05-09' },
      // gap: 05-08 missing
      { dateLocal: '2024-05-05' },
      { dateLocal: '2024-05-04' },
    ]);

    const res = await handler.POST(makeRequest({ date: '2024-05-10' }), params);
    const body = await res.json();
    expect(body.currentStreak).toBe(2);
    expect(body.longestStreak).toBe(2);
  });
});

describe('DELETE /api/habits/:id/complete (streak recomputation)', () => {
  function makeDeleteRequest(body: unknown) {
    return new Request('http://localhost/api/habits/5/complete', {
      method: 'DELETE',
      body: JSON.stringify(body),
    });
  }

  it('resets the streak to zero when no completions remain', async () => {
    (prisma.habitCompletion.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const res = await handler.DELETE(makeDeleteRequest({ date: '2024-05-10' }), params);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.currentStreak).toBe(0);
    expect(body.longestStreak).toBe(0);
    expect(body.lastCompletedDate).toBeNull();
    expect(body.completed).toBe(false);
  });

  it('recomputes a reduced streak after removing the most recent day', async () => {
    (prisma.habitCompletion.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
      { dateLocal: '2024-05-09' },
      { dateLocal: '2024-05-08' },
    ]);

    const res = await handler.DELETE(makeDeleteRequest({ date: '2024-05-10' }), params);
    const body = await res.json();
    expect(body.currentStreak).toBe(2);
    expect(body.longestStreak).toBe(2);
    expect(body.lastCompletedDate).toBe('2024-05-09');
  });
});
