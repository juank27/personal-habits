export interface Habit {
  id: string
  user_id: string
  name: string
  icon: string
  color: string
  frequency: string // 'daily' | 'weekdays' | 'weekends' | '1,3,5' (day numbers 0=Sun)
  reminder_time: string | null // 'HH:MM' format, null = no reminder
  created_at: string
}

export interface HabitLog {
  id: string
  habit_id: string
  user_id: string
  completed_at: string
  note: string | null
}

export interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
}

export interface HabitWithLogs extends Habit {
  logs: HabitLog[]
  streak: number
  bestStreak: number
  isCompletedToday: boolean
}

export const HABIT_ICONS = [
  { value: 'dumbbell', label: 'Exercise' },
  { value: 'book-open', label: 'Reading' },
  { value: 'droplets', label: 'Water' },
  { value: 'moon', label: 'Sleep' },
  { value: 'apple', label: 'Nutrition' },
  { value: 'brain', label: 'Meditation' },
  { value: 'pencil', label: 'Writing' },
  { value: 'music', label: 'Music' },
  { value: 'code', label: 'Coding' },
  { value: 'heart', label: 'Health' },
  { value: 'wallet', label: 'Finance' },
  { value: 'users', label: 'Social' },
] as const

export const HABIT_COLORS = [
  { value: 'purple', label: 'Purple', class: 'bg-primary' },
  { value: 'pink', label: 'Pink', class: 'bg-pink-500' },
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'green', label: 'Green', class: 'bg-emerald-500' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
  { value: 'red', label: 'Red', class: 'bg-red-500' },
] as const

export const FREQUENCY_OPTIONS = [
  { value: 'daily',    labelEn: 'Daily',    labelEs: 'Diario' },
  { value: 'weekdays', labelEn: 'Weekdays', labelEs: 'Lun–Vie' },
  { value: 'weekends', labelEn: 'Weekends', labelEs: 'Fin de semana' },
  { value: 'custom',   labelEn: 'Custom',   labelEs: 'Personalizado' },
] as const

export const DAY_LABELS_EN = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
export const DAY_LABELS_ES = ['D', 'L', 'M', 'X', 'J', 'V', 'S']

export type HabitIcon = typeof HABIT_ICONS[number]['value']
export type HabitColor = typeof HABIT_COLORS[number]['value']
