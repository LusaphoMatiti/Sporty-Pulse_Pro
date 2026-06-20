/**
 * PersonalRecordCard — Sporty Pulse Pro
 * File: src/components/progress/PersonalRecordCard.tsx
 *
 * Exports:
 *   - PRSection (default) — top PR card + rest-of-PRs list
 *   - PersonalRecordCard — the full detail card (named)
 *   - PersonalRecordData (type)
 *   - PRCardState (type)
 *   - EXAMPLE_PR_DATA (const)
 *
 * Stack: React Native + Expo + react-native-svg + react-native-reanimated + lucide-react-native
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from "react-native-svg";
import {
  ArrowRight,
  ArrowUp,
  ChevronDown,
  Crown,
  TrendingUp,
} from "lucide-react-native";

// ─── Theme ────────────────────────────────────────────────────────────────────

const T = {
  bg: "#0C0E10",
  surface: "#13171A",
  surface2: "#1A1F23",
  border: "rgba(255,255,255,0.07)",
  text: "#F0EDE4",
  muted: "#6B6B62",
  muted2: "#9A9A90",
  accent: "#C8F135",
  accentDim: "rgba(200,241,53,0.10)",
  accentGlow: "rgba(200,241,53,0.18)",
  void: "#0A0A0A",
  raised: "#1E1E1E",
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PRDataPoint {
  label: string;
  value: number;
  isToday?: boolean;
}

export interface PersonalRecordData {
  exerciseName: string;
  value: number;
  unit: string;
  caption?: string;
  improvement: number;
  improvementUnit: string;
  isNewPR: boolean;
  history: PRDataPoint[];
  insight?: {
    headline: string;
    body: string;
  };
}

export type PRCardState = "loading" | "empty" | "populated";

// ─── Constants ────────────────────────────────────────────────────────────────

const PERIOD_OPTIONS = ["1M", "3M", "6M", "All Time"] as const;
type Period = (typeof PERIOD_OPTIONS)[number];

const SPRING_CONFIG = { damping: 22, stiffness: 180, mass: 1 };

// ─── Skeleton Block ───────────────────────────────────────────────────────────

function SkeletonBlock({
  width,
  height,
  borderRadius = 8,
  style,
}: {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: object;
}) {
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.35, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: T.surface2,
        },
        animStyle,
        style,
      ]}
    />
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <SkeletonBlock width={44} height={44} borderRadius={14} />
        <View style={{ gap: 8, flex: 1 }}>
          <SkeletonBlock width={100} height={10} borderRadius={5} />
          <SkeletonBlock width={180} height={16} borderRadius={6} />
        </View>
        <SkeletonBlock width={72} height={32} borderRadius={16} />
      </View>

      <View style={styles.dividerLine} />

      <View style={{ flexDirection: "row", gap: 20, alignItems: "center" }}>
        <View style={{ gap: 8 }}>
          <SkeletonBlock width={90} height={64} borderRadius={8} />
          <SkeletonBlock width={60} height={12} borderRadius={5} />
        </View>
        <View
          style={{
            width: 1,
            height: 72,
            backgroundColor: T.border,
            marginHorizontal: 4,
          }}
        />
        <View style={{ gap: 10 }}>
          <SkeletonBlock width={100} height={20} borderRadius={6} />
          <SkeletonBlock width={80} height={12} borderRadius={5} />
        </View>
      </View>

      <View style={styles.dividerLine} />

      <View style={{ gap: 12 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <SkeletonBlock width={140} height={10} borderRadius={5} />
          <SkeletonBlock width={90} height={30} borderRadius={10} />
        </View>
        <SkeletonBlock width="100%" height={160} borderRadius={12} />
      </View>

      <View style={styles.dividerLine} />

      <SkeletonBlock width="100%" height={64} borderRadius={16} />
    </View>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  const fadeIn = useSharedValue(0);
  const translateY = useSharedValue(12);

  useEffect(() => {
    fadeIn.value = withDelay(100, withTiming(1, { duration: 500 }));
    translateY.value = withDelay(
      100,
      withSpring(0, { damping: 20, stiffness: 120 }),
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.card, animStyle]}>
      <View style={styles.emptyInner}>
        <View style={styles.emptyIconWrap}>
          <Crown size={24} color={T.accent} strokeWidth={1.5} />
        </View>
        <Text style={styles.emptyHeadline}>No records yet.</Text>
        <Text style={styles.emptyBody}>
          Train consistently to unlock your personal records. Each session is
          data.
        </Text>
      </View>
    </Animated.View>
  );
}

// ─── NewRecordBadge ───────────────────────────────────────────────────────────

function NewRecordBadge({ visible }: { visible: boolean }) {
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (!visible) return;
    opacity.value = withTiming(1, { duration: 280 });
    scale.value = withSpring(1, SPRING_CONFIG, () => {
      pulseScale.value = withSequence(
        withTiming(1.08, { duration: 200 }),
        withTiming(1, { duration: 200 }),
      );
    });
  }, [visible]);

  const badgeStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value * pulseScale.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.newPRBadge, badgeStyle]}>
      <Text style={styles.newPRBadgeText}>NEW PR</Text>
    </Animated.View>
  );
}

// ─── HeaderSection ────────────────────────────────────────────────────────────

function HeaderSection({
  exerciseName,
  isNewPR,
}: {
  exerciseName: string;
  isNewPR: boolean;
}) {
  return (
    <View style={styles.headerRow}>
      <View style={styles.iconContainer}>
        <Crown size={16} color={T.accent} strokeWidth={1.5} />
      </View>
      <View style={styles.headerMiddle}>
        <Text style={styles.headerLabel}>PERSONAL RECORD</Text>
        <Text style={styles.exerciseName} numberOfLines={2}>
          {exerciseName}
        </Text>
      </View>
      <NewRecordBadge visible={isNewPR} />
    </View>
  );
}

// ─── Animated Count-Up ────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 900, delay = 200): number {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    let rafId: number;
    let startTime: number | null = null;

    const timeout = setTimeout(() => {
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayed(Math.round(eased * target));
        if (progress < 1) {
          rafId = requestAnimationFrame(animate);
        }
      };
      rafId = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(rafId);
    };
  }, [target, duration, delay]);

  return displayed;
}

// ─── PerformanceSummary ───────────────────────────────────────────────────────

function PerformanceSummary({
  value,
  unit,
  caption,
  improvement,
  improvementUnit,
}: {
  value: number;
  unit: string;
  caption?: string;
  improvement: number;
  improvementUnit: string;
}) {
  const { width } = useWindowDimensions();
  const isNarrow = width < 360;
  const displayValue = useCountUp(value);

  return (
    <View
      style={[
        styles.performanceRow,
        isNarrow && { flexDirection: "column", gap: 16 },
      ]}
    >
      <View style={styles.perfLeft}>
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8 }}>
          <Text style={styles.perfNumber}>{displayValue}</Text>
          <View style={{ paddingBottom: 8 }}>
            <Text style={styles.perfUnit}>{unit}</Text>
            {caption ? <Text style={styles.perfCaption}>{caption}</Text> : null}
          </View>
        </View>
      </View>

      {!isNarrow && <View style={styles.perfDivider} />}

      <View style={styles.perfRight}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <ArrowUp size={16} color={T.accent} strokeWidth={2} />
          <Text style={styles.perfImprovementValue}>
            +{improvement} {improvementUnit}
          </Text>
        </View>
        <Text style={styles.perfImprovementLabel}>vs previous best</Text>
      </View>
    </View>
  );
}

// ─── ProgressChart ────────────────────────────────────────────────────────────

function buildSmoothPath(
  xs: number[],
  ys: number[],
): { line: string; area: string } {
  if (xs.length < 2) {
    const d = `M${xs[0]},${ys[0]}`;
    return { line: d, area: d };
  }

  let line = `M${xs[0]},${ys[0]}`;
  for (let i = 0; i < xs.length - 1; i++) {
    const cpx = (xs[i] + xs[i + 1]) / 2;
    line += ` C${cpx},${ys[i]} ${cpx},${ys[i + 1]} ${xs[i + 1]},${ys[i + 1]}`;
  }

  const last = xs.length - 1;
  const area = `${line} L${xs[last]},${ys[last] + 200} L${xs[0]},${ys[0] + 200} Z`;
  return { line, area };
}

function ProgressChart({
  data,
  period,
  onPeriodChange,
}: {
  data: PRDataPoint[];
  period: Period;
  onPeriodChange: (p: Period) => void;
}) {
  const { width: windowWidth } = useWindowDimensions();
  const [periodMenuOpen, setPeriodMenuOpen] = useState(false);

  const cardPadding = 60;
  const chartWidth = Math.min(windowWidth - cardPadding * 2, 600);
  const chartHeight = 120;
  const padTop = 12;
  const padBottom = 24;
  const padLeft = 24;
  const padRight = 12;

  const innerW = chartWidth - padLeft - padRight;
  const innerH = chartHeight - padTop - padBottom;

  const safeData = data.length >= 2 ? data : [...data, ...data].slice(0, 2);
  const values = safeData.map((d) => d.value);
  const maxV = Math.max(...values);
  const minV = Math.min(...values);
  const range = maxV - minV || 1;

  const xs = safeData.map(
    (_, i) => padLeft + (i / (safeData.length - 1)) * innerW,
  );
  const ys = safeData.map(
    (d) => padTop + (1 - (d.value - minV) / range) * innerH,
  );

  const { line: linePath, area: areaPath } = buildSmoothPath(xs, ys);

  const gridValues = useMemo(() => {
    const step = Math.ceil(range / 4 / 5) * 5 || 5;
    const ticks: number[] = [];
    for (let v = Math.floor(minV / step) * step; v <= maxV + step; v += step) {
      if (v >= minV && v <= maxV + step * 0.5) ticks.push(v);
    }
    return ticks.slice(0, 5);
  }, [minV, maxV, range]);

  const lastIdx = safeData.length - 1;

  return (
    <View>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>PROGRESS OVER TIME</Text>
        <Pressable
          style={styles.periodSelector}
          onPress={() => setPeriodMenuOpen((v) => !v)}
        >
          <Text style={styles.periodSelectorText}>{period}</Text>
          <ChevronDown size={13} color={T.muted2} strokeWidth={2} />
        </Pressable>
      </View>

      {periodMenuOpen && (
        <View style={styles.periodMenu}>
          {PERIOD_OPTIONS.map((p) => (
            <Pressable
              key={p}
              style={[
                styles.periodMenuItem,
                p === period && styles.periodMenuItemActive,
              ]}
              onPress={() => {
                onPeriodChange(p);
                setPeriodMenuOpen(false);
              }}
            >
              <Text
                style={[
                  styles.periodMenuItemText,
                  p === period && { color: T.accent },
                ]}
              >
                {p}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <View style={{ marginTop: 16 }}>
        <Svg
          width={chartWidth}
          height={chartHeight}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        >
          <Defs>
            <LinearGradient id="prAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={T.accent} stopOpacity={0.22} />
              <Stop offset="100%" stopColor={T.accent} stopOpacity={0} />
            </LinearGradient>
            <RadialGradient id="prDotGlow" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor={T.accent} stopOpacity={0.45} />
              <Stop offset="100%" stopColor={T.accent} stopOpacity={0} />
            </RadialGradient>
          </Defs>

          {/* Grid lines */}
          {gridValues.map((v, i) => {
            const gy = padTop + (1 - (v - minV) / range) * innerH;
            if (gy < padTop - 2 || gy > padTop + innerH + 2) return null;
            return (
              <Path
                key={i}
                d={`M${padLeft} ${gy} L${chartWidth - padRight} ${gy}`}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth={1}
                strokeDasharray="3 5"
              />
            );
          })}

          {/* Area fill */}
          <Path d={areaPath} fill="url(#prAreaGrad)" />

          {/* Glow stroke */}
          <Path
            d={linePath}
            fill="none"
            stroke={T.accent}
            strokeWidth={6}
            strokeOpacity={0.12}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Main line */}
          <Path
            d={linePath}
            fill="none"
            stroke={T.accent}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interior dots */}
          {safeData.map((_, i) => {
            if (i === lastIdx) return null;
            return (
              <Circle
                key={i}
                cx={xs[i]}
                cy={ys[i]}
                r={3.5}
                fill={T.surface}
                stroke={T.accent}
                strokeWidth={1.5}
              />
            );
          })}

          {/* Last point glow */}
          <Circle
            cx={xs[lastIdx]}
            cy={ys[lastIdx]}
            r={14}
            fill="url(#prDotGlow)"
          />
          <Circle
            cx={xs[lastIdx]}
            cy={ys[lastIdx]}
            r={6}
            fill={T.surface}
            stroke={T.accent}
            strokeWidth={2.5}
          />
          <Circle cx={xs[lastIdx]} cy={ys[lastIdx]} r={3} fill={T.accent} />
        </Svg>

        {/* Y-axis labels — positioned over SVG */}
        <View
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: padLeft,
            height: chartHeight,
          }}
          pointerEvents="none"
        >
          {gridValues.map((v, i) => {
            const gy = padTop + (1 - (v - minV) / range) * innerH;
            if (gy < padTop - 4 || gy > padTop + innerH + 4) return null;
            return (
              <Text
                key={i}
                style={[
                  styles.axisLabel,
                  { position: "absolute", top: gy - 7, left: 0 },
                ]}
              >
                {v}
              </Text>
            );
          })}
        </View>
      </View>

      {/* X-axis labels */}
      <View
        style={[
          styles.xAxisRow,
          { width: chartWidth, paddingLeft: padLeft, paddingRight: padRight },
        ]}
      >
        {safeData.map((d, i) => (
          <Text
            key={i}
            style={[styles.xAxisLabel, d.isToday && { color: T.accent }]}
          >
            {d.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

// ─── InsightCard ──────────────────────────────────────────────────────────────

function InsightCard({
  headline,
  body,
  onPress,
}: {
  headline: string;
  body: string;
  onPress?: () => void;
}) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(0.975, { damping: 20, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 20, stiffness: 300 });
      }}
      onPress={onPress}
    >
      <Animated.View style={[styles.insightCard, animStyle]}>
        <View style={styles.insightIconWrap}>
          <TrendingUp size={16} color={T.accent} strokeWidth={1.75} />
        </View>
        <View style={styles.insightText}>
          <Text style={styles.insightHeadline} numberOfLines={1}>
            {headline}
          </Text>
          <Text style={styles.insightBody} numberOfLines={2}>
            {body}
          </Text>
        </View>
        <ArrowRight size={16} color={T.muted} strokeWidth={1.5} />
      </Animated.View>
    </Pressable>
  );
}

