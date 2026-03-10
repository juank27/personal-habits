import {
  Dumbbell,
  BookOpen,
  Droplets,
  Moon,
  Apple,
  Brain,
  Pencil,
  Music,
  Code,
  Heart,
  Wallet,
  Users,
  type LucideIcon,
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  dumbbell: Dumbbell,
  'book-open': BookOpen,
  droplets: Droplets,
  moon: Moon,
  apple: Apple,
  brain: Brain,
  pencil: Pencil,
  music: Music,
  code: Code,
  heart: Heart,
  wallet: Wallet,
  users: Users,
}

interface HabitIconProps {
  icon: string
  className?: string
}

export function HabitIcon({ icon, className }: HabitIconProps) {
  const IconComponent = iconMap[icon] || Heart
  return <IconComponent className={className} />
}

export { iconMap }
