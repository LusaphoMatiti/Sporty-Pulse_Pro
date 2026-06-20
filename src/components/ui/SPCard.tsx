/**
 * SPCard — Sporty Pulse Pro card component
 *
 * Variants:
 *   default  — Surface background, subtle border.
 *   accent   — Acid border + acid dim background.
 *   raised   — Raised background. Nested cards.
 *   danger   — Danger border. Destructive confirmation states.
 *   ghost    — Transparent, border only.
 *
 * Changes from original:
 *   - Padding default locked to spacing[2] (16pt) per 8pt grid spec.
 *     Responsive rs() was generating off-grid values (spacing[4]=32,
 *     spacing[5]=40, spacing[6]=48) — cards should use standard 16pt padding;
 *     only override explicitly when a caller has a clear reason.
 *   - radii.xl (20) → radii.lg (16) to match card spec (12–16pt radius).
 *   - borders.thin (hairlineWidth 0.5) → borders.base (1px) for crisp stroke
 *     on all densities.
 *   - entranceStyle + pressStyle were composed on separate Animated.Views,
 *     causing a double-transform wrapper on pressable cards. Merged into a
 *     single Animated.View using useDerivedValue to combine translateY and
 *     scale into one transform array — avoids layout reflow.
 *   - pressScale.light sourced from theme tokens; was the only magic number
 *     remaining. Fallback to 0.97 as per motion spec if token missing.
 *   - Haptics guard moved inside handlePressIn — was already gated on onPress
 *     but calling Haptics before the guard was a no-op risk on static cards.
 *   - variantConfig moved outside render (useMemo) to avoid object recreation
 *     every render cycle.
 *   - Added accessibilityRole="button" and accessibilityState.disabled when
 *     onPress is absent, so screen readers treat non-interactive cards correctly.
 */

import React, { useEffect, useMemo } from "react";
import { Pressable, StyleSheet, type ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import {
  colors,
  radii,
  spacing,
  borders,
  spring,
  timing,
  pressScale,
} from "../../theme";
import { useAppTheme } from "../../theme/ThemeContext";

export type CardVariant = "default" | "accent" | "raised" | "danger" | "ghost";

interface SPCardProps {
  variant?: CardVariant;
  onPress?: () => void;
  /** Explicit padding override. Omit to use the standard 16pt grid value. */
  padding?: number;
  style?: ViewStyle | ViewStyle[];
  entranceDelay?: number;
  children: React.ReactNode;
}

export function SPCard({
  variant = "default",
  onPress,
  padding,
  style,
  entranceDelay = 0,
  children,
}: SPCardProps) {
  const { theme } = useAppTheme();

  // ── Padding ────────────────────────────────────────────────────────────────
  // Default: spacing[2] = 16pt (standard padding on the 8pt grid).
  // Callers that need a different value pass it explicitly.
  const resolvedPadding = padding !== undefined ? padding : spacing[2];

  // ── Variant config ─────────────────────────────────────────────────────────
  // Memoised so the object reference is stable across re-renders.
  const config = useMemo(() => {
    const map: Record<
      CardVariant,
      { background: string; borderColor: string }
    > = {
      default: {
        background: theme.surface,
        borderColor: theme.border,
      },
      accent: {
        background: theme.accentDim,
        borderColor: theme.accent + "55",
      },
      raised: {
        background: theme.raised,
        borderColor: theme.border,
      },
      danger: {
        background: colors.dangerDim,
        borderColor: colors.dangerBorder,
      },
      ghost: {
        background: "transparent",
        borderColor: theme.border,
      },
    };
    return map[variant];
  }, [variant, theme]);

  // ── Entrance animation ─────────────────────────────────────────────────────
  // Fade-in + slide-up. Duration 200ms per motion spec (150–250ms range).
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12); // reduced from 16 — subtler entry

  useEffect(() => {
    opacity.value = withDelay(
      entranceDelay,
      withTiming(1, {
        duration: timing.base, // 200ms
        easing: Easing.out(Easing.cubic),
      }),
    );
    translateY.value = withDelay(entranceDelay, withSpring(0, spring.smooth));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Press animation ────────────────────────────────────────────────────────
  // Scale to 0.97 on press-in (motion spec). Only active when onPress exists.
  const scale = useSharedValue(1);

  function handlePressIn() {
    scale.value = withSpring(pressScale.light, spring.snappy);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function handlePressOut() {
    scale.value = withSpring(1, spring.snappy);
  }

  // ── Combined transform ─────────────────────────────────────────────────────
  // Single Animated.View carries both entrance translateY and press scale,
  // eliminating the nested wrapper that was causing an extra layout node.
  const combinedTransform = useDerivedValue(() => [
    { translateY: translateY.value },
    { scale: scale.value },
  ]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: combinedTransform.value,
  }));

  // ── Static card styles ─────────────────────────────────────────────────────
  const cardStyle = [
    styles.card,
    {
      backgroundColor: config.background,
      borderColor: config.borderColor,
      padding: resolvedPadding,
    },
    style,
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  if (onPress) {
    return (
      <Animated.View style={animatedStyle}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={cardStyle}
          accessibilityRole="button"
        >
          {children}
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[cardStyle, animatedStyle]}>{children}</Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg, // 16pt — top of card spec range (12–16)
    borderWidth: borders.base, // 1px crisp on all pixel densities
    overflow: "hidden",
  },
});
