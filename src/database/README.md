# Database Setup Guide

## Migration Order

Run the SQL files in this order in your Supabase SQL Editor:

1. `01_profiles.sql` - Creates profiles table (1:1 with auth.users)
2. `02_budgets.sql` - Creates budgets table (1:N with transactions)
3. `03_transactions.sql` - Creates transactions table
4. `04_categories.sql` - Creates categories and user_categories tables (M:N)
5. `05_seed.sql` - Seeds sample data (requires modification)

## How to Run Migrations

### Option 1: Supabase Dashboard (Recommended for first-time setup)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste each migration file contents
4. Click **Run** for each file in order

### Option 2: Command Line (Using psql)

```bash
# Set your connection string
export DB_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run migrations in order
psql $DB_URL -f 01_profiles.sql
psql $DB_URL -f 02_budgets.sql
psql $DB_URL -f 03_transactions.sql
psql $DB_URL -f 04_categories.sql
```

## Seed Data Setup

The `05_seed.sql` file requires your actual user ID to work:

1. **Create a test account** through the app at `/signup`
2. **Get your user ID** by running this in SQL Editor:
   ```sql
   SELECT id, email FROM auth.users;
   ```
3. **Copy your UUID** (looks like: `550e8400-e29b-41d4-a716-446655440000`)
4. **Edit `05_seed.sql`**:
   - Uncomment the second `DO $$` block
   - Replace `YOUR_USER_ID_HERE` with your actual UUID
5. **Run the seed script** in SQL Editor

## Verify Setup

After running all migrations, verify with:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Expected output:
-- budgets
-- categories
-- profiles
-- transactions
-- user_categories

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- All should have rowsecurity = true

-- Check default categories
SELECT name, icon, color FROM public.categories;
-- Should return 12 categories
```

## ERD (Entity Relationship Diagram)

```
┌─────────────┐
│ auth.users  │
│ (Supabase)  │
└──────┬──────┘
       │ 1:1
       │
┌──────▼──────────┐         ┌──────────────┐
│   profiles      │         │  categories  │
│─────────────────│         │──────────────│
│ id (PK, FK)     │         │ id (PK)      │
│ display_name    │         │ name         │
│ currency        │         │ icon         │
└────────┬────────┘         │ color        │
         │                  └──────┬───────┘
         │ 1:N                     │
         │                         │ M:N
┌────────▼────────┐         ┌──────▼───────────────┐
│    budgets      │         │  user_categories     │
│─────────────────│         │──────────────────────│
│ id (PK)         │         │ user_id (PK, FK)     │
│ user_id (FK)    │◄────────│ category_id (PK, FK) │
│ name            │         │ is_favorite          │
│ amount          │         └──────────────────────┘
│ period          │
└────────┬────────┘
         │ 1:N
         │
┌────────▼─────────┐
│  transactions    │
│──────────────────│
│ id (PK)          │
│ budget_id (FK)   │
│ category_id (FK) │
│ amount           │
│ description      │
│ transaction_date │
│ type             │
└──────────────────┘
```

## Troubleshooting

### "relation does not exist" error
- Make sure you ran migrations in the correct order
- Check that you're running in the correct database

### "permission denied" error
- Verify RLS policies are created
- Make sure you're authenticated as the correct user

### Seed data doesn't insert
- Verify you replaced `YOUR_USER_ID_HERE` with an actual UUID
- Check that the user exists: `SELECT * FROM auth.users WHERE id = 'your-uuid';`
- Ensure categories were created: `SELECT COUNT(*) FROM public.categories;`
