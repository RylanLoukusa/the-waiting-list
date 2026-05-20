import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../theme/theme";

type Props = {
  title: string;
  message: string;
};

export const EmptyState = ({ title, message }: Props) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.message}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginVertical: spacing.sm,
    padding: spacing.lg,
  },
  title: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "700",
  },
  message: {
    color: colors.muted,
    fontSize: 14,
    marginTop: spacing.xs,
    textAlign: "center",
  },
});
