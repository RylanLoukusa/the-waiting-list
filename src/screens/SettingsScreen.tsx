import React from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppButton } from "../components/AppButton";
import { ScreenTopBar } from "../components/ScreenTopBar";
import { RootStackParamList } from "../navigation/types";
import { useWaitingList } from "../storage/storage";
import { colors, spacing } from "../theme/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Settings">;

export const SettingsScreen = ({ navigation }: Props) => {
  const { folders, items, resetToSeed } = useWaitingList();
  const confirmReset = (): void => Alert.alert("Reset sample data?", "This replaces local data with the original sample folders and items.", [{ text: "Cancel", style: "cancel" }, { text: "Reset", style: "destructive", onPress: resetToSeed }]);
  return (
    <View style={styles.screen}>
      <ScreenTopBar navigation={navigation} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.body}>The Waiting List works offline and stores folders and items locally on this device.</Text>
      <Text style={styles.stat}>{folders.length} folders</Text><Text style={styles.stat}>{items.length} saved items</Text>
      <AppButton label="Reset to sample data" variant="danger" onPress={confirmReset} style={styles.button} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background, flex: 1 },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xl },
  title: { color: colors.ink, fontSize: 32, fontWeight: "900" },
  body: { color: colors.muted, fontSize: 16, lineHeight: 24, marginVertical: spacing.lg },
  stat: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    color: colors.ink,
    fontWeight: "800",
    marginVertical: spacing.xs,
    padding: spacing.md,
  },
  button: { marginTop: spacing.lg },
});
