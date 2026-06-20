/**
 * Sporty Pulse Pro — Design Tokens
 * Palette : Void Black + Acid Yellow
 * Platform: Expo managed workflow (iOS + Android)
 *
 */

// ─── Colour

export const colors = {
  // Brand accent
  acid: "#CFFF00",
  acidDim: "rgba(207,255,0,0.10)",
  acidBorder: "rgba(207,255,0,0.22)",
  acidSubtle: "rgba(207,255,0,0.06)",
  acidStrong: "#B8E600", // pressed / darker state

  // Background layers — dark-first, 4 levels of depth
  void: "#0A0A0A", // true app background
  surface: "#141414", // cards, sheets
  raised: "#1E1E1E", // inputs, icon boxes, list icons
  overlay: "#282828", // modals, bottom sheets

  // White opacity scale
  white: "#FFFFFF",
  white80: "rgba(255,255,255,0.80)",
  white60: "rgba(255,255,255,0.60)",
  white40: "rgba(255,255,255,0.40)",
  white20: "rgba(255,255,255,0.20)",
  white10: "rgba(255,255,255,0.10)",
  white06: "rgba(255,255,255,0.06)",
  white04: "rgba(255,255,255,0.04)",

  // Semantic
  danger: "#FF4136",
  dangerDim: "rgba(255,65,54,0.10)",
  dangerBorder: "rgba(255,65,54,0.22)",
  success: "#39FF6A",
  successDim: "rgba(57,255,106,0.10)",
  warning: "#FFA500",
  warningDim: "rgba(255,165,0,0.10)",

  // Absolute
  black: "#000000",
  transparent: "transparent",
} as const;

export type ColorKey = keyof typeof colors;

// ─── Typography

export const fonts = {
  /**
   * Load these via expo-font in _layout.tsx:
   *   'Barlow-Regular', 'Barlow-Medium', 'Barlow-SemiBold',
   *   'Barlow-Bold', 'Barlow-ExtraBold'
   *
   * System font is the OS default (SF Pro on iOS, Roboto on Android).
   * Barlow is used for all brand/display text.
   */
  brand: "Barlow-ExtraBold",
  brandBold: "Barlow-Bold",
  brandSemiBold: "Barlow-SemiBold",
  brandMedium: "Barlow-Medium",
  brandRegular: "Barlow-Regular",
  system: undefined as string | undefined, // OS default
} as const;

export const fontSize = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 15,
  lg: 17,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 42,
  "5xl": 56,
  "6xl": 72,
} as const;

export const fontWeight = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800",
} as const;

export const letterSpacing = {
  tightest: -2,
  tighter: -1.5,
  tight: -0.8,
  snug: -0.4,
  normal: 0,
  wide: 0.5,
  wider: 1.0,
  widest: 1.8,
  display: 2.4,
} as const;

export const lineHeight = {
  none: 1,
  tight: 1.1,
  snug: 1.25,
  normal: 1.5,
  relaxed: 1.7,
} as const;

// ─── Spacing

export const spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
} as const;

// ─── Border Radius
export const radii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 28,
  full: 9999,
} as const;

// ─── Borders

export const borders = {
  thin: 0.5,
  base: 1,
  thick: 1.5,
} as const;

// ─── Shadows
// React Native: shadowColor/Offset/Opacity/Radius (iOS) + elevation (Android)

export const shadows = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 3,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 6,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.65,
    shadowRadius: 24,
    elevation: 12,
  },
  acid: {
    shadowColor: "#CFFF00",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 8,
  },
} as const;

// ─── Motion / Animation
// Used with Reanimated withSpring / withTiming

export const spring = {
  /**
   * Snappy — quick response, slight overshoot. Good for button press feedback,
   * tab indicators, small element entrances.
   */
  snappy: {
    damping: 18,
    stiffness: 300,
    mass: 0.8,
  },
  /**
   * Bouncy — playful overshoot. Good for PR badges, streak numbers, success
   * states that reward the user.
   */
  bouncy: {
    damping: 10,
    stiffness: 180,
    mass: 1.0,
  },
  /**
   * Smooth — no overshoot, elegant deceleration. Good for sheet slide-ups,
   * modal entrances, progress ring animations.
   */
  smooth: {
    damping: 26,
    stiffness: 180,
    mass: 1.2,
  },
  /**
   * Heavy — slow, weighty feel. Good for large number counters, timer ring
   * updates, layout shifts that need gravitas.
   */
  heavy: {
    damping: 30,
    stiffness: 120,
    mass: 1.6,
  },
} as const;

export const timing = {
  instant: 80,
  fast: 150,
  base: 250,
  slow: 400,
  xslow: 600,
} as const;

// Press scale targets — used in usePressAnimation hook
export const pressScale = {
  default: 0.96,
  light: 0.98,
  heavy: 0.93,
} as const;

// ─── Layout

export const layout = {
  screenPaddingH: 20,
  screenPaddingV: 16,
  tabBarHeight: 64, // safe area NOT included — add useSafeAreaInsets
  headerHeight: 56,
  cardGap: 12,
  sectionGap: 28,
  maxWidth: 428, // iPhone 14 Pro Max width — natural cap
} as const;

// ─── Z-Index

export const zIndex = {
  base: 0,
  card: 10,
  sticky: 20,
  fab: 30,
  modal: 40,
  sheet: 50,
  toast: 60,
} as const;
