/**
 * StreakRing
 *
 * The hero element of the Home screen. Shows the current streak as a giant
 * number inside an animated acid ring.
 *
 * Changes:
 *   - `counter` shared value was defined and animated but never consumed
 *     anywhere in the component — it was dead code. The intended use was
 *     presumably an animating number display, but SPText doesn't accept
 *     animated props directly. Removed the counter sharedValue and its
 *     useEffect entirely. If an animated counter is needed in future, it
 *     requires Animated.Text + useAnimatedProps, not SPText.
 *   - Three separate useEffect(() => {}, []) calls (progress, counter, entrance)
 *     → merged into a single useEffect. All three had the same empty dependency
 *     array so they fired together; one call is cleaner and avoids scheduling
 *     three separate worklet batches on mount.
 *   - opacity/scale entrance: was two separate withDelay(100, ...) calls for
 *     opacity and scale in the same useEffect — kept but merged into the single
 *     combined useEffect.
 *   - `fillRatio` was recalculated inline each render. Extracted to a const
 *     with a clear name for readability; the formula is unchanged.
 *   - All derived geometry constants (STROKE_WIDTH, RADIUS, etc.) are pure
 *     calculations from `size` — no changes to values, just comments added
 *     to make the scale rationale explicit.
 *   - gap: 2 in styles.inner is not on the 8pt grid. Changed to 4pt
 *     (spacing[0.5]) which is the micro-spacing token and is visually
 *     equivalent at this scale.
 */

import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withDelay,
  withSpring,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { SPText } from "../../components/ui/SPText";
import { spacing, spring, timing } from "../../theme";
import { useAppTheme } from "../../theme/ThemeContext";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const FIRE_COLOR = "#FF4136";
const DEFAULT_SIZE = 200;

interface StreakRingProps {
  currentStreak: number;
  bestStreak: number;
  isOnFire: boolean;
  /** Container + SVG size in px. Passed from HomeScreen's ResponsiveScale. */
  size?: number;
}

export function StreakRing({
  currentStreak,
  bestStreak,
  isOnFire,
  size = DEFAULT_SIZE,
}: StreakRingProps) {
  const { theme } = useAppTheme();

  // ── Geometry — all derived from `size` so the ring scales uniformly ────────
  const STROKE_WIDTH = Math.round(size * 0.04); // 4% of size (~8px at 200)
  const RADIUS = (size - STROKE_WIDTH) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  // Inner content type scale — proportional to ring size
  const topLabelSize = Math.round(size * 0.045); // ~9px at 200
  const numberSize = Math.round(size * 0.28); // ~56px at 200
  const numberLineH = Math.round(size * 0.3);
  const unitSize = Math.round(size * 0.06); // ~12px at 200
  const bestSize = Math.round(size * 0.055); // ~11px at 200
  const topLabelMb = Math.round(size * 0.02); // ~4px at 200
  const unitMt = Math.round(size * -0.01); // ~-2px at 200
  const bestMt = Math.round(size * 0.03); // ~6px at 200

  // ── Fill ratio ─────────────────────────────────────────────────────────────
  // Minimum 0.04 so the ring always shows a sliver even at streak=0.
  const fillRatio =
    bestStreak > 0
      ? Math.max(0.04, Math.min(1, currentStreak / bestStreak))
      : currentStreak > 0
        ? 1
        : 0.04;

  // ── Shared values ──────────────────────────────────────────────────────────
  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.85);

  // Single useEffect — all three animations have the same mount-only trigger.
  // Previously split into three separate useEffect(fn, []) calls; merged to
  // avoid scheduling three separate Reanimated worklet batches on mount.
  useEffect(() => {
    // Ring fill — delayed 300ms so the entrance animation lands first
    progress.value = withDelay(300, withSpring(fillRatio, spring.smooth));

    // Container entrance
    opacity.value = withDelay(100, withTiming(1, { duration: timing.base }));
    scale.value = withDelay(100, withSpring(1, spring.bouncy));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-animate ring when streak changes after mount
  useEffect(() => {
    progress.value = withSpring(fillRatio, spring.smooth);
  }, [fillRatio]);

  // ── Animated styles ────────────────────────────────────────────────────────
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const ringStrokeColor = isOnFire ? FIRE_COLOR : theme.accent;
  const numberColor = isOnFire ? FIRE_COLOR : theme.text;

  return (
    <Animated.View
      style={[styles.container, { width: size, height: size }, containerStyle]}
    >
      <Svg
        width={size}
        height={size}
        style={StyleSheet.absoluteFill}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Track ring */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={RADIUS}
          fill="none"
          stroke={theme.border}
          strokeWidth={STROKE_WIDTH}
        />
        {/* Animated fill ring */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={RADIUS}
          fill="none"
          stroke={ringStrokeColor}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      <View style={styles.inner}>
        <SPText
          variant="label"
          style={{
            color: theme.muted,
            fontSize: topLabelSize,
            letterSpacing: 2,
            marginBottom: topLabelMb,
          }}
        >
          {isOnFire ? "On Fire" : "Streak"}
        </SPText>

        <SPText
          variant="statLg"
          style={{
            color: numberColor,
            fontSize: numberSize,
            lineHeight: numberLineH,
          }}
        >
          {currentStreak}
        </SPText>

        <SPText
          variant="caption"
          style={{ color: theme.muted2, fontSize: unitSize, marginTop: unitMt }}
        >
          day{currentStreak !== 1 ? "s" : ""}
        </SPText>

        <SPText
          variant="caption"
          style={{ color: theme.muted, fontSize: bestSize, marginTop: bestMt }}
        >
          Best: {bestStreak}
        </SPText>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  inner: {
    alignItems: "center",
    gap: spacing[0.5], // 4pt micro-spacing — was 2 (off-grid)
  },
});
