# CLAUDE.md — MindSai Habit Tracker

Architecture reference and contribution guidelines for Claude Code.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript 5.7**
- **Tailwind CSS v4** with OKLch CSS variables for theming
- **shadcn/ui** (New York style) + **Radix UI** primitives
- **Supabase** — Auth (email/password) + PostgreSQL
- **date-fns 4** for all date operations
- **Recharts** for analytics charts
- **lucide-react** for icons — do not use emojis as icons
- **next-themes** for dark/light mode
- **sonner** for toast notifications
- **react-hook-form + zod** for form validation

## Architecture

### Rendering Strategy

Server Components are the default. Use `'use client'` only where user interaction or browser APIs are needed.

- **Server Components** fetch data from Supabase and pass it down as props
- **Client Components** handle local state, optimistic updates, and mutations
- After a mutation, call `router.refresh()` to revalidate server component data — there is no global state manager

### Auth & Routing

`middleware.ts` runs on every request via `lib/supabase/proxy.ts`:
- Unauthenticated users trying to access `/dashboard` or `/protected` are redirected to `/auth/login`
- Authenticated users on `/` or `/auth/*` are redirected to `/dashboard`
- Always create a fresh Supabase client per request (Fluid compute compatible)

### Data Flow

```
Supabase DB → Server Component (page.tsx) → props → Client Component → local state
                                                                          ↓
                                                              Supabase mutation
                                                                          ↓
                                                              router.refresh() → revalidates
```

## Database Schema

```
profiles
  id            uuid (FK auth.users, PK)
  display_name  text | null
  avatar_url    text | null
  created_at    timestamptz

habits
  id             uuid (PK)
  user_id        uuid (FK auth.users)
  name           text
  icon           text  -- lucide icon name, from HABIT_ICONS constant
  color          text  -- from HABIT_COLORS constant
  frequency      text  -- 'daily' | 'weekdays' | 'weekends' | '1,3,5' (0=Sun)
  reminder_time  text | null  -- 'HH:MM' 24h format
  created_at     timestamptz

habit_logs
  id            uuid (PK)
  habit_id      uuid (FK habits)
  user_id       uuid (FK auth.users)
  completed_at  date  -- stored as 'yyyy-MM-dd' string
  note          text | null
  UNIQUE(habit_id, completed_at)
```

All tables use Row Level Security — users can only access rows where `user_id = auth.uid()`.

## Key Files

| File | Responsibility |
|------|---------------|
| `lib/types.ts` | All TypeScript interfaces (`Habit`, `HabitLog`, `HabitWithLogs`, `Profile`) + constants (`HABIT_ICONS`, `HABIT_COLORS`, `FREQUENCY_OPTIONS`) |
| `lib/habits.ts` | Core logic: `calculateStreak`, `calculateBestStreak`, `isCompletedOnDate`, `isScheduledForDate`, `processHabitsWithLogs`, `getColorClass`, `getColorRingClass`, `formatDateForDB` |
| `lib/supabase/server.ts` | Supabase client for Server Components |
| `lib/supabase/client.ts` | Supabase client for Client Components (browser) |
| `lib/supabase/proxy.ts` | Middleware session refresh + auth redirect logic |
| `lib/utils.ts` | `cn()` — clsx + tailwind-merge |
| `components/dashboard-content.tsx` | Dashboard client shell, owns selected date state, filters habits by frequency for the selected day |
| `components/habit-list.tsx` | Habit cards, optimistic toggle (local state first → Supabase → refresh), 1000ms debounced note save, streak display |
| `components/week-calendar.tsx` | 90-day horizontal drag carousel, completion dots visualization |
| `components/stats-content.tsx` | Recharts bar charts, date range filter (7d / last week / this month) |
| `hooks/use-notifications.ts` | Browser Notification API wrapper, interval-based reminder checker, localStorage deduplication |
| `hooks/use-mobile.ts` | `useIsMobile()` — boolean based on 768px breakpoint |
| `middleware.ts` | Entry point for auth routing; delegates to `updateSession` |

## Conventions

### Styling

- Use Tailwind utilities + CSS variables (`var(--primary)`, etc.) — not inline styles
- Dark mode is handled by `next-themes`; use `dark:` variants as needed
- Color and icon values come from `HABIT_COLORS` and `HABIT_ICONS` in `lib/types.ts` — do not hardcode them
- `getColorClass(color)` and `getColorRingClass(color)` from `lib/habits.ts` map color strings to Tailwind classes

### Dates

- All dates stored in DB as `'yyyy-MM-dd'` strings — use `formatDateForDB(date)` from `lib/habits.ts`
- All date arithmetic uses `date-fns` — do not use raw `Date` math
- The app is timezone-aware on the client side

### Frequency

The `frequency` field on a habit accepts:
- `'daily'` — every day
- `'weekdays'` — Monday–Friday
- `'weekends'` — Saturday–Sunday
- `'1,3,5'` — comma-separated day numbers where 0=Sunday, 6=Saturday

Use `isScheduledForDate(habit, date)` from `lib/habits.ts` to evaluate whether a habit appears on a given day.

### Forms

Use `react-hook-form` + `zod` for all forms. Validation schemas live alongside the form component.

### Toasts

Use `sonner` directly — `import { toast } from 'sonner'`. Call `toast.success()` / `toast.error()`.

### i18n

Language is provided via `LanguageProvider` context. Access with `useLanguage()` → `{ t, language }`. Translation strings are defined inside the provider — there are no external translation files. Both `en` and `es` strings must be added when adding new UI text.

### Components

- Prefer editing existing components over creating new ones
- Use shadcn/ui primitives from `components/ui/` for all interactive elements
- Animations: use existing keyframes (`animate-fade-in-up`, `scale-pop`, `pulse-flame`) and stagger with inline `animationDelay` style

## Running Locally

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build
pnpm lint
```

Requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.
