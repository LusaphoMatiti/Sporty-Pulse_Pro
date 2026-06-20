/**
 * SessionProgressRing
 *
 * Circular progress ring for the Today's Session card.
 * Shows "N / of total" in the centre with a lime-green arc that represents
 * how far through the plan the user is (sessionNumber / totalSessions).
 *
 * The arc animates from 0 → progress on mount.
 *
 * File location: src/components/home/SessionProgressRing.tsx
 */

import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withDelay,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

import { SPText } from "../ui/SPText";
import { useAppTheme } from "../../theme/ThemeContext";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SessionProgressRingProps {
  /** 1-based session number */
  sessionNumber: number;
  /** Total sessions in the plan */
  totalSessions: number;
  /** Outer diameter of the ring in dp */
  size?: number;
  /** Stroke thickness */
  strokeWidth?: number;
  /** ms delay before ring animates */
  entranceDelay?: number;
}

// ─── Animated Circle ──────────────────────────────────────────────────────────

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ─── SessionProgressRing ──────────────────────────────────────────────────────

export function SessionProgressRing({
  sessionNumber,
  totalSessions,
  size = 72,
  strokeWidth = 5,
  entranceDelay = 0,
}: SessionProgressRingProps) {
  const { theme } = useAppTheme();

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = totalSessions > 0 ? (sessionNumber - 1) / totalSessions : 0;

  // Animate strokeDashoffset from circumference (empty) → target offset
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withDelay(
      entranceDelay,
      withTiming(progress, {
        duration: 700,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [progress, entranceDelay]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  const center = size / 2;

  // Track colour: dark circle behind the accent arc
  const trackColor = theme.surface2 ?? "#2a2a2a";
  const arcColor = theme.accent; // lime green

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        {/* Background track */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress arc */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={arcColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          // Start arc from the top (12 o'clock) by rotating -90 degrees
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </Svg>

      {/* Centre labels */}
      <View style={styles.labelContainer}>
        <SPText variant="h2" style={[styles.numberText, { color: theme.text }]}>
          {sessionNumber}
        </SPText>
        <SPText
          variant="caption"
          style={[styles.ofText, { color: theme.muted }]}
        >
          of {totalSessions}
        </SPText>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  labelContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  numberText: {
    fontSize: 22,
    lineHeight: 26,
    fontFamily: "Barlow-Bold",
  },
  ofText: {
    fontSize: 10,
    lineHeight: 12,
    fontFamily: "Barlow-Regular",
    marginTop: -1,
  },
});
