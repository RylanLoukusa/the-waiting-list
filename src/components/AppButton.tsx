import React from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { colors, spacing } from "../theme/theme";

type Variant = "primary" | "secondary" | "danger";

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  style?: ViewStyle;
};

export const AppButton = ({ label, onPress, variant = "primary", style }: Props) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }: { pressed: boolean }) => [
      styles.base,
      styles[variant],
      pressed && styles.pressed,
      style,
    ]}
  >
    <Text style={[styles.text, variant !== "primary" && styles.secondaryText]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    borderRadius: 999,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  primary: { backgroundColor: colors.accentDark },
  secondary: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
  danger: { backgroundColor: colors.danger },
  text: { color: colors.surface, fontSize: 15, fontWeight: "800" },
  secondaryText: { color: colors.ink },
  pressed: { opacity: 0.78 },
});
