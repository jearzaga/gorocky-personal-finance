# Budget Tracker Application

> A personal finance and budgeting application built with Next.js 15, Supabase, and TypeScript. Implements all three database relationship types (1:1, 1:N, M:N) with Row Level Security.

**Developer:** John Erick Earzaga  
**Assignment:** GoRocky Software Engineer Technical Assessment

---
- ✅ Debugged and refined through iterative feedback

## � Project Overview

**Budget Tracker** allows users to manage their personal finances by creating budgets, tracking transactions, and categorizing expenses. The application demonstrates:

- **Authentication:** Secure user signup/login with Supabase Auth
- **Budget Management:** Create and track budgets with different time periods (monthly/weekly/yearly)
- **Transaction Tracking:** Record income and expenses linked to budgets
- **Category System:** Pre-seeded categories with user favorites (Many-to-Many relationship)
- **Analytics:** Dashboard with spending insights, progress bars, and daily summaries
- **Responsive Design:** Mobile-first interface using Tailwind CSS


## 🗄️ Data Model (ERD)

```
 auth.users (Supabase Auth)
        │
        │ 1:1 (One-to-One)
        │ - Auto-created via trigger
        │ - ON DELETE CASCADE
        ▼
   ┌─────────────┐
   │  profiles   │
   │─────────────│
   │ id (PK)     │◄─────── Foreign Key: auth.users(id)
   │ user_id     │
   │ full_name   │
   │ currency    │         ┌─────────────────┐
   │ created_at  │         │   categories    │
   │ updated_at  │         │─────────────────│
   └─────────────┘         │ id (PK)         │
        │                  │ name (unique)   │
        │                  │ icon            │
        │ 1:N              │ color           │
        │ (One-to-Many)    └────────┬────────┘
        │                           │
        ▼                           │
   ┌─────────────┐                 │
   │   budgets   │                 │ M:N (Many-to-Many)
   │─────────────│                 │ via user_categories
   │ id (PK)     │                 │
   │ user_id (FK)│◄────────────────┼──────────┐
   │ name        │                 │          │
   │ amount      │                 │          │
   │ period      │                 ▼          ▼
   │ created_at  │         ┌──────────────────────┐
   │ updated_at  │         │  user_categories     │
   └──────┬──────┘         │──────────────────────│
          │                │ user_id (FK, PK)     │
          │ 1:N            │ category_id (FK, PK) │
          │ (One-to-Many)  │ is_favorite          │
          │                │ created_at           │
          ▼                └──────────────────────┘
   ┌────────────────┐
   │ transactions   │
   │────────────────│
   │ id (PK)        │
   │ budget_id (FK) │◄──── Foreign Key: budgets(id)
   │ category_id    │◄──── Foreign Key: categories(id) NULLABLE
   │ amount         │
   │ description    │
   │ transaction_date│
   │ type           │      (income/expense)
   │ created_at     │
   │ updated_at     │
   └────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                      RELATIONSHIP EXPLANATIONS                           │
└─────────────────────────────────────────────────────────────────────────┘

1. ONE-TO-ONE (auth.users ↔ profiles)
   - Each authenticated user has exactly ONE profile
   - Auto-created via database trigger: handle_new_user()
   - Profile stores additional user metadata (full_name, currency)
   - CASCADE delete: When user account deleted, profile is deleted

2. ONE-TO-MANY (users → budgets)
   - Each user can have MANY budgets
   - Each budget belongs to exactly ONE user
   - Examples: "Monthly Groceries ($600)", "Transportation ($200)"
   - CASCADE delete: When user deleted, all budgets are deleted

3. ONE-TO-MANY (budgets → transactions)
   - Each budget can have MANY transactions
   - Each transaction belongs to exactly ONE budget
   - Examples: "Whole Foods grocery shopping (-$45.50)"
   - CASCADE delete: When budget deleted, all transactions are deleted

4. MANY-TO-MANY (users ↔ categories)
   - Each user can select MANY categories
   - Each category can be selected by MANY users
   - Join table: user_categories (user_id, category_id, is_favorite)
   - Examples: User adds "Food & Dining" as favorite category
   - CASCADE delete: When user deleted, category associations are deleted

5. OPTIONAL FOREIGN KEY (transactions → categories)
   - Transactions can optionally be categorized
   - category_id is NULLABLE (SET NULL on category delete)
   - Allows uncategorized transactions
```

## ✅ Feature Mapping

| Requirement | Implementation |
|-------------|----------------|
| **Database Relationships** | |
| One-to-One | `auth.users` ↔ `profiles` (auto-created via trigger) |
| One-to-Many | `users` → `budgets` → `transactions` (cascade deletes) |
| Many-to-Many | `users` ↔ `categories` via `user_categories` join table |
| **CRUD Operations** | All entities have Create/Read/Update/Delete via Server Actions |
| **Authentication** | Supabase Auth with email/password, protected routes via middleware |
| **Access Control** | Row Level Security (RLS) policies on all tables |
| **Modern Framework** | Next.js 15 with App Router, TypeScript strict mode |
| **Responsive Design** | Mobile-first Tailwind CSS, tested on multiple screen sizes |

