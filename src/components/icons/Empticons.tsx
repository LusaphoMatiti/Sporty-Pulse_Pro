import React from "react";
import Svg, { Path, Circle, Rect, Line } from "react-native-svg";

// ─── Shared icon prop contract ──────────────────────────────────────────────
// Matches the lucide-react-native signature so these drop straight into
// OptionCard's `lucideIcon` slot with zero changes to OptionCard itself.

export interface EquipmentIconProps {
  size: number;
  color: string;
  strokeWidth: number;
}

const base = (strokeWidth = 2) => ({
  stroke: undefined as unknown as string, // set per-instance below
  strokeWidth,
  fill: "none",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

// ─── Icon components (24x24 viewBox, lucide-matched stroke style) ─────────

export function AbWheelIcon({
  size = 20,
  color = "#9A9A90",
  strokeWidth = 2,
}: EquipmentIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="7" stroke={color} strokeWidth={strokeWidth} />
      <Line
        x1="2"
        y1="12"
        x2="22"
        y2="12"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Line
        x1="2"
        y1="9"
        x2="2"
        y2="15"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Line
        x1="22"
        y1="9"
        x2="22"
        y2="15"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function BattleRopeIcon({
  size = 20,
  color = "#9A9A90",
  strokeWidth = 2,
}: EquipmentIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="19"
        y="9"
        width="3"
        height="6"
        rx="1"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Path
        d="M2 8c2 2 4 2 6 0s4-2 6 0 4 2 5 0"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M2 16c2-2 4-2 6 0s4 2 6 0 4-2 5 0"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function DipBarIcon({
  size = 20,
  color = "#9A9A90",
  strokeWidth = 2,
}: EquipmentIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line
        x1="7"
        y1="4"
        x2="7"
        y2="20"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Line
        x1="17"
        y1="4"
        x2="17"
        y2="20"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Line
        x1="4"
        y1="6"
        x2="10"
        y2="6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Line
        x1="14"
        y1="6"
        x2="20"
        y2="6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Line
        x1="4"
        y1="20"
        x2="10"
        y2="20"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Line
        x1="14"
        y1="20"
        x2="20"
        y2="20"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function DumbbellIcon({
  size = 20,
  color = "#9A9A90",
  strokeWidth = 2,
}: EquipmentIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="3"
        y="8"
        width="3"
        height="8"
        rx="1"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Rect
        x="18"
        y="8"
        width="3"
        height="8"
        rx="1"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Line
        x1="6"
        y1="12"
        x2="18"
        y2="12"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Line
        x1="9"
        y1="9"
        x2="9"
        y2="15"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Line
        x1="15"
        y1="9"
        x2="15"
        y2="15"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function BarbellIcon({
  size = 20,
  color = "#9A9A90",
  strokeWidth = 2,
}: EquipmentIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line
        x1="2"
        y1="12"
        x2="22"
        y2="12"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Rect
        x="3"
        y="7"
        width="2"
        height="10"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Rect
        x="6"
        y="9"
        width="2"
        height="6"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Rect
        x="19"
        y="7"
        width="2"
        height="10"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Rect
        x="16"
        y="9"
        width="2"
        height="6"
        stroke={color}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
}

export function KettlebellIcon({
  size = 20,
  color = "#9A9A90",
  strokeWidth = 2,
}: EquipmentIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 10V8a3 3 0 0 1 6 0v2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Circle cx="12" cy="15" r="6" stroke={color} strokeWidth={strokeWidth} />
    </Svg>
  );
}

export function ResistanceBandIcon({
  size = 20,
  color = "#9A9A90",
  strokeWidth = 2,
}: EquipmentIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 12c0-4.5 4-7.5 9-7.5s9 3 9 7.5-4 7.5-9 7.5-9-3-9-7.5z"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Path
        d="M7 8c3 2 3 6 0 8"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function PullUpBarIcon({
  size = 20,
  color = "#9A9A90",
  strokeWidth = 2,
}: EquipmentIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="2"
        y="3"
        width="4"
        height="3"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Rect
        x="18"
        y="3"
        width="4"
        height="3"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Line
        x1="4"
        y1="6"
        x2="4"
        y2="10"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Line
        x1="20"
        y1="6"
        x2="20"
        y2="10"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Line
        x1="2"
        y1="10"
        x2="22"
        y2="10"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function BenchIcon({
  size = 20,
  color = "#9A9A90",
  strokeWidth = 2,
}: EquipmentIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="3"
        y="9"
        width="18"
        height="3"
        rx="1"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Line
        x1="6"
        y1="12"
        x2="6"
        y2="19"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Line
        x1="18"
        y1="12"
        x2="18"
        y2="19"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function SquatRackIcon({
  size = 20,
  color = "#9A9A90",
  strokeWidth = 2,
}: EquipmentIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line
        x1="5"
        y1="3"
        x2="5"
        y2="21"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Line
        x1="19"
        y1="3"
        x2="19"
        y2="21"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Line
        x1="5"
        y1="6"
        x2="19"
        y2="6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Line
        x1="5"
        y1="11"
        x2="8"
        y2="11"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Line
        x1="19"
        y1="11"
        x2="16"
        y2="11"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Line
        x1="2"
        y1="21"
        x2="8"
        y2="21"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Line
        x1="16"
        y1="21"
        x2="22"
        y2="21"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function JumpRopeIcon({
  size = 20,
  color = "#9A9A90",
  strokeWidth = 2,
}: EquipmentIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="4" cy="4" r="1.5" stroke={color} strokeWidth={strokeWidth} />
      <Circle cx="20" cy="4" r="1.5" stroke={color} strokeWidth={strokeWidth} />
      <Line
        x1="4"
        y1="5.5"
        x2="4"
        y2="8"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Line
        x1="20"
        y1="5.5"
        x2="20"
        y2="8"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Path
        d="M4 8c0 8 16 8 16 0"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function MedicineBallIcon({
  size = 20,
  color = "#9A9A90",
  strokeWidth = 2,
}: EquipmentIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="8" stroke={color} strokeWidth={strokeWidth} />
      <Line
        x1="12"
        y1="4"
        x2="12"
        y2="20"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Line
        x1="4"
        y1="12"
        x2="20"
        y2="12"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function FoamRollerIcon({
  size = 20,
  color = "#9A9A90",
  strokeWidth = 2,
}: EquipmentIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="3"
        y="9"
        width="18"
        height="6"
        rx="3"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Line
        x1="8"
        y1="9"
        x2="8"
        y2="15"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Line
        x1="12"
        y1="9"
        x2="12"
        y2="15"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Line
        x1="16"
        y1="9"
        x2="16"
        y2="15"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function SuspensionTrainerIcon({
  size = 20,
  color = "#9A9A90",
  strokeWidth = 2,
}: EquipmentIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="3" r="1.5" stroke={color} strokeWidth={strokeWidth} />
      <Line
        x1="12"
        y1="4.5"
        x2="7"
        y2="16"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Line
        x1="12"
        y1="4.5"
        x2="17"
        y2="16"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Circle cx="7" cy="18" r="2" stroke={color} strokeWidth={strokeWidth} />
      <Circle cx="17" cy="18" r="2" stroke={color} strokeWidth={strokeWidth} />
    </Svg>
  );
}

export function PlyoBoxIcon({
  size = 20,
  color = "#9A9A90",
  strokeWidth = 2,
}: EquipmentIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="4"
        y="10"
        width="12"
        height="10"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Path
        d="M4 10l4-4h12l-4 4z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <Path
        d="M16 10l4-4v10l-4 4z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function SandbagIcon({
  size = 20,
  color = "#9A9A90",
  strokeWidth = 2,
}: EquipmentIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 8V6a3 3 0 0 1 6 0v2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Rect
        x="5"
        y="8"
        width="14"
        height="11"
        rx="5"
        stroke={color}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
}

export function GymnasticRingsIcon({
  size = 20,
  color = "#9A9A90",
  strokeWidth = 2,
}: EquipmentIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line
        x1="2"
        y1="4"
        x2="22"
        y2="4"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Line
        x1="7"
        y1="4"
        x2="7"
        y2="14"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Line
        x1="17"
        y1="4"
        x2="17"
        y2="14"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Circle cx="7" cy="18" r="3" stroke={color} strokeWidth={strokeWidth} />
      <Circle cx="17" cy="18" r="3" stroke={color} strokeWidth={strokeWidth} />
    </Svg>
  );
}

export function YogaMatIcon({
  size = 20,
  color = "#9A9A90",
  strokeWidth = 2,
}: EquipmentIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="4"
        y="5"
        width="16"
        height="14"
        rx="2"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Line
        x1="4"
        y1="10"
        x2="20"
        y2="10"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Line
        x1="4"
        y1="14"
        x2="20"
        y2="14"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function WeightPlateIcon({
  size = 20,
  color = "#9A9A90",
  strokeWidth = 2,
}: EquipmentIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} />
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={strokeWidth} />
      <Circle cx="12" cy="5" r="1" stroke={color} strokeWidth={strokeWidth} />
      <Circle cx="12" cy="19" r="1" stroke={color} strokeWidth={strokeWidth} />
      <Circle cx="5" cy="12" r="1" stroke={color} strokeWidth={strokeWidth} />
      <Circle cx="19" cy="12" r="1" stroke={color} strokeWidth={strokeWidth} />
    </Svg>
  );
}

export function StabilityBallIcon({
  size = 20,
  color = "#9A9A90",
  strokeWidth = 2,
}: EquipmentIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} />
      <Path
        d="M5 9c4 4 10 4 14 0"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ─── Name-based resolver ────────────────────────────────────────────────────
// Looks up by equipment name first (so "Ab Wheel" gets the ab-wheel icon,
// not a generic category icon), falling back to category, then a default.

type IconComponent = React.ComponentType<EquipmentIconProps>;

// Each entry: list of normalized aliases -> icon. Add new equipment by
// dropping a new icon component above and a line below — no other wiring
// needed, EquipmentRow already calls getEquipmentIcon(item.name, item.category).
const EQUIPMENT_ALIASES: { keys: string[]; icon: IconComponent }[] = [
  {
    keys: ["ab wheel", "abwheel", "ab roller", "core wheel"],
    icon: AbWheelIcon,
  },
  {
    keys: ["battle rope", "battle ropes", "battling rope"],
    icon: BattleRopeIcon,
  },
  {
    keys: [
      "dip bar",
      "dip bars",
      "dip station",
      "parallel bars",
      "parallettes",
    ],
    icon: DipBarIcon,
  },
  { keys: ["dumbbell", "dumbbells"], icon: DumbbellIcon },
  { keys: ["barbell", "barbells", "ez bar", "trap bar"], icon: BarbellIcon },
  { keys: ["kettlebell", "kettlebells"], icon: KettlebellIcon },
  {
    keys: ["resistance band", "resistance bands", "band", "bands"],
    icon: ResistanceBandIcon,
  },
  {
    keys: [
      "pull up bar",
      "pullup bar",
      "pull-up bar",
      "chin up bar",
      "chinup bar",
    ],
    icon: PullUpBarIcon,
  },
  { keys: ["bench", "flat bench", "adjustable bench"], icon: BenchIcon },
  { keys: ["squat rack", "power rack", "rack"], icon: SquatRackIcon },
  { keys: ["jump rope", "skipping rope"], icon: JumpRopeIcon },
  { keys: ["medicine ball", "med ball", "slam ball"], icon: MedicineBallIcon },
  { keys: ["foam roller"], icon: FoamRollerIcon },
  { keys: ["suspension trainer", "trx"], icon: SuspensionTrainerIcon },
  { keys: ["plyo box", "jump box", "plyometric box"], icon: PlyoBoxIcon },
  { keys: ["sandbag", "sand bag"], icon: SandbagIcon },
  { keys: ["gymnastic rings", "rings"], icon: GymnasticRingsIcon },
  { keys: ["yoga mat", "exercise mat", "mat"], icon: YogaMatIcon },
  {
    keys: [
      "weight plate",
      "weight plates",
      "plate",
      "plates",
      "slider disc",
      "slider discs",
      "sliders",
    ],
    icon: WeightPlateIcon,
  },
  {
    keys: ["stability ball", "swiss ball", "exercise ball"],
    icon: StabilityBallIcon,
  },
];

function normalize(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 ]/g, "");
}

/**
 * Resolve the precise icon for a piece of equipment by name, falling back
 * to a category-level icon, then a sensible default. Returns a component
 * with the same {size, color, strokeWidth} contract as lucide icons, so it
 * can be passed directly as OptionCard's `lucideIcon` prop.
 */
export function getEquipmentIcon(
  name: string,
  fallback?: IconComponent,
): IconComponent {
  const n = normalize(name);
  for (const entry of EQUIPMENT_ALIASES) {
    if (entry.keys.some((k) => n.includes(k))) return entry.icon;
  }
  return fallback ?? DumbbellIcon;
}
