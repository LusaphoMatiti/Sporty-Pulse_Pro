import React from "react";
import { View, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import { Activity, Clock, Layers, Check, Minus } from "lucide-react-native";

import { SPText } from "../ui/SPText";
import { spacing, radii, borders, fonts } from "../../theme";
import { useAppTheme } from "../../theme/ThemeContext";
import { relativeDate, formatVolume } from "./ProgressComponents";

// ─── Types ──────────────────────────────────────────────────────────────────

export type SessionStatus = "completed" | "partial" | "missed";

export interface SessionHistoryItem {
  key: string;
  name: string; // "Lower Body Strength"
  focusLabel?: string; // optional secondary tag, e.g. plan name
  date: string; // ISO string
  durationMinutes: number;
  volumeKg: number;
  status: SessionStatus;
  onPress?: () => void;
}

type Density = "rich" | "compact" | "stacked";

// ─── Example data (for preview / Storybook-style usage) ──────────────────────

export const EXAMPLE_SESSION_HISTORY: SessionHistoryItem[] = [
  {
    key: "1",
    name: "Lower Body Strength",
    date: "2026-06-17",
    durationMinutes: 48,
    volumeKg: 8420,
    status: "completed",
  },
  {
    key: "2",
    name: "Upper Body Performance",
    date: "2026-06-15",
    durationMinutes: 52,
    volumeKg: 7110,
    status: "completed",
  },
  {
    key: "3",
    name: "Recovery Flow",
    date: "2026-06-13",
    durationMinutes: 30,
    volumeKg: 0,
    status: "partial",
  },
  {
    key: "4",
    name: "Executive Conditioning",
    date: "2026-06-11",
    durationMinutes: 41,
    volumeKg: 5260,
    status: "completed",
  },
  {
    key: "5",
    name: "Strength Maintenance Protocol",
    date: "2026-06-08",
    durationMinutes: 0,
    volumeKg: 0,
    status: "missed",
  },
];

// ─── Status config ─────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<SessionStatus, { label: string; color: string }> = {
  completed: { label: "Completed", color: "#30D158" },
  partial: { label: "Partial", color: "#FF9F0A" },
  missed: { label: "Missed", color: "#8E8E93" },
};

// ─── Status pill ───────────────────────────────────────────────────────────

function StatusPill({ status }: { status: SessionStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <View
      style={[
        pillStyles.pill,
        { backgroundColor: cfg.color + "16", borderColor: cfg.color + "40" },
      ]}
    >
      <View style={[pillStyles.dot, { backgroundColor: cfg.color }]} />
      <SPText
        variant="tag"
        style={{ color: cfg.color, fontSize: 10, letterSpacing: 0.4 }}
      >
        {cfg.label}
      </SPText>
    </View>
  );
}

const pillStyles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: borders.thin,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  dot: { width: 5, height: 5, borderRadius: 2.5 },
});

// ─── Stat group (duration / volume) ────────────────────────────────────────

function StatGroup({
  icon: Icon,
  value,
  label,
  muted,
}: {
  icon: React.ComponentType<{
    size: number;
    color: string;
    strokeWidth: number;
  }>;
  value: string;
  label: string;
  muted: string;
}) {
  return (
    <View style={statStyles.group}>
      <Icon size={13} color={muted} strokeWidth={2} />
      <SPText
        variant="bodyMd"
        style={{ fontFamily: fonts.brandBold, fontSize: 13 }}
      >
        {value}
      </SPText>
      <SPText variant="caption" style={{ opacity: 0.45, fontSize: 11 }}>
        {label}
      </SPText>
    </View>
  );
}

const statStyles = StyleSheet.create({
  group: { flexDirection: "row", alignItems: "center", gap: 5 },
});

// ─── Timeline rail ─────────────────────────────────────────────────────────
// A continuous vertical line with a status dot per row. The line above the
// first dot and below the last dot is hidden so the rail starts/ends clean.