### Implemented Features

- ✅ User signup/login with automatic profile creation
- ✅ Budget CRUD (create, read, update, delete)
- ✅ Transaction CRUD with category linking
- ✅ Category management (M:N relationship) with favorites
- ✅ Dashboard analytics (spending summaries, progress bars)
- ✅ Daily transaction view ("Today" page)
- ✅ All transactions view across budgets
- ✅ Mobile-responsive layouts  

---

## 🚀 Local Setup Guide

### Prerequisites

- Node.js v18+ 
- npm v10+
- Supabase account (free tier)

### Environment Variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these values from your Supabase project dashboard at [app.supabase.com](https://app.supabase.com).

### Database Setup

1. **Create a Supabase project** at [app.supabase.com](https://app.supabase.com)

2. **Run migrations** in Supabase SQL Editor (in order):
   - `src/database/01_profiles.sql` - Creates profiles table + auto-creation trigger
   - `src/database/02_budgets.sql` - Creates budgets table with RLS policies
   - `src/database/03_transactions.sql` - Creates transactions table with RLS policies
   - `src/database/04_categories.sql` - Creates categories + user_categories (M:N)
   - `src/database/05_seed.sql` - Seeds default categories (optional)

3. **For seed data** (optional):
   - First create a user account via signup
   - Get user UUID from Supabase Dashboard → Authentication → Users
   - Replace `'YOUR_USER_ID_HERE'` in `05_seed.sql`
   - Run the script to populate sample budgets/transactions

### Installation & Running

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### Test Account
email: johnerickarzaga11@gmail.com
password: Password1

Open [http://localhost:3000](http://localhost:3000)

### Verification

```bash
# Check for errors
npm run build
npm run lint
```

Expected: 0 errors, 0 warnings, all 13 routes compiled successfully  

---

## Testing

This project includes comprehensive unit tests for validation logic.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Coverage

Current test suite includes:
- **Budget Validation Tests** (`src/__tests__/budget-validation.test.ts`)
  - ✅ Validates correct budget data
  - ✅ Rejects empty names
  - ✅ Rejects names over 100 characters
  - ✅ Rejects zero/negative amounts
  - ✅ Validates period enums (monthly/weekly/yearly)
  - ✅ Tests partial updates
  - ✅ Tests type coercion


## CI/CD Pipeline

This project uses GitHub Actions for continuous integration.

### Workflow (`.github/workflows/ci.yml`)

On every push and pull request, the pipeline automatically:
1. ✅ **Lints** the codebase (`npm run lint`)
2. ✅ **Type checks** TypeScript (`npm run type-check`)
3. ✅ **Runs tests** (`npm test`)


### Local CI Verification

Before pushing code, verify all checks pass locally:

```bash
# Run all CI checks locally
npm run lint && npm run type-check && npm test
```


## 🔒 Access Control (RLS Implementation)

All tables use **Row Level Security (RLS)** policies to ensure users can only access their own data:

### RLS Policies

**Profiles** - Users can only view/update their own profile:
```sql
USING (auth.uid() = id)
```

**Budgets** - Users can only CRUD their own budgets:
```sql
USING (auth.uid() = user_id)
```

**Transactions** - Users can only access transactions from their own budgets:
```sql
USING (
  EXISTS (
    SELECT 1 FROM budgets
    WHERE budgets.id = transactions.budget_id
    AND budgets.user_id = auth.uid()
  )
)
```

**Categories** - Public read (everyone can view):
```sql
USING (true)
```

**User Categories** - Users can only manage their own category associations:
```sql
USING (auth.uid() = user_id)
```

### Database Triggers

- **Auto-profile creation**: `handle_new_user()` trigger creates profile when user signs up
- **Auto-timestamps**: `handle_updated_at()` trigger updates `updated_at` on every UPDATE



---

## 🤖 AI Tools Used

This project was developed with AI assistance to demonstrate modern development workflows:

### GitHub Copilott
- **Usage:** Architecture planning, debugging TypeScript errors, documentation writing, refactoring, and inline suggestions
- **Examples:**
  - Designed database schema with RLS policies
  - Fixed Supabase TypeScript "never" type collapse
  - Generated comprehensive README structure

### Disclosure Statement

**All code in this repository was written with AI assistance.** While AI tools generated significant portions of the code, every line was:
- ✅ Reviewed and understood by the developer
- ✅ Tested manually and via build process
- ✅ Customized to fit project requirements
- ✅ Debugged and refined through iterative feedback
- ✅ Debugged and refined through iterative feedback

AI tools were used as **productivity multipliers**, not replacements for understanding. The developer maintains full ownership of architectural decisions, debugging strategies, and implementation choices.

---

**Developer:** John Erick P. Arzaga