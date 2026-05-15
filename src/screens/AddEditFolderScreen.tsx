import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppButton } from "../components/AppButton";
import { RootStackParamList } from "../navigation/types";
import { useWaitingList } from "../storage/storage";
import { colors, spacing } from "../theme/theme";
import { canAddChildFolder, canMoveFolder, getFolderById, getFolderPathLabel } from "../utils/folderTree";

type Props = NativeStackScreenProps<RootStackParamList, "AddEditFolder">;

export const AddEditFolderScreen = ({ navigation, route }: Props) => {
  const { folders, createFolder, updateFolder } = useWaitingList();
  const editing = getFolderById(folders, route.params?.folderId);
  const [name, setName] = useState(editing?.name ?? "");
  const [icon, setIcon] = useState(editing?.icon ?? "📁");
  const [color, setColor] = useState(editing?.color ?? "#D8C7AA");
  const [parentFolderId, setParentFolderId] = useState<string | null>(editing?.parentFolderId ?? route.params?.parentFolderId ?? null);

  const save = (): void => {
    if (editing) {
      if (!canMoveFolder(folders, editing.id, parentFolderId)) {
        Alert.alert("Cannot move folder", "That destination would create a loop or exceed the 5-level nesting limit.");
        return;
      }
      updateFolder(editing.id, { name, icon, color, parentFolderId });
      navigation.goBack();
      return;
    }
    if (!canAddChildFolder(folders, parentFolderId)) {
      Alert.alert("Max depth reached", "Folders can be nested up to 5 levels deep.");
      return;
    }
    const folder = createFolder({ name, icon, color, parentFolderId });
    navigation.replace("Folder", { folderId: folder.id });
  };

  const parentChoices = editing ? folders.filter((folder) => folder.id !== editing.id && canMoveFolder(folders, editing.id, folder.id)) : folders.filter((folder) => canAddChildFolder(folders, folder.id));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{editing ? "Edit folder" : "New folder"}</Text>
      <Text style={styles.label}>Name</Text><TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Weekend Ideas" />
      <Text style={styles.label}>Icon</Text><TextInput style={styles.input} value={icon} onChangeText={setIcon} />
      <Text style={styles.label}>Color</Text><TextInput style={styles.input} value={color} onChangeText={setColor} />
      <Text style={styles.section}>Parent folder</Text>
      <Text onPress={() => setParentFolderId(null)} style={[styles.choice, parentFolderId === null && styles.selected]}>Home</Text>
      {parentChoices.map((folder) => <Text key={folder.id} onPress={() => setParentFolderId(folder.id)} style={[styles.choice, parentFolderId === folder.id && styles.selected]}>{getFolderPathLabel(folders, folder.id)}</Text>)}
      <AppButton label="Save folder" onPress={save} style={styles.save} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.lg, paddingTop: 64 },
  title: { color: colors.ink, fontSize: 32, fontWeight: "900", marginBottom: spacing.lg },
  label: { color: colors.muted, fontWeight: "800", marginBottom: spacing.xs, marginTop: spacing.md },
  input: { backgroundColor: colors.surface, borderRadius: 16, color: colors.ink, padding: spacing.md },
  section: { color: colors.ink, fontSize: 18, fontWeight: "900", marginTop: spacing.lg },
  choice: { color: colors.muted, paddingVertical: spacing.sm },
  selected: { color: colors.accentDark, fontWeight: "900" },
  save: { marginTop: spacing.lg },
});
