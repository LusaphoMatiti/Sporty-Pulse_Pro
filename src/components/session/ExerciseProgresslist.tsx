/**
 * ExerciseProgressList
 *
 * Scrollable list showing all session exercises with live state:
 *   - Done: dimmed, accent checkmark bullet
 *   - Current: accent highlight row, live set counter
 *   - Upcoming: neutral opacity
 *
 * Design system:
 *  - 8pt grid: 4 / 8 / 16 / 24 / 32 / 48
 *  - Barlow only, 5 type levels
 *  - Motion: 150–250 ms transitions
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { SPText } from "../ui/SPText";
import { useAppTheme } from "../../theme/ThemeContext";
import { useResponsive } from "../../hooks/useResponsive";
import type { ExerciseForSession } from "../../types/session";

// ── 8pt spacing scale ─────────────────────────────────────────────────────────
const SP = {
  micro: 4,
  tight: 8,
  base: 16,
  section: 24,
  large: 32,
  major: 48,
} as const;

const RADIUS = { card: 16, row: 12, bullet: 999 } as const;
const ANIM_DURATION = 200;

// ─────────────────────────────────────────────────────────────────────────────
// ExerciseRow
// ─────────────────────────────────────────────────────────────────────────────
interface ExerciseRowProps {
  exercise: ExerciseForSession;
  index: number;
  currentExerciseIdx: number;
  completedSets: number;
  totalExercises: number;
}

function ExerciseRow({
  exercise,
  index,
  currentExerciseIdx,
  completedSets,
  totalExercises,
}: ExerciseRowProps) {
  const { theme } = useAppTheme();
  const { rs } = useResponsive();

  const isDone = index < currentExerciseIdx;
  const isCurrent = index === currentExerciseIdx;

  // ── Responsive tokens (8pt grid) ────────────────────────────────────────
  const rowPadV = rs(SP.tight + 4, SP.tight + 4, SP.base, SP.base); // 12 / 12 / 16 / 16
  const rowPadH = rs(SP.base, SP.base, SP.base, SP.section);
  const bulletSize = rs(28, 28, 32, 32);
  const bodySize = rs(14, 14, 16, 16);
  const captionSize = rs(12, 12, 12, 14);
  const statSize = rs(13, 13, 14, 14);

  // Animated opacity: done=0.35, current=1, upcoming=0.55
  const targetOpacity = isDone ? 0.35 : isCurrent ? 1 : 0.55;
  const animStyle = useAnimatedStyle(() => ({
    opacity: withTiming(targetOpacity, { duration: ANIM_DURATION }),
  }));

  // Bullet visuals
  const bulletBg = isDone
    ? theme.accent
    : isCurrent
      ? theme.accentDim
      : theme.raised;
  const bulletTextColor = isDone
    ? theme.void
    : isCurrent
      ? theme.accent
      : theme.muted;

  // Right-side stat
  const rightLabel = isCurrent
    ? `${completedSets} / ${exercise.sets}`
    : isDone
      ? `${exercise.sets} × ${exercise.reps}`
      : `${exercise.sets} × ${exercise.reps}`;

  const isLast = index === totalExercises - 1;

  return (
    <Animated.View style={animStyle}>
      <View
        style={[
          styles.row,
          {
            paddingVertical: rowPadV,
            paddingHorizontal: rowPadH,
            borderRadius: RADIUS.row,
          },
          isCurrent && {
            backgroundColor: theme.accentDim,
            borderWidth: 1,
            borderColor: theme.accent + "40",
          },
        ]}
      >
        {/* Bullet */}
        <View
          style={[
            styles.bullet,
            {
              width: bulletSize,
              height: bulletSize,
              borderRadius: RADIUS.bullet,
              backgroundColor: bulletBg,
              borderWidth: !isDone && !isCurrent ? 1 : 0,
              borderColor: theme.border,
            },
          ]}
        >
          <SPText
            variant="caption"
            style={{
              color: bulletTextColor,
              fontSize: captionSize,
              fontFamily: "Barlow_700Bold",
              lineHeight: captionSize + 2,
            }}
          >
            {isDone ? "✓" : String(index + 1)}
          </SPText>
        </View>

        {/* Exercise name + secondary info */}
        <View style={styles.nameCol}>
          <SPText
            variant="body"
            style={{
              color: theme.text,
              fontSize: bodySize,
              fontFamily: isCurrent
                ? "Barlow_600SemiBold"
                : "Barlow_400Regular",
              letterSpacing: -0.2,
            }}
            numberOfLines={1}
          >
            {exercise.exercise.name}
          </SPText>
          {isCurrent && (
            <SPText
              variant="caption"
              style={{
                color: theme.muted,
                fontSize: captionSize,
                marginTop: 2,
                fontFamily: "Barlow_400Regular",
              }}
            >
              {exercise.reps} reps per set
            </SPText>
          )}
        </View>

        {/* Right stat */}
        <View style={styles.statCol}>
          <SPText
            variant="bodyMd"
            style={{
              color: isCurrent
                ? theme.accent
                : isDone
                  ? theme.muted
                  : theme.muted,
              fontSize: statSize,
              fontFamily: "Barlow_600SemiBold",
              letterSpacing: isCurrent ? -0.5 : 0,
            }}
          >
            {rightLabel}
          </SPText>
        </View>
      </View>

      {/* Hairline divider between rows (skip for current + last) */}
      {!isCurrent && !isLast && (
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
      )}
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ExerciseProgressList
// ─────────────────────────────────────────────────────────────────────────────
interface ExerciseProgressListProps {
  exercises: ExerciseForSession[];
  currentExerciseIdx: number;
  completedSets: number;
}

