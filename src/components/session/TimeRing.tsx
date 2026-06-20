/**
 * TimerRing
 *
 * Renders the animated SVG ring for the active session timer.
 *
 * ── Circumference ownership ──────────────────────────────────────────────────
 * This component is the ONLY place that knows the true drawn radius (responsive
 * via `rs`). It therefore computes circumference itself and derives
 * strokeDashoffset via useAnimatedProps — keeping strokeDasharray and
 * strokeDashoffset always in sync, regardless of screen size.
 *
 * The hook (useSessionTimer) passes a unit-less `progress` SharedValue
 * (0 → 1). TimerRing multiplies: dashOffset = circumference × (1 − progress).
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useAnimatedProps,
  type SharedValue,
} from "react-native-reanimated";
import { spacing, shadows } from "../../theme";
import { SPText } from "../../components/ui/SPText";
import { useAppTheme } from "../../theme/ThemeContext";
import { useResponsive } from "../../hooks/useResponsive";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const STROKE_WIDTH = 6;

interface TimerRingProps {
  mins: string;
  secs: string;
  status: "In Progress" | "Resting" | "Paused";
  /** Unit-less 0-1 progress from useSessionTimer. */
  progress: SharedValue<number>;
}

export function TimerRing({ mins, secs, status, progress }: TimerRingProps) {
  const { theme, isDark } = useAppTheme();
  const { rs } = useResponsive();

  // ── Responsive dimensions ─────────────────────────────────────────────────
  const RING_SIZE = rs(196, 212, 224, 240);
  const RADIUS = rs(86, 94, 100, 108);
  const SVG_SIZE = rs(208, 224, 240, 256);
  const FACE_SIZE = rs(152, 164, 176, 190);
  const timeFontSize = rs(42, 48, 52, 58);
  const timeLineHeight = rs(42, 48, 52, 58);

  // ✅ Circumference computed from the SAME radius used in r={RADIUS} below.
  const circumference = 2 * Math.PI * RADIUS;

  // ✅ animatedProps lives here — it references the local circumference.
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <View style={[styles.container, { width: RING_SIZE, height: RING_SIZE }]}>
      <Svg
        width={RING_SIZE}
        height={RING_SIZE}
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        style={styles.svg}
      >
        {/* Track */}
        <Circle
          cx={SVG_SIZE / 2}
          cy={SVG_SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={theme.border}
          strokeWidth={STROKE_WIDTH}
        />

        {/* Animated progress arc */}
        <AnimatedCircle
          cx={SVG_SIZE / 2}
          cy={SVG_SIZE / 2}
          r={RADIUS} // ← drawn with RADIUS
          fill="none"
          stroke={isDark ? theme.accent : "#5C8A00"}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={circumference} // ← same circumference
          animatedProps={animatedProps} // ← offset derived from same circumference
        />
      </Svg>

      {/* Acid glow */}
      <View
        style={[
          styles.glow,
          { width: FACE_SIZE, height: FACE_SIZE, borderRadius: FACE_SIZE / 2 },
        ]}
      />

      {/* Inner face */}
      <View
        style={[
          styles.face,
          {
            width: FACE_SIZE,
            height: FACE_SIZE,
            borderRadius: FACE_SIZE / 2,
            backgroundColor: isDark ? theme.surface : "#5C8A00",
            borderColor: isDark ? theme.border : "#5C8A00",
          },
        ]}
      >
        <SPText
          variant="display"
          style={[
            styles.time,
            {
              color: isDark ? theme.accent : "#ffffff",
              fontSize: timeFontSize,
              lineHeight: timeLineHeight,
            },
          ]}
        >
          {mins}:{secs}
        </SPText>
        <SPText
          variant="label"
          style={[
            styles.statusLabel,
            { color: isDark ? theme.muted : "#ffffff" },
          ]}
        >
          {status}
        </SPText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  svg: {
    position: "absolute",
    transform: [{ rotate: "-90deg" }],
  },
  glow: {
    position: "absolute",
    ...shadows.acid,
  },
  face: {
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[1],
  },
  time: {
    letterSpacing: -2,
  },
  statusLabel: {
    marginTop: spacing[1],
    letterSpacing: 2.4,
  },
});
