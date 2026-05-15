import React, { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppButton } from "../components/AppButton";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { ScreenTopBar } from "../components/ScreenTopBar";
import { EmptyState } from "../components/EmptyState";
import { FolderCard } from "../components/FolderCard";
import { ItemCard } from "../components/ItemCard";
import { QuickAddModal } from "../components/QuickAddModal";
import { RootStackParamList } from "../navigation/types";
import { useWaitingList } from "../storage/storage";
import { colors, spacing } from "../theme/theme";
import { canAddChildFolder, getChildFolders, getFolderById, getFolderPath, getItemsInFolder } from "../utils/folderTree";

type Props = NativeStackScreenProps<RootStackParamList, "Folder">;

export const FolderScreen = ({ navigation, route }: Props) => {
  const { folders, items, deleteFolder } = useWaitingList();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const folder = getFolderById(folders, route.params.folderId);
  if (!folder) {
    return (
      <View style={styles.screen}>
        <ScreenTopBar navigation={navigation} />
        <View style={styles.notFoundBody}>
          <EmptyState title="Folder not found" message="This folder may have been deleted." />
        </View>
      </View>
    );
  }
  const subfolders = getChildFolders(folders, folder.id);
  const folderItems = getItemsInFolder(items, folder.id);
  const canNestMore = canAddChildFolder(folders, folder.id);

  const confirmDelete = (): void => {
    Alert.alert("Delete folder?", "This recursively deletes nested subfolders and saved items inside this folder.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => { deleteFolder(folder.id); navigation.navigate("Home"); } },
    ]);
  };

  return (
    <View style={styles.screen}>
      <ScreenTopBar navigation={navigation} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Breadcrumbs path={getFolderPath(folders, folder.id)} onHome={() => navigation.navigate("Home")} onFolder={(folderId) => navigation.navigate("Folder", { folderId })} />
      <View style={styles.titleRow}><Text style={styles.title}>{folder.icon} {folder.name}</Text><Pressable onPress={() => navigation.navigate("AddEditFolder", { folderId: folder.id })}><Text style={styles.link}>Edit</Text></Pressable></View>
      <View style={styles.actions}>
        <AppButton label="Add item" onPress={() => navigation.navigate("AddEditItem", { folderId: folder.id })} style={styles.action} />
        <AppButton label="Quick Add" variant="secondary" onPress={() => setQuickAddOpen(true)} style={styles.action} />
      </View>
      <View style={styles.actions}>
        <AppButton label={canNestMore ? "Add subfolder" : "Max depth reached"} variant="secondary" onPress={() => canNestMore && navigation.navigate("AddEditFolder", { parentFolderId: folder.id })} style={styles.action} />
        <AppButton label="Delete" variant="danger" onPress={confirmDelete} style={styles.action} />
      </View>
      <Text style={styles.section}>Subfolders</Text>
      {subfolders.length === 0 ? <EmptyState title="No subfolders yet." message="Create a subfolder to organize this list." /> : subfolders.map((child) => <FolderCard key={child.id} folder={child} count={items.filter((item) => item.folderId === child.id).length} onPress={() => navigation.navigate("Folder", { folderId: child.id })} />)}
      <Text style={styles.section}>Items</Text>
      {folderItems.length === 0 ? <EmptyState title="No items here yet." message="Add an idea, link, image, or video to this folder." /> : folderItems.map((item) => <ItemCard key={item.id} item={item} onPress={() => navigation.navigate("ItemDetail", { itemId: item.id })} />)}
      <QuickAddModal visible={quickAddOpen} currentFolderId={folder.id} onClose={() => setQuickAddOpen(false)} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background, flex: 1 },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xl },
  notFoundBody: { flex: 1, padding: spacing.lg },
  titleRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  title: { color: colors.ink, flex: 1, fontSize: 32, fontWeight: "900" },
  link: { color: colors.accentDark, fontWeight: "900" },
  actions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
  action: { flex: 1 },
  section: { color: colors.ink, fontSize: 20, fontWeight: "900", marginTop: spacing.lg, marginBottom: spacing.xs },
});
