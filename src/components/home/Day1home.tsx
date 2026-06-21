import React, { useMemo } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import Svg, { Circle } from "react-native-svg";
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

const WEEK_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

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
          {/* Both "your" and "journey." carry the accent per the design —
              nesting them inside one accent-colored SPText keeps the
              line break while colouring both fragments. */}
          <SPText variant="h1" style={{ color: theme.text }}>
            Welcome to{" "}
            <SPText variant="h1" style={{ color: theme.accent }}>
              your{"\n"}journey.
            </SPText>
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
          <LockedPill label="Unlocks after first session" />
        </View>

        <View style={styles.recoveryBody}>
          <RecoveryRing />

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

          <RecoveryTexture />
        </View>
      </SPCard>

      {/* ── Today's Session / Current Streak — locked ── */}
      <View style={styles.featureRow}>
        <View style={styles.featureCardWrap}>
          <LockedFeatureCard
            label="Today's Session"
            value="Locked"
            description="Pick a plan to unlock today's session."
            entranceDelay={140}
          />
        </View>
        <View style={styles.featureCardWrap}>
          <LockedFeatureCard
            label="Current Streak"
            value="—"
            description="Pick a plan to start your streak."
            entranceDelay={170}
          />
        </View>
      </View>

      {/* ── Summary metrics — locked ── */}
      <View style={styles.metricsRow}>
        {LOCKED_METRICS.map((m, i) => (
          <MetricCard
            key={m.label}
            label={m.label}
            value="0"
            icon={m.icon}
            locked
            entranceDelay={210 + i * 50}
          />
        ))}
      </View>

      {/* ── This Week — locked, day-by-day ── */}
      <SPCard variant="default" entranceDelay={360}>
        <View style={styles.weekHeader}>
          <SPText variant="h3" style={{ color: theme.text }}>
            This Week
          </SPText>
          <LockedPill label="No plan yet" />
        </View>

        <View style={styles.weekDaysRow}>
          {WEEK_DAYS.map((day) => (
            <View key={day} style={styles.weekDayCol}>
              <SPText variant="caption" style={{ color: theme.muted }}>
                —
              </SPText>
              <View
                style={[
                  styles.weekDayLock,
                  { backgroundColor: theme.raised, borderColor: theme.border },
                ]}
              >
                <SPIcon name="lock" size={11} color={theme.muted} />
              </View>
              <SPText
                variant="caption"
                style={{ color: theme.muted, fontSize: 10 }}
              >
                {day}
              </SPText>
            </View>
          ))}
        </View>
      </SPCard>

      {/* ── Recent Activity — locked ── */}
      <SPCard variant="default" entranceDelay={410}>
        <View style={styles.activityHeader}>
          <SPText variant="label" style={{ color: theme.text }}>
            Recent Activity
          </SPText>
          <LockedPill label="No activity yet" />
        </View>

        <View style={styles.activityLockedBody}>
          <View
            style={[
              styles.activityLockCircle,
              { backgroundColor: theme.raised, borderColor: theme.border },
            ]}
          >
            <SPIcon name="lock" size={22} color={theme.muted} />
          </View>
          <SPText
            variant="bodyMd"
            style={{ color: theme.text, marginTop: spacing[2] }}
          >
            No activity to show yet
          </SPText>
          <SPText
            variant="caption"
            center
            style={{ color: theme.muted, marginTop: spacing[0.5] }}
          >
            Complete your first session to see your progress here.
          </SPText>
        </View>
      </SPCard>

      {/* ── CTA ── */}
      <View style={{ marginTop: spacing[2] }}>
        <SPButton
          onPress={() => router.push("/(tabs)/programs" as any)}
          variant="primary"
        >
          {`${ctaCopy}  →`}
        </SPButton>
      </View>
    </ScrollView>
  );
}

// ── LockedPill ──────────────────────────────────────────────────────────────
// Shared small pill used for "Unlocks after first session" / "No plan yet" /
// "No activity yet" — kept as one component so all three stay visually
// identical.

