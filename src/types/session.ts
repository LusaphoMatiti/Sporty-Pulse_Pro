/**
 * Sporty Pulse Pro — Shared types
 *
 * These mirror the types defined in your Next.js app.
 * Keep in sync with:
 *   - src/app/api/session/draft/route.ts
 *   - src/components/global/Home.tsx
 *   - src/app/progress/ProgressView.tsx
 *   - src/app/training/TrainingView.tsx
 */

// ─── Session Draft ────────────────────────────────────────────────────────────

export interface SessionDraft {
  sessionNumber: number;
  currentExerciseIdx: number;
  completedSets: number;
  elapsedSeconds: number;
  logs: SessionLog[];
}

export interface SessionLog {
  plannedExerciseId: string;
  actualSets: number;
  actualReps: number;
  weightKg?: number;
}

// ─── Home screen ──────────────────────────────────────────────────────────────

export interface WeekDay {
  day: string;
  worked: boolean;
  isFuture: boolean;
}

export interface WeekWorkout {
  name: string;
  progress: number;
}

export interface HomeData {
  totalWorkouts: number;
  trainedHours: string;
  totalSets: number;
  currentStreak: number;
  bestStreak: number;
  weekDays: WeekDay[];
  planWeek: number | null;
  sessionsLeft: number | null;
  planName: string | null;
  weekCompletedCount: number;
  weekTotalCount: number;
  weekWorkouts: WeekWorkout[];
  nextSessionUrl: string | null;
  todaySessionNumber: number | null;
  planTotalSessions: number | null;
  sessionPhase: string | null;
  sessionDurationMin: number | null;
  trainingLevel: string | null;
  weekMinutes: number;
  recentActivity: {
    planName: string;
    sessionLabel: string;
    durationMin: number;
  } | null;
  recentActivityUrl: string | null;
  streakWeeks: { completed: boolean; isToday?: boolean }[][];
  accessTier: "free" | "equipment" | "pro";
  equipmentTrial: { daysRemaining: number; isExpired: boolean } | null;
  recoveryPct: number | null;
  recoveryLabel: string | null;
  recoveryTip: string | null;
}

// ─── Training / Session screen ────────────────────────────────────────────────

export interface ExerciseForSession {
  id: string;
  order: number;
  sets: number;
  reps: number;
  restSeconds: number;
  exercise: {
    id: string;
    name: string;
    musclesWorked: string[];
    thumbnailUrl?: string | null;
    equipment?: { id: string; name: string } | null;
  };
}

export type MuscleGroup = "FULLBODY" | "UPPER" | "LOWER" | "CORE";
export type UserLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type UserPlan = "FREE" | "EQUIPMENT" | "PRO";
export type TrainingTier = "FREE" | "DECLARED_TRIAL" | "PURCHASED" | "PRO";

export const muscleGroupLabel: Record<MuscleGroup, string> = {
  FULLBODY: "Full Body",
  UPPER: "Upper Body",
  LOWER: "Lower Body",
  CORE: "Core",
};

export const muscleGroupIcon: Record<MuscleGroup, string> = {
  UPPER: "💪",
  LOWER: "🦵",
  CORE: "🔥",
  FULLBODY: "⚡",
};

// ─── Progress screen ──────────────────────────────────────────────────────────

export interface PRHistory {
  date: string;
  weightKg: number;
  reps: number;
}

export interface PersonalRecord {
  exerciseName: string;
  weightKg: number;
  reps: number;
  setAt: string;
  isNew: boolean;
  history: PRHistory[];
}

export interface MonthStats {
  sessions: number;
  volumeKg: number;
  hours: number;
}

export interface HeaderStats {
  totalWorkouts: number;
  totalHours: number;
  totalVolumeKg: number;
  currentStreak: number;
}

export interface BodySplitItem {
  group: string;
  count: number;
  percent: number;
}

export interface SessionItem {
  key: string;
  completedAt: string;
  planName: string;
  muscleGroup: string;
  focus: string;
  exerciseCount: number;
  totalVolume: number;
  sessionNumber: number;
  instanceId: string;
}

export type RecoveryStatus = "FRESH" | "MODERATE" | "HIGH_FATIGUE";

export interface StrengthTrend {
  exerciseName: string;
  percentChange: number;
  currentRM: number;
  priorRM: number;
  dataPoints: number;
}

export interface VolumeByMuscle {
  group: string;
  thisWeekKg: number;
  lastWeekKg: number;
  percentChange: number | null;
}

export interface WeeklyVolumeDay {
  label: string;
  kg: number;
}

export interface WeeklyVolumeData {
  totalKg: number;
  setsCompleted: number;
  durationMinutes: number;
  vsLastWeekPct: number | null;
  days: WeeklyVolumeDay[];
}

export interface DashboardData {
  consistencyScore: number;
  consistencyPlanned: number;
  consistencyCompleted: number;
  goalProgress: number;
  goalLabel: string;
  goalInsight: string;
  recoveryStatus: RecoveryStatus;
  recoveryInsight: string;
  strengthTrends: StrengthTrend[];
  volumeByMuscle: VolumeByMuscle[];
  weeklyVolume: WeeklyVolumeData;
}

// ─── User / Auth ──────────────────────────────────────────────────────────────

export interface SPUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  plan: UserPlan;
  isNewUser: boolean;
  experienceLevel: UserLevel | null;
}

/**
 * Sporty Pulse Pro — Session Types
 *
 * Single source of truth for all session-related types used across
 * SessionScreen, hooks, and API calls.
 */

// ─── Screen props ─────────────────────────────────────────────────────────────

export type SessionScreenProps = {
  instanceId: string;
  dayNumber: number;
  planName: string;
  focus: string;
  level: string;
  muscleGroup: string;
  totalSessions: number;
  exercises: ExerciseForSession[];
  draft?: SessionDraft | null;
};

// ─── State machine phases ─────────────────────────────────────────────────────

export type SessionPhase =
  | "in_progress" // Active exercise
  | "resting" // Between sets / exercises
  | "paused" // Timer frozen, exit modal shown
  | "ending" // API call in flight
  | "complete"; // All exercises done
