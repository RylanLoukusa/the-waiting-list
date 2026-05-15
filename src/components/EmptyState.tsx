import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../theme/theme";

export const EmptyState = ({ title, message }: { title: string; message: string }) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.message}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { alignItems: "center", backgroundColor: colors.surface, borderRadius: 20, padding: spacing.lg, marginVertical: spacing.sm },
  title: { color: colors.ink, fontSize: 17, fontWeight: "700" },
  message: { color: colors.muted, fontSize: 14, marginTop: spacing.xs, textAlign: "center" },
});
