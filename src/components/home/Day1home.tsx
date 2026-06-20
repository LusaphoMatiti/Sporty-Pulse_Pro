/**
 * Day1Home
 *
 * The "Day 1" locked state — shown when the user has never completed
 * a workout (totalWorkouts === 0).
 *
 * Changes:
 *   - spacing[5]=40, spacing[6]=48, spacing[20]=160 replaced with grid values:
 *     paddingHorizontal → spacing[2] (16), paddingTop → spacing[6] (48 is fine,
 *     kept), paddingBottom → spacing[8] (64 — safe thumb-zone clearance for
 *     floating tab bar), gap → spacing[3] (24, section spacing).
 *     spacing[20] does not exist on the 8pt map and would produce undefined.
 *   - spacing[4] (32) used for recoveryHeader marginBottom and recoveryBody gap
 *     replaced with spacing[2] (16) and spacing[3] (24) respectively — 32pt
 *     gaps inside a card are too large.
 *   - spacing[2.5]=20 in metricsRow gap → spacing[2] (16, standard).
 *   - spacing[1.5]=12 kept (it's 12pt = 1.5 × 8, valid on the grid).
 *   - borders.thin kept (0.5px hairline — correct for avatar ring, locked pill).
 *   - skeletonBar borderRadius: spacing[1] (8) → radii.sm (8) — same value
 *     but pulls from the correct token rather than the spacing map.
 *   - spacing[3] (24) for lockedPill paddingHorizontal → spacing[2] (16),
 *     spacing[1.5] (12) for gap → spacing[1] (8). Pill interior was too wide.
 *   - paddingRight: spacing[4] (32) on greetingText → spacing[3] (24).
 */

import React from "react";
import { View, ScrollView, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import { SPText } from "../../components/ui/SPText";
import { SPButton } from "../../components/ui/SPButton";
import { SPCard } from "../../components/ui/SPCard";
import { SPIcon } from "../icons/SPIcon";
import { MetricCard } from "./MatricCard";
import { spacing, radii, borders } from "../../theme";
import { useAppTheme } from "../../theme/ThemeContext";
import type { SPUser } from "../../types/session";

interface Day1HomeProps {
  user: SPUser;
  greeting: string;
  /** CTA button label — tier-aware copy from HomeScreen */
  ctaCopy: string;
  /** Subtitle shown below the h1 — tier-aware copy from HomeScreen */
  subline: string;
}

const LOCKED_METRICS: {
  label: string;
  icon: "training" | "timer" | "repeat";
}[] = [
  { label: "Workouts", icon: "training" },
  { label: "Trained", icon: "timer" },
  { label: "Sets", icon: "repeat" },
];

export function Day1Home({ user, greeting, ctaCopy, subline }: Day1HomeProps) {
  const router = useRouter();
  const { theme } = useAppTheme();

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: theme.void }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Greeting ── */}
      <View style={styles.greetingRow}>
        <View style={styles.greetingText}>
          <SPText
            variant="label"
            style={[styles.greetingLabel, { color: theme.muted }]}
          >
            {greeting}, {user.name ?? "Athlete"}
          </SPText>
          <SPText variant="h1" style={{ color: theme.text }}>
            Welcome to{" "}
            <SPText variant="h1" style={{ color: theme.accent }}>
              your
            </SPText>
            {"\n"}journey.
          </SPText>
          <SPText
            variant="body"
            style={[styles.subline, { color: theme.muted2 }]}
          >
            {subline}
          </SPText>
        </View>

        <Avatar user={user} />
      </View>

      {/* ── Recovery card — locked ── */}
      <SPCard variant="default" entranceDelay={80}>
        <View style={styles.recoveryHeader}>
          <SPText variant="label" style={{ color: theme.text }}>
            Recovery Status
          </SPText>
          <View
            style={[
              styles.lockedPill,
              { backgroundColor: theme.surface2, borderColor: theme.border },
            ]}
          >
            <SPIcon name="lock" size={10} color={theme.muted} />
            <SPText
              variant="caption"
              style={{ fontSize: 11, color: theme.muted }}
            >
              Unlocks after first session
            </SPText>
          </View>
        </View>

        <View style={styles.recoveryBody}>
          {/* Dashed placeholder ring */}
          <View
            style={[
              styles.recoveryRing,
              { borderColor: theme.border, backgroundColor: theme.raised },
            ]}
          >
            <SPIcon name="timer" size={22} color={theme.muted} />
          </View>
          <View style={styles.recoveryInfo}>
            <SPText
              variant="stat"
              style={[styles.recoveryDash, { color: theme.muted }]}
            >
              — %
            </SPText>
            <SPText variant="bodyMd" style={{ color: theme.text }}>
              No recovery data yet
            </SPText>
            <SPText
              variant="caption"
              style={{ marginTop: spacing[0.5], color: theme.muted }}
            >
              Complete your first workout to start tracking
            </SPText>
          </View>
        </View>
      </SPCard>

      {/* ── Locked metrics ── */}
      <View style={styles.metricsRow}>
        {LOCKED_METRICS.map((m, i) => (
          <MetricCard
            key={m.label}
            label={m.label}
            value="0"
            icon={m.icon}
            locked
            entranceDelay={120 + i * 50}
          />
        ))}
      </View>

      {/* ── This Week skeleton ── */}
      <SPCard variant="default" entranceDelay={240}>
        <View style={styles.weekHeader}>
          <SPText variant="h3" style={{ color: theme.text }}>
            This Week
          </SPText>
          <SPText variant="caption" style={{ color: theme.muted }}>
            No plan yet
          </SPText>
        </View>

        {[0.7, 0.5, 0.85].map((opacity, i) => (
          <View key={i} style={[styles.skeletonRow, { opacity }]}>
            <View style={styles.skeletonHeader}>
              <View
                style={[
                  styles.skeletonBar,
                  { width: "55%", backgroundColor: theme.raised },
                ]}
              />
              <View
                style={[
                  styles.skeletonBar,
                  { width: "10%", backgroundColor: theme.raised },
                ]}
              />
            </View>
            <View
              style={[
                styles.skeletonBar,
                { width: "100%", height: 2, backgroundColor: theme.raised },
              ]}
            />
          </View>
        ))}

        <SPText
          variant="caption"
          center
          style={{ marginTop: spacing[3], color: theme.muted }}
        >
          Pick a plan to see your sessions here
        </SPText>
      </SPCard>

      {/* ── CTA ── */}
      <View style={{ marginTop: spacing[2] }}>
        <SPButton
          onPress={() => router.push("/(tabs)/programs" as any)}
          variant="primary"
        >
          {ctaCopy}
        </SPButton>
      </View>
    </ScrollView>
  );
}

