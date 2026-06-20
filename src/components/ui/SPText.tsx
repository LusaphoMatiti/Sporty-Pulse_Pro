/**
 * SPText — Sporty Pulse Pro typography component
 *
 * All text in the app goes through this component. It enforces the design
 * system and loads the correct Barlow variant for each role.
 *
 * Spec (5 levels max):
 *   H1      → 28–32px, bold      (screen titles)
 *   H2      → 22–24px, semibold  (section headers)
 *   Body    → 16px, regular
 *   Subtext → 14px, medium
 *   Caption → 12px, muted
 *
 * Usage:
 *   <SPText variant="h1">Let's crush it.</SPText>
 *   <SPText variant="stat" color="acid">125</SPText>
 *   <SPText variant="label">Current Streak</SPText>
 *   <SPText variant="body" opacity={0.5}>3 days ago</SPText>
 */

import React, { useMemo } from "react";
import { Text, type TextProps } from "react-native";
import { colors, fonts, fontSize, letterSpacing, spacing } from "../../theme";
import type { ColorKey } from "../../theme";
import { useAppTheme } from "../../theme/ThemeContext";
import { useResponsive } from "../../hooks/useResponsive";
import type { FontVariant } from "react-native/Libraries/StyleSheet/StyleSheetTypes";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TextVariant =
  | "display" // Giant hero numbers — above H1, decorative only
  | "h1" // 28–32px bold — screen titles
  | "h2" // 22–24px semibold — section headers
  | "h3" // 18–20px semibold — card headers
  | "stat" // Accent-coloured metric number
  | "statLg" // Large accent metric (streak, hero)
  | "body" // 16px regular — standard readable text
  | "bodyMd" // 14px medium — subtext, secondary info
  | "label" // 12px semibold uppercase — micro labels
  | "labelMd" // 12px semibold uppercase — slightly looser
  | "caption" // 12px regular — supporting / timestamp text
  | "button" // CTA text — uppercase, tracks theme
  | "tag" // 12px bold uppercase — pill / badge text
  | "mono"; // Timer digits — tabular nums, accent colour

interface SPTextProps extends TextProps {
  variant?: TextVariant;
  /**
   * Pass a ColorKey from the theme token map, or any raw CSS/RN colour string.
   * `accent` and `muted` props are convenience shortcuts.
   */
  color?: ColorKey | string;
  opacity?: number;
  center?: boolean;
  /** Shorthand: sets colour to theme.accent */
  accent?: boolean;
  /** Shorthand: sets colour to theme.muted */
  muted?: boolean;
  children: React.ReactNode;
}

// ─── Style map ────────────────────────────────────────────────────────────────

/**
 * Memoised so the full record is only rebuilt when theme or breakpoint changes,
 * not on every render of every SPText instance.
 */
