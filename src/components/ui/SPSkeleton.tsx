import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useAppTheme } from "../../theme/ThemeContext";
import { radii } from "../../theme";

interface Props {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: object;
}

export function SPSkeleton({
  width = "100%",
  height = 16,
  radius = radii.sm,
  style,
}: Props) {
  const { theme, isDark } = useAppTheme();
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.35, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: isDark ? "#ffffff18" : "#00000012",
        },
        animStyle,
        style,
      ]}
    />
  );
}
