import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppButton } from "../components/AppButton";
import { ScreenTopBar } from "../components/ScreenTopBar";
import { RootStackParamList } from "../navigation/types";
import { useWaitingList } from "../storage/storage";
import { colors, spacing } from "../theme/theme";
import { ItemPriority, ItemStatus, ItemType } from "../types/models";
import { detectItemType, suggestFolders, suggestTags, suggestTitle } from "../utils/folderSuggestions";
import { getFolderPathLabel } from "../utils/folderTree";

type Props = NativeStackScreenProps<RootStackParamList, "AddEditItem">;

const types: ItemType[] = ["text", "link", "image", "video"];
const statuses: ItemStatus[] = ["waiting", "planned", "done", "skipped"];
const priorities: ItemPriority[] = ["low", "medium", "high"];

export const AddEditItemScreen = ({ navigation, route }: Props) => {
  const { folders, items, createItem, updateItem } = useWaitingList();
  const editing = items.find((item) => item.id === route.params?.itemId);
  const [content, setContent] = useState(editing?.description ?? editing?.url ?? "");
  const suggestions = useMemo(() => suggestFolders(content, folders, items), [content, folders, items]);
  const [title, setTitle] = useState(editing?.title ?? "");
  const [type, setType] = useState<ItemType>(editing?.type ?? "text");
  const [folderId, setFolderId] = useState(editing?.folderId ?? route.params?.folderId ?? folders[0]?.id ?? "");
  const [tags, setTags] = useState(editing?.tags.join(", ") ?? "");
  const [status, setStatus] = useState<ItemStatus>(editing?.status ?? "waiting");
  const [priority, setPriority] = useState<ItemPriority>(editing?.priority ?? "medium");

  const applySuggestion = (): void => {
    setTitle(suggestTitle(content));
    setType(detectItemType(content));
    setTags(suggestTags(content).join(", "));
    if (suggestions[0]) setFolderId(suggestions[0].folder.id);
  };

  const save = (): void => {
    const payload = { folderId, title: title || suggestTitle(content), description: content, type, url: type === "link" ? content : undefined, mediaUri: type === "image" || type === "video" ? content : undefined, tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean), status, priority };
    if (editing) {
      updateItem(editing.id, payload);
      navigation.goBack();
    } else {
      const item = createItem(payload);
      navigation.replace("ItemDetail", { itemId: item.id });
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenTopBar navigation={navigation} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{editing ? "Edit item" : "Add item"}</Text>
      <Text style={styles.label}>Idea, URL, or media URI</Text><TextInput style={[styles.input, styles.body]} multiline value={content} onChangeText={setContent} placeholder="Paste or type something worth saving..." />
      <AppButton label="Suggest title, folder & tags" variant="secondary" onPress={applySuggestion} style={styles.button} />
      <Text style={styles.label}>Title</Text><TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder={suggestTitle(content)} />
      <Text style={styles.section}>Type</Text>{types.map((choice) => <Text key={choice} onPress={() => setType(choice)} style={[styles.choice, type === choice && styles.selected]}>{choice}</Text>)}
      <Text style={styles.section}>Folder</Text>{suggestions.map((suggestion) => <Text key={suggestion.folder.id} onPress={() => setFolderId(suggestion.folder.id)} style={[styles.choice, folderId === suggestion.folder.id && styles.selected]}>Suggested: {getFolderPathLabel(folders, suggestion.folder.id)}</Text>)}{folders.map((folder) => <Text key={folder.id} onPress={() => setFolderId(folder.id)} style={[styles.choice, folderId === folder.id && styles.selected]}>{getFolderPathLabel(folders, folder.id)}</Text>)}
      <Text style={styles.label}>Tags</Text><TextInput style={styles.input} value={tags} onChangeText={setTags} placeholder="ramen, restaurant, dinner" />
      <Text style={styles.section}>Status</Text>{statuses.map((choice) => <Text key={choice} onPress={() => setStatus(choice)} style={[styles.choice, status === choice && styles.selected]}>{choice}</Text>)}
      <Text style={styles.section}>Priority</Text>{priorities.map((choice) => <Text key={choice} onPress={() => setPriority(choice)} style={[styles.choice, priority === choice && styles.selected]}>{choice}</Text>)}
      <AppButton label="Save item" onPress={save} style={styles.button} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background, flex: 1 },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xl },
  title: { color: colors.ink, fontSize: 32, fontWeight: "900", marginBottom: spacing.lg },
  label: { color: colors.muted, fontWeight: "800", marginBottom: spacing.xs, marginTop: spacing.md },
  input: { backgroundColor: colors.surface, borderRadius: 16, color: colors.ink, padding: spacing.md },
  body: { minHeight: 120, textAlignVertical: "top" },
  section: { color: colors.ink, fontSize: 18, fontWeight: "900", marginTop: spacing.lg },
  choice: { color: colors.muted, paddingVertical: spacing.sm },
  selected: { color: colors.accentDark, fontWeight: "900" },
  button: { marginTop: spacing.lg },
});
