import React, { useEffect, useMemo, useRef } from "react";
import {
  View,
  Pressable,
  StyleSheet,
  Platform,
  AccessibilityInfo,
  useWindowDimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Home, Dumbbell, TrendingUp, Settings } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../../theme/ThemeContext";

// ─── Theme ──────────────────────────────────────────────────────────────────
// Colors come from useAppTheme() (your darkTheme/lightTheme tokens), not a
// hardcoded palette — this shape just describes what SPTabBar consumes from
// whichever theme object the context hands back.

interface SPTheme {
  bg: string;
  surface: string;
  surface2: string;
  border: string;
  text: string;
  muted: string;
  muted2: string;
  accent: string;
  accentDim: string;
  void: string;
  raised: string;
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ─── Types ──────────────────────────────────────────────────────────────────

export type TabKey = "home" | "training" | "progress" | "settings";

export interface TabDef {
  key: TabKey;
  href: string;
  label: string;
}

const TABS: TabDef[] = [
  { key: "home", href: "/(tabs)", label: "Home" },
  { key: "training", href: "/(tabs)/training", label: "Training" },
  { key: "progress", href: "/(tabs)/progress", label: "Progress" },
  { key: "settings", href: "/(tabs)/settings", label: "Settings" },
];

const ICONS: Record<TabKey, React.ComponentType<any>> = {
  home: Home,
  training: Dumbbell,
  progress: TrendingUp,
  settings: Settings,
};

const ANIM_DURATION = 220;

// Layout constants — exported so other screens can compute the bar's
// total footprint (see hooks/useTabBarHeight.ts) without hardcoding
// these numbers a second time and silently drifting out of sync.
export const TAB_BAR_CONTAINER_HEIGHT = 90;
export const TAB_BAR_WRAPPER_MARGIN_TOP = 4;
export const TAB_BAR_MIN_BOTTOM_INSET = 12;
export const TAB_BAR_BOTTOM_GAP = 8;

// ─── Single Tab Item ────────────────────────────────────────────────────────

interface SPTabItemProps {
  tab: TabDef;
  isActive: boolean;
  onPress: (tab: TabDef) => void;
  reducedMotion: boolean;
  theme: SPTheme;
}

function SPTabItem({
  tab,
  isActive,
  onPress,
  reducedMotion,
  theme,
}: SPTabItemProps) {
  const Icon = ICONS[tab.key];

  const progress = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isActive ? 1 : 0, {
      duration: reducedMotion ? 0 : ANIM_DURATION,
      easing: Easing.out(Easing.quad),
    });
  }, [isActive, reducedMotion, progress]);

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scaleX: 0.4 + progress.value * 0.6 }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.08,
  }));

  const iconStyle = useAnimatedStyle(() => ({
    opacity: 0.55 + progress.value * 0.45,
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: 0.55 + progress.value * 0.45,
  }));

  return (
    <Pressable
      onPress={() => onPress(tab)}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={tab.label}
      hitSlop={8}
      style={styles.tabItem}
    >
      <View style={styles.indicatorSlot}>
        <Animated.View
          style={[
            styles.indicator,
            { backgroundColor: theme.accent },
            indicatorStyle,
          ]}
        />
      </View>

      <View style={styles.iconSlot}>
        <Animated.View
          style={[
            styles.iconGlow,
            { backgroundColor: theme.accent },
            glowStyle,
          ]}
        />
        <Animated.View style={iconStyle}>
          <Icon
            size={22}
            strokeWidth={1.8}
            color={isActive ? theme.accent : theme.muted2}
          />
        </Animated.View>
      </View>

      <Animated.Text
        style={[
          styles.label,
          { color: isActive ? theme.text : theme.muted },
          labelStyle,
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
      >
        {tab.label.toUpperCase()}
      </Animated.Text>
    </Pressable>
  );
}

// ─── Bottom Tab Bar ─────────────────────────────────────────────────────────

interface SPTabBarProps {
  activeTab: TabKey;
  onTabPress: (tab: TabDef) => void;
}

export function SPTabBar({ activeTab, onTabPress }: SPTabBarProps) {
  const { theme, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then((v) => {
        reducedMotionRef.current = !!v;
      })
      .catch(() => {});
  }, []);

  const horizontalMargin = width < 360 ? 8 : width > 600 ? 32 : 12;
  const innerPaddingH = width < 360 ? 4 : 8;
  // Safe-area inset is consumed HERE, as real layout space, not as an
  // absolute offset — this is what reserves the bar's own footprint
  // below the screen content instead of floating over it.
  // The extra +8 is deliberate breathing room below the bar itself
  // (on top of whatever the device's safe area already requires) —
  // tune this single number to adjust the bottom gap.
  const bottomInset =
    Math.max(insets.bottom, TAB_BAR_MIN_BOTTOM_INSET) + TAB_BAR_BOTTOM_GAP;

  // Surface overlay: dark theme's surface (#13171A) becomes the original
  // "rgba(19,23,26,0.92)" look; light theme's surface (#FFFFFF) becomes a
  // matching translucent white instead of staying hardcoded to dark.
  // Shadow is heavier in dark mode (reads as depth on a near-black bg) and
  // lighter in light mode (a strong dark shadow on a white bg looks muddy).
  const dynamicContainerStyle = useMemo(
    () => ({
      backgroundColor: hexToRgba(theme.surface, 0.92),
      borderColor: theme.border,
      ...Platform.select({
        ios: { shadowOpacity: isDark ? 0.28 : 0.1 },
        android: { elevation: isDark ? 10 : 4 },
      }),
    }),
    [theme.surface, theme.border, isDark],
  );

  return (
    <View
      style={[
        styles.wrapper,
        {
          marginHorizontal: horizontalMargin,
          marginTop: TAB_BAR_WRAPPER_MARGIN_TOP,
          paddingBottom: bottomInset,
          // Transparent on purpose — this wrapper is only spacing
          // (margin/padding) around the bar, not a painted surface.
          // No backgroundColor here means content scrolling underneath
          // shows through instead of being covered by a solid block.
        },
      ]}
    >
      <View
        style={[
          styles.container,
          dynamicContainerStyle,
          { paddingHorizontal: innerPaddingH },
        ]}
        accessibilityRole="tablist"
      >
        {TABS.map((tab, idx) => (
          <React.Fragment key={tab.key}>
            <SPTabItem
              tab={tab}
              isActive={activeTab === tab.key}
              onPress={onTabPress}
              reducedMotion={reducedMotionRef.current}
              theme={theme}
            />
            {idx < TABS.length - 1 && (
              <View
                style={[styles.divider, { backgroundColor: theme.border }]}
              />
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

export default SPTabBar;

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: "stretch",
  },
  container: {
    flexDirection: "row",
    alignItems: "stretch",
    height: TAB_BAR_CONTAINER_HEIGHT,
    borderRadius: 34,
    borderWidth: 1,
    paddingVertical: 10,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 22,
      },
      android: {},
    }),
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  divider: {
    width: 1,
    alignSelf: "center",
    height: "42%",
  },
  indicatorSlot: {
    height: 5,
    justifyContent: "center",
    marginBottom: 6,
  },
  indicator: {
    width: 32,
    height: 3,
    borderRadius: 999,
  },
  iconSlot: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  iconGlow: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  label: {
    fontSize: 10,
    letterSpacing: 1.8,
    fontWeight: "600",
    textAlign: "center",
    paddingHorizontal: 2,
  },
});
