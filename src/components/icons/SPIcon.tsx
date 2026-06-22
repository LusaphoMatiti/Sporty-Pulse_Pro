/**
 * SPIcon — Platform-aware icon system
 *
 * iOS    → SF Symbols via expo-symbols
 * Android → Phosphor Icons via phosphor-react-native
 *
 * All icons are referenced by a semantic name defined in this file.
 * Never import icon libraries directly in screen files — always go through SPIcon.
 * This means the platform split is contained to one place.
 *
 * Usage:
 *   <SPIcon name="home" size={22} color={colors.acid} />
 *   <SPIcon name="barbell" size={20} />
 *   <SPIcon name="play" size={24} color={colors.void} />
 *
 * Installation:
 *   npx expo install phosphor-react-native
 *   npx expo install expo-symbols   (iOS only, skip if Android-first)
 *
 * Note: SF Symbols requires iOS 13+ and the SFSafeSymbols package.
 * If you haven't set up expo-symbols yet, the iOS branch will
 * fall back to the Phosphor icon until you do.
 */

import React from "react";
import { Platform, View } from "react-native";
import { colors } from "../../theme";
import { StyleProp, ViewStyle } from "react-native";

// ─── Semantic icon names ───────────────────────────────────────────────────────
// Add new icons here. Both platforms must have an entry.

export type IconName =
  | "home"
  | "training" // barbell / dumbbell
  | "progress" // chart trending up
  | "settings" // gear / cog
  | "play"
  | "pause"
  | "stop"
  | "checkmark"
  | "close"
  | "check"
  | "back"
  | "forward"
  | "timer"
  | "fire"
  | "lightning"
  | "lock"
  | "unlock"
  | "trophy"
  | "star"
  | "person"
  | "camera"
  | "pencil"
  | "trash"
  | "plus"
  | "minus"
  | "info"
  | "warning"
  | "skip"
  | "repeat"
  | "target"
  | "sun" // ← theme toggle: light mode indicator
  | "moon" // ← theme toggle: dark mode indicator
  | "calendar"
  | "flame" // onboarding: lose weight
  | "dumbbell" // onboarding: equipment / build muscle
  | "heart" // onboarding: get fit
  | "fitness" // onboarding: bodyweight
  | "chart" // onboarding: experience level
  | "seedling" // onboarding: beginner
  | "time" // trial notice
  | "ellipsis" // onboarding: prefer not to say
  | "trending" // streak card: chart trending up
  | "chevronRight" // card header: navigate right
  | "activity" // recent activity / pulse
  // ── Muscle group icons ────────────────────────────────────────────────────
  | "muscleUpper" // bicep / arm curl → UPPER body
  | "muscleLower" // leg / squat      → LOWER body
  | "muscleCore" // abs / torso       → CORE
  | "muscleFullbody" // full figure   → FULL BODY
  // ── Recovery status icons ─────────────────────────────────────────────────
  | "recoveryFresh" // green bolt circle  → FRESH
  | "recoveryModerate" // amber gauge    → MODERATE
  | "recoveryFatigue" // red pulse      → HIGH_FATIGUE
  // ── Settings screen icons ─────────────────────────────────────────────────
  | "bell" // push notifications
  | "sliders" // training system
  | "pulse" // edit profile (waveform pulse)
  | "shieldCheck" // privacy policy
  | "fileText" // terms & conditions
  | "logOut" // sign out
  | "crown"; // upgrade to pro

// ─── Platform maps ────────────────────────────────────────────────────────────

