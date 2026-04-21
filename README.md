# MindSai — Personal Habit Tracker

A modern habit tracking app built with Next.js, Supabase, and shadcn/ui. Track daily habits, visualize streaks, and build consistency.

## Features

- **Habit management** — Create habits with custom icons, colors, and frequency (daily, weekdays, weekends, or custom days)
- **Streak tracking** — Current and best streak calculated automatically
- **Daily log** — Toggle completion per day, add optional notes to each entry
- **90-day calendar** — Horizontal drag carousel showing your completion history
- **Analytics** — Bar charts with completion rates filtered by last 7 days, last week, or this month
- **Reminders** — Browser push notifications at a per-habit scheduled time
- **Dark/light mode** — Theme toggle with next-themes
- **Bilingual** — English and Spanish support

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS v4 + shadcn/ui + Radix UI |
| Backend | Supabase (Auth + PostgreSQL) |
| Charts | Recharts |
| Forms | react-hook-form + zod |
| Dates | date-fns |
| Icons | lucide-react |
| Fonts | Plus Jakarta Sans + JetBrains Mono |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- A Supabase project

### Environment Variables

Create a `.env.local` file at the root with the following variables (values from your Supabase project settings):

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### Database Setup

Run the SQL migration in your Supabase SQL Editor. The base schema requires three tables: `profiles`, `habits`, and `habit_logs`. See `supabase-migration.sql` for the latest migration (adds `reminder_time` to habits and `note` to habit_logs).

The initial schema (create this first if starting from scratch):

```sql
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

create table habits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  icon text not null,
  color text not null,
  frequency text not null default 'daily',
  reminder_time text,
  created_at timestamptz default now()
);

create table habit_logs (
  id uuid default gen_random_uuid() primary key,
  habit_id uuid references habits on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  completed_at date not null,
  note text,
  unique(habit_id, completed_at)
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table habits enable row level security;
alter table habit_logs enable row level security;

-- RLS policies (users can only access their own data)
create policy "Users manage own profile" on profiles for all using (auth.uid() = id);
create policy "Users manage own habits" on habits for all using (auth.uid() = user_id);
create policy "Users manage own logs" on habit_logs for all using (auth.uid() = user_id);
```

Then apply `supabase-migration.sql` to add the missing columns if they don't exist.

### Development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
pnpm build   # production build
pnpm start   # start production server
pnpm lint    # run ESLint
```

## Project Structure

```
app/
  page.tsx                    # Landing page (public)
  layout.tsx                  # Root layout with providers
  auth/                       # Login, sign-up, password reset
  dashboard/
    page.tsx                  # Main dashboard (SSR)
    new-habit/page.tsx        # Habit creation form
    edit-habit/[id]/page.tsx  # Habit edit form
    stats/page.tsx            # Analytics page
    profile/page.tsx          # Profile & settings

components/
  ui/                         # shadcn/ui primitives
  dashboard-content.tsx       # Dashboard client shell + date state
  habit-list.tsx              # Habit cards with toggle & notes
  week-calendar.tsx           # 90-day drag carousel
  stats-content.tsx           # Charts and metrics
  notification-banner.tsx     # Browser notification opt-in
  profile-content.tsx         # Profile management

lib/
  supabase/                   # server.ts, client.ts, proxy.ts
  habits.ts                   # Core streak & completion logic
  types.ts                    # Interfaces + constants
  utils.ts                    # cn() helper

hooks/
  use-notifications.ts        # Habit reminder notification logic
  use-mobile.ts               # Mobile breakpoint hook

middleware.ts                 # Auth routing + session refresh
supabase-migration.sql        # Latest DB migration
```