function TimelineRail({
  status,
  isFirst,
  isLast,
  border,
}: {
  status: SessionStatus;
  isFirst: boolean;
  isLast: boolean;
  border: string;
}) {
  const cfg = STATUS_CONFIG[status];
  const filled = status === "completed";

  return (
    <View style={railStyles.rail}>
      <View
        style={[
          railStyles.line,
          { backgroundColor: isFirst ? "transparent" : border },
        ]}
      />
      <View
        style={[
          railStyles.dotOuter,
          {
            backgroundColor: filled ? cfg.color : "transparent",
            borderColor: filled ? cfg.color : border,
          },
        ]}
      >
        {status === "completed" && (
          <Check size={10} color="#06140B" strokeWidth={3} />
        )}
        {status === "partial" && (
          <View style={[railStyles.dotInner, { backgroundColor: cfg.color }]} />
        )}
        {status === "missed" && (
          <Minus size={9} color={cfg.color} strokeWidth={3} />
        )}
      </View>
      <View
        style={[
          railStyles.line,
          { backgroundColor: isLast ? "transparent" : border },
        ]}
      />
    </View>
  );
}

const railStyles = StyleSheet.create({
  rail: { width: 26, alignItems: "center" },
  line: { width: 1.5, flex: 1 },
  dotOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  dotInner: { width: 6, height: 6, borderRadius: 3 },
});

// ─── Session row ───────────────────────────────────────────────────────────

function SessionRow({
  item,
  isFirst,
  isLast,
  density,
}: {
  item: SessionHistoryItem;
  isFirst: boolean;
  isLast: boolean;
  density: Density;
}) {
  const { theme } = useAppTheme();
  const dateLabel = relativeDate(item.date);
  const durationLabel =
    item.durationMinutes > 0 ? `${item.durationMinutes}m` : "—";
  const volumeLabel = item.volumeKg > 0 ? formatVolume(item.volumeKg) : "—";

  // ── Rich (desktop): single elegant line, ledger-style ──
  if (density === "rich") {
    return (
      <View style={rowStyles.row}>
        <TimelineRail
          status={item.status}
          isFirst={isFirst}
          isLast={isLast}
          border={theme.border}
        />
        <Pressable
          onPress={item.onPress}
          style={({ pressed }) => [
            rowStyles.card,
            rowStyles.richCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
            pressed && { opacity: 0.85 },
          ]}
        >
          <View style={rowStyles.richNameCol}>
            <SPText
              variant="bodyMd"
              numberOfLines={1}
              style={{ fontFamily: fonts.brandBold }}
            >
              {item.name}
            </SPText>
            <SPText variant="caption" style={{ opacity: 0.45, marginTop: 2 }}>
              {dateLabel}
              {item.focusLabel ? `  ·  ${item.focusLabel}` : ""}
            </SPText>
          </View>

          <View style={rowStyles.richStatsCol}>
            <StatGroup
              icon={Clock}
              value={durationLabel}
              label="duration"
              muted={theme.muted}
            />
            <View
              style={[rowStyles.vDivider, { backgroundColor: theme.border }]}
            />
            <StatGroup
              icon={Layers}
              value={volumeLabel}
              label="volume"
              muted={theme.muted}
            />
          </View>

          <StatusPill status={item.status} />
        </Pressable>
      </View>
    );
  }

  // ── Compact (tablet): two lines ──
  if (density === "compact") {
    return (
      <View style={rowStyles.row}>
        <TimelineRail
          status={item.status}
          isFirst={isFirst}
          isLast={isLast}
          border={theme.border}
        />
        <Pressable
          onPress={item.onPress}
          style={({ pressed }) => [
            rowStyles.card,
            rowStyles.compactCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
            pressed && { opacity: 0.85 },
          ]}
        >
          <View style={rowStyles.topLine}>
            <SPText
              variant="bodyMd"
              numberOfLines={1}
              style={{
                fontFamily: fonts.brandBold,
                flex: 1,
                marginRight: spacing[2],
              }}
            >
              {item.name}
            </SPText>
            <StatusPill status={item.status} />
          </View>

          <View style={rowStyles.compactMetaRow}>
            <SPText variant="caption" style={{ opacity: 0.45 }}>
              {dateLabel}
            </SPText>
            <View style={[rowStyles.hDot, { backgroundColor: theme.muted }]} />
            <StatGroup
              icon={Clock}
              value={durationLabel}
              label=""
              muted={theme.muted}
            />
            <View style={[rowStyles.hDot, { backgroundColor: theme.muted }]} />
            <StatGroup
              icon={Layers}
              value={volumeLabel}
              label=""
              muted={theme.muted}
            />
          </View>
        </Pressable>
      </View>
    );
  }

  // ── Stacked (mobile): three lines, generous touch target ──
  return (
    <View style={rowStyles.row}>
      <TimelineRail
        status={item.status}
        isFirst={isFirst}
        isLast={isLast}
        border={theme.border}
      />
      <Pressable
        onPress={item.onPress}
        style={({ pressed }) => [
          rowStyles.card,
          rowStyles.stackedCard,
          { backgroundColor: theme.surface, borderColor: theme.border },
          pressed && { opacity: 0.85 },
        ]}
      >
        <View style={rowStyles.topLine}>
          <SPText
            variant="bodyMd"
            numberOfLines={1}
            style={{
              fontFamily: fonts.brandBold,
              flex: 1,
              marginRight: spacing[2],
            }}
          >
            {item.name}
          </SPText>
          <StatusPill status={item.status} />
        </View>

        <SPText variant="caption" style={{ opacity: 0.45, marginTop: 3 }}>
          {dateLabel}
          {item.focusLabel ? `  ·  ${item.focusLabel}` : ""}
        </SPText>

        <View style={rowStyles.statsRow}>
          <StatGroup
            icon={Clock}
            value={durationLabel}
            label="duration"
            muted={theme.muted}
          />
          <View
            style={[rowStyles.vDivider, { backgroundColor: theme.border }]}
          />
          <StatGroup
            icon={Layers}
            value={volumeLabel}
            label="volume"
            muted={theme.muted}
          />
        </View>
      </Pressable>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: { flexDirection: "row" },
  card: {
    flex: 1,
    borderRadius: radii.xl,
    borderWidth: borders.thin,
    marginLeft: spacing[2],
    marginBottom: spacing[3],
  },
  richCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    gap: spacing[4],
  },
  richNameCol: { flex: 1, minWidth: 0 },
  richStatsCol: { flexDirection: "row", alignItems: "center", gap: spacing[3] },
  compactCard: { padding: spacing[3] },
  stackedCard: { padding: spacing[4], minHeight: 84 },
  topLine: { flexDirection: "row", alignItems: "center" },
  compactMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 5,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing[2.5],
    gap: spacing[2.5],
  },
  vDivider: { width: 1, height: 12 },
  hDot: { width: 3, height: 3, borderRadius: 1.5, opacity: 0.4 },
});

