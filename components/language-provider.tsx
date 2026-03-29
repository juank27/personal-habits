"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type Language = "en" | "es";

interface Translations {
  // Navigation
  today: string;
  stats: string;
  profile: string;

  // Dashboard
  goodMorning: string;
  goodAfternoon: string;
  goodEvening: string;
  todayHabits: string;
  noHabitsYet: string;
  createFirstHabit: string;
  completedToday: string;
  dayStreak: string;

  // New Habit
  createNewHabit: string;
  habitName: string;
  habitNamePlaceholder: string;
  icon: string;
  color: string;
  preview: string;
  createHabit: string;
  creating: string;
  back: string;
  habitCreated: string;
  failedToCreate: string;
  enterHabitName: string;
  mustBeLoggedIn: string;

  // Stats
  statistics: string;
  habitOverview: string;
  avgRate: string;
  bestStreak: string;
  thisWeek: string;
  done: string;
  totalHabits: string;
  last7Days: string;
  habitPerformance: string;
  dayStreakLabel: string;
  last30d: string;
  lastWeek: string;
  thisMonth: string;
  dateRange: string;
  completionRate: string;

  // Edit Habit
  editHabit: string;
  saveChanges: string;
  saving: string;
  habitUpdated: string;
  failedToUpdate: string;
  deleteHabit: string;
  deleting: string;
  habitDeleted: string;
  failedToDelete: string;
  confirmDelete: string;
  confirmDeleteMessage: string;
  cancel: string;
  delete: string;

  // Profile
  manageAccount: string;
  memberSince: string;
  habits: string;
  daysActive: string;
  settings: string;
  appearance: string;
  language: string;
  myHabits: string;
  signOut: string;
  signingOut: string;
  english: string;
  spanish: string;

  // Frequency
  frequency: string;
  daily: string;
  weekdays: string;
  weekends: string;
  custom: string;
  selectDays: string;

  // Reminders
  reminder: string;
  reminderTime: string;
  enableReminder: string;
  notificationsBlocked: string;
  notificationsGranted: string;
  reminderFor: string;

  // Notes
  addNote: string;
  notePlaceholder: string;
  noteSaved: string;

  // Best streak
  bestStreak: string;
  currentStreak: string;

  // Common
  days: string;
  loading: string;
}

