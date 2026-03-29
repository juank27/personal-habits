-- =====================================================
-- Migration: Add reminder_time to habits + note to habit_logs
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. Add reminder_time column to habits table
--    Format: 'HH:MM' (24h), NULL = no reminder
ALTER TABLE habits
  ADD COLUMN IF NOT EXISTS reminder_time TEXT;

-- 2. Add note column to habit_logs table
--    Free text note for each completion entry
ALTER TABLE habit_logs
  ADD COLUMN IF NOT EXISTS note TEXT;

-- 3. (Optional) Index on reminder_time for faster queries
--    Only useful if you later add server-side push notifications
-- CREATE INDEX IF NOT EXISTS idx_habits_reminder_time ON habits(reminder_time) WHERE reminder_time IS NOT NULL;

-- Verify
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name IN ('habits', 'habit_logs')
  AND column_name IN ('frequency', 'reminder_time', 'note')
ORDER BY table_name, column_name;
