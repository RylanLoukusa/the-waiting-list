import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Folder } from "../types/models";
import { colors, spacing } from "../theme/theme";

export const FolderCard = ({ folder, count, onPress }: { folder: Folder; count?: number; onPress: () => void }) => (
  <Pressable onPress={onPress} style={({ pressed }: { pressed: boolean }) => [styles.card, pressed && styles.pressed]}>
    <View style={[styles.icon, { backgroundColor: folder.color ?? colors.border }]}><Text style={styles.emoji}>{folder.icon ?? "📁"}</Text></View>
    <View style={styles.content}>
      <Text style={styles.name}>{folder.name}</Text>
      <Text style={styles.meta}>{count ?? 0} saved here</Text>
    </View>
    <Text style={styles.chevron}>›</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  card: { alignItems: "center", backgroundColor: colors.surface, borderRadius: 18, flexDirection: "row", marginVertical: spacing.xs, padding: spacing.md, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 12 },
  icon: { alignItems: "center", borderRadius: 14, height: 46, justifyContent: "center", width: 46 },
  emoji: { fontSize: 22 },
  content: { flex: 1, marginLeft: spacing.md },
  name: { color: colors.ink, fontSize: 17, fontWeight: "800" },
  meta: { color: colors.muted, fontSize: 13, marginTop: 2 },
  chevron: { color: colors.muted, fontSize: 28 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
});
