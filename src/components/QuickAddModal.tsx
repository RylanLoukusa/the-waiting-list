import React, { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useWaitingList } from "../storage/storage";
import { colors, spacing } from "../theme/theme";
import { detectItemType, suggestFolders, suggestTags, suggestTitle } from "../utils/folderSuggestions";
import { getFolderHierarchyRows } from "../utils/folderTree";
import { AppButton } from "./AppButton";
import { FolderChoiceRow } from "./FolderChoiceRow";

type Props = {
  visible: boolean;
  currentFolderId?: string;
  onClose: () => void;
};

export const QuickAddModal = ({ visible, currentFolderId, onClose }: Props) => {
  const { folders, items, createItem } = useWaitingList();
  const [content, setContent] = useState("");
  const suggestions = useMemo(() => suggestFolders(content, folders, items), [content, folders, items]);
  const folderRows = useMemo(() => getFolderHierarchyRows(folders), [folders]);
  const folderDepthById = useMemo(
    () => new Map(folderRows.map((row) => [row.folder.id, row.depth])),
    [folderRows],
  );
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>(currentFolderId);
  const targetFolderId = selectedFolderId ?? suggestions[0]?.folder.id ?? currentFolderId ?? folders[0]?.id;

  const preview = useMemo(
    () => ({ title: suggestTitle(content), type: detectItemType(content), tags: suggestTags(content) }),
    [content],
  );

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
        <View style={styles.header}>
          <Text style={styles.title}>Quick Add</Text>
          <Pressable onPress={onClose}>
            <Text style={styles.close}>Close</Text>
          </Pressable>
        </View>
        <Text style={styles.label}>Paste a thought, URL, image URI, or video URI</Text>
        <TextInput
          style={styles.input}
          multiline
          placeholder="Try the new ramen place downtown"
          value={content}
          onChangeText={setContent}
          autoFocus
        />
        <View style={styles.preview}>
          <Text style={styles.previewTitle}>{preview.title}</Text>
          <Text style={styles.meta}>
            Type: {preview.type} · Tags: {preview.tags.join(", ") || "none yet"}
          </Text>
        </View>
        <Text style={styles.section}>Suggested folder</Text>
        {suggestions.length === 0 ? (
          <Text style={styles.meta}>No confident match yet. Create a new folder or choose one below.</Text>
        ) : (
          suggestions.map((suggestion, index) => (
            <FolderChoiceRow
              key={suggestion.folder.id}
              folder={suggestion.folder}
              depth={folderDepthById.get(suggestion.folder.id) ?? 0}
              detail={suggestion.reasons.join(" · ")}
              prefix={index === 0 ? "Best" : "Suggested"}
              isSelected={targetFolderId === suggestion.folder.id}
              onPress={() => setSelectedFolderId(suggestion.folder.id)}
            />
          ))
        )}
        <Text style={styles.section}>Or choose any folder</Text>
        {folderRows.map(({ folder, depth }) => (
          <FolderChoiceRow
            key={folder.id}
            folder={folder}
            depth={depth}
            isSelected={targetFolderId === folder.id}
            onPress={() => setSelectedFolderId(folder.id)}
          />
        ))}
        <AppButton label="Save to Waiting List" onPress={save} style={styles.save} />
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 60 },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  title: { color: colors.ink, fontSize: 28, fontWeight: "900" },
  close: { color: colors.accentDark, fontWeight: "800" },
  label: { color: colors.muted, fontWeight: "700", marginBottom: spacing.xs },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    color: colors.ink,
    minHeight: 130,
    padding: spacing.md,
    textAlignVertical: "top",
  },
  preview: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  previewTitle: { color: colors.ink, fontSize: 17, fontWeight: "800" },
  meta: { color: colors.muted, fontSize: 13, marginTop: 4 },
  section: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: spacing.xs,
    marginTop: spacing.lg,
  },
  save: { marginTop: spacing.lg },
});
