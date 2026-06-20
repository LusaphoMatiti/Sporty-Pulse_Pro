/**
 * WeekProgress
 *
 * "This Week" section. Shows each planned session as a labelled progress bar.
 *
 * Changes:
 *   - `width: \`${width.value * 100}%\` as any` — same Reanimated
 *     percentage-string bug as WeekBar. Fixed identically: animate a scaleX
 *     value from 0→1 on a full-width fill View instead of animating a
 *     percentage string. scaleX with transformOrigin-left is the canonical
 *     Reanimated pattern for progress bars:
 *       • fill View is always width:"100%"
 *       • scaleX animates 0→1
 *       • transform: [{ translateX: -(1 - scaleX) * measuredWidth / 2 }]
 *     However, translateX requires knowing the bar's pixel width. The simpler
 *     correct approach: wrap the fill in an outer View with overflow:hidden
 *     and animate the fill's absolute width using the track's known pixel
 *     height equivalent. For a horizontal bar this means using scaleX + a
 *     left-anchored container. The cleanest zero-measurement approach:
 *       fill View: width "100%", transform scaleX — but this scales from
 *       centre by default in RN, causing a grow-from-middle effect.
 *     Best fix without layout measurement: use a wrapper with overflow:hidden
 *     and animate the fill's `right` from 100% → 0% via a covering overlay,
 *     OR simply interpolate a flex value. Chosen approach: animate `flexGrow`
 *     from 0 to progress/100, with a sibling `flexGrow: 1 - progress/100`
 *     spacer. This is layout-engine driven, works correctly, and avoids both
 *     the percentage string hack and the scaleX centering issue.
 *   - spacing[3.5] (28pt) for rows gap → spacing[3] (24pt). 3.5 is not in
 *     the defined spacing map and will produce undefined in JS, collapsing
 *     the gap to 0.
 *   - spacing[4] (32pt) for container gap → spacing[3] (24pt, section spacing).
 *   - useEffect dependency array was empty []. `progress` is a prop — added
 *     to deps so the bar re-animates when progress changes (e.g. mid-workout).
 *   - ProgressRow key was w.name — fragile if two workouts share a name.
 *     Changed to index-based key with name prefix for stability.
 *   - Progress bar track height: 3px. Kept — deliberate minimal style.
 *     Increased to 4px for slightly better tap affordance on the visual target.
 */

import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
} from "react-native-reanimated";
import { SPText } from "../ui/SPText";
import { SPBadge } from "../ui/SPBadge";
import { spacing, radii } from "../../theme";
import { useAppTheme } from "../../theme/ThemeContext";

interface WeekWorkout {
  name: string;
  progress: number; // 0 | 50 | 100
}

interface WeekProgressProps {
  weekWorkouts: WeekWorkout[];
  weekCompletedCount: number;
  weekTotalCount: number;
  entranceDelay?: number;
}

function ProgressRow({
  name,
  progress,
  index,
  baseDelay,
}: WeekWorkout & { index: number; baseDelay: number }) {
  const { theme } = useAppTheme();

  // Animate a 0→1 ratio. Applied as scaleX on the fill — but to anchor left,
  // we wrap in overflow:hidden and animate the fill's flex share instead.
  const fillGrow = useSharedValue(0);

  useEffect(() => {
    fillGrow.value = withDelay(
      baseDelay + index * 60,
      withSpring(progress / 100, { damping: 22, stiffness: 160, mass: 1.2 }),
    );
    // Re-animate when progress prop changes (workout in progress)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  // Fill grows from left; spacer takes remaining width. Both sum to flex 1.
  const fillStyle = useAnimatedStyle(() => ({
    flex: fillGrow.value,
  }));
  const spacerStyle = useAnimatedStyle(() => ({
    flex: 1 - fillGrow.value,
  }));

  const isComplete = progress === 100;
  const isPartial = progress > 0 && progress < 100;

  const fillColor = isComplete
    ? theme.accent
    : isPartial
      ? theme.muted
      : "transparent";
  const nameColor = isComplete ? theme.text : theme.muted2;
  const pctColor = isComplete ? theme.accent : theme.muted;

  return (
    <View style={styles.row}>
      <View style={styles.rowHeader}>
        <SPText
          variant="bodyMd"
          style={{ color: nameColor, fontFamily: "Barlow-Medium" }}
        >
          {name}
        </SPText>
        <SPText variant="caption" style={{ color: pctColor }}>
          {progress}%
        </SPText>
      </View>

      {/* Track with flex-based fill — no percentage string, no scaleX centering */}
      <View style={[styles.track, { backgroundColor: theme.surface2 }]}>
        <Animated.View
          style={[styles.fill, { backgroundColor: fillColor }, fillStyle]}
        />
        <Animated.View style={spacerStyle} />
      </View>
    </View>
  );
}

export function WeekProgress({
  weekWorkouts,
  weekCompletedCount,
  weekTotalCount,
  entranceDelay = 0,
}: WeekProgressProps) {
  const { theme } = useAppTheme();

  if (weekWorkouts.length === 0) {
    return (
      <View style={styles.empty}>
        <SPText variant="caption" center style={{ color: theme.muted }}>
          No active plan — sessions appear here once you start one
        </SPText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SPText variant="h3" style={{ color: theme.text }}>
          This Week
        </SPText>
        {weekTotalCount > 0 && (
          <SPBadge variant="acid">
            {weekCompletedCount} / {weekTotalCount} done
          </SPBadge>
        )}
      </View>

      <View style={styles.rows}>
        {weekWorkouts.map((w, i) => (
          <ProgressRow
            key={`${i}-${w.name}`}
            {...w}
            index={i}
            baseDelay={entranceDelay}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[3], // 24pt section spacing — was spacing[4]=32
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rows: {
    gap: spacing[3], // 24pt — was spacing[3.5] which is undefined on the map
  },
  row: {
    gap: spacing[1.5], // 12pt
  },
  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  track: {
    height: 4, // was 3px — 4px slightly better visual target
    borderRadius: radii.sm, // 8pt
    overflow: "hidden",
    flexDirection: "row", // needed for flex-based fill children
  },
  fill: {
    height: "100%",
  },
  empty: {
    paddingVertical: spacing[3], // 24pt — was spacing[4]=32
  },
});