export function ExerciseProgressList({
  exercises,
  currentExerciseIdx,
  completedSets,
}: ExerciseProgressListProps) {
  const { theme } = useAppTheme();
  const { rs } = useResponsive();

  const cardPad = rs(SP.base, SP.base, SP.base, SP.section);
  const headerMb = rs(SP.tight, SP.tight, SP.base, SP.base);

  const doneCount = currentExerciseIdx;
  const totalCount = exercises.length;

  // Overall progress %
  const overallProgress = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          padding: cardPad,
        },
      ]}
    >
      {/* Header row */}
      <View style={[styles.headerRow, { marginBottom: headerMb }]}>
        <SPText
          variant="caption"
          style={{
            color: theme.muted,
            fontSize: rs(11, 11, 12, 12),
            fontFamily: "Barlow_600SemiBold",
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          Workout Progress
        </SPText>
        <SPText
          variant="caption"
          style={{
            color: theme.muted2,
            fontSize: rs(12, 12, 13, 13),
            fontFamily: "Barlow_600SemiBold",
          }}
        >
          {doneCount}/{totalCount}
        </SPText>
      </View>

      {/* Slim overall progress bar */}
      <View
        style={[
          styles.overallTrack,
          { backgroundColor: theme.raised, marginBottom: headerMb },
        ]}
      >
        <View
          style={[
            styles.overallFill,
            {
              backgroundColor: theme.accent,
              width: `${overallProgress}%` as any,
            },
          ]}
        />
      </View>

      {/* Exercise rows */}
      <View>
        {exercises.map((ex, i) => (
          <ExerciseRow
            key={ex.id}
            exercise={ex}
            index={i}
            currentExerciseIdx={currentExerciseIdx}
            completedSets={completedSets}
            totalExercises={totalCount}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: RADIUS.card,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  overallTrack: {
    height: 2,
    borderRadius: 1,
    overflow: "hidden",
  },
  overallFill: {
    height: "100%",
    borderRadius: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: SP.tight,
  },
  bullet: {
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  nameCol: {
    flex: 1,
    minWidth: 0,
  },
  statCol: {
    alignItems: "flex-end",
    flexShrink: 0,
  },
  divider: {
    height: 1,
    marginHorizontal: SP.large + SP.tight, // indent past bullet
    opacity: 0.6,
  },
});