// iOS: SF Symbol names
const sfSymbolMap: Record<IconName, string> = {
  home: "house.fill",
  training: "dumbbell.fill",
  progress: "chart.line.uptrend.xyaxis",
  settings: "gearshape.fill",
  play: "play.fill",
  pause: "pause.fill",
  stop: "stop.fill",
  checkmark: "checkmark",
  check: "checkmark",
  close: "xmark",
  back: "chevron.left",
  forward: "chevron.right",
  timer: "timer",
  fire: "flame.fill",
  lightning: "bolt.fill",
  lock: "lock.fill",
  unlock: "lock.open.fill",
  trophy: "trophy.fill",
  star: "star.fill",
  person: "person.fill",
  camera: "camera.fill",
  pencil: "pencil",
  trash: "trash.fill",
  plus: "plus",
  minus: "minus",
  info: "info.circle.fill",
  warning: "exclamationmark.triangle.fill",
  skip: "forward.fill",
  repeat: "repeat",
  target: "target",
  sun: "sun.max.fill",
  moon: "moon.fill",
  calendar: "calendar",
  flame: "flame.fill",
  dumbbell: "dumbbell.fill",
  heart: "heart.fill",
  fitness: "figure.run",
  chart: "chart.bar.fill",
  seedling: "leaf.fill",
  time: "clock.fill",
  ellipsis: "ellipsis",
  trending: "chart.line.uptrend.xyaxis",
  chevronRight: "chevron.right",
  activity: "waveform.path.ecg",
  // muscle groups
  muscleUpper: "figure.strengthtraining.traditional",
  muscleLower: "figure.run",
  muscleCore: "figure.core.training",
  muscleFullbody: "figure.mixed.cardio",
  // recovery
  recoveryFresh: "bolt.circle.fill",
  recoveryModerate: "gauge.medium",
  recoveryFatigue: "waveform.path.ecg.rectangle.fill",
  // settings screen
  bell: "bell.fill",
  sliders: "slider.horizontal.3",
  pulse: "waveform.path.ecg",
  shieldCheck: "checkmark.shield.fill",
  fileText: "doc.text.fill",
  logOut: "rectangle.portrait.and.arrow.right",
  crown: "crown.fill",
};

// Android: Phosphor icon component names
const phosphorMap: Record<IconName, string> = {
  home: "House",
  training: "Barbell",
  progress: "TrendUp",
  settings: "Gear",
  play: "Play",
  pause: "Pause",
  stop: "Stop",
  checkmark: "Check",
  check: "Check",
  close: "X",
  back: "CaretLeft",
  forward: "CaretRight",
  timer: "Timer",
  fire: "Fire",
  lightning: "Lightning",
  lock: "Lock",
  unlock: "LockOpen",
  trophy: "Trophy",
  star: "Star",
  person: "User",
  camera: "Camera",
  pencil: "Pencil",
  trash: "Trash",
  plus: "Plus",
  minus: "Minus",
  info: "Info",
  warning: "Warning",
  skip: "SkipForward",
  repeat: "Repeat",
  target: "Target",
  sun: "Sun",
  moon: "Moon",
  calendar: "Calendar",
  flame: "Fire",
  dumbbell: "Barbell",
  heart: "Heart",
  fitness: "PersonSimpleRun",
  chart: "ChartBar",
  seedling: "Plant",
  time: "Clock",
  ellipsis: "DotsThree",
  trending: "TrendUp",
  chevronRight: "CaretRight",
  activity: "Activity",
  // muscle groups
  muscleUpper: "PersonSimpleTaiChi",
  muscleLower: "PersonSimpleSquat",
  muscleCore: "PersonSimple",
  muscleFullbody: "PersonSimpleRun",
  // recovery
  recoveryFresh: "Lightning",
  recoveryModerate: "Gauge",
  recoveryFatigue: "Heartbeat",
  // settings screen
  bell: "Bell",
  sliders: "Sliders",
  pulse: "Pulse",
  shieldCheck: "ShieldCheck",
  fileText: "FileText",
  logOut: "SignOut",
  crown: "Crown",
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface SPIconProps {
  name: IconName;
  size?: number;
  color?: string;
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
  style?: StyleProp<ViewStyle>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SPIcon({
  name,
  size = 22,
  color = colors.white60,
  weight = "regular",
}: SPIconProps) {
  if (Platform.OS === "ios") {
    return <IOSIcon name={name} size={size} color={color} />;
  }
  return <AndroidIcon name={name} size={size} color={color} weight={weight} />;
}

// ─── iOS implementation ───────────────────────────────────────────────────────

function IOSIcon({
  name,
  size,
  color,
}: {
  name: IconName;
  size: number;
  color: string;
}) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { SymbolView } = require("expo-symbols");
    return (
      <SymbolView
        name={sfSymbolMap[name]}
        size={size}
        tintColor={color}
        resizeMode="scaleAspectFit"
      />
    );
  } catch {
    return <FallbackIcon name={name} size={size} color={color} />;
  }
}

// ─── Android implementation ───────────────────────────────────────────────────

function AndroidIcon({
  name,
  size,
  color,
  weight,
}: {
  name: IconName;
  size: number;
  color: string;
  weight: string;
}) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Phosphor = require("phosphor-react-native");
    const componentName = phosphorMap[name];
    const IconComponent = Phosphor[componentName];

    if (!IconComponent) {
      return <FallbackIcon name={name} size={size} color={color} />;
    }

    return <IconComponent size={size} color={color} weight={weight} />;
  } catch {
    return <FallbackIcon name={name} size={size} color={color} />;
  }
}

