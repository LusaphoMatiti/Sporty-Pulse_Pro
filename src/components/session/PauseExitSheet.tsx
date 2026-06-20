/**
 * PauseExitSheet
 *
 * Premium iOS-style bottom sheet shown on back/pause during a session.
 * Reanimated-driven with spring physics, drag-to-dismiss, and backdrop.
 *
 * Design system:
 *  - 8pt grid: 4 / 8 / 16 / 24 / 32 / 48
 *  - Barlow only, 5 type levels
 *  - Button min-height 48–56, border-radius 12–16
 *  - Motion: 150–250 ms, scale 0.97 on press
 */

import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
  Platform,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SPText } from "../../components/ui/SPText";
import { useAppTheme } from "../../theme/ThemeContext";
import { useResponsive } from "../../hooks/useResponsive";

// ── 8pt spacing scale ─────────────────────────────────────────────────────────
const SP = {
  micro: 4,
  tight: 8,
  base: 16,
  section: 24,
  large: 32,
  major: 48,
} as const;

const RADIUS = { sheet: 24, button: 14, buttonSm: 12 } as const;

// ── Spring / timing presets ───────────────────────────────────────────────────
const SPRING_OPEN = { damping: 26, stiffness: 300, mass: 0.9 };
const SPRING_CLOSE = { damping: 28, stiffness: 400, mass: 0.7 };
const SHEET_HIDDEN = 520;
const DRAG_DISMISS_THRESHOLD = 100;

// ── Animated pressable button ─────────────────────────────────────────────────
interface SheetButtonProps {
  onPress: () => void | Promise<void>;
  variant: "primary" | "danger" | "ghost";
  children: React.ReactNode;
  theme: any;
  rs: (...args: number[]) => number;
}