// ─── PersonalRecordCard ───────────────────────────────────────────────────────

export interface PersonalRecordCardProps {
  state: PRCardState;
  data?: PersonalRecordData;
  onInsightPress?: () => void;
}

function PersonalRecordCard({
  state,
  data,
  onInsightPress,
}: PersonalRecordCardProps) {
  const [period, setPeriod] = useState<Period>("All Time");

  const cardOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(20);

  useEffect(() => {
    if (state === "populated" || state === "empty") {
      cardOpacity.value = withTiming(1, { duration: 480 });
      cardTranslateY.value = withSpring(0, { damping: 22, stiffness: 140 });
    }
  }, [state]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardTranslateY.value }],
  }));

  if (state === "loading") return <LoadingSkeleton />;
  if (state === "empty") return <EmptyState />;
  if (!data) return null;

  const filteredData = (() => {
    if (!data.history || data.history.length === 0) return [];
    if (period === "All Time") return data.history;
    const months: Record<Period, number> = {
      "1M": 1,
      "3M": 3,
      "6M": 6,
      "All Time": 999,
    };
    return data.history.slice(-(months[period] + 1));
  })();

  const chartData = filteredData.length >= 2 ? filteredData : data.history;

  return (
    <Animated.View style={[styles.card, cardStyle]}>
      <HeaderSection exerciseName={data.exerciseName} isNewPR={data.isNewPR} />

      <View style={styles.dividerLine} />

      <PerformanceSummary
        value={data.value}
        unit={data.unit}
        caption={data.caption}
        improvement={data.improvement}
        improvementUnit={data.improvementUnit}
      />

      <View style={styles.dividerLine} />

      <ProgressChart
        data={chartData}
        period={period}
        onPeriodChange={setPeriod}
      />

      {data.insight && (
        <>
          <View style={styles.dividerLine} />
          <InsightCard
            headline={data.insight.headline}
            body={data.insight.body}
            onPress={onInsightPress}
          />
        </>
      )}
    </Animated.View>
  );
}

