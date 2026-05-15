import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SavedItem } from "../types/models";
import { colors, spacing } from "../theme/theme";

const typeIcon = { text: "📝", link: "🔗", image: "🖼️", video: "🎥" };

export const ItemCard = ({ item, folderPath, onPress }: { item: SavedItem; folderPath?: string; onPress: () => void }) => (
  <Pressable onPress={onPress} style={({ pressed }: { pressed: boolean }) => [styles.card, pressed && styles.pressed]}>
    <Text style={styles.icon}>{typeIcon[item.type]}</Text>
    <View style={styles.content}>
      <Text style={styles.title}>{item.title}</Text>
      {!!folderPath && <Text style={styles.path}>{folderPath}</Text>}
      {!!item.description && <Text numberOfLines={2} style={styles.description}>{item.description}</Text>}
      <View style={styles.row}>
        <Text style={styles.pill}>{item.status}</Text>
        <Text style={[styles.pill, item.priority === "high" && styles.high]}>{item.priority}</Text>
      </View>
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 18, flexDirection: "row", marginVertical: spacing.xs, padding: spacing.md },
  icon: { fontSize: 22, marginRight: spacing.md, marginTop: 2 },
  content: { flex: 1 },
  title: { color: colors.ink, fontSize: 16, fontWeight: "800" },
  path: { color: colors.accentDark, fontSize: 12, marginTop: 2 },
  description: { color: colors.muted, fontSize: 13, marginTop: spacing.xs },
  row: { flexDirection: "row", gap: spacing.xs, marginTop: spacing.sm },
  pill: { backgroundColor: colors.background, borderRadius: 999, color: colors.muted, fontSize: 12, fontWeight: "700", overflow: "hidden", paddingHorizontal: 9, paddingVertical: 4 },
  high: { color: colors.danger },
  pressed: { opacity: 0.75 },
});