function SheetButton({
  onPress,
  variant,
  children,
  theme,
  rs,
}: SheetButtonProps) {
  const scale = useSharedValue(1);
  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 350 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 350 });
  };

  const buttonHeight = rs(48, 52, 52, 56);
  const fontSize = rs(14, 14, 16, 16);

  const variantStyles: Record<string, object> = {
    primary: {
      backgroundColor: theme.accent,
    },
    danger: {
      backgroundColor: "rgba(255,59,48,0.12)",
      borderWidth: 1,
      borderColor: "rgba(255,59,48,0.25)",
    },
    ghost: {
      backgroundColor: theme.surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },
  };

  const variantTextColors: Record<string, string> = {
    primary: theme.void,
    danger: "#FF3B30",
    ghost: theme.text,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View
        style={[
          styles.button,
          {
            height: buttonHeight,
            borderRadius: RADIUS.button,
            ...variantStyles[variant],
          },
          scaleStyle,
        ]}
      >
        <SPText
          variant="bodyMd"
          style={{
            color: variantTextColors[variant],
            fontSize,
            fontFamily: "Barlow_600SemiBold",
            letterSpacing: 0.1,
          }}
        >
          {children}
        </SPText>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PauseExitSheet
// ─────────────────────────────────────────────────────────────────────────────
interface PauseExitSheetProps {
  visible: boolean;
  onResume: () => void;
  onSaveDraftAndLeave: () => Promise<void>;
  onEndAndSave: () => void;
}

export function PauseExitSheet({
  visible,
  onResume,
  onSaveDraftAndLeave,
  onEndAndSave,
}: PauseExitSheetProps) {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { rs } = useResponsive();
  const translateY = useSharedValue(SHEET_HIDDEN);
  const backdropOpacity = useSharedValue(0);

  // ── Responsive tokens ────────────────────────────────────────────────────
  const sheetPadH = rs(SP.base, SP.section, SP.section, SP.large);
  const sheetPadT = rs(SP.base, SP.base, SP.section, SP.section);
  const titleMb = rs(SP.large, SP.large, SP.large, SP.major);
  const actionsGap = rs(SP.tight, SP.tight, SP.base, SP.base);
  const h1Size = rs(26, 28, 28, 32);
  const captionSize = rs(12, 12, 13, 14);
  const bodySize = rs(14, 14, 16, 16);

  // ── Animate open / close ─────────────────────────────────────────────────
  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, { duration: 200 });
      translateY.value = withSpring(0, SPRING_OPEN);
    } else {
      backdropOpacity.value = withTiming(0, { duration: 150 });
      translateY.value = withSpring(SHEET_HIDDEN, SPRING_CLOSE);
    }
  }, [visible]);

  // ── Android back button ──────────────────────────────────────────────────
  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onResume();
      return true;
    });
    return () => sub.remove();
  }, [visible, onResume]);

  // ── Drag gesture ─────────────────────────────────────────────────────────
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        // Rubber-band feel: slight resistance
        translateY.value = e.translationY * 0.85;
      }
    })
    .onEnd((e) => {
      if (e.translationY > DRAG_DISMISS_THRESHOLD || e.velocityY > 800) {
        runOnJS(onResume)();
      } else {
        translateY.value = withSpring(0, SPRING_OPEN);
      }
    });

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // Don't render when hidden and off-screen
  if (!visible && translateY.value >= SHEET_HIDDEN) return null;

  return (
    <View style={[StyleSheet.absoluteFillObject, styles.root]}>
      {/* ── Backdrop ──────────────────────────────────────────────────────── */}
      <Animated.View
        style={[StyleSheet.absoluteFillObject, styles.backdrop, backdropStyle]}
        pointerEvents={visible ? "auto" : "none"}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          onPress={onResume}
          activeOpacity={1}
        />
      </Animated.View>

      {/* ── Sheet ─────────────────────────────────────────────────────────── */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.surface,
              borderTopLeftRadius: RADIUS.sheet,
              borderTopRightRadius: RADIUS.sheet,
              borderTopWidth: 1,
              borderLeftWidth: 1,
              borderRightWidth: 1,
              borderColor: theme.border,
              paddingBottom: Math.max(insets.bottom, SP.section) + SP.base,
              paddingHorizontal: sheetPadH,
              paddingTop: sheetPadT,
            },
            sheetStyle,
          ]}
        >
          {/* Drag handle */}
          <View style={styles.handleWrap}>
            <View
              style={[styles.handle, { backgroundColor: theme.muted + "50" }]}
            />
          </View>

          {/* Status label */}
          <SPText
            variant="caption"
            style={[
              styles.statusLabel,
              {
                color: theme.muted,
                fontSize: captionSize,
                marginBottom: SP.tight,
              },
            ]}
          >
            SESSION PAUSED
          </SPText>

          {/* Title */}
          <SPText
            variant="h1"
            style={[
              styles.title,
              { color: theme.text, fontSize: h1Size, marginBottom: titleMb },
            ]}
          >
            Leave this workout?
          </SPText>

          {/* Subtitle */}
          <SPText
            variant="body"
            style={[
              styles.subtitle,
              {
                color: theme.muted,
                fontSize: bodySize,
                marginTop: -titleMb + SP.base,
                marginBottom: titleMb,
              },
            ]}
          >
            Your progress is saved automatically.
          </SPText>

          {/* Actions */}
          <View style={[styles.actions, { gap: actionsGap }]}>
            <SheetButton
              onPress={onSaveDraftAndLeave}
              variant="ghost"
              theme={theme}
              rs={rs}
            >
              Pause & Come Back Later
            </SheetButton>

            <SheetButton
              onPress={onEndAndSave}
              variant="danger"
              theme={theme}
              rs={rs}
            >
              End & Save Progress
            </SheetButton>

            {/* Keep going — tertiary, text only */}
            <TouchableOpacity
              onPress={onResume}
              activeOpacity={0.6}
              style={styles.keepGoingBtn}
              hitSlop={{ top: 12, bottom: 12, left: 24, right: 24 }}
            >
              <SPText
                variant="bodyMd"
                style={{
                  color: theme.muted,
                  fontSize: rs(13, 13, 14, 14),
                  fontFamily: "Barlow_500Medium",
                }}
              >
                ← Keep Going
              </SPText>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    zIndex: 100,
    justifyContent: "flex-end",
  },
  backdrop: {
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  sheet: {
    // Shadow for iOS
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: -8 },
    elevation: 24,
  },
  handleWrap: {
    alignItems: "center",
    paddingBottom: SP.section,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  statusLabel: {
    textAlign: "center",
    letterSpacing: 2.4,
    fontFamily: "Barlow_600SemiBold",
    textTransform: "uppercase",
    marginBottom: SP.tight,
  },
  title: {
    textAlign: "center",
    fontFamily: "Barlow_700Bold",
    letterSpacing: -0.5,
  },
  subtitle: {
    textAlign: "center",
    fontFamily: "Barlow_400Regular",
  },
  actions: {
    width: "100%",
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  keepGoingBtn: {
    alignItems: "center",
    paddingVertical: SP.tight,
    marginTop: SP.micro,
  },
});
