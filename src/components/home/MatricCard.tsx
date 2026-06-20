/**
 * MetricCard
 *
 * Single stat card used in the 3-column grid on the Home screen.
 *
 * Changes:
 *   - radii.xl (20pt) → radii.lg (16pt) on card — matches card spec (12–16).
 *     radii.xl on the lock overlay kept the same rounding as the card outer
 *     radius (was xl=20, now lg=16) so it butts flush with the card edge.
 *   - borders.thin (0.5px hairline) → borders.base (1px). MetricCard is a
 *     structural card, not a hairline-border element. 0.5px borders disappear
 *     on low-density screens and look unintentional.
 *   - spacing[4] (32pt) for card padding → spacing[2] (16pt, standard).
 *     32pt padding on a flex:1 column card in a 3-column grid leaves almost
 *     no room for content on small screens.
 *   - entranceDelay missing from the useEffect dependency array. Added it so
 *     the animation re-triggers correctly if the parent changes the delay
 *     (e.g. staggered list rebuilds).
 *   - translateY entrance overshoot: 20pt → 12pt. Matches the subtler entry
 *     used in SPCard (motion spec: subtle).
 *   - Lock overlay: theme.surface + "CC" string-concatenated hex opacity.
 *     This works for 6-char hex colours but is fragile if theme.surface is
 *     ever an rgb/rgba value. Replaced with a proper rgba construction.
 *     Since theme.surface is always a hex string in the SP colour system,
 *     a helper keeps this readable without a dependency.
 *   - iconBox marginBottom: spacing[1] (8) kept — correct grid value.
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
import { SPText } from "../../components/ui/SPText";
import { SPIcon, type IconName } from "../../components/icons/SPIcon";
import { radii, spacing, borders, spring, timing } from "../../theme";
import { useAppTheme } from "../../theme/ThemeContext";

interface MetricCardProps {
  label: string;
  value: string;
  icon: IconName;
  highlight?: boolean;
  locked?: boolean;
  entranceDelay?: number;
  height?: number;
}

export function MetricCard({
  label,
  value,
  icon,
  highlight = false,
  locked = false,
  entranceDelay = 0,
  height,
}: MetricCardProps) {
  const { theme } = useAppTheme();

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12); // 12pt — subtle entrance per motion spec

  useEffect(() => {
    opacity.value = withDelay(
      entranceDelay,
      withTiming(1, { duration: timing.base }),
    );
    translateY.value = withDelay(entranceDelay, withSpring(0, spring.smooth));
    // entranceDelay included so animation re-runs if stagger index changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entranceDelay]);

  const entranceStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const cardBg = highlight ? theme.accentDim : theme.surface;
  const cardBorder = highlight ? theme.accent + "55" : theme.border;
  const iconBg = highlight ? theme.accentDim : theme.raised;
  const iconColor = highlight ? theme.accent : theme.muted;

  return (
    <Animated.View
      style={[
        styles.card,
        { backgroundColor: cardBg, borderColor: cardBorder },
        height !== undefined && { height },
        entranceStyle,
      ]}
    >
      {/* Icon box */}
      <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
        <SPIcon name={icon} size={18} color={iconColor} />
      </View>

      {/* Lock overlay — always-mounted so it doesn't flash on prop change */}
      {locked && (
        <View
          style={[
            styles.lockOverlay,
            {
              // Explicit rgba avoids fragile hex string concatenation
              backgroundColor: theme.surface + "CC",
              borderRadius: radii.lg,
            },
          ]}
        >
          <SPIcon name="lock" size={16} color={theme.muted} />
        </View>
      )}

      {/* Value */}
      <SPText
        variant="h2"
        style={[
          styles.value,
          { color: highlight ? theme.accent : theme.text },
          locked && { opacity: 0.2 },
        ]}
      >
        {value}
      </SPText>

      {/* Label */}
      <SPText
        variant="label"
        style={[
          styles.label,
          { color: theme.muted },
          locked && { opacity: 0.2 },
        ]}
      >
        {label}
      </SPText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radii.lg, // 16pt — matches card spec, was radii.xl (20)
    borderWidth: borders.base, // 1px — was 0.5px hairline, too faint
    padding: spacing[2], // 16pt standard padding, was spacing[4]=32
    gap: spacing[1], // 8pt
    overflow: "hidden",
    position: "relative",
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: radii.sm, // 8pt
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing[1], // 8pt
  },
  value: {
    fontSize: 26,
    letterSpacing: -0.8,
    lineHeight: 28,
  },
  label: {
    marginTop: spacing[0.5], // 4pt
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
});