const translations: Record<Language, Translations> = {
  en: {
    // Navigation
    today: "Today",
    stats: "Stats",
    profile: "Profile",

    // Dashboard
    goodMorning: "Good morning",
    goodAfternoon: "Good afternoon",
    goodEvening: "Good evening",
    todayHabits: "Today's Habits",
    noHabitsYet: "No habits yet",
    createFirstHabit: "Create your first habit",
    completedToday: "completed today",
    dayStreak: "day streak",

    // New Habit
    createNewHabit: "Create New Habit",
    habitName: "Habit Name",
    habitNamePlaceholder: "e.g., Morning meditation",
    icon: "Icon",
    color: "Color",
    preview: "Preview",
    createHabit: "Create Habit",
    creating: "Creating...",
    back: "Back",
    habitCreated: "Habit created!",
    failedToCreate: "Failed to create habit",
    enterHabitName: "Please enter a habit name",
    mustBeLoggedIn: "You must be logged in",

    // Stats
    statistics: "Statistics",
    habitOverview: "Your habit tracking overview",
    avgRate: "Avg. Rate",
    bestStreak: "Best Streak",
    thisWeek: "This Week",
    done: "done",
    totalHabits: "Total Habits",
    last7Days: "Last 7 Days",
    habitPerformance: "Habit Performance",
    dayStreakLabel: "day streak",
    last30d: "last 30d",
    lastWeek: "Last Week",
    thisMonth: "This Month",
    dateRange: "Date Range",
    completionRate: "Completion Rate",

    // Edit Habit
    editHabit: "Edit Habit",
    saveChanges: "Save Changes",
    saving: "Saving...",
    habitUpdated: "Habit updated!",
    failedToUpdate: "Failed to update habit",
    deleteHabit: "Delete Habit",
    deleting: "Deleting...",
    habitDeleted: "Habit deleted!",
    failedToDelete: "Failed to delete habit",
    confirmDelete: "Delete Habit?",
    confirmDeleteMessage:
      "This action cannot be undone. All your progress for this habit will be lost.",
    cancel: "Cancel",
    delete: "Delete",

    // Profile
    manageAccount: "Manage your account settings",
    memberSince: "Member since",
    habits: "Habits",
    daysActive: "Days Active",
    settings: "Settings",
    appearance: "Appearance",
    language: "Language",
    myHabits: "My Habits",
    signOut: "Sign Out",
    signingOut: "Signing out...",
    english: "English",
    spanish: "Spanish",

    // Frequency
    frequency: "Frequency",
    daily: "Daily",
    weekdays: "Weekdays",
    weekends: "Weekends",
    custom: "Custom",
    selectDays: "Select days",

    // Reminders
    reminder: "Reminder",
    reminderTime: "Reminder time",
    enableReminder: "Enable reminder",
    notificationsBlocked: "Notifications blocked. Enable them in browser settings.",
    notificationsGranted: "Notifications enabled!",
    reminderFor: "Time to do your habit:",

    // Notes
    addNote: "Add note...",
    notePlaceholder: "How did it go? (optional)",
    noteSaved: "Note saved",

    // Best streak
    bestStreak: "Best streak",
    currentStreak: "Current streak",

    // Common
    days: "days",
    loading: "Loading...",
  },
  es: {
    // Navigation
    today: "Hoy",
    stats: "Estadísticas",
    profile: "Perfil",

    // Dashboard
    goodMorning: "Buenos días",
    goodAfternoon: "Buenas tardes",
    goodEvening: "Buenas noches",
    todayHabits: "Hábitos de hoy",
    noHabitsYet: "Sin hábitos aún",
    createFirstHabit: "Crea tu primer hábito",
    completedToday: "completado hoy",
    dayStreak: "días de racha",

    // New Habit
    createNewHabit: "Crear Nuevo Hábito",
    habitName: "Nombre del Hábito",
    habitNamePlaceholder: "ej., Meditación matutina",
    icon: "Icono",
    color: "Color",
    preview: "Vista previa",
    createHabit: "Crear Hábito",
    creating: "Creando...",
    back: "Volver",
    habitCreated: "¡Hábito creado!",
    failedToCreate: "Error al crear el hábito",
    enterHabitName: "Por favor ingresa un nombre",
    mustBeLoggedIn: "Debes iniciar sesión",

    // Stats
    statistics: "Estadísticas",
    habitOverview: "Resumen de tus hábitos",
    avgRate: "Tasa Prom.",
    bestStreak: "Mejor Racha",
    thisWeek: "Esta Semana",
    done: "hechos",
    totalHabits: "Total Hábitos",
    last7Days: "Últimos 7 Días",
    habitPerformance: "Rendimiento por Hábito",
    dayStreakLabel: "días de racha",
    last30d: "últimos 30d",
    lastWeek: "Semana Pasada",
    thisMonth: "Este Mes",
    dateRange: "Rango de Fechas",
    completionRate: "Tasa de Cumplimiento",

    // Edit Habit
    editHabit: "Editar Hábito",
    saveChanges: "Guardar Cambios",
    saving: "Guardando...",
    habitUpdated: "¡Hábito actualizado!",
    failedToUpdate: "Error al actualizar el hábito",
    deleteHabit: "Eliminar Hábito",
    deleting: "Eliminando...",
    habitDeleted: "¡Hábito eliminado!",
    failedToDelete: "Error al eliminar el hábito",
    confirmDelete: "¿Eliminar Hábito?",
    confirmDeleteMessage:
      "Esta acción no se puede deshacer. Todo tu progreso de este hábito se perderá.",
    cancel: "Cancelar",
    delete: "Eliminar",

    // Profile
    manageAccount: "Administra tu cuenta",
    memberSince: "Miembro desde",
    habits: "Hábitos",
    daysActive: "Días Activo",
    settings: "Configuración",
    appearance: "Apariencia",
    language: "Idioma",
    myHabits: "Mis Hábitos",
    signOut: "Cerrar Sesión",
    signingOut: "Cerrando sesión...",
    english: "Inglés",
    spanish: "Español",

    // Frequency
    frequency: "Frecuencia",
    daily: "Diario",
    weekdays: "Lun–Vie",
    weekends: "Fin de semana",
    custom: "Personalizado",
    selectDays: "Selecciona días",

    // Reminders
    reminder: "Recordatorio",
    reminderTime: "Hora del recordatorio",
    enableReminder: "Activar recordatorio",
    notificationsBlocked: "Notificaciones bloqueadas. Actívalas en la configuración del navegador.",
    notificationsGranted: "¡Notificaciones activadas!",
    reminderFor: "Hora de hacer tu hábito:",

    // Notes
    addNote: "Agregar nota...",
    notePlaceholder: "¿Cómo te fue? (opcional)",
    noteSaved: "Nota guardada",

    // Best streak
    bestStreak: "Mejor racha",
    currentStreak: "Racha actual",

    // Common
    days: "días",
    loading: "Cargando...",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const defaultContext: LanguageContextType = {
  language: "en",
  setLanguage: () => {},
  t: translations["en"],
};

const LanguageContext = createContext<LanguageContextType>(defaultContext);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("habitflow-language") as Language;
    if (stored && (stored === "en" || stored === "es")) {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("habitflow-language", lang);
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, t: translations[language] }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
