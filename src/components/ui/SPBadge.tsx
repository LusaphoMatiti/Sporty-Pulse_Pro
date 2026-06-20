/**
 * SPBadge — status pills, tier labels, PR tags, active indicators
 *
 * Variants:
 *   acid      — Acid dim bg + acid text. Active, positive states.
 *   acidSolid — Solid acid bg + black text. "NEW PR", featured labels.
 *   white     — White dim bg + white text. Neutral info.
 *   danger    — Red dim bg + red text. Warnings, end states.
 *   warning   — Amber dim bg + amber text. Trial banners, caution.
 *   success   — Green dim bg + green text.
 *   outline   — Border only, no fill. Subtle inline tags.
 */

import React from "react";
import { View, StyleSheet, type ViewStyle } from "react-native";
import { SPText } from "./SPText";
import { colors, spacing, radii, borders, fontSize, fonts } from "../../theme";
import { useAppTheme } from "../../theme/ThemeContext";
import { useResponsive } from "../../hooks/useResponsive";

export type BadgeVariant =
  | "acid"
  | "acidSolid"
  | "white"
  | "danger"
  | "warning"
  | "success"
  | "outline";

interface SPBadgeProps {
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  style?: ViewStyle;
  children: React.ReactNode;
}

export function SPBadge({
  variant = "acid",
  icon,
  style,
  children,
}: SPBadgeProps) {
  const { theme } = useAppTheme();
  const { rs } = useResponsive();

  const variantConfig = {
    acid: {
      background: theme.accentDim,
      borderColor: theme.accent + "55",
      textColor: theme.accent,
    },
    acidSolid: {
      background: theme.accent,
      borderColor: theme.accent,
      textColor: theme.void,
    },
    white: {
      background: theme.surface2,
      borderColor: theme.border,
      textColor: theme.muted2,
    },
    danger: {
      background: colors.dangerDim,
      borderColor: colors.dangerBorder,
      textColor: colors.danger,
    },
    warning: {
      background: colors.warningDim,
      borderColor: "rgba(255,165,0,0.22)",
      textColor: colors.warning,
    },
    success: {
      background: colors.successDim,
      borderColor: "rgba(57,255,106,0.22)",
      textColor: colors.success,
    },
    outline: {
      background: "transparent",
      borderColor: theme.border,
      textColor: theme.muted,
    },
  } as const;

  const config = variantConfig[variant];

  // Responsive badge sizing
  const badgePaddingV = rs(spacing[1], spacing[1.5]);
  const badgePaddingH = rs(spacing[2], spacing[3]);
  const badgeFontSize = rs(fontSize.xs - 1, fontSize.xs);
  const badgeLetterSpacing = rs(0.9, 1.2);

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.background,
          borderColor: config.borderColor,
          paddingVertical: badgePaddingV,
          paddingHorizontal: badgePaddingH,
        },
        style,
      ]}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <SPText
        style={{
          fontFamily: fonts.brandBold,
          fontSize: badgeFontSize,
          letterSpacing: badgeLetterSpacing,
          textTransform: "uppercase",
          color: config.textColor,
        }}
      >
        {children}
      </SPText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: radii.full,
    borderWidth: borders.base,
    gap: spacing[1],
  },
  icon: {
    marginRight: spacing[0.5],
  },
});
