/**
 * StreakDotGrid
 *
 * Renders the 3-week dot grid shown in the Current Streak card.
 * Left side: large streak number + "Day" + "Best: N day" label.
 * Right side: 3-row × 7-col dot matrix (oldest week top, current week bottom).
 * Current day column label is highlighted in accent colour.
 *
 * File location: src/components/home/StreakDotGrid.tsx
 */

import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { SPText } from "../ui/SPText";
import { useAppTheme } from "../../theme/ThemeContext";
import { spacing } from "../../theme";

// ─── Public Types ─────────────────────────────────────────────────────────────

export interface StreakDotDay {
  /** true → filled accent dot, false → dim dot */
  completed: boolean;
  /** Whether this is today's column */
  isToday?: boolean;
}

interface StreakDotGridProps {
  currentStreak: number;
  bestStreak: number;
  /** 3-element array: index 0 = oldest week, index 2 = current week */
  weeks: StreakDotDay[][];
  isOnFire?: boolean;
  /** ms delay before dots animate in */
  entranceDelay?: number;
}

// ─── Day labels (Mon → Sun) ───────────────────────────────────────────────────

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"] as const;

// ─── AnimatedDot ──────────────────────────────────────────────────────────────

function AnimatedDot({
  completed,
  delay,
  accentColor,
  dimColor,
}: {
  completed: boolean;
  delay: number;
  accentColor: string;
  dimColor: string;
}) {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withSpring(1, { damping: 18, stiffness: 200 }),
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.dot,
        { backgroundColor: completed ? accentColor : dimColor },
        animStyle,
      ]}
    />
  );
}

// ─── StreakDotGrid ────────────────────────────────────────────────────────────

export function StreakDotGrid({
  currentStreak,
  bestStreak,
  weeks,
  entranceDelay = 0,
}: StreakDotGridProps) {
  const { theme } = useAppTheme();

  // Normalise: always 3 weeks, each 7 days
  const normalised: StreakDotDay[][] = Array.from({ length: 3 }, (_, wi) => {
    const week = weeks[wi] ?? [];
    return Array.from(
      { length: 7 },
      (_, di) => week[di] ?? { completed: false },
    );
  });

  // Find which column index is "today" (look in the last week)
  const todayColIndex = normalised[2].findIndex((d) => d.isToday);

  return (
    <View style={styles.container}>
      {/* ── Left: streak stat ── */}
      <View style={styles.statSide}>
        <View style={styles.streakNumberRow}>
          <SPText
            variant="h1"
            style={[styles.streakNumber, { color: theme.text }]}
          >
            {currentStreak}
          </SPText>
          <SPText
            variant="body"
            style={[styles.streakUnit, { color: theme.muted }]}
          >
            {" Day"}
          </SPText>
        </View>
        <SPText variant="caption" style={{ color: theme.muted }}>
          Best: {bestStreak} day
        </SPText>
      </View>

      {/* ── Right: dot grid ── */}
      <View style={styles.gridSide}>
        {normalised.map((week, wi) => (
          <View key={wi} style={styles.weekRow}>
            {week.map((day, di) => (
              <AnimatedDot
                key={di}
                completed={day.completed}
                delay={entranceDelay + wi * 40 + di * 20}
                accentColor={theme.accent}
                dimColor={theme.surface2 ?? "#2a2a2a"}
              />
            ))}
          </View>
        ))}

        {/* Day labels row */}
        <View style={styles.labelsRow}>
          {DAY_LABELS.map((label, i) => {
            const isToday = i === todayColIndex;
            return (
              <SPText
                key={i}
                variant="caption"
                style={[
                  styles.dayLabel,
                  {
                    color: isToday ? theme.accent : theme.muted,
                    fontWeight: isToday ? "700" : "400",
                  },
                ]}
              >
                {label}
              </SPText>
            );
          })}
        </View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const DOT_SIZE = 10;
const DOT_GAP = 6;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  // Left stat
  statSide: {
    alignItems: "flex-start",
    justifyContent: "center",
    minWidth: 100,
  },
  streakNumberRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  streakNumber: {
    fontSize: 48,
    lineHeight: 52,
    fontFamily: "Barlow-Bold",
  },
  streakUnit: {
    fontSize: 15,
    marginLeft: 4,
    fontFamily: "Barlow-Medium",
  },

  // Right dot grid
  gridSide: {
    alignItems: "center",
    gap: DOT_GAP,
  },
  weekRow: {
    flexDirection: "row",
    gap: DOT_GAP,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
  labelsRow: {
    flexDirection: "row",
    gap: DOT_GAP,
    marginTop: 2,
  },
  dayLabel: {
    width: DOT_SIZE,
    fontSize: 10,
    textAlign: "center",
    fontFamily: "Barlow-Medium",
  },
});