// ─── Public component ──────────────────────────────────────────────────────

export function SessionHistoryCard({
  items,
  title = "Session History",
  onViewAll,
  emptyLabel = "No sessions yet. Start your first workout!",
}: {
  items: SessionHistoryItem[];
  title?: string;
  onViewAll?: () => void;
  emptyLabel?: string;
}) {
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();

  const density: Density =
    width >= 820 ? "rich" : width >= 560 ? "compact" : "stacked";

  return (
    <View>
      <View style={headerStyles.row}>
        <View style={headerStyles.titleGroup}>
          <Activity size={16} color={theme.accent} strokeWidth={2} />
          <SPText variant="h3">{title}</SPText>
        </View>
        {onViewAll && (
          <Pressable onPress={onViewAll}>
            <SPText variant="tag" accent>
              View all →
            </SPText>
          </Pressable>
        )}
      </View>

      {items.length === 0 ? (
        <View
          style={[
            headerStyles.emptyCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <SPText variant="caption" center style={{ opacity: 0.5 }}>
            {emptyLabel}
          </SPText>
        </View>
      ) : (
        <View>
          {items.map((item, i) => (
            <SessionRow
              key={item.key}
              item={item}
              isFirst={i === 0}
              isLast={i === items.length - 1}
              density={density}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const headerStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing[3],
  },
  titleGroup: { flexDirection: "row", alignItems: "center", gap: 6 },
  emptyCard: {
    borderRadius: radii.xl,
    borderWidth: borders.thin,
    padding: spacing[5],
    alignItems: "center",
  },
});
