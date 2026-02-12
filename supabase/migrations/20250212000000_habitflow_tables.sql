-- HabitFlow: tabelas para hábitos e conclusões (Supabase auto-hospedado)
-- Execute este SQL no SQL Editor do Supabase ou via MCP.

-- Tabela de hábitos
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text not null,
  icon text not null,
  frequency text not null check (frequency in ('daily', 'weekdays', 'weekends', 'custom')),
  custom_days integer[] default null,
  reminder text default null,
  created_at timestamptz not null default now()
  -- Opcional: descomente e use quando ativar Supabase Auth:
  -- , user_id uuid references auth.users(id) on delete cascade
);

-- Tabela de conclusões (marca de conclusão por dia)
create table if not exists public.habit_completions (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  date date not null,
  unique(habit_id, date)
);

-- Índices para consultas comuns
create index if not exists idx_habits_created_at on public.habits(created_at);
create index if not exists idx_habit_completions_habit_date on public.habit_completions(habit_id, date);
create index if not exists idx_habit_completions_date on public.habit_completions(date);

-- RLS: por padrão permitir tudo para anon (app sem login).
-- Quando ativar Auth, altere para: enable row level security e políticas por user_id.
alter table public.habits enable row level security;
alter table public.habit_completions enable row level security;

-- Políticas permissivas para anon e authenticated (sem user_id por enquanto)
create policy "Allow all for habits" on public.habits
  for all using (true) with check (true);

create policy "Allow all for habit_completions" on public.habit_completions
  for all using (true) with check (true);

-- Comentários
comment on table public.habits is 'Hábitos do HabitFlow';
comment on table public.habit_completions is 'Conclusões diárias dos hábitos';
