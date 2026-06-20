import React, { useState } from "react";
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  type TextInputProps,
} from "react-native";
import { SPText } from "../../components/ui/SPText";
import { SPIcon } from "../../components/icons/SPIcon";
import { colors, spacing, radii, borders, fonts, fontSize } from "../../theme";

interface AuthInputProps extends TextInputProps {
  label: string;
  isPassword?: boolean;
}

export function AuthInput({ label, isPassword, ...props }: AuthInputProps) {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  return (
    <View style={styles.wrap}>
      <SPText variant="label" style={styles.label}>
        {label}
      </SPText>
      <View style={[styles.inputRow, focused && styles.inputFocused]}>
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.white20}
          secureTextEntry={isPassword && !revealed}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {isPassword && (
          <Pressable
            onPress={() => setRevealed((r) => !r)}
            hitSlop={8}
            style={styles.eye}
          >
            <SPIcon
              name={revealed ? "lock" : "unlock"}
              size={16}
              color={colors.white40}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing[1.5] },
  label: { paddingLeft: spacing[0.5] },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: borders.base,
    borderColor: colors.white10,
    borderRadius: radii.lg,
    paddingHorizontal: spacing[4],
  },
  inputFocused: { borderColor: colors.acid },
  input: {
    flex: 1,
    fontFamily: fonts.brandRegular,
    fontSize: fontSize.base,
    color: colors.white,
    paddingVertical: spacing[3.5],
  },
  eye: { paddingLeft: spacing[2] },
});
