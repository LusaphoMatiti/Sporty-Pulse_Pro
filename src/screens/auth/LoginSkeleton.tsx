import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions, ImageBackground } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SPLogo } from "../../components/settings/SPLogo";
import { SPText } from "../../components/ui/SPText";

// Design tokens (must mirror LoginScreen)

const T = {
  bg: "#0C0E10",
  surface: "#13171A",
  shimmerBase: "#1A1F23",
  shimmerHighlight: "#25292E",
  text: "#F0EDE4",
  accent: "#C8F135",
  s4: 4,
  s8: 8,
  s12: 12,
  s16: 16,
  s20: 20,
  s24: 24,
  s32: 32,
  s48: 48,
  r8: 8,
  r12: 12,
  r16: 16,
};

const { height: SCREEN_H } = Dimensions.get("window");
const isSmall = SCREEN_H < 668;
const isLarge = SCREEN_H > 900;
const HERO_FLEX = isSmall ? 0.52 : isLarge ? 0.58 : 0.55;
const SHEET_FLEX = 1 - HERO_FLEX;
const SHEET_OVERLAP = 72;

// Shimmer bar

function Shimmer({
  width,
  height,
  borderRadius = T.r8,
  style,
}: {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
}) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, []);

  const aStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: T.shimmerHighlight,
        },
        aStyle,
        style,
      ]}
    />
  );
}

//  LoginSkeleton

export function LoginSkeleton() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      {/* Hero */}
      <View style={{ flex: HERO_FLEX }}>
        <ImageBackground
          source={require("../../../assets/squat.jpg")}
          style={styles.imageBg}
          resizeMode="cover"
        >
          <View
            style={[
              styles.overlay,
              { paddingTop: Math.max(insets.top + T.s16, T.s48) },
            ]}
          >
            <SPLogo />
            <View style={styles.heroText}>
              <SPText style={styles.h1Accent}>Sporty Pulse Pro</SPText>
              <SPText style={styles.subtext}>Every Session Counts.</SPText>
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* Sheet skeleton */}
      <View
        style={[
          styles.bottomSheet,
          { flex: SHEET_FLEX, marginTop: -SHEET_OVERLAP },
        ]}
      >
        {/* Drag handle */}
        <View style={styles.dragHandleRow}>
          <View style={styles.dragHandle} />
        </View>

        <View
          style={[
            styles.content,
            { paddingBottom: Math.max(insets.bottom + T.s16, T.s24) },
          ]}
        >
          {/* Title */}
          <Shimmer width={80} height={28} borderRadius={6} />

          {/* Input fields */}
          <View style={styles.fields}>
            <Shimmer width="100%" height={52} borderRadius={T.r12} />
            <Shimmer width="100%" height={52} borderRadius={T.r12} />
          </View>

          {/* Forgot password */}
          <Shimmer
            width={110}
            height={14}
            borderRadius={4}
            style={styles.forgotSkeleton}
          />

          {/* Primary button */}
          <Shimmer width="100%" height={52} borderRadius={T.r16} />

          {/* "or continue with" */}
          <Shimmer
            width={100}
            height={12}
            borderRadius={4}
            style={styles.orSkeleton}
          />

          {/* Google button */}
          <Shimmer width="100%" height={52} borderRadius={T.r16} />

          {/* Footer */}
          <View style={styles.footer}>
            <Shimmer width={160} height={12} borderRadius={4} />
          </View>
        </View>
      </View>
    </View>
  );
}

//  Styles

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },
  imageBg: { flex: 1 },
  overlay: {
    flex: 1,
    paddingHorizontal: T.s16,
    justifyContent: "flex-start",
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  heroText: { marginTop: T.s32, gap: T.s8 },
  h1Accent: {
    fontFamily: "Barlow-Bold",
    fontSize: isSmall ? 26 : 30,
    color: T.accent,
  },
  subtext: {
    fontFamily: "Barlow-SemiBold",
    fontSize: 16,
    color: T.text,
    marginTop: T.s4,
  },
  bottomSheet: {
    backgroundColor: T.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 16,
  },
  dragHandleRow: { alignItems: "center", paddingTop: 10, paddingBottom: 4 },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  content: {
    flex: 1,
    paddingHorizontal: T.s24,
    paddingTop: T.s16,
    gap: T.s20,
  },
  fields: { gap: T.s16 },
  forgotSkeleton: { alignSelf: "flex-end", marginTop: -T.s8 },
  orSkeleton: { alignSelf: "center" },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: T.s8,
  },
});
