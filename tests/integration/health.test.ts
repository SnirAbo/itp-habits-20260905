import { NextResponse } from 'next/server';
import * as handler from '@/app/api/health/route';

describe('health', () => {
  it('returns ok', () => {
    const res = handler.GET();
    expect(res).toBeInstanceOf(NextResponse);
  });
});
