/**
 * WelcomeBackScreen — Sporty Pulse
 *
 * Shown to returning users after Google OAuth login.
 * Mirrors the Next.js /welcome-back page.
 *
 * Flow: Login (OAuth or credentials) → WelcomeBackScreen → Home tabs
 *
 * File location: src/screens/auth/WelcomeBackScreen.tsx
 * Expo Router:   src/app/welcome-back.tsx
 */

import React, { useEffect } from "react";
import { View, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from "react-native-reanimated";

import { SPText } from "../components/ui/SPText";
import { SPButton } from "../components/ui/SPButton";
import {
  colors,
  spacing,
  radii,
  borders,
  fonts,
  layout,
  spring,
} from "../theme";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WelcomeBackScreenProps {
  firstName?: string;
  email?: string;
}

// ─── Main WelcomeBackScreen ───────────────────────────────────────────────────

export function WelcomeBackScreen({
  firstName = "Athlete",
  email = "",
}: WelcomeBackScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Staggered entrance animations
  const op0 = useSharedValue(0);
  const ty0 = useSharedValue(30);
  const op1 = useSharedValue(0);
  const ty1 = useSharedValue(30);
  const op2 = useSharedValue(0);
  const ty2 = useSharedValue(30);
  const op3 = useSharedValue(0);
  const ty3 = useSharedValue(30);

  useEffect(() => {
    const ease = { duration: 400, easing: Easing.out(Easing.cubic) };
    op0.value = withTiming(1, ease);
    ty0.value = withSpring(0, spring.smooth);
    op1.value = withDelay(120, withTiming(1, ease));
    ty1.value = withDelay(120, withSpring(0, spring.smooth));
    op2.value = withDelay(240, withTiming(1, ease));
    ty2.value = withDelay(240, withSpring(0, spring.smooth));
    op3.value = withDelay(360, withTiming(1, ease));
    ty3.value = withDelay(360, withSpring(0, spring.smooth));
  }, []);

  const a0 = useAnimatedStyle(() => ({
    opacity: op0.value,
    transform: [{ translateY: ty0.value }],
  }));
  const a1 = useAnimatedStyle(() => ({
    opacity: op1.value,
    transform: [{ translateY: ty1.value }],
  }));
  const a2 = useAnimatedStyle(() => ({
    opacity: op2.value,
    transform: [{ translateY: ty2.value }],
  }));
  const a3 = useAnimatedStyle(() => ({
    opacity: op3.value,
    transform: [{ translateY: ty3.value }],
  }));

  function handleContinue() {
    router.replace("/(tabs)" as any);
  }

  return (
    <View
      style={[
        styles.fill,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.bg} />

      <View
        style={[styles.inner, { paddingHorizontal: layout.screenPaddingH }]}
      >
        {/* Top section */}
        <View style={styles.top}>
          {/* Logo */}
          <Animated.View style={[a0]}>
            <Image
              source={require("../../assets/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Heading */}
          <Animated.View style={[styles.headingWrap, a1]}>
            <SPText style={styles.eyebrow}>Welcome back</SPText>
            <SPText style={styles.h1}>
              {"Good to see\nyou again,\n"}
              <SPText style={[styles.h1, { color: colors.acid }]}>
                {firstName}.
              </SPText>
            </SPText>
            <SPText style={styles.sub}>Ready to get back to work?</SPText>
          </Animated.View>

          {/* Info card */}
          <Animated.View style={[styles.card, a2]}>
            <SPText style={styles.cardEyebrow}>Signed in as</SPText>
            <SPText style={styles.cardEmail}>{email}</SPText>
            <View style={styles.divider} />
            <SPText style={styles.cardTagline}>
              Keep your streak going. Your body remembers.
            </SPText>
          </Animated.View>
        </View>

        {/* CTA */}
        <Animated.View style={[styles.cta, a3]}>
          <SPButton onPress={handleContinue}>Continue Training</SPButton>
        </Animated.View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: "#000" },

  bg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#050505",
  },

  inner: {
    flex: 1,
    justifyContent: "space-between",
    paddingTop: spacing[8],
    paddingBottom: spacing[6],
  },

  top: { gap: spacing[8] },

  logo: {
    width: 60,
    height: 60,
    marginTop: 10,
    borderRadius: 14,
  },

  headingWrap: { gap: spacing[2] },
  eyebrow: {
    fontSize: 11,
    letterSpacing: 2.5,
    textTransform: "uppercase",
    color: colors.acid,
    fontFamily: fonts.brandMedium,
  },
  h1: {
    fontSize: 42,
    lineHeight: 46,
    fontFamily: fonts.brandBold,
    color: colors.white,
    letterSpacing: -0.5,
  },
  sub: {
    color: colors.white40,
    fontSize: 14,
    fontFamily: fonts.brandRegular,
    lineHeight: 20,
    paddingTop: spacing[1],
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: borders.thin,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: radii.xl,
    padding: spacing[5],
    gap: spacing[3],
  },
  cardEyebrow: {
    fontSize: 11,
    letterSpacing: 2.5,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.5)",
    fontFamily: fonts.brandMedium,
  },
  cardEmail: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontFamily: fonts.brandRegular,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  cardTagline: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    fontFamily: fonts.brandRegular,
    lineHeight: 18,
  },

  cta: { paddingTop: spacing[8] },
});
