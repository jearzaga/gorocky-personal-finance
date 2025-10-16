-- Seed data script for testing
-- Note: Replace the user_id with your actual test user's UUID from auth.users

-- This is a template. You'll need to replace 'YOUR_USER_ID_HERE' with an actual user ID
-- You can get this by:
-- 1. Creating a test account through the app
-- 2. Running: SELECT id, email FROM auth.users;
-- 3. Copy the UUID and replace below

DO $$
DECLARE
  test_user_id uuid;
  budget1_id uuid;
  budget2_id uuid;
  budget3_id uuid;
  category_food_id uuid;
  category_transport_id uuid;
  category_bills_id uuid;
  category_income_id uuid;
BEGIN
  -- Get or create a test user (you should replace this with your actual test user)
  -- For now, we'll just use a placeholder
  -- In production, run this after creating your test account
  
  -- Example: test_user_id := 'YOUR_USER_ID_HERE'::uuid;
  
  -- For this seed script to work, you need to:
  -- 1. Create a user account first
  -- 2. Get the user_id from auth.users
  -- 3. Replace the user_id in the INSERT statements below
  
  -- Get category IDs
  SELECT id INTO category_food_id FROM public.categories WHERE name = 'Food & Dining';
  SELECT id INTO category_transport_id FROM public.categories WHERE name = 'Transportation';
  SELECT id INTO category_bills_id FROM public.categories WHERE name = 'Bills & Utilities';
  SELECT id INTO category_income_id FROM public.categories WHERE name = 'Income';
  
  RAISE NOTICE 'Categories found. Please create a test user account first, then update this script with the user_id.';
  RAISE NOTICE 'Run: SELECT id, email FROM auth.users; to get your user ID';
  
END $$;

-- Once you have your user_id, uncomment and modify the sections below:

/*
-- Replace YOUR_USER_ID_HERE with your actual user UUID
DO $$
DECLARE
  test_user_id uuid := 'YOUR_USER_ID_HERE'::uuid;
  budget1_id uuid;
  budget2_id uuid;
  budget3_id uuid;
  category_food_id uuid;
  category_transport_id uuid;
  category_bills_id uuid;
  category_entertainment_id uuid;
  category_shopping_id uuid;
  category_income_id uuid;
BEGIN
  -- Get category IDs
  SELECT id INTO category_food_id FROM public.categories WHERE name = 'Food & Dining';
  SELECT id INTO category_transport_id FROM public.categories WHERE name = 'Transportation';
  SELECT id INTO category_bills_id FROM public.categories WHERE name = 'Bills & Utilities';
  SELECT id INTO category_entertainment_id FROM public.categories WHERE name = 'Entertainment';
  SELECT id INTO category_shopping_id FROM public.categories WHERE name = 'Shopping';
  SELECT id INTO category_income_id FROM public.categories WHERE name = 'Income';

  -- Insert sample budgets
  INSERT INTO public.budgets (id, user_id, name, amount, period)
  VALUES 
    (gen_random_uuid(), test_user_id, 'Monthly Groceries', 600.00, 'monthly'),
    (gen_random_uuid(), test_user_id, 'Transportation', 200.00, 'monthly'),
    (gen_random_uuid(), test_user_id, 'Entertainment', 150.00, 'monthly')
  RETURNING id INTO budget1_id, budget2_id, budget3_id;

  -- Get the inserted budget IDs
  SELECT id INTO budget1_id FROM public.budgets WHERE user_id = test_user_id AND name = 'Monthly Groceries';
  SELECT id INTO budget2_id FROM public.budgets WHERE user_id = test_user_id AND name = 'Transportation';
  SELECT id INTO budget3_id FROM public.budgets WHERE user_id = test_user_id AND name = 'Entertainment';

  -- Insert sample transactions for Groceries budget
  INSERT INTO public.transactions (budget_id, category_id, amount, description, transaction_date, type)
  VALUES 
    (budget1_id, category_food_id, -45.50, 'Whole Foods grocery shopping', CURRENT_DATE, 'expense'),
    (budget1_id, category_food_id, -32.80, 'Trader Joes weekly haul', CURRENT_DATE - 2, 'expense'),
    (budget1_id, category_food_id, -78.25, 'Costco bulk buy', CURRENT_DATE - 5, 'expense'),
    (budget1_id, category_food_id, -25.00, 'Local farmers market', CURRENT_DATE - 7, 'expense');

  -- Insert sample transactions for Transportation budget
  INSERT INTO public.transactions (budget_id, category_id, amount, description, transaction_date, type)
  VALUES 
    (budget2_id, category_transport_id, -60.00, 'Gas station fill-up', CURRENT_DATE - 1, 'expense'),
    (budget2_id, category_transport_id, -15.50, 'Uber to airport', CURRENT_DATE - 3, 'expense'),
    (budget2_id, category_transport_id, -45.00, 'Monthly parking pass', CURRENT_DATE - 10, 'expense');

  -- Insert sample transactions for Entertainment budget
  INSERT INTO public.transactions (budget_id, category_id, amount, description, transaction_date, type)
  VALUES 
    (budget3_id, category_entertainment_id, -25.00, 'Movie tickets', CURRENT_DATE, 'expense'),
    (budget3_id, category_entertainment_id, -60.00, 'Concert tickets', CURRENT_DATE - 4, 'expense'),
    (budget3_id, category_entertainment_id, -18.99, 'Netflix subscription', CURRENT_DATE - 8, 'expense');

  -- Associate user with favorite categories
  INSERT INTO public.user_categories (user_id, category_id, is_favorite)
  VALUES 
    (test_user_id, category_food_id, true),
    (test_user_id, category_transport_id, true),
    (test_user_id, category_bills_id, false),
    (test_user_id, category_entertainment_id, true),
    (test_user_id, category_shopping_id, false)
  ON CONFLICT (user_id, category_id) DO NOTHING;

  RAISE NOTICE 'Seed data inserted successfully!';
  RAISE NOTICE 'Budgets created: 3';
  RAISE NOTICE 'Transactions created: 11';
  RAISE NOTICE 'Category associations created: 5';
END $$;
*/
