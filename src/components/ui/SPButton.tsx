/**
 * SPButton — Sporty Pulse Pro button component
 *
 * Variants:
 *   primary   — Accent fill, void text. Main CTAs.
 *   ghost     — Accent dim fill + accent border. Secondary actions.
 *   secondary — Raised surface, border. Tertiary actions.
 *   danger    — Red dim fill + red border. Destructive actions.
 *   text      — No background. Inline text actions.
 *
 * Sizes:
 *   sm → 48px height   (spec minimum)
 *   md → 52px height
 *   lg → 56px height   (spec maximum)
 *
 * Motion:
 *   Press → scale 0.97, spring snappy, 150–200ms
 *   Haptic on pressIn (light impact)
 */

import React, { useCallback, useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  ActivityIndicator,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { SPText } from "./SPText";
import {
  colors,
  radii,
  spacing,
  spring,
  pressScale,
  borders,
} from "../../theme";
import { useAppTheme } from "../../theme/ThemeContext";
import { useResponsive } from "../../hooks/useResponsive";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ButtonVariant =
  | "primary"
  | "ghost"
  | "secondary"
  | "danger"
  | "text";
export type ButtonSize = "sm" | "md" | "lg";

export interface SPButtonProps extends Omit<PressableProps, "style"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  /** Stretches button to 100% of its parent. Default: true */
  fullWidth?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

// ─── Size config ──────────────────────────────────────────────────────────────

/**
 * Heights are spec-locked: 48 / 52 / 56px.
 * Border-radius is now a full pill (height / 2) on every variant,
 * matching the onboarding slide 8 CTA — this supersedes the old
 * 12–16px radius cap.
 * Font size scales with size but stays within the button variant of SPText.
 */
const SIZE_CONFIG: Record<
  ButtonSize,
  {
    height: number;
    paddingHorizontal: number;
    borderRadius: number;
    fontSize: number;
  }
> = {
  sm: {
    height: 48,
    paddingHorizontal: spacing[4],
    borderRadius: 24,
    fontSize: 13,
  },
  md: {
    height: 52,
    paddingHorizontal: spacing[5],
    borderRadius: 26,
    fontSize: 14,
  },
  lg: {
    height: 56,
    paddingHorizontal: spacing[6],
    borderRadius: 28,
    fontSize: 15,
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function SPButton({
  variant = "primary",
  size = "lg",
  loading = false,
  iconLeft,
  iconRight,
  fullWidth = true,
  disabled,
  onPress,
  containerStyle,
  children,
  ...rest
}: SPButtonProps) {
  const { theme } = useAppTheme();
  const { rs } = useResponsive();
  const isDisabled = disabled || loading;

  // ── Responsive size ────────────────────────────────────────────────────────
  // Scale height and horizontal padding up slightly on larger screens,
  // staying within the 48–56px spec window.
  const sizeStyles = useMemo(() => {
    const base = SIZE_CONFIG[size];
    const height = rs(base.height, base.height + 2, base.height + 4);
    return {
      height,
      paddingHorizontal: rs(
        base.paddingHorizontal,
        base.paddingHorizontal + spacing[1],
      ),
      // Full pill — always half the (responsive) height, so it stays
      // perfectly rounded regardless of breakpoint.
      borderRadius: height / 2,
      fontSize: rs(base.fontSize, base.fontSize + 1),
    };
  }, [size, rs]);

  // ── Variant colours ────────────────────────────────────────────────────────
  // Memoised — only rebuilds when theme switches (dark ↔ light).
  const variantConfig = useMemo(
    () => ({
      primary: {
        background: theme.accent,
        borderColor: theme.accent,
        textColor: theme.void,
        // Slightly darker on press — avoid hex concat which breaks on rgba colours
        pressedBg: theme.accent,
        pressedOpacity: 0.85,
        borderWidth: 0,
      },
      ghost: {
        background: theme.accentDim,
        borderColor: theme.accent + "80", // 50% opacity border
        textColor: theme.accent,
        // Deeper fill on press for clear feedback (was identical to resting state)
        pressedBg: theme.accent + "22",
        pressedOpacity: 1,
        borderWidth: borders.base,
      },
      secondary: {
        background: theme.raised,
        borderColor: theme.border,
        textColor: theme.text,
        pressedBg: theme.surface2,
        pressedOpacity: 1,
        borderWidth: borders.base,
      },
      danger: {
        background: colors.dangerDim,
        borderColor: colors.dangerBorder,
        textColor: colors.danger,
        pressedBg: "rgba(255,65,54,0.18)",
        pressedOpacity: 1,
        borderWidth: borders.base,
      },
      text: {
        background: "transparent",
        borderColor: "transparent",
        textColor: theme.muted,
        // Subtle dim on press — was transparent (zero feedback)
        pressedBg: theme.surface2,
        pressedOpacity: 1,
        borderWidth: 0,
      },
    }),
    [theme],
  );

  const config = variantConfig[variant];

  // ── Press animation ────────────────────────────────────────────────────────
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    if (isDisabled) return;
    scale.value = withSpring(pressScale.default, spring.snappy); // → 0.97
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [isDisabled]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, spring.snappy);
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Animated.View
      style={[
        animatedStyle,
        fullWidth ? styles.fullWidth : styles.fitContent,
        containerStyle,
      ]}
    >
      <Pressable
        onPress={isDisabled ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        style={({ pressed }) => [
          styles.base,
          {
            height: sizeStyles.height,
            borderRadius: sizeStyles.borderRadius,
            borderWidth: config.borderWidth,
            borderColor: config.borderColor,
            backgroundColor: pressed ? config.pressedBg : config.background,
            opacity:
              pressed && config.pressedOpacity < 1 ? config.pressedOpacity : 1,
            // text variant has no horizontal padding — it sizes to content
            paddingHorizontal:
              variant === "text" ? 0 : sizeStyles.paddingHorizontal,
          },
          isDisabled && styles.disabled,
        ]}
        {...rest}
      >
        {loading ? (
          <ActivityIndicator color={config.textColor} size="small" />
        ) : (
          <View style={styles.inner}>
            {iconLeft}
            <SPText
              variant="button"
              style={{
                color: config.textColor,
                fontSize: sizeStyles.fontSize,
                fontFamily: "Barlow-Bold",
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              {children}
            </SPText>
            {iconRight ? (
              <View
                style={[
                  styles.iconCapsule,
                  {
                    width: sizeStyles.height * 0.5,
                    height: sizeStyles.height * 0.5,
                    borderRadius: sizeStyles.height * 0.25,
                    // Translucent wash of the button's own text colour —
                    // guarantees contrast against any variant's background
                    // without hardcoding a colour per-variant.
                    backgroundColor: config.textColor + "26", // ~15% opacity
                  },
                ]}
              >
                {iconRight}
              </View>
            ) : null}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  fullWidth: { width: "100%" },
  fitContent: { alignSelf: "flex-start" },
  base: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    // Single gap — removed the redundant iconLeft/iconRight margin wrappers
    // that were doubling up with this gap value
    gap: spacing[2],
  },
  iconCapsule: {
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: { opacity: 0.38 },
});
