-- Create budgets table (1:N relationship - one user has many budgets)
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) >= 1 and char_length(name) <= 100),
  amount decimal(10,2) not null check (amount > 0),
  period text not null check (period in ('monthly', 'weekly', 'yearly')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.budgets enable row level security;

-- Policies: Users can only CRUD their own budgets
create policy "Users can view own budgets"
  on public.budgets for select
  using (auth.uid() = user_id);

create policy "Users can create own budgets"
  on public.budgets for insert
  with check (auth.uid() = user_id);

create policy "Users can update own budgets"
  on public.budgets for update
  using (auth.uid() = user_id);

create policy "Users can delete own budgets"
  on public.budgets for delete
  using (auth.uid() = user_id);

-- Create indexes for faster queries
create index if not exists budgets_user_id_idx on public.budgets(user_id);
create index if not exists budgets_created_at_idx on public.budgets(created_at desc);

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to automatically update updated_at
create trigger set_budgets_updated_at
  before update on public.budgets
  for each row
  execute procedure public.handle_updated_at();
