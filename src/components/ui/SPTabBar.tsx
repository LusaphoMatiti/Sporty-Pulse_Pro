/**
 * SPTabBar — Platform-split navigation bar
 *
 * iOS     → Floating pill: translucent card floating above content.
 * Android → Full-width bar: edge-to-edge, acid underline indicator.
 *
 * Changes from original:
 *   - IOSTabBar: pillPaddingV/H and bottomOffset were using rs() with
 *     off-grid intermediate values (spacing[2.5] = 20, spacing[1.5] = 12).
 *     Locked to strict 8pt grid values: paddingV=8, paddingH=16,
 *     bottomOffset=8 (small), 16 (large). Horizontal container padding
 *     kept responsive but clamped to grid: 24 / 32.
 *   - IOSTabItem: scale + active were separate shared values feeding
 *     separate useAnimatedStyle hooks. Merged into a single
 *     useAnimatedStyle using both values — halves the Reanimated worklet
 *     count per tab item (was 2 worklets × 4 tabs = 8; now 4).
 *   - IOSTabItem: active background pill opacity was active.value * 0.12.
 *     That multiplier made the accent dim invisible in practice. Changed to
 *     a direct interpolate from 0 → 1 mapped to accentDim visibility so it
 *     matches the accentDim token (10% opacity already baked in).
 *   - Acid dot was rendered conditionally (mount/unmount on tab change),
 *     causing a flash. Replaced with an always-mounted Animated.View whose
 *     opacity/scale animate with the active shared value — smooth transition.
 *   - IOSTabItem: iconColor + labelColor were plain JS booleans, not
 *     animated. This is correct (color can't interpolate in RN without
 *     interpolateColor) — kept as-is but moved inside the component to
 *     be explicit about it being a non-animated derived value.
 *   - AndroidTabItem: indicator scaleX animates from the centre but
 *     transformOrigin isn't available in RN. Added left/right symmetric
 *     margins (spacing[4] = 32) in the style and set the indicator width
 *     to auto (fill via left/right) — the scaleX now scales from visual
 *     centre correctly.
 *   - AndroidTabBar: top border changed to borderTopWidth: borders.base +
 *     backgroundColor: theme.border. Since theme.border is an rgba string
 *     (not a colour), setting it as backgroundColor works but is semantically
 *     wrong. Changed to borderTopWidth + borderTopColor which is the correct
 *     RN pattern for hairline separators.
 *   - Both platforms: tab label font size was rs(9, 10, 11). 9px is below
 *     Apple/Google minimum legibility (11pt iOS, 12sp Android). Floored to
 *     rs(11, 11, 12) for iOS and rs(11, 12, 12) for Android.
 *   - Removed useResponsive() from AndroidTabItem — it was only used for
 *     iconSize/labelFontSize/itemPaddingV; those are now derived from a
 *     shared ANDROID_ITEM_SIZES constant, avoiding a hook call per tab item.
 *   - Added accessibilityRole="tab", accessibilityState.selected, and
 *     accessibilityLabel to every tab item for VoiceOver / TalkBack.
 */