// ─── PRListRow ────────────────────────────────────────────────────────────────
// Compact row for every PR after the first one.

function PRListRow({
  data,
  index,
  onPress,
}: {
  data: PersonalRecordData;
  index: number;
  onPress?: () => void;
}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);

  useEffect(() => {
    opacity.value = withDelay(index * 60, withTiming(1, { duration: 340 }));
    translateY.value = withDelay(
      index * 60,
      withSpring(0, { damping: 22, stiffness: 160 }),
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const isBodyweight = data.unit === "REPS";
  const hasImprovement = data.improvement > 0;

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(0.978, { damping: 20, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 20, stiffness: 300 });
      }}
      onPress={onPress}
    >
      <Animated.View style={[listStyles.row, animStyle]}>
        {/* Value */}
        <View style={listStyles.valueCol}>
          <Text style={listStyles.value}>{data.value}</Text>
          <Text style={listStyles.unit}>{data.unit}</Text>
        </View>

        {/* Name + delta */}
        <View style={listStyles.infoCol}>
          <Text style={listStyles.name} numberOfLines={1}>
            {data.exerciseName}
          </Text>
          {hasImprovement ? (
            <View style={listStyles.deltaRow}>
              <ArrowUp size={10} color={T.accent} strokeWidth={2.5} />
              <Text style={listStyles.delta}>
                +{data.improvement} {data.improvementUnit} vs prev
              </Text>
            </View>
          ) : (
            <Text style={listStyles.deltaMuted}>Personal best</Text>
          )}
        </View>

        {/* Right: new badge or date */}
        {data.isNewPR ? (
          <View style={listStyles.newBadge}>
            <Text style={listStyles.newBadgeText}>NEW</Text>
          </View>
        ) : (
          <ArrowRight size={13} color={T.muted} strokeWidth={1.5} />
        )}
      </Animated.View>
    </Pressable>
  );
}

const listStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 11,
  },
  valueCol: {
    width: 52,
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  value: {
    fontSize: 20,
    fontWeight: "800",
    color: T.text,
    letterSpacing: -1,
    lineHeight: 22,
  },
  unit: {
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: T.muted,
  },
  infoCol: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 13,
    fontWeight: "600",
    color: T.text,
    letterSpacing: -0.1,
  },
  deltaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  delta: {
    fontSize: 10,
    color: T.accent,
    fontWeight: "500",
  },
  deltaMuted: {
    fontSize: 10,
    color: T.muted,
  },
  newBadge: {
    backgroundColor: T.accent,
    borderRadius: 100,
    paddingHorizontal: 7,
    paddingVertical: 3,
    flexShrink: 0,
  },
  newBadgeText: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: "#0C0E10",
  },
});

// ─── PRSection ────────────────────────────────────────────────────────────────
// The full section: top PR as rich card + all remaining PRs as stacked rows.
// This is what ProgressScreen renders.

export interface PRSectionProps {
  state: PRCardState;
  allPRs?: PersonalRecordData[];
  onInsightPress?: () => void;
  onPRPress?: (pr: PersonalRecordData) => void;
}

export function PRSection({
  state,
  allPRs = [],
  onInsightPress,
  onPRPress,
}: PRSectionProps) {
  const topPR = allPRs[0];
  const restPRs = allPRs.slice(1);

  return (
    <View style={sectionStyles.wrapper}>
      {/* Top PR — full rich card */}
      <PersonalRecordCard
        state={state}
        data={topPR}
        onInsightPress={onInsightPress}
      />

      {/* Remaining PRs — compact stacked list inside a card */}
      {state === "populated" && restPRs.length > 0 && (
        <View style={sectionStyles.listCard}>
          <Text style={sectionStyles.listHeader}>OTHER RECORDS</Text>
          {restPRs.map((pr, i) => (
            <View key={pr.exerciseName}>
              {i > 0 && <View style={sectionStyles.rowDivider} />}
              <PRListRow data={pr} index={i} onPress={() => onPRPress?.(pr)} />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  wrapper: {
    gap: 10,
  },
  listCard: {
    backgroundColor: T.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: T.border,
    paddingVertical: 6,
    paddingHorizontal: 18,
  },
  listHeader: {
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 1.6,
    color: T.muted,
    paddingTop: 12,
    paddingBottom: 4,
  },
  rowDivider: {
    height: 1,
    backgroundColor: T.border,
    marginLeft: 64,
  },
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: T.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: T.border,
    paddingVertical: 20,
    paddingHorizontal: 22,
    gap: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: T.accentDim,
    borderWidth: 1,
    borderColor: "rgba(200,241,53,0.15)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  headerMiddle: {
    flex: 1,
    gap: 3,
  },
  headerLabel: {
    fontSize: 9,
    letterSpacing: 1.6,
    color: T.muted,
    fontWeight: "600",
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "700",
    color: T.text,
    letterSpacing: -0.3,
    lineHeight: 20,
  },
  newPRBadge: {
    backgroundColor: T.accent,
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexShrink: 0,
  },
  newPRBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.1,
    color: "#0C0E10",
  },
  dividerLine: {
    height: 1,
    backgroundColor: T.border,
  },
  performanceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  perfLeft: {
    flex: 1,
    paddingRight: 16,
  },
  perfNumber: {
    fontSize: 52,
    fontWeight: "800",
    color: T.text,
    letterSpacing: -3,
    lineHeight: 52,
  },
  perfUnit: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
    color: T.accent,
  },
  perfCaption: {
    fontSize: 10,
    color: T.muted2,
    marginTop: 2,
  },
  perfDivider: {
    width: 1,
    height: 56,
    backgroundColor: T.border,
  },
  perfRight: {
    flex: 1,
    paddingLeft: 16,
    gap: 4,
  },
  perfImprovementValue: {
    fontSize: 15,
    fontWeight: "700",
    color: T.text,
    letterSpacing: -0.3,
  },
  perfImprovementLabel: {
    fontSize: 11,
    color: T.muted,
    letterSpacing: 0.1,
  },
  chartHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chartTitle: {
    fontSize: 10,
    letterSpacing: 1.8,
    color: T.muted,
    fontWeight: "600",
  },
  periodSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: T.surface2,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: T.border,
  },
  periodSelectorText: {
    fontSize: 12,
    color: T.muted2,
    fontWeight: "500",
  },
  periodMenu: {
    position: "absolute",
    right: 0,
    top: 36,
    backgroundColor: T.surface2,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.border,
    paddingVertical: 6,
    zIndex: 100,
    minWidth: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  periodMenuItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  periodMenuItemActive: {
    backgroundColor: T.accentDim,
  },
  periodMenuItemText: {
    fontSize: 13,
    color: T.muted2,
    fontWeight: "500",
  },
  axisLabel: {
    fontSize: 9,
    color: T.muted,
    letterSpacing: 0.2,
  },
  xAxisRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  xAxisLabel: {
    fontSize: 10,
    color: T.muted,
    letterSpacing: 0.2,
  },
  insightCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: T.surface2,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.border,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  insightIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: T.accentDim,
    borderWidth: 1,
    borderColor: "rgba(200,241,53,0.12)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  insightText: {
    flex: 1,
    gap: 3,
  },
  insightHeadline: {
    fontSize: 12,
    fontWeight: "700",
    color: T.text,
    letterSpacing: -0.1,
  },
  insightBody: {
    fontSize: 10,
    color: T.muted2,
    lineHeight: 14,
  },
  emptyInner: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 14,
  },
  emptyIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: T.accentDim,
    borderWidth: 1,
    borderColor: "rgba(200,241,53,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyHeadline: {
    fontSize: 17,
    fontWeight: "700",
    color: T.text,
    letterSpacing: -0.2,
  },
  emptyBody: {
    fontSize: 13,
    color: T.muted,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 260,
  },
});

// ─── Example Data ─────────────────────────────────────────────────────────────

export const EXAMPLE_PR_DATA: PersonalRecordData = {
  exerciseName: "Bodyweight Squat",
  value: 20,
  unit: "REPS",
  caption: "New Record",
  improvement: 5,
  improvementUnit: "REPS",
  isNewPR: true,
  history: [
    { label: "Jan 20", value: 4 },
    { label: "Feb 10", value: 6 },
    { label: "Mar 03", value: 11 },
    { label: "Mar 25", value: 14 },
    { label: "Apr 16", value: 16 },
    { label: "Today", value: 20, isToday: true },
  ],
  insight: {
    headline: "Keep it up! You're getting stronger.",
    body: "Consistency is building results.",
  },
};

export default PersonalRecordCard;
