-- Enable RLS at database level in Supabase dashboard as well.

alter table if exists public."User" enable row level security;
alter table if exists public."Habit" enable row level security;
alter table if exists public."HabitCompletion" enable row level security;
alter table if exists public."HabitMetrics" enable row level security;

-- Allow users to see only their own rows
create policy if not exists user_is_owner on public."Habit"
for all using (auth.uid()::int = "userId") with check (auth.uid()::int = "userId");

create policy if not exists user_is_owner_completion on public."HabitCompletion"
for all using (
  exists(select 1 from public."Habit" h where h.id = "habitId" and h."userId" = auth.uid()::int)
) with check (
  exists(select 1 from public."Habit" h where h.id = "habitId" and h."userId" = auth.uid()::int)
);

create policy if not exists user_is_owner_metrics on public."HabitMetrics"
for all using (
  exists(select 1 from public."Habit" h where h.id = "habitId" and h."userId" = auth.uid()::int)
) with check (
  exists(select 1 from public."Habit" h where h.id = "habitId" and h."userId" = auth.uid()::int)
);
