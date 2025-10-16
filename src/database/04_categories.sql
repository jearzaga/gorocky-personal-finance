-- Create categories table
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) >= 1 and char_length(name) <= 50),
  icon text,
  color text check (color ~ '^#[0-9A-Fa-f]{6}$'),
  created_at timestamptz default now()
);

-- Create user_categories join table (M:N relationship)
create table if not exists public.user_categories (
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  is_favorite boolean default false,
  created_at timestamptz default now(),
  primary key (user_id, category_id)
);

-- Enable RLS on categories (public read, admin write)
alter table public.categories enable row level security;

-- Everyone can view categories
create policy "Anyone can view categories"
  on public.categories for select
  using (true);

-- Enable RLS on user_categories
alter table public.user_categories enable row level security;

-- Policies: Users can only manage their own category associations
create policy "Users can view own category associations"
  on public.user_categories for select
  using (auth.uid() = user_id);

create policy "Users can create own category associations"
  on public.user_categories for insert
  with check (auth.uid() = user_id);

create policy "Users can update own category associations"
  on public.user_categories for update
  using (auth.uid() = user_id);

create policy "Users can delete own category associations"
  on public.user_categories for delete
  using (auth.uid() = user_id);

-- Create indexes for faster queries
create index if not exists user_categories_user_id_idx on public.user_categories(user_id);
create index if not exists user_categories_category_id_idx on public.user_categories(category_id);
create index if not exists user_categories_is_favorite_idx on public.user_categories(is_favorite) where is_favorite = true;

-- Insert default categories
insert into public.categories (name, icon, color) values
  ('Food & Dining', '🍔', '#ef4444'),
  ('Transportation', '🚗', '#f97316'),
  ('Shopping', '🛍️', '#eab308'),
  ('Entertainment', '🎬', '#84cc16'),
  ('Bills & Utilities', '💡', '#06b6d4'),
  ('Healthcare', '🏥', '#3b82f6'),
  ('Education', '📚', '#8b5cf6'),
  ('Travel', '✈️', '#ec4899'),
  ('Personal Care', '💅', '#d946ef'),
  ('Gifts & Donations', '🎁', '#f43f5e'),
  ('Savings', '💰', '#10b981'),
  ('Income', '💵', '#22c55e')
on conflict (name) do nothing;