// ── Avatar ─────────────────────────────────────────────────────────────────────

function Avatar({ user }: { user: SPUser }) {
  const { theme } = useAppTheme();

  if (user.image) {
    return (
      <Image
        source={{ uri: user.image }}
        style={[styles.avatar, { borderColor: theme.border }]}
      />
    );
  }

  return (
    <View
      style={[
        styles.avatarFallback,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <SPText variant="h3" style={{ color: theme.accent, lineHeight: 22 }}>
        {user.name?.charAt(0).toUpperCase() ?? "?"}
      </SPText>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing[2], // 16 — standard padding
    paddingTop: spacing[6], // 48 — major section top
    paddingBottom: spacing[8], // 64 — clears floating tab bar
    gap: spacing[3], // 24 — section spacing
  },

  greetingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  greetingText: {
    flex: 1,
    gap: spacing[1], // 8
    paddingRight: spacing[3], // 24 — was 32, too wide
  },
  greetingLabel: {
    marginBottom: spacing[1], // 8
  },
  subline: {
    marginTop: spacing[1.5], // 12
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: borders.thin,
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: borders.thin,
    alignItems: "center",
    justifyContent: "center",
  },

  recoveryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing[2], // 16 — was 32, too tall inside card
  },
  lockedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[1], // 8 — was 12, too wide for small pill
    borderWidth: borders.thin,
    borderRadius: radii.full,
    paddingVertical: spacing[1], // 8
    paddingHorizontal: spacing[2], // 16 — was 24
  },
  recoveryBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3], // 24 — was 32
  },
  recoveryRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  recoveryInfo: {
    flex: 1,
    gap: spacing[0.5], // 4
  },
  recoveryDash: {
    fontSize: 28,
  },

  metricsRow: {
    flexDirection: "row",
    gap: spacing[2], // 16 — was 20 (off-grid)
  },

  weekHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing[2], // 16 — was 32
  },
  skeletonRow: {
    gap: spacing[1.5], // 12
    marginBottom: spacing[3], // 24 — was spacing[3] already, kept
  },
  skeletonHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  skeletonBar: {
    height: 10,
    borderRadius: radii.sm, // 8 — was spacing[1] (same value, wrong token)
  },
});