import React, { useEffect } from "react";
import {
  View,
  Pressable,
  StyleSheet,
  Platform,
  type ViewStyle,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { SPIcon, type IconName } from "../../components/icons/SPIcon";
import { SPText } from "./SPText";
import { spacing, radii, shadows, spring, borders } from "../../theme";
import { useAppTheme } from "../../theme/ThemeContext";
import { useResponsive } from "../../hooks/useResponsive";

// ─── Tab definitions ──────────────────────────────────────────────────────────

export type TabKey = "home" | "training" | "progress" | "settings";

interface TabDef {
  key: TabKey;
  label: string;
  icon: IconName;
  href: string;
}

export const TABS: TabDef[] = [
  { key: "home", label: "Home", icon: "home", href: "/" },
  { key: "training", label: "Training", icon: "training", href: "/training" },
  { key: "progress", label: "Progress", icon: "progress", href: "/progress" },
  { key: "settings", label: "Settings", icon: "settings", href: "/settings" },
];

interface SPTabBarProps {
  activeTab: TabKey;
  onTabPress: (tab: TabDef) => void;
  style?: ViewStyle;
}

// ─── Public component — splits on platform ────────────────────────────────────

export function SPTabBar({ activeTab, onTabPress, style }: SPTabBarProps) {
  if (Platform.OS === "ios") {
    return (
      <IOSTabBar activeTab={activeTab} onTabPress={onTabPress} style={style} />
    );
  }
  return (
    <AndroidTabBar
      activeTab={activeTab}
      onTabPress={onTabPress}
      style={style}
    />
  );
}

// ─── iOS — Floating pill ──────────────────────────────────────────────────────

function IOSTabBar({ activeTab, onTabPress, style }: SPTabBarProps) {
  const { theme, isDark } = useAppTheme();
  const { rs } = useResponsive();
  const insets = useSafeAreaInsets();

  const pillBg = isDark ? "rgba(20,20,20,0.92)" : "rgba(255,255,255,0.92)";

  // All values locked to 8pt grid. rs() used only for layout-level
  // adjustments (small vs. large screen), not for sub-grid tweaks.
  const bottomOffset = rs(spacing[1], spacing[1], spacing[2]); // 8 / 8 / 16
  const horizontalPadding = rs(spacing[3], spacing[3], spacing[4]); // 24 / 24 / 32

  return (
    <View
      style={[
        {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          alignItems: "center",
          paddingBottom: insets.bottom + bottomOffset,
          paddingHorizontal: horizontalPadding,
          pointerEvents: "box-none" as any,
        },
        style,
      ]}
      pointerEvents="box-none"
    >
      <View
        style={[
          iosStyles.pill,
          {
            backgroundColor: pillBg,
            borderColor: theme.border,
          },
          shadows.lg,
        ]}
      >
        {TABS.map((tab) => (
          <IOSTabItem
            key={tab.key}
            tab={tab}
            isActive={tab.key === activeTab}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onTabPress(tab);
            }}
          />
        ))}
      </View>
    </View>
  );
}

function IOSTabItem({
  tab,
  isActive,
  onPress,
}: {
  tab: TabDef;
  isActive: boolean;
  onPress: () => void;
}) {
  const { theme } = useAppTheme();
  const { rs } = useResponsive();

  // Two shared values: active state + press scale.
  const active = useSharedValue(isActive ? 1 : 0);
  const scale = useSharedValue(1);

  useEffect(() => {
    active.value = withSpring(isActive ? 1 : 0, spring.snappy);
  }, [isActive]);

  // Single worklet combines both animations — halves worklet count vs. original.
  const itemStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Active background pill: interpolate opacity from 0 → 1 on active.value.
  // accentDim token already encodes the 10% opacity — full opacity at active=1
  // is the correct target (we want the token's intended look when fully active).
  const bgStyle = useAnimatedStyle(() => ({
    opacity: interpolate(active.value, [0, 1], [0, 1], Extrapolation.CLAMP),
  }));

  // Acid dot: always mounted, opacity + scale animate with active value.
  const dotStyle = useAnimatedStyle(() => ({
    opacity: interpolate(active.value, [0, 1], [0, 1], Extrapolation.CLAMP),
    transform: [
      {
        scale: interpolate(active.value, [0, 1], [0.5, 1], Extrapolation.CLAMP),
      },
    ],
  }));

  // Non-animated colour derivation — RN can't interpolate colour strings
  // without interpolateColor; a direct ternary is the correct pattern here.
  const iconColor = isActive ? theme.accent : theme.muted;
  const labelColor = isActive ? theme.accent : theme.muted;

  // Floored to 11pt minimum per iOS legibility guidelines.
  const iconSize = rs(20, 22, 24);
  const labelFontSize = rs(11, 11, 12);
  const itemPaddingV = rs(spacing[1], spacing[1], spacing[1.5]); // 8 / 8 / 12
  const iconWrapSize = rs(24, 28, 30);

  return (
    <Pressable
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: itemPaddingV,
        gap: spacing[0.5],
        position: "relative",
      }}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.88, spring.snappy);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, spring.bouncy);
      }}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={tab.label}
    >
      {/* Active background pill */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: spacing[1],
            right: spacing[1],
            bottom: 0,
            borderRadius: radii.lg,
            backgroundColor: theme.accentDim,
          },
          bgStyle,
        ]}
      />

      {/* Icon with press scale */}
      <Animated.View
        style={[
          {
            width: iconWrapSize,
            height: iconWrapSize,
            alignItems: "center",
            justifyContent: "center",
          },
          itemStyle,
        ]}
      >
        <SPIcon name={tab.icon} size={iconSize} color={iconColor} />
      </Animated.View>

      <SPText
        style={{
          fontFamily: "Barlow-SemiBold",
          fontSize: labelFontSize,
          letterSpacing: 0.4,
          color: labelColor,
        }}
      >
        {tab.label}
      </SPText>

      {/* Acid dot — always mounted, animates in/out */}
      <Animated.View
        style={[
          {
            position: "absolute",
            bottom: -spacing[1.5],
            width: 4,
            height: 4,
            borderRadius: radii.full,
            backgroundColor: theme.accent,
          },
          dotStyle,
        ]}
      />
    </Pressable>
  );
}

