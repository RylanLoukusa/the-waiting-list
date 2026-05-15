import React, { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { AppButton } from "./AppButton";
import { useWaitingList } from "../storage/storage";
import { colors, spacing } from "../theme/theme";
import { detectItemType, suggestFolders, suggestTags, suggestTitle } from "../utils/folderSuggestions";
import { getFolderPathLabel } from "../utils/folderTree";

export const QuickAddModal = ({ visible, currentFolderId, onClose }: { visible: boolean; currentFolderId?: string; onClose: () => void }) => {
  const { folders, items, createItem } = useWaitingList();
  const [content, setContent] = useState("");
  const suggestions = useMemo(() => suggestFolders(content, folders, items), [content, folders, items]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>(currentFolderId);
  const targetFolderId = selectedFolderId ?? suggestions[0]?.folder.id ?? currentFolderId ?? folders[0]?.id;

  const preview = useMemo(() => ({ title: suggestTitle(content), type: detectItemType(content), tags: suggestTags(content) }), [content]);

  const save = (): void => {
    if (!targetFolderId || content.trim().length === 0) return;
    createItem({
      folderId: targetFolderId,
      title: preview.title,
      description: content.trim(),
      type: preview.type,
      url: preview.type === "link" ? content.trim() : undefined,
      mediaUri: preview.type === "image" || preview.type === "video" ? content.trim() : undefined,
      tags: preview.tags,
      status: "waiting",
      priority: "medium",
    });
    setContent("");
    setSelectedFolderId(undefined);
    onClose();
  };

  return (
    <Modal animationType="slide" visible={visible} presentationStyle="pageSheet" onRequestClose={onClose}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}><Text style={styles.title}>Quick Add</Text><Pressable onPress={onClose}><Text style={styles.close}>Close</Text></Pressable></View>
        <Text style={styles.label}>Paste a thought, URL, image URI, or video URI</Text>
        <TextInput style={styles.input} multiline placeholder="Try the new ramen place downtown" value={content} onChangeText={setContent} autoFocus />
        <View style={styles.preview}>
          <Text style={styles.previewTitle}>{preview.title}</Text>
          <Text style={styles.meta}>Type: {preview.type} · Tags: {preview.tags.join(", ") || "none yet"}</Text>
        </View>
        <Text style={styles.section}>Suggested folder</Text>
        {suggestions.length === 0 ? <Text style={styles.meta}>No confident match yet. Create a new folder or choose one below.</Text> : suggestions.map((suggestion, index) => (
          <Pressable key={suggestion.folder.id} onPress={() => setSelectedFolderId(suggestion.folder.id)} style={[styles.suggestion, targetFolderId === suggestion.folder.id && styles.selected]}>
            <Text style={styles.suggestionTitle}>{index === 0 ? "Best: " : ""}{getFolderPathLabel(folders, suggestion.folder.id)}</Text>
            <Text style={styles.meta}>{suggestion.reasons.join(" · ")}</Text>
          </Pressable>
        ))}
        <Text style={styles.section}>Or choose any folder</Text>
        {folders.map((folder) => <Pressable key={folder.id} onPress={() => setSelectedFolderId(folder.id)}><Text style={[styles.folderChoice, targetFolderId === folder.id && styles.choiceSelected]}>{getFolderPathLabel(folders, folder.id)}</Text></Pressable>)}
        <AppButton label="Save to Waiting List" onPress={save} style={styles.save} />
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 60 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.lg },
  title: { color: colors.ink, fontSize: 28, fontWeight: "900" },
  close: { color: colors.accentDark, fontWeight: "800" },
  label: { color: colors.muted, fontWeight: "700", marginBottom: spacing.xs },
  input: { backgroundColor: colors.surface, borderRadius: 18, color: colors.ink, minHeight: 130, padding: spacing.md, textAlignVertical: "top" },
  preview: { backgroundColor: colors.surface, borderRadius: 18, marginTop: spacing.md, padding: spacing.md },
  previewTitle: { color: colors.ink, fontSize: 17, fontWeight: "800" },
  meta: { color: colors.muted, fontSize: 13, marginTop: 4 },
  section: { color: colors.ink, fontSize: 16, fontWeight: "900", marginTop: spacing.lg, marginBottom: spacing.xs },
  suggestion: { backgroundColor: colors.surface, borderRadius: 16, marginVertical: spacing.xs, padding: spacing.md },
  selected: { borderColor: colors.accent, borderWidth: 2 },
  suggestionTitle: { color: colors.ink, fontWeight: "800" },
  folderChoice: { color: colors.muted, paddingVertical: spacing.sm },
  choiceSelected: { color: colors.accentDark, fontWeight: "900" },
  save: { marginTop: spacing.lg },
});
