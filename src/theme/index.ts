/**
 * Sporty Pulse Pro — Theme
 *
 * Single import point. Components should import from here, never directly
 * from tokens.ts (keeps refactoring easy).
 *
 * Usage:
 *   import { colors, spacing, radii, fonts, spring } from '@/theme';
 */

export {
  colors,
  fonts,
  fontSize,
  fontWeight,
  letterSpacing,
  lineHeight,
  spacing,
  radii,
  borders,
  shadows,
  spring,
  timing,
  pressScale,
  layout,
  zIndex,
} from "./tokens";

export type { ColorKey } from "./tokens";

// ─── Convenience style objects ────────────────────────────────────────────────
// Pre-composed styles used across many components.

import { colors, fonts, fontSize, letterSpacing } from "./tokens";
import type { TextStyle } from "react-native";

/**
 * Typography presets — import and spread into StyleSheet.
 *
 * Example:
 *   label: { ...typography.label, color: colors.acid }
 */
export const typography = {
  // Display — hero numbers, giant headers
  display: {
    fontFamily: fonts.brand,
    fontSize: fontSize["5xl"],
    letterSpacing: letterSpacing.tightest,
    color: colors.white,
  } as TextStyle,

  // H1 — screen titles
  h1: {
    fontFamily: fonts.brand,
    fontSize: fontSize["4xl"],
    letterSpacing: letterSpacing.tighter,
    color: colors.white,
  } as TextStyle,

  // H2 — section headers
  h2: {
    fontFamily: fonts.brandBold,
    fontSize: fontSize["2xl"],
    letterSpacing: letterSpacing.tight,
    color: colors.white,
  } as TextStyle,

  // H3 — card headers
  h3: {
    fontFamily: fonts.brandBold,
    fontSize: fontSize.xl,
    letterSpacing: letterSpacing.snug,
    color: colors.white,
  } as TextStyle,

  // Stat — large numeric values (sets, reps, weight)
  stat: {
    fontFamily: fonts.brand,
    fontSize: fontSize["3xl"],
    letterSpacing: letterSpacing.tightest,
    color: colors.acid,
  } as TextStyle,

  // Body — standard readable text
  body: {
    fontFamily: fonts.brandRegular,
    fontSize: fontSize.md,
    letterSpacing: letterSpacing.normal,
    color: colors.white60,
  } as TextStyle,

  // Label — ALL-CAPS micro labels
  label: {
    fontFamily: fonts.brandSemiBold,
    fontSize: fontSize.xs,
    letterSpacing: letterSpacing.display,
    textTransform: "uppercase",
    color: colors.white40,
  } as TextStyle,

  // Caption — small supporting text
  caption: {
    fontFamily: fonts.brandRegular,
    fontSize: fontSize.sm,
    letterSpacing: letterSpacing.normal,
    color: colors.white40,
  } as TextStyle,

  // Button — CTA text
  button: {
    fontFamily: fonts.brand,
    fontSize: fontSize.lg,
    letterSpacing: letterSpacing.wider,
    textTransform: "uppercase",
  } as TextStyle,

  // Tag — pill / badge text
  tag: {
    fontFamily: fonts.brandBold,
    fontSize: fontSize.xs,
    letterSpacing: letterSpacing.wide,
    textTransform: "uppercase",
  } as TextStyle,
} as const;
