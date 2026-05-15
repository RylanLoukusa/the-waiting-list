import React from "react";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import { AppButton } from "../components/AppButton";
import { useWaitingList } from "../storage/storage";
import { colors, spacing } from "../theme/theme";

export const SettingsScreen = () => {
  const { folders, items, resetToSeed } = useWaitingList();
  const confirmReset = (): void => Alert.alert("Reset sample data?", "This replaces local data with the original sample folders and items.", [{ text: "Cancel", style: "cancel" }, { text: "Reset", style: "destructive", onPress: resetToSeed }]);
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.body}>The Waiting List works offline and stores folders and items locally on this device.</Text>
      <Text style={styles.stat}>{folders.length} folders</Text><Text style={styles.stat}>{items.length} saved items</Text>
      <AppButton label="Reset to sample data" variant="danger" onPress={confirmReset} style={styles.button} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({ container: { backgroundColor: colors.background, flex: 1 }, content: { padding: spacing.lg, paddingTop: 64 }, title: { color: colors.ink, fontSize: 32, fontWeight: "900" }, body: { color: colors.muted, fontSize: 16, lineHeight: 24, marginVertical: spacing.lg }, stat: { backgroundColor: colors.surface, borderRadius: 16, color: colors.ink, fontWeight: "800", marginVertical: spacing.xs, padding: spacing.md }, button: { marginTop: spacing.lg } });