// ─── SVG Fallback icons ───────────────────────────────────────────────────────

import Svg, {
  Path,
  Polyline,
  Circle,
  Rect,
  Line,
  Polygon,
} from "react-native-svg";

function FallbackIcon({
  name,
  size,
  color,
}: {
  name: IconName;
  size: number;
  color: string;
}) {
  const s = { width: size, height: size };
  const p = {
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };

  switch (name) {
    case "sun":
      return (
        <Svg {...s} viewBox="0 0 24 24">
          <Circle {...p} cx="12" cy="12" r="5" />
          <Line {...p} x1="12" y1="1" x2="12" y2="3" />
          <Line {...p} x1="12" y1="21" x2="12" y2="23" />
          <Line {...p} x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <Line {...p} x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <Line {...p} x1="1" y1="12" x2="3" y2="12" />
          <Line {...p} x1="21" y1="12" x2="23" y2="12" />
          <Line {...p} x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <Line {...p} x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </Svg>
      );
    case "moon":
      return (
        <Svg {...s} viewBox="0 0 24 24">
          <Path {...p} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </Svg>
      );
    case "home":
      return (
        <Svg {...s} viewBox="0 0 24 24">
          <Path
            {...p}
            d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"
          />
          <Path {...p} d="M9 21V12h6v9" />
        </Svg>
      );
    case "check":
      return (
        <Svg {...s} viewBox="0 0 24 24">
          <Path {...p} d="M20 6L9 17l-5-5" />
        </Svg>
      );
    case "training":
      return (
        <Svg {...s} viewBox="0 0 24 24">
          <Path {...p} d="M6 4v16M18 4v16M2 9h4M18 9h4M2 15h4M18 15h4" />
        </Svg>
      );
    case "progress":
      return (
        <Svg {...s} viewBox="0 0 24 24">
          <Polyline {...p} points="22 7 13.5 15.5 8.5 10.5 2 17" />
          <Polyline {...p} points="16 7 22 7 22 13" />
        </Svg>
      );
    case "settings":
      return (
        <Svg {...s} viewBox="0 0 24 24">
          <Circle {...p} cx="12" cy="12" r="3" />
          <Path
            {...p}
            d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
          />
        </Svg>
      );
    case "play":
      return (
        <Svg {...s} viewBox="0 0 24 24">
          <Polygon
            {...p}
            fill={color}
            stroke={color}
            points="5 3 19 12 5 21 5 3"
          />
        </Svg>
      );
    case "pause":
      return (
        <Svg {...s} viewBox="0 0 24 24">
          <Rect {...p} x="6" y="4" width="4" height="16" fill={color} />
          <Rect {...p} x="14" y="4" width="4" height="16" fill={color} />
        </Svg>
      );
    case "stop":
      return (
        <Svg {...s} viewBox="0 0 24 24">
          <Rect {...p} x="3" y="3" width="18" height="18" rx="2" />
        </Svg>
      );
    case "checkmark":
      return (
        <Svg {...s} viewBox="0 0 24 24">
          <Path {...p} d="M20 6L9 17l-5-5" />
        </Svg>
      );
    case "close":
      return (
        <Svg {...s} viewBox="0 0 24 24">
          <Line {...p} x1="18" y1="6" x2="6" y2="18" />
          <Line {...p} x1="6" y1="6" x2="18" y2="18" />
        </Svg>
      );
    case "back":
      return (
        <Svg {...s} viewBox="0 0 24 24">
          <Path {...p} d="M15 18l-6-6 6-6" />
        </Svg>
      );
    case "forward":
      return (
        <Svg {...s} viewBox="0 0 24 24">
          <Path {...p} d="M9 18l6-6-6-6" />
        </Svg>
      );
    case "timer":
      return (
        <Svg {...s} viewBox="0 0 24 24">
          <Circle {...p} cx="12" cy="13" r="8" />
          <Path {...p} d="M12 9v4l3 3M9 3h6M12 1v2" />
        </Svg>
      );
    case "fire":
      return (
        <Svg {...s} viewBox="0 0 24 24">
          <Path
            {...p}
            fill={color}
            d="M12 2C12 2 7 8 7 13a5 5 0 0010 0C17 8 12 2 12 2z"
          />
          <Path
            {...p}
            fill={color}
            d="M12 10c0 0-2 2.5-2 4a2 2 0 004 0c0-1.5-2-4-2-4z"
          />
        </Svg>
      );
    case "lock":
      return (
        <Svg {...s} viewBox="0 0 24 24">
          <Rect {...p} x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <Path {...p} d="M7 11V7a5 5 0 0110 0v4" />
        </Svg>
      );
    case "trophy":
      return (
        <Svg {...s} viewBox="0 0 24 24">
          <Path {...p} d="M6 9H4a2 2 0 01-2-2V5h4M18 9h2a2 2 0 002-2V5h-4" />
          <Path {...p} d="M8 21h8M12 17v4" />
          <Path {...p} d="M6 5h12v7a6 6 0 01-12 0V5z" />
        </Svg>
      );
    case "person":
      return (
        <Svg {...s} viewBox="0 0 24 24">
          <Path {...p} d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <Circle {...p} cx="12" cy="7" r="4" />
        </Svg>
      );
    case "lightning":
      return (
        <Svg {...s} viewBox="0 0 24 24">
          <Polygon
            {...p}
            fill={color}
            points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
          />
        </Svg>
      );
    case "target":
      return (
        <Svg {...s} viewBox="0 0 24 24">
          <Circle {...p} cx="12" cy="12" r="10" />
          <Circle {...p} cx="12" cy="12" r="6" />
          <Circle {...p} cx="12" cy="12" r="2" />
        </Svg>
      );
    case "skip":
      return (
        <Svg {...s} viewBox="0 0 24 24">
          <Polygon {...p} fill={color} points="5 4 15 12 5 20 5 4" />
          <Line {...p} x1="19" y1="5" x2="19" y2="19" />
        </Svg>
      );
    case "repeat":
      return (
        <Svg {...s} viewBox="0 0 24 24">
          <Polyline {...p} points="17 1 21 5 17 9" />
          <Path {...p} d="M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4" />
          <Path {...p} d="M21 13v2a4 4 0 01-4 4H3" />
        </Svg>
      );
    case "calendar":
      return (
        <Svg {...s} viewBox="0 0 24 24">
          <Rect {...p} x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <Line {...p} x1="16" y1="2" x2="16" y2="6" />
          <Line {...p} x1="8" y1="2" x2="8" y2="6" />
          <Line {...p} x1="3" y1="10" x2="21" y2="10" />
        </Svg>
      );
    case "flame":
      return (
        <Svg {...s} viewBox="0 0 24 24">
          <Path
            {...p}
            fill={color}
            d="M12 2C12 2 7 8 7 13a5 5 0 0010 0C17 8 12 2 12 2z"
          />
          <Path
            stroke="none"
            fill={color}
            d="M12 10c0 0-2 2.5-2 4a2 2 0 004 0c0-1.5-2-4-2-4z"
            opacity="0.5"
          />
        </Svg>
      );
    case "dumbbell":
      return (
        <Svg {...s} viewBox="0 0 24 24">
          <Path {...p} d="M6 4v16M18 4v16M2 9h4M18 9h4M2 15h4M18 15h4M6 9h12" />
        </Svg>
      );
    case "heart":
      return (
        <Svg {...s} viewBox="0 0 24 24">
          <Path
            {...p}
            fill={color}
            d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"
          />
        </Svg>
      );
    case "fitness":
      return (
        <Svg {...s} viewBox="0 0 24 24">
          <Circle {...p} cx="13" cy="4" r="2" />
          <Path {...p} d="M7 14l2-4 3 3 2-3 3 4" />
          <Path {...p} d="M5 20l4-6M15 14l4 6" />
        </Svg>
      );
    case "chart":
      return (
        <Svg {...s} viewBox="0 0 24 24">
          <Rect {...p} x="3" y="12" width="4" height="9" />
          <Rect {...p} x="10" y="8" width="4" height="13" />
          <Rect {...p} x="17" y="4" width="4" height="17" />
        </Svg>
      );
    case "seedling":
      return (
        <Svg {...s} viewBox="0 0 24 24">
          <Path {...p} d="M12 22v-9" />
          <Path {...p} d="M12 13C12 13 7 10 7 5a5 5 0 0110 0c0 5-5 8-5 8z" />
          <Path {...p} d="M12 13c0 0-3 2-3 5" />
        </Svg>
      );
    case "time":
      return (
        <Svg {...s} viewBox="0 0 24 24">
          <Circle {...p} cx="12" cy="12" r="10" />
          <Polyline {...p} points="12 6 12 12 16 14" />
        </Svg>
      );
    case "ellipsis":
      return (
        <Svg {...s} viewBox="0 0 24 24">
          <Circle {...p} fill={color} stroke="none" cx="5" cy="12" r="1.5" />
          <Circle {...p} fill={color} stroke="none" cx="12" cy="12" r="1.5" />
          <Circle {...p} fill={color} stroke="none" cx="19" cy="12" r="1.5" />
        </Svg>
      );
    case "trending":
      return (
        <Svg {...s} viewBox="0 0 24 24">
          <Polyline {...p} points="22 7 13.5 15.5 8.5 10.5 2 17" />
          <Polyline {...p} points="16 7 22 7 22 13" />
        </Svg>
      );
    case "chevronRight":
      return (
        <Svg {...s} viewBox="0 0 24 24">
          <Path {...p} d="M9 18l6-6-6-6" />
        </Svg>
      );
    case "activity":
      return (
        <Svg {...s} viewBox="0 0 24 24">
          <Polyline {...p} points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </Svg>
      );

    // ── Muscle group icons ────────────────────────────────────────────────────

    case "muscleUpper":
      // Bicep curl figure: head + torso + arm raised with weight
      return (
        <Svg {...s} viewBox="0 0 24 24">
          {/* head */}
          <Circle {...p} cx="12" cy="3.5" r="1.8" />
          {/* torso */}
          <Path {...p} d="M12 5.3v6" />
          {/* right arm raised — bicep curl */}
          <Path {...p} d="M12 7l3.5-2.5" />
          <Path {...p} strokeLinecap="round" d="M15.5 4.5l1.5 1" />
          {/* left arm down */}
          <Path {...p} d="M12 7l-2.5 2" />
          {/* legs */}
          <Path {...p} d="M12 11.3l-2 4.7M12 11.3l2 4.7" />
        </Svg>
      );

    case "muscleLower":
      // Squat figure: head + torso lowered + bent knees wide
      return (
        <Svg {...s} viewBox="0 0 24 24">
          {/* head */}
          <Circle {...p} cx="12" cy="3.5" r="1.8" />
          {/* torso angled forward */}
          <Path {...p} d="M12 5.3l-0.5 4.7" />
          {/* arms out for balance */}
          <Path {...p} d="M11.5 7l-3 1.5M11.5 7l3 1.5" />
          {/* thighs wide */}
          <Path {...p} d="M11.5 10l-3.5 3M11.5 10l3.5 3" />
          {/* lower legs */}
          <Path {...p} d="M8 13l0.5 3.5M15 13l-0.5 3.5" />
          {/* feet */}
          <Path {...p} d="M8.5 16.5l-1.5 0.5M14.5 16.5l1.5 0.5" />
        </Svg>
      );

    case "muscleCore":
      // Standing figure with core/abs highlight lines
      return (
        <Svg {...s} viewBox="0 0 24 24">
          {/* head */}
          <Circle {...p} cx="12" cy="3.5" r="1.8" />
          {/* torso with core tension lines */}
          <Path {...p} d="M12 5.3v7" />
          <Path {...p} strokeWidth={2.4} d="M10 8h4" />
          <Path {...p} strokeWidth={2.4} d="M10 10h4" />
          {/* arms */}
          <Path {...p} d="M12 7l-3 2.5M12 7l3 2.5" />
          {/* legs */}
          <Path {...p} d="M12 12.3l-2 5M12 12.3l2 5" />
        </Svg>
      );

    case "muscleFullbody":
      // Dynamic running figure
      return (
        <Svg {...s} viewBox="0 0 24 24">
          {/* head */}
          <Circle {...p} cx="13" cy="3.5" r="1.8" />
          {/* torso leaning */}
          <Path {...p} d="M13 5.3l-1 5" />
          {/* arms in running swing */}
          <Path {...p} d="M12 7.5l-3.5 2M12 7.5l2.5-2" />
          {/* lead leg */}
          <Path {...p} d="M12 10.3l-2.5 3.5" />
          <Path {...p} d="M9.5 13.8l-1 3" />
          {/* trail leg */}
          <Path {...p} d="M12 10.3l2 2" />
          <Path {...p} d="M14 12.3l2.5 2" />
        </Svg>
      );

    // ── Recovery status icons ─────────────────────────────────────────────────

    case "recoveryFresh":
      // Bolt inside a circle — energised, ready
      return (
        <Svg {...s} viewBox="0 0 24 24">
          <Circle {...p} cx="12" cy="12" r="9" />
          <Polygon
            stroke="none"
            fill={color}
            points="13 7 8.5 13.5 12 13.5 11 17 15.5 10.5 12 10.5 13 7"
          />
        </Svg>
      );

    case "recoveryModerate":
      // Speedometer / gauge arc with needle
      return (
        <Svg {...s} viewBox="0 0 24 24">
          {/* outer arc — approx 210° sweep */}
          <Path {...p} d="M4.5 16.5A9 9 0 0 1 12 3a9 9 0 0 1 7.5 13.5" />
          {/* tick marks */}
          <Line {...p} x1="12" y1="4.2" x2="12" y2="5.8" />
          <Line {...p} x1="6.2" y1="7.2" x2="7.3" y2="8.3" />
          <Line {...p} x1="17.8" y1="7.2" x2="16.7" y2="8.3" />
          {/* needle pointing mid-range */}
          <Line
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            x1="12"
            y1="12"
            x2="8"
            y2="8.5"
          />
          <Circle fill={color} stroke="none" cx="12" cy="12" r="1.4" />
        </Svg>
      );

    case "recoveryFatigue":
      // ECG heartbeat flatline with drop — fatigue signal
      return (
        <Svg {...s} viewBox="0 0 24 24">
          <Polyline
            {...p}
            points="2 12 5 12 7 7 9 17 11 10 13 14 15 12 22 12"
          />
          {/* downward accent arrow indicating drop */}
          <Path {...p} d="M18 15l2 3-2 0" strokeWidth={1.4} />
        </Svg>
      );

    // ── Settings screen icons ─────────────────────────────────────────────────

    case "bell":
      return (
        <Svg {...s} viewBox="0 0 24 24">
          <Path {...p} d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <Path {...p} d="M13.73 21a2 2 0 01-3.46 0" />
        </Svg>
      );
    case "sliders":
      return (
        <Svg {...s} viewBox="0 0 24 24">
          <Line {...p} x1="4" y1="6" x2="20" y2="6" />
          <Line {...p} x1="4" y1="12" x2="20" y2="12" />
          <Line {...p} x1="4" y1="18" x2="20" y2="18" />
          <Circle {...p} fill={color} cx="9" cy="6" r="2" />
          <Circle {...p} fill={color} cx="16" cy="12" r="2" />
          <Circle {...p} fill={color} cx="10" cy="18" r="2" />
        </Svg>
      );
    case "pulse":
      return (
        <Svg {...s} viewBox="0 0 24 24">
          <Polyline {...p} points="2 12 6 12 9 5 13 19 16 12 22 12" />
        </Svg>
      );
    case "shieldCheck":
      return (
        <Svg {...s} viewBox="0 0 24 24">
          <Path
            {...p}
            d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5l8-3z"
          />
          <Path {...p} d="M9 12l2 2 4-4" />
        </Svg>
      );
    case "fileText":
      return (
        <Svg {...s} viewBox="0 0 24 24">
          <Path
            {...p}
            d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
          />
          <Path {...p} d="M14 2v6h6" />
          <Line {...p} x1="8" y1="13" x2="16" y2="13" />
          <Line {...p} x1="8" y1="17" x2="16" y2="17" />
        </Svg>
      );
    case "logOut":
      return (
        <Svg {...s} viewBox="0 0 24 24">
          <Path {...p} d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
          <Polyline {...p} points="16 17 21 12 16 7" />
          <Line {...p} x1="21" y1="12" x2="9" y2="12" />
        </Svg>
      );
    case "crown":
      return (
        <Svg {...s} viewBox="0 0 24 24">
          <Path
            {...p}
            fill={color}
            d="M3 18l-1.2-9.6a.8.8 0 011.3-.7L7 11l3.9-6.5a1.2 1.2 0 012.2 0L17 11l3.9-3.3a.8.8 0 011.3.7L21 18H3z"
          />
        </Svg>
      );
    default:
      return (
        <View
          style={{
            width: size,
            height: size,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              width: size * 0.3,
              height: size * 0.3,
              borderRadius: size,
              backgroundColor: color,
            }}
          />
        </View>
      );
  }
}
