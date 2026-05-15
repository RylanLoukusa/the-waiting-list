import React from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { Folder } from "../types/models";
import { colors, spacing } from "../theme/theme";

export const Breadcrumbs = ({ path, onHome, onFolder }: { path: Folder[]; onHome: () => void; onFolder: (folderId: string) => void }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
    <Pressable onPress={onHome}><Text style={styles.crumb}>Home</Text></Pressable>
    {path.map((folder) => <React.Fragment key={folder.id}><Text style={styles.sep}>›</Text><Pressable onPress={() => onFolder(folder.id)}><Text style={styles.crumb}>{folder.name}</Text></Pressable></React.Fragment>)}
  </ScrollView>
);

const styles = StyleSheet.create({
  row: { alignItems: "center", paddingVertical: spacing.sm },
  crumb: { color: colors.accentDark, fontSize: 14, fontWeight: "800" },
  sep: { color: colors.muted, marginHorizontal: spacing.xs },
});
