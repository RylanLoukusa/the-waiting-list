import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, Pressable, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppButton } from "../components/AppButton";
import { EmptyState } from "../components/EmptyState";
import { FolderCard } from "../components/FolderCard";
import { ItemCard } from "../components/ItemCard";
import { QuickAddModal } from "../components/QuickAddModal";
import { RootStackParamList } from "../navigation/types";
import { useWaitingList } from "../storage/storage";
import { colors, spacing } from "../theme/theme";
import { getChildFolders, getDescendantFolderIds, getFolderPathLabel } from "../utils/folderTree";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export const HomeScreen = ({ navigation }: Props) => {
  const { folders, items } = useWaitingList();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const topFolders = getChildFolders(folders, null);
  const recentItems = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  const countForFolder = (folderId: string) => {
    const ids = [folderId, ...getDescendantFolderIds(folders, folderId)];
    return items.filter((item) => ids.includes(item.folderId)).length;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>Save ideas now. Pick the perfect one later.</Text>
      <Text style={styles.title}>The Waiting List</Text>
      <Pressable style={styles.search} onPress={() => navigation.navigate("Search")}><Text style={styles.searchText}>Search folders, ideas, tags, URLs...</Text></Pressable>
      <View style={styles.actions}>
        <AppButton label="Quick Add" onPress={() => setQuickAddOpen(true)} style={styles.action} />
        <AppButton label="Pick Something" variant="secondary" onPress={() => navigation.navigate("PickSomething")} style={styles.action} />
      </View>
      <View style={styles.rowHeader}><Text style={styles.section}>Folders</Text><Pressable onPress={() => navigation.navigate("AddEditFolder", { parentFolderId: null })}><Text style={styles.link}>New folder</Text></Pressable></View>
      {topFolders.length === 0 ? <EmptyState title="No folders yet." message="Create folders to organize everything waiting for later." /> : topFolders.map((folder) => <FolderCard key={folder.id} folder={folder} count={countForFolder(folder.id)} onPress={() => navigation.navigate("Folder", { folderId: folder.id })} />)}
      <Text style={styles.section}>Recently added</Text>
      {recentItems.length === 0 ? <EmptyState title="No items here yet." message="Add an idea, link, image, or video to your Waiting List." /> : recentItems.map((item) => <ItemCard key={item.id} item={item} folderPath={getFolderPathLabel(folders, item.folderId)} onPress={() => navigation.navigate("ItemDetail", { itemId: item.id })} />)}
      <AppButton label="Settings" variant="secondary" onPress={() => navigation.navigate("Settings")} style={styles.settings} />
      <QuickAddModal visible={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.lg, paddingTop: 64 },
  kicker: { color: colors.accentDark, fontSize: 14, fontWeight: "800" },
  title: { color: colors.ink, fontSize: 36, fontWeight: "900", letterSpacing: -1, marginBottom: spacing.md },
  search: { backgroundColor: colors.surface, borderRadius: 999, padding: spacing.md },
  searchText: { color: colors.muted },
  actions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
  action: { flex: 1 },
  rowHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: spacing.lg },
  section: { color: colors.ink, fontSize: 20, fontWeight: "900", marginTop: spacing.lg, marginBottom: spacing.xs },
  link: { color: colors.accentDark, fontWeight: "900" },
  settings: { marginTop: spacing.lg },
});