function LockedPill({ label }: { label: string }) {
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        styles.lockedPill,
        { backgroundColor: theme.surface2, borderColor: theme.border },
      ]}
    >
      <SPIcon name="lock" size={10} color={theme.muted} />
      <SPText variant="caption" style={{ fontSize: 11, color: theme.muted }}>
        {label}
      </SPText>
    </View>
  );
}

// ── LockedFeatureCard ────────────────────────────────────────────────────────
// Today's Session / Current Streak — vertically centered locked card.

function LockedFeatureCard({
  label,
  value,
  description,
  entranceDelay,
}: {
  label: string;
  value: string;
  description: string;
  entranceDelay?: number;
}) {
  const { theme } = useAppTheme();

  return (
    <SPCard variant="default" entranceDelay={entranceDelay}>
      <View style={styles.featureCardContent}>
        <SPText variant="label" style={{ color: theme.muted }}>
          {label}
        </SPText>
        <View
          style={[
            styles.featureLockCircle,
            { backgroundColor: theme.raised, borderColor: theme.border },
          ]}
        >
          <SPIcon name="lock" size={20} color={theme.muted} />
        </View>
        <SPText variant="bodyMd" style={{ color: theme.text }}>
          {value}
        </SPText>
        <SPText variant="caption" center style={{ color: theme.muted }}>
          {description}
        </SPText>
      </View>
    </SPCard>
  );
}

// ── RecoveryRing ─────────────────────────────────────────────────────────────
// Faint full-circle track + two short accent arcs ("partial accent stroke"
// per spec) with a clock icon centered — replaces the old plain dashed ring.

const RING_SIZE = 64;
const RING_STROKE = 2;

function RecoveryRing() {
  const { theme } = useAppTheme();
  const r = (RING_SIZE - RING_STROKE) / 2;
  const c = RING_SIZE / 2;
  const circumference = 2 * Math.PI * r;

  return (
    <View style={styles.recoveryRingWrap}>
      <Svg width={RING_SIZE} height={RING_SIZE}>
        <Circle
          cx={c}
          cy={c}
          r={r}
          stroke={theme.border}
          strokeWidth={RING_STROKE}
          fill="none"
        />
        {/* Short accent arc near the top */}
        <Circle
          cx={c}
          cy={c}
          r={r}
          stroke={theme.accent}
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={`${circumference * 0.14} ${circumference}`}
          rotation={-95}
          originX={c}
          originY={c}
          fill="none"
        />
        {/* Shorter accent arc near the bottom-left */}
        <Circle
          cx={c}
          cy={c}
          r={r}
          stroke={theme.accent}
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={`${circumference * 0.09} ${circumference}`}
          rotation={150}
          originX={c}
          originY={c}
          fill="none"
        />
      </Svg>
      <View style={styles.recoveryRingIconWrap}>
        <SPIcon name="timer" size={22} color={theme.muted} />
      </View>
    </View>
  );
}

// ── RecoveryTexture ──────────────────────────────────────────────────────────
// Deterministic particle/wave field — small accent dots scattered along a
// few sine curves, fading from transparent (left) to faintly bright (right),
// for the "expensive analytics dashboard" visual note. Pure decoration,
// pointerEvents="none". Hidden under the `sm` width tier so it can never
// squeeze the recovery copy on small phones.

const TEXTURE_W = 120;
const TEXTURE_H = 96;
const TEXTURE_MIN_WIDTH = 380;

interface Particle {
  x: number;
  y: number;
  r: number;
  o: number;
}