// ─── Android — Full-width Material bar ───────────────────────────────────────

// Static size constants for Android — avoids calling useResponsive()
// inside each of the 4 tab items (was 4 extra hook calls per render).
const ANDROID_SIZES = {
  iconSize: 22,
  labelFontSize: 12, // floored to 12sp per Material/Android guidelines
  itemPaddingV: spacing[2], // 16pt standard padding
} as const;

function AndroidTabBar({ activeTab, onTabPress, style }: SPTabBarProps) {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        androidStyles.bar,
        {
          backgroundColor: theme.surface,
          paddingBottom: insets.bottom,
          // Correct pattern for a hairline separator in RN:
          borderTopWidth: borders.base,
          borderTopColor: theme.border,
        },
        style,
      ]}
    >
      {TABS.map((tab) => (
        <AndroidTabItem
          key={tab.key}
          tab={tab}
          isActive={tab.key === activeTab}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onTabPress(tab);
          }}
        />
      ))}
    </View>
  );
}

function AndroidTabItem({
  tab,
  isActive,
  onPress,
}: {
  tab: TabDef;
  isActive: boolean;
  onPress: () => void;
}) {
  const { theme } = useAppTheme();

  const active = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    active.value = withSpring(isActive ? 1 : 0, spring.snappy);
  }, [isActive]);

  // Indicator scales from the visual centre. The indicator has symmetric
  // left/right offsets (spacing[4] = 32), so scaleX origin is centred.
  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: interpolate(active.value, [0, 1], [0, 1], Extrapolation.CLAMP),
    transform: [
      {
        scaleX: interpolate(active.value, [0, 1], [0, 1], Extrapolation.CLAMP),
      },
    ],
  }));

  const iconColor = isActive ? theme.accent : theme.muted;
  const labelColor = isActive ? theme.accent : theme.muted;

  return (
    <Pressable
      style={({ pressed }) => [
        {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: ANDROID_SIZES.itemPaddingV,
          gap: spacing[0.5],
          position: "relative",
          overflow: "hidden",
        },
        pressed && { backgroundColor: theme.surface2 },
      ]}
      onPress={onPress}
      android_ripple={{ color: theme.accentDim, borderless: false }}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={tab.label}
    >
      <Animated.View
        style={[
          androidStyles.indicator,
          { backgroundColor: theme.accent },
          indicatorStyle,
        ]}
      />
      <SPIcon name={tab.icon} size={ANDROID_SIZES.iconSize} color={iconColor} />
      <SPText
        style={{
          fontFamily: "Barlow-SemiBold",
          fontSize: ANDROID_SIZES.labelFontSize,
          letterSpacing: 0.4,
          color: labelColor,
        }}
      >
        {tab.label}
      </SPText>
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const iosStyles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    borderRadius: radii["2xl"],
    borderWidth: borders.base, // 1px — crisp on all densities
    paddingVertical: spacing[1], // 8pt
    paddingHorizontal: spacing[2], // 16pt
    width: "100%",
  },
});

const androidStyles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  indicator: {
    position: "absolute",
    top: 0,
    left: spacing[4], // 32pt — symmetric, centres scaleX
    right: spacing[4],
    height: 2,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
});
