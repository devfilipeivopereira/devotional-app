-- HabitFlow: associar hábitos e conclusões ao usuário (Supabase Auth)
-- Execute no SQL Editor do Supabase após a migração inicial.

-- 1) Adicionar coluna user_id em habits
alter table public.habits
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- 2) Índice para filtrar por usuário
create index if not exists idx_habits_user_id on public.habits(user_id);

-- 3) Remover políticas antigas
drop policy if exists "Allow all for habits" on public.habits;
drop policy if exists "Allow all for habit_completions" on public.habit_completions;

-- 4) Políticas por usuário (RLS)
create policy "Users can read own habits"
  on public.habits for select
  using (auth.uid() = user_id);

create policy "Users can insert own habits"
  on public.habits for insert
  with check (auth.uid() = user_id);

create policy "Users can update own habits"
  on public.habits for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own habits"
  on public.habits for delete
  using (auth.uid() = user_id);

-- 5) habit_completions: usuário só acessa conclusões dos seus hábitos
create policy "Users can read own habit_completions"
  on public.habit_completions for select
  using (
    exists (
      select 1 from public.habits h
      where h.id = habit_completions.habit_id and h.user_id = auth.uid()
    )
  );

create policy "Users can insert own habit_completions"
  on public.habit_completions for insert
  with check (
    exists (
      select 1 from public.habits h
      where h.id = habit_completions.habit_id and h.user_id = auth.uid()
    )
  );

create policy "Users can delete own habit_completions"
  on public.habit_completions for delete
  using (
    exists (
      select 1 from public.habits h
      where h.id = habit_completions.habit_id and h.user_id = auth.uid()
    )
  );

comment on column public.habits.user_id is 'Usuário dono do hábito (Supabase Auth)';
