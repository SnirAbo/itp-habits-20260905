import { auth } from '@/lib/auth';

export async function getAuthedUserId(): Promise<number | null> {
  const session = await auth();
  const id = (session as any)?.userId as number | undefined;
  return id ?? null;
}
