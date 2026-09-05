import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Today from '@/components/Today';

export default async function Page() {
  const session = await getServerSession(authOptions);
  return (
    <section>
      <h2 className="text-xl font-semibold mb-3">Today</h2>
      {!session ? (
        <p>Please sign in to see your habits.</p>
      ) : (
        <Today />
      )}
    </section>
  );
}
