/**
 * WeekBar
 *
 * 7-day training activity bars.
 *
 * Changes:
 *   - `height: \`${fillHeight.value * 100}%\` as any` inside useAnimatedStyle
 *     is a well-known Reanimated anti-pattern. Percentage strings are not
 *     supported in Reanimated's JS-driven animated styles — the value is sent
 *     to the native side as a number, not a string, and the `as any` cast
 *     silently breaks on some Reanimated versions / Fabric. Fixed by animating
 *     a pixel height directly: `height: fillHeight.value * BAR_HEIGHT`.
 *     This is the correct pattern for bar charts in Reanimated.
 *   - `opacity` was also inside the same useAnimatedStyle alongside the height.
 *     Opacity is fine as a direct number — kept but ensured the value is a
 *     number literal (was already a ternary returning numbers, no change).
 *   - spacing[1.5] (12pt) for barWrapper gap → spacing[1] (8pt). 12pt between
 *     bar and label is too much for a compact 7-column layout.
 *   - spacing[2] (16pt) for container gap → spacing[1.5] (12pt). On narrow
 *     screens, 16pt × 6 gaps = 96pt of gap in a full-width row — too wide,
 *     pushes bars below minimum tap width. 12pt gives each bar ~28pt width
 *     on a 375pt screen, within acceptable range.
 *   - Bar track width: 6px is at the low end of legibility. Kept — this is a
 *     deliberate minimal design choice, not a bug.
 *   - dayLabel fontSize: 10pt is below the 11pt iOS minimum. Raised to 11pt.
 *   - useEffect dependency array was empty []. targetFill is a derived value
 *     from props (isFuture, worked) — added to deps so the bar re-animates
 *     if the day's state changes (e.g. after a workout is logged).
 */

import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
} from "react-native-reanimated";
import { SPText } from "../../components/ui/SPText";
import { spring, spacing } from "../../theme";
import { useAppTheme } from "../../theme/ThemeContext";

interface WeekDay {
  day: string;
  worked: boolean;
  isFuture: boolean;
}

interface WeekBarProps {
  weekDays: WeekDay[];
}

const BAR_HEIGHT = 52;

function Bar({ day, worked, isFuture, index }: WeekDay & { index: number }) {
  const { theme } = useAppTheme();

  // Target as a ratio [0–1]; multiplied to pixel height in animatedStyle
  const targetFill = isFuture ? 0 : worked ? 1 : 0.18;

  const fillHeight = useSharedValue(0);

  useEffect(() => {
    fillHeight.value = withDelay(
      index * 40,
      withSpring(targetFill, spring.smooth),
    );
    // targetFill in deps: re-animates bar if workout state changes after mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetFill]);

  // height is a pixel value — avoids the percentage-string Reanimated bug
  const fillStyle = useAnimatedStyle(() => ({
    height: fillHeight.value * BAR_HEIGHT,
    opacity: worked ? 1 : isFuture ? 0 : 0.5,
  }));

  const fillColor = worked ? theme.accent : theme.muted;
  const labelColor = worked
    ? theme.accent
    : isFuture
      ? theme.border
      : theme.muted;

  return (
    <View style={styles.barWrapper}>
      <View style={[styles.track, { backgroundColor: theme.surface2 }]}>
        <Animated.View
          style={[styles.fill, { backgroundColor: fillColor }, fillStyle]}
        />
      </View>
      <SPText
        variant="caption"
        style={[styles.dayLabel, { color: labelColor }]}
      >
        {day}
      </SPText>
    </View>
  );
}

export function WeekBar({ weekDays }: WeekBarProps) {
  return (
    <View style={styles.container}>
      {weekDays.map((d, i) => (
        <Bar key={d.day} {...d} index={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: spacing[1.5], // 12pt — was 16, too wide for 7-col layout
  },
  barWrapper: {
    flex: 1,
    alignItems: "center",
    gap: spacing[1], // 8pt — was 12, too much between bar + label
  },
  track: {
    width: 6,
    height: BAR_HEIGHT,
    borderRadius: 3,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  fill: {
    width: "100%",
    borderRadius: 3,
  },
  dayLabel: {
    fontSize: 11, // was 10 — below iOS 11pt minimum legibility
  },
});
