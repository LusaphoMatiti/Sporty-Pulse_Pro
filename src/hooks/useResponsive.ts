/**
 * useResponsive — Screen-size breakpoint hook for Sporty Pulse Pro
 *
 * Breakpoints (based on screen WIDTH, not diagonal, since RN uses logical px):
 *   sm   — Small phones  5.4"–5.8"   width ≤ 375   (iPhone 12/13 mini, SE 3rd gen)
 *   md   — Standard      6.0"–6.4"   width 376–414  (iPhone 15, Pixel 8)
 *   lg   — Large         6.5"–6.8"   width 415–430  (iPhone 15 Plus/Pro Max, S24+)
 *   xl   — Foldables/XL  7.0"+       width > 430    (Galaxy Z Fold unfolded, tablets)
 *
 * Usage:
 *   const { rs, screen, breakpoint } = useResponsive();
 *   <SPText style={{ fontSize: rs(14, 15, 16, 17) }}>Hello</SPText>
 *   padding: rs(12, 16, 20, 24)
 */

import { useWindowDimensions } from "react-native";

export type Breakpoint = "sm" | "md" | "lg" | "xl";

export interface ResponsiveUtils {
  /** Current screen width */
  width: number;
  /** Current screen height */
  height: number;
  /** Active breakpoint key */
  breakpoint: Breakpoint;
  /** true helpers */
  isSm: boolean;
  isMd: boolean;
  isLg: boolean;
  isXl: boolean;
  /** isAtLeast — true if current bp >= supplied bp */
  isAtLeast: (bp: Breakpoint) => boolean;
  /**
   * rs (responsive select) — pick a value per breakpoint.
   * Pass 2–4 args: (sm, md?, lg?, xl?)
   * Missing upper tiers fall back to the last supplied value.
   *
   * @example rs(12, 16, 20, 24)  // explicit per tier
   * @example rs(12, 16)          // lg & xl inherit md value (16)
   */
  rs: <T>(sm: T, md?: T, lg?: T, xl?: T) => T;
  /**
   * rsp — responsive spacing multiplier.
   * Takes a base spacing value and scales it slightly per tier.
   * Useful for padding / gap / margin calls.
   *
   * @example rsp(spacing[4])  → spacing[4] on sm, slightly larger on bigger screens
   */
  rsp: (base: number) => number;
}

const BP_SM = 375;
const BP_MD = 414;
const BP_LG = 430;

function getBreakpoint(w: number): Breakpoint {
  if (w <= BP_SM) return "sm";
  if (w <= BP_MD) return "md";
  if (w <= BP_LG) return "lg";
  return "xl";
}

const BP_ORDER: Breakpoint[] = ["sm", "md", "lg", "xl"];

export function useResponsive(): ResponsiveUtils {
  const { width, height } = useWindowDimensions();
  const breakpoint = getBreakpoint(width);

  function rs<T>(sm: T, md?: T, lg?: T, xl?: T): T {
    const vals = [sm, md ?? sm, lg ?? md ?? sm, xl ?? lg ?? md ?? sm] as T[];
    return vals[BP_ORDER.indexOf(breakpoint)];
  }

  function rsp(base: number): number {
    const scale = rs(1, 1.1, 1.2, 1.35);
    return Math.round(base * scale);
  }

  function isAtLeast(bp: Breakpoint): boolean {
    return BP_ORDER.indexOf(breakpoint) >= BP_ORDER.indexOf(bp);
  }

  return {
    width,
    height,
    breakpoint,
    isSm: breakpoint === "sm",
    isMd: breakpoint === "md",
    isLg: breakpoint === "lg",
    isXl: breakpoint === "xl",
    isAtLeast,
    rs,
    rsp,
  };
}
