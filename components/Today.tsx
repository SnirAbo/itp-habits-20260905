// Minimal Today component placeholder
'use client';
import { useEffect, useState } from 'react';

export default function Today() {
  const [habits, setHabits] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/habits').then(r => r.json()).then(setHabits).catch(() => setHabits([]));
  }, []);
  return (
    <div className="space-y-2">
      {habits.map(h => (
        <div key={h.id} className="border rounded p-3 flex items-center justify-between">
          <div>
            <div className="font-medium">{h.name}</div>
            <div className="text-xs opacity-70">streak: {h.metrics?.currentStreak ?? 0} / best: {h.metrics?.longestStreak ?? 0}</div>
          </div>
          <button
            className="px-3 py-1 border rounded hover:bg-black/5"
            onClick={async () => {
              const res = await fetch(`/api/habits/${h.id}/complete`, { method: 'POST' });
              if (res.ok) {
                const updated = await fetch('/api/habits').then(r => r.json());
                setHabits(updated);
              }
            }}
          >Done</button>
        </div>
      ))}
      {habits.length === 0 && <div className="text-sm opacity-70">No habits yet.</div>}
    </div>
  );
}
