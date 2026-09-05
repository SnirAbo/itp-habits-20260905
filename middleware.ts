import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  // Example CSRF hardening for POST forms (same-site)
  if (req.method === 'POST') {
    // Next.js defaults SameSite=Lax on cookies; keep endpoints idempotent and prefer JSON APIs.
  }
  return NextResponse.next();
}

export const config = { matcher: ['/((?!_next|.*\\..*).*)'] };
