/**
 * ExerciseCallout
 *
 * Prominent hero card shown at the top of the session view.
 * Three states: Active (current exercise), Resting (countdown + skip), Complete.
 *
 * Design system:
 *  - 8pt grid: 4 / 8 / 16 / 24 / 32 / 48
 *  - Barlow only, 5 type levels
 *  - Accent #C8F135 (dark) / #5C8A00 (light)
 *  - Motion: 150–250 ms, scale 0.97 on press
 */

import React, { useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
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

// ── Border radius ─────────────────────────────────────────────────────────────
const RADIUS = { card: 16, button: 12 } as const;

// ── Animation config ──────────────────────────────────────────────────────────
const FADE_OUT = 120;
const FADE_IN = 200;

interface ExerciseCalloutProps {
  resting: boolean;
  restMins: number;
  restSecs: number;
  currentExercise: ExerciseForSession | null;
  completedSets: number;
  onSkipRest: () => void;
}

// ── Animated press wrapper ────────────────────────────────────────────────────
function PressableScale({
  onPress,
  style,
  children,
}: {
  onPress: () => void;
  style?: object;
  children: React.ReactNode;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      }}
      activeOpacity={1}
    >
      <Animated.View style={[style, animStyle]}>{children}</Animated.View>
    </TouchableOpacity>
  );
}

export function ExerciseCallout({
  resting,
  restMins,
  restSecs,
  currentExercise,
  completedSets,
  onSkipRest,
}: ExerciseCalloutProps) {
  const { theme } = useAppTheme();
  const { rs } = useResponsive();
  const opacity = useSharedValue(1);

  // ── Responsive scale (stays within 8pt grid) ──────────────────────────────
  const cardPadH = rs(SP.base, SP.base, SP.section, SP.section);
  const cardPadV = rs(SP.base, SP.base, SP.section, SP.section);
  const h1Size = rs(28, 30, 32, 32);
  const subtextSize = rs(14, 14, 16, 16);
  const captionSize = rs(12, 12, 14, 14);

  // Cross-fade on state change
  useEffect(() => {
    opacity.value = withSequence(
      withTiming(0, { duration: FADE_OUT }),
      withTiming(1, { duration: FADE_IN }),
    );
  }, [resting, currentExercise?.id]);

  const fadeStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  // ── REST STATE ────────────────────────────────────────────────────────────
  if (resting) {
    return (
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            paddingHorizontal: cardPadH,
            paddingVertical: cardPadV,
            // Subtle inner shadow effect via border
            shadowColor: theme.accent,
            shadowOpacity: 0.06,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 4 },
            elevation: 3,
          },
          fadeStyle,
        ]}
      >
        {/* Left: label + timer */}
        <View style={styles.col}>
          <SPText
            variant="caption"
            style={[
              styles.eyebrow,
              { color: theme.muted, fontSize: captionSize },
            ]}
          >
            REST
          </SPText>
          <SPText
            variant="h1"
            style={[
              styles.timerText,
              { color: theme.accent, fontSize: h1Size },
            ]}
          >
            {restMins}:{restSecs}
          </SPText>
        </View>

        {/* Right: skip button */}
        <PressableScale
          onPress={onSkipRest}
          style={[
            styles.skipBtn,
            {
              borderColor: theme.accent + "40",
              backgroundColor: theme.accentDim,
              paddingHorizontal: SP.base,
              paddingVertical: SP.tight,
            },
          ]}
        >
          <SPText
            variant="bodyMd"
            style={{ color: theme.accent, fontSize: subtextSize }}
          >
            Skip
          </SPText>
        </PressableScale>
      </Animated.View>
    );
  }

  // ── COMPLETE STATE ────────────────────────────────────────────────────────
  if (!currentExercise) {
    return (
      <Animated.View
        style={[
          styles.card,
          styles.cardCentered,
          {
            backgroundColor: theme.accentDim,
            borderColor: theme.accent + "40",
            paddingHorizontal: cardPadH,
            paddingVertical: cardPadV,
          },
          fadeStyle,
        ]}
      >
        <SPText
          variant="h2"
          style={{ color: theme.accent, fontSize: rs(22, 22, 24, 24) }}
        >
          All done 🎉
        </SPText>
        <SPText
          variant="caption"
          style={{
            color: theme.muted,
            marginTop: SP.micro,
            fontSize: captionSize,
          }}
        >
          Great work — session complete
        </SPText>
      </Animated.View>
    );
  }

  // ── ACTIVE STATE ──────────────────────────────────────────────────────────
  const progressPercent =
    currentExercise.sets > 0 ? (completedSets / currentExercise.sets) * 100 : 0;

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: theme.accentDim,
          borderColor: theme.accent + "40",
          paddingHorizontal: cardPadH,
          paddingVertical: cardPadV,
          shadowColor: theme.accent,
          shadowOpacity: 0.08,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 6 },
          elevation: 4,
        },
        fadeStyle,
      ]}
    >
      {/* Left: exercise info */}
      <View style={styles.activeLeft}>
        <SPText
          variant="caption"
          style={[
            styles.eyebrow,
            { color: theme.muted, fontSize: captionSize },
          ]}
        >
          NOW
        </SPText>
        <SPText
          variant="h2"
          style={[
            styles.exerciseName,
            { color: theme.text, fontSize: rs(22, 22, 24, 24) },
          ]}
          numberOfLines={1}
        >
          {currentExercise.exercise.name}
        </SPText>
        <SPText
          variant="caption"
          style={{ color: theme.muted, fontSize: captionSize, marginTop: 2 }}
        >
          {currentExercise.reps} reps · {currentExercise.sets} sets
        </SPText>

        {/* Micro progress bar */}
        <View
          style={[
            styles.progressTrack,
            { backgroundColor: theme.accent + "20", marginTop: SP.tight },
          ]}
        >
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: theme.accent,
                width: `${progressPercent}%` as any,
              },
            ]}
          />
        </View>
      </View>

      {/* Right: set counter */}
      <View style={styles.activeRight}>
        <SPText
          variant="caption"
          style={[
            styles.eyebrow,
            { color: theme.muted, fontSize: captionSize },
          ]}
        >
          SET
        </SPText>
        <SPText
          variant="h1"
          style={[styles.setCounter, { color: theme.accent, fontSize: h1Size }]}
        >
          {completedSets + 1}
          <SPText
            variant="bodyMd"
            style={{
              color: theme.muted,
              fontSize: subtextSize,
              fontWeight: "500",
            }}
          >
            /{currentExercise.sets}
          </SPText>
        </SPText>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.card,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    overflow: "hidden",
  },
  cardCentered: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  col: {
    gap: SP.micro,
  },
  eyebrow: {
    letterSpacing: 2,
    textTransform: "uppercase",
    fontFamily: "Barlow_600SemiBold",
    marginBottom: SP.micro,
  },
  timerText: {
    fontFamily: "Barlow_700Bold",
    letterSpacing: -1,
  },
  skipBtn: {
    borderWidth: 1,
    borderRadius: RADIUS.button,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 72,
    minHeight: 48,
  },
  activeLeft: {
    flex: 1,
    marginRight: SP.base,
  },
  exerciseName: {
    fontFamily: "Barlow_600SemiBold",
    letterSpacing: -0.3,
  },
  progressTrack: {
    height: 3,
    borderRadius: 2,
    overflow: "hidden",
    width: "100%",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  activeRight: {
    alignItems: "flex-end",
    minWidth: 56,
  },
  setCounter: {
    fontFamily: "Barlow_700Bold",
    letterSpacing: -1,
  },
});
