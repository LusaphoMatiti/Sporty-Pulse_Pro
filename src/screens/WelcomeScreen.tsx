/**
 * WelcomeScreen — Sporty Pulse
 *
 * Shown to brand-new users after Google OAuth or email registration.
 * Mirrors the Next.js /welcome page.
 *
 * Flow: Register → WelcomeScreen → Onboarding → Home
 *
 * File location: src/screens/auth/WelcomeScreen.tsx
 * Expo Router:   src/app/welcome.tsx
 */

import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ImageBackground,
  Image,
} from "react-native";
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
import { api } from "../lib/api";
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

interface WelcomeScreenProps {
  firstName?: string;
}

// ─── Step row ─────────────────────────────────────────────────────────────────

function NextStep({ step, text }: { step: string; text: string }) {
  return (
    <View style={styles.stepRow}>
      <SPText style={styles.stepNumber}>{step}</SPText>
      <SPText variant="bodyMd" style={styles.stepText}>
        {text}
      </SPText>
    </View>
  );
}

// ─── Main WelcomeScreen ───────────────────────────────────────────────────────

export function WelcomeScreen({ firstName = "Athlete" }: WelcomeScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = React.useState(false);

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

  async function handleLetsGo() {
    setLoading(true);
    try {
      // Mark the user as no longer "new" on the server (mirrors /api/auth/complete-welcome)
      await api.post("/api/auth/complete-welcome", {});
    } catch {
      // Non-fatal — proceed regardless
    } finally {
      setLoading(false);
    }
    router.replace("/onboarding" as any);
  }

  return (
    <View
      style={[
        styles.fill,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      {/* Dark gradient background — replace with ImageBackground if you have inbound.jpg in assets */}
      <View style={styles.bg} />
      <View style={styles.overlay} />

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
            <SPText style={styles.eyebrow}>Account created</SPText>
            <SPText style={styles.h1}>
              {"Welcome to\n"}
              <SPText style={[styles.h1, { color: colors.acid }]}>
                Sporty Pulse
              </SPText>
              {",\n"}
              {firstName}.
            </SPText>
            <SPText style={styles.sub}>
              Your training journey starts right now. Let's build something
              great.
            </SPText>
          </Animated.View>

          {/* What's next card */}
          <Animated.View style={[styles.card, a2]}>
            <SPText style={styles.cardEyebrow}>What's next</SPText>
            <NextStep step="01" text="Pick your equipment" />
            <NextStep step="02" text="Choose your level" />
            <NextStep step="03" text="Start your first session" />
          </Animated.View>
        </View>

        {/* CTA */}
        <Animated.View style={[styles.cta, a3]}>
          <SPButton onPress={handleLetsGo} loading={loading}>
            Let's Go
          </SPButton>
        </Animated.View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: "#000" },

  // Full-screen dark gradient (matches Next.js bg-linear-to-b from-black/95...)
  bg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#050505",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    // Simulate the gradient with a subtle lighter centre — looks great without images
    backgroundColor: "transparent",
  },

  inner: {
    flex: 1,
    justifyContent: "space-between",
    paddingTop: spacing[8],
    paddingBottom: spacing[6],
  },

  top: { gap: spacing[8] },

  headingWrap: { gap: spacing[2] },
  logo: {
    width: 60,
    height: 60,
    marginTop: 10,
    borderRadius: 14,
  },
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

  // Card
  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: borders.thin,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: radii.xl,
    padding: spacing[5],
    gap: spacing[4],
  },
  cardEyebrow: {
    fontSize: 11,
    letterSpacing: 2.5,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.5)",
    fontFamily: fonts.brandMedium,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
  },
  stepNumber: {
    fontFamily: fonts.brandBold,
    color: colors.acid,
    fontSize: 13,
    width: 24,
  },
  stepText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontFamily: fonts.brandRegular,
  },

  cta: { paddingTop: spacing[8] },
});
