import React from "react";
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppButton } from "../components/AppButton";
import { ScreenTopBar } from "../components/ScreenTopBar";
import { RootStackParamList } from "../navigation/types";
import { useWaitingList } from "../storage/storage";
import { colors, spacing } from "../theme/theme";
import { getFolderPathLabel } from "../utils/folderTree";

type Props = NativeStackScreenProps<RootStackParamList, "ItemDetail">;

export const ItemDetailScreen = ({ navigation, route }: Props) => {
  const { folders, items, updateItem, deleteItem } = useWaitingList();
  const item = items.find((candidate) => candidate.id === route.params.itemId);
  if (!item) {
    return (
      <View style={styles.screen}>
        <ScreenTopBar navigation={navigation} />
        <View style={styles.notFoundBody}>
          <Text style={styles.notFoundText}>Item not found</Text>
        </View>
      </View>
    );
  }

  const confirmDelete = (): void => Alert.alert("Delete item?", "This removes it from your Waiting List.", [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: () => { deleteItem(item.id); navigation.navigate("Home"); } }]);

  return (
    <View style={styles.screen}>
      <ScreenTopBar navigation={navigation} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.type}>{item.type.toUpperCase()}</Text>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.path}>{getFolderPathLabel(folders, item.folderId)}</Text>
      {!!item.url && <View style={styles.preview}><Text style={styles.previewTitle}>Link preview</Text><Text style={styles.url} onPress={() => item.url && void Linking.openURL(item.url)}>{item.url}</Text></View>}
      {!!item.mediaUri && <View style={styles.preview}><Text style={styles.previewTitle}>{item.type === "video" ? "Video" : "Image"} preview</Text><Text style={styles.url}>{item.mediaUri}</Text></View>}
      {!!item.description && <Text style={styles.description}>{item.description}</Text>}
      <View style={styles.row}><Text style={styles.pill}>{item.status}</Text><Text style={styles.pill}>{item.priority} priority</Text></View>
      <Text style={styles.section}>Tags</Text><Text style={styles.meta}>{item.tags.join(", ") || "No tags"}</Text>
      <Text style={styles.section}>Created</Text><Text style={styles.meta}>{new Date(item.createdAt).toLocaleString()}</Text>
      <AppButton label="Edit / Move" onPress={() => navigation.navigate("AddEditItem", { itemId: item.id })} style={styles.button} />
      <AppButton label="Mark as done" variant="secondary" onPress={() => updateItem(item.id, { status: "done" })} style={styles.button} />
      <AppButton label="Delete item" variant="danger" onPress={confirmDelete} style={styles.button} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background, flex: 1 },
  scroll: { flex: 1 },
  notFoundBody: { flex: 1, padding: spacing.lg },
  notFoundText: { color: colors.muted, fontSize: 16 },
  content: { padding: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xl },
  type: { color: colors.accentDark, fontSize: 13, fontWeight: "900" },
  title: { color: colors.ink, fontSize: 32, fontWeight: "900", marginTop: spacing.xs },
  path: { color: colors.accentDark, fontWeight: "800", marginTop: spacing.xs },
  description: { color: colors.ink, fontSize: 16, lineHeight: 24, marginTop: spacing.lg },
  preview: { backgroundColor: colors.surface, borderRadius: 18, marginTop: spacing.lg, padding: spacing.md },
  previewTitle: { color: colors.ink, fontWeight: "900" },
  url: { color: colors.blue, marginTop: spacing.xs },
  row: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.lg },
  pill: { backgroundColor: colors.surface, borderRadius: 999, color: colors.muted, fontWeight: "800", paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  section: { color: colors.ink, fontSize: 18, fontWeight: "900", marginTop: spacing.lg },
  meta: { color: colors.muted, marginTop: spacing.xs },
  button: { marginTop: spacing.md },
});