function buildTextureParticles(): Particle[] {
  const rows: {
    baseY: number;
    amp: number;
    freq: number;
    density: number;
    maxOpacity: number;
    maxR: number;
    phase: number;
  }[] = [
    {
      baseY: 22,
      amp: 10,
      freq: 0.11,
      density: 12,
      maxOpacity: 0.45,
      maxR: 1.4,
      phase: 0,
    },
    {
      baseY: 44,
      amp: 14,
      freq: 0.09,
      density: 14,
      maxOpacity: 0.6,
      maxR: 1.7,
      phase: 1.4,
    },
    {
      baseY: 64,
      amp: 9,
      freq: 0.12,
      density: 12,
      maxOpacity: 0.4,
      maxR: 1.3,
      phase: 2.6,
    },
    {
      baseY: 80,
      amp: 7,
      freq: 0.13,
      density: 10,
      maxOpacity: 0.25,
      maxR: 1.1,
      phase: 0.8,
    },
  ];

  const particles: Particle[] = [];

  rows.forEach((row) => {
    for (let i = 0; i < row.density; i++) {
      const t = i / (row.density - 1);
      const x = t * TEXTURE_W;
      const y = row.baseY + Math.sin(x * row.freq + row.phase) * row.amp;
      particles.push({
        x,
        y,
        r: 0.5 + t * row.maxR,
        o: 0.04 + t * row.maxOpacity,
      });
    }
  });

  return particles;
}

function RecoveryTexture() {
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const particles = useMemo(buildTextureParticles, []);

  if (width < TEXTURE_MIN_WIDTH) return null;

  return (
    <View style={styles.recoveryTexture} pointerEvents="none">
      <Svg
        width={TEXTURE_W}
        height={TEXTURE_H}
        viewBox={`0 0 ${TEXTURE_W} ${TEXTURE_H}`}
      >
        {particles.map((p, i) => (
          <Circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={p.r}
            fill={theme.accent}
            opacity={p.o}
          />
        ))}
      </Svg>
    </View>
  );
}

// ── Avatar ─────────────────────────────────────────────────────────────────────

const AVATAR_SIZE = 56; // per spec — was 44 (dashboard size), corrected here

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
      <SPText variant="h3" style={{ color: theme.accent, lineHeight: 26 }}>
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
    paddingRight: spacing[3], // 24
  },
  greetingLabel: {
    marginBottom: spacing[1], // 8
    letterSpacing: 6, // per spec: "Letter spacing: 6–8"
  },
  subline: {
    marginTop: spacing[1.5], // 12
  },

  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: borders.thin,
  },
  avatarFallback: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: borders.thin,
    alignItems: "center",
    justifyContent: "center",
  },

  // Recovery card
  recoveryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing[2], // 16
  },
  recoveryBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3], // 24
  },
  recoveryInfo: {
    flex: 1,
    gap: spacing[0.5], // 4
  },
  recoveryDash: {
    fontSize: 28,
  },
  recoveryRingWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  recoveryRingIconWrap: {
    position: "absolute",
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  recoveryTexture: {
    width: TEXTURE_W,
    height: TEXTURE_H,
  },

  // Locked pill (shared)
  lockedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[1], // 8
    borderWidth: borders.thin,
    borderRadius: radii.full,
    paddingVertical: spacing[1], // 8
    paddingHorizontal: spacing[2], // 16
  },

  // Today's Session / Current Streak
  featureRow: {
    flexDirection: "row",
    gap: spacing[2], // 16
  },
  featureCardWrap: {
    flex: 1,
  },
  featureCardContent: {
    alignItems: "center",
    gap: spacing[1.5], // 12
  },
  featureLockCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: borders.thin,
    alignItems: "center",
    justifyContent: "center",
  },

  // Summary metrics
  metricsRow: {
    flexDirection: "row",
    gap: spacing[2], // 16
  },

  // This Week
  weekHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing[3], // 24
  },
  weekDaysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  weekDayCol: {
    alignItems: "center",
    gap: spacing[1], // 8
  },
  weekDayLock: {
    width: 28,
    height: 28,
    borderRadius: radii.sm,
    borderWidth: borders.thin,
    alignItems: "center",
    justifyContent: "center",
  },

  // Recent Activity
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing[3],
  },
  activityLockedBody: {
    alignItems: "center",
    paddingVertical: spacing[2],
  },
  activityLockCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: borders.thin,
    alignItems: "center",
    justifyContent: "center",
  },
});