function useVariantStyles(
  theme: ReturnType<typeof useAppTheme>["theme"],
  rs: <T>(sm: T, md?: T, lg?: T, xl?: T) => T,
) {
  return useMemo(
    () => ({
      // ── Decorative / hero ──────────────────────────────────────────────────
      display: {
        fontFamily: fonts.brand,
        // Intentionally above spec — display is decorative only (hero numbers)
        fontSize: rs(40, 48, 56),
        letterSpacing: letterSpacing.tightest,
        // 1.0 minimum — 0.95 clips Barlow descenders
        lineHeight: rs(40, 48, 56),
        color: theme.text,
      },

      // ── Core 5-level type scale ────────────────────────────────────────────
      h1: {
        fontFamily: fonts.brand,
        // Spec: 28–32px bold
        fontSize: rs(28, 30, 32),
        letterSpacing: letterSpacing.tighter,
        lineHeight: rs(28 * 1.15, 30 * 1.15, 32 * 1.15),
        color: theme.text,
      },
      h2: {
        fontFamily: fonts.brandBold,
        // Spec: 22–24px semibold
        fontSize: rs(22, 23, 24),
        letterSpacing: letterSpacing.tight,
        // Uniform 1.3 multiplier — avoids the sm:1.6 / lg:1.1 mismatch
        lineHeight: rs(22 * 1.3, 23 * 1.3, 24 * 1.3),
        color: theme.text,
      },
      h3: {
        fontFamily: fonts.brandBold,
        // Between h2 and body — card headers
        fontSize: rs(18, 19, 20),
        letterSpacing: letterSpacing.snug,
        lineHeight: rs(18 * 1.3, 19 * 1.3, 20 * 1.3),
        color: theme.text,
      },

      // ── Metrics ───────────────────────────────────────────────────────────
      stat: {
        fontFamily: fonts.brand,
        fontSize: rs(26, 28, 32),
        letterSpacing: letterSpacing.tightest,
        lineHeight: rs(26, 28, 32),
        // theme.accent so light-mode gets the darker olive green, not acid yellow
        color: theme.accent,
      },
      statLg: {
        fontFamily: fonts.brand,
        fontSize: rs(34, 40, 48),
        letterSpacing: letterSpacing.tightest,
        lineHeight: rs(34, 40, 48),
        color: theme.accent,
      },

      // ── Body ──────────────────────────────────────────────────────────────
      body: {
        fontFamily: fonts.brandRegular,
        // Spec: 16px regular
        fontSize: rs(15, 16, 16),
        letterSpacing: letterSpacing.normal,
        lineHeight: rs(15 * 1.55, 16 * 1.55, 16 * 1.55),
        color: theme.muted2,
      },
      bodyMd: {
        fontFamily: fonts.brandRegular,
        // Spec: 14px medium — subtext
        fontSize: rs(13, 14, 14),
        letterSpacing: letterSpacing.normal,
        lineHeight: rs(13 * 1.55, 14 * 1.55, 14 * 1.55),
        color: theme.muted2,
      },

      // ── Labels / micro ────────────────────────────────────────────────────
      label: {
        fontFamily: fonts.brandSemiBold,
        // Spec: Caption floor is 12px — was 9px which broke the scale
        fontSize: rs(11, 12, 12),
        letterSpacing: letterSpacing.display,
        lineHeight: rs(11 * 1.4, 12 * 1.4, 12 * 1.4),
        textTransform: "uppercase" as const,
        color: theme.muted,
      },
      labelMd: {
        fontFamily: fonts.brandSemiBold,
        fontSize: rs(12, 12, 13),
        letterSpacing: letterSpacing.widest,
        lineHeight: rs(12 * 1.4, 12 * 1.4, 13 * 1.4),
        textTransform: "uppercase" as const,
        color: theme.muted,
      },

      // ── Caption ───────────────────────────────────────────────────────────
      caption: {
        fontFamily: fonts.brandRegular,
        // Spec: 12px muted
        fontSize: rs(12, 12, 13),
        letterSpacing: letterSpacing.normal,
        lineHeight: rs(12 * 1.5, 12 * 1.5, 13 * 1.5),
        color: theme.muted,
      },

      // ── Interactive ───────────────────────────────────────────────────────
      button: {
        fontFamily: fonts.brand,
        fontSize: rs(14, 15, 16),
        letterSpacing: letterSpacing.widest,
        lineHeight: rs(14 * 1.1, 15 * 1.1, 16 * 1.1),
        textTransform: "uppercase" as const,
        // theme.void tracks dark/light — dark: #0A0A0A, light: #F0F2F5
        color: theme.void,
      },
      tag: {
        fontFamily: fonts.brandBold,
        // Was 9px — raised to caption floor (12px)
        fontSize: rs(11, 12, 12),
        letterSpacing: letterSpacing.wide,
        lineHeight: rs(11 * 1.4, 12 * 1.4, 12 * 1.4),
        textTransform: "uppercase" as const,
        color: theme.accent,
      },

      // ── Mono ──────────────────────────────────────────────────────────────
      mono: {
        fontFamily: fonts.brand,
        fontSize: rs(34, 38, 44),
        letterSpacing: letterSpacing.tight,
        lineHeight: rs(34, 38, 44),
        fontVariant: ["tabular-nums"] as FontVariant[],
        color: theme.accent,
      },
    }),
    // Only recompute when the theme object reference changes (theme switch)
    // or when the breakpoint changes (rs identity changes on resize)
    [theme, rs],
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SPText({
  variant = "body",
  color,
  opacity,
  center,
  accent,
  muted,
  style,
  children,
  ...rest
}: SPTextProps) {
  const { theme } = useAppTheme();
  const { rs } = useResponsive();
  const variantStyles = useVariantStyles(theme, rs);

  /**
   * Colour resolution order (highest → lowest priority):
   *   1. `accent` prop  → theme.accent
   *   2. `muted` prop   → theme.muted
   *   3. `color` prop   → ColorKey lookup → raw string fallback
   *   4. Variant default (set inside variantStyles)
   */
  let resolvedColor: string | undefined;
  if (accent) {
    resolvedColor = theme.accent;
  } else if (muted) {
    resolvedColor = theme.muted;
  } else if (color) {
    resolvedColor = (colors as Record<string, string>)[color] ?? color;
  }

  return (
    <Text
      style={[
        variantStyles[variant],
        resolvedColor !== undefined && { color: resolvedColor },
        opacity !== undefined && { opacity },
        center && { textAlign: "center" },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}
