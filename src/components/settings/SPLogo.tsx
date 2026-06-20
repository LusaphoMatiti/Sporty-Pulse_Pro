import React from "react";
import { View, StyleSheet } from "react-native";
import { SPText } from "../../components/ui/SPText";
import { colors, radii, borders, spacing } from "../../theme";

export function SPLogo() {
  return (
    <View style={styles.badge}>
      <SPText
        style={{
          fontFamily: "Barlow-ExtraBold",
          fontSize: 20,
          letterSpacing: -0.5,
          color: colors.acid,
        }}
      >
        SP
      </SPText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: 52,
    height: 52,
    borderRadius: radii.lg,
    backgroundColor: colors.acidDim,
    borderWidth: borders.base,
    borderColor: colors.acidBorder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing[6],
  },
});
