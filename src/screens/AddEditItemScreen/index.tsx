import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppButton } from "../../components/AppButton";
import { FolderChoiceRow } from "../../components/FolderChoiceRow";
import { MediaPicker } from "../../components/MediaPicker";
import { OptionChoiceRow } from "../../components/OptionChoiceRow";
import { ScreenTopBar } from "../../components/ScreenTopBar";
import { RootStackParamList } from "../../navigation/types";
import { uploadMediaToSupabase } from "../../lib/supabaseStorage";
import { useWaitingList } from "../../storage/storage";
import { ItemPriority, ItemStatus, ItemType } from "../../types/models";
import { detectItemType, suggestFolders, suggestTags, suggestTitle } from "../../utils/folderSuggestions";
import { getFolderHierarchyRows } from "../../utils/folderTree";
import { styles } from "./styles";

type Props = NativeStackScreenProps<RootStackParamList, "AddEditItem">;

const types: ItemType[] = ["text", "link", "image", "video"];
const statuses: ItemStatus[] = ["waiting", "planned", "done", "skipped"];
const priorities: ItemPriority[] = ["low", "medium", "high"];

const typeChoices: Record<ItemType, { label: string; detail: string; tone: string }> = {
  text: { label: "Text", detail: "Notes, ideas, reminders", tone: "#8A9A5B" },
  link: { label: "Link", detail: "Articles, products, places", tone: "#6F8FAF" },
  image: { label: "Image", detail: "Photos and visual references", tone: "#B9856D" },
  video: { label: "Video", detail: "Clips, reels, and watch-later saves", tone: "#9B7BB5" },
};

const statusChoices: Record<ItemStatus, { label: string; detail: string; tone: string }> = {
  waiting: { label: "Waiting", detail: "Saved for later", tone: "#DFAE73" },
  planned: { label: "Planned", detail: "Chosen and queued up", tone: "#6F8FAF" },
  done: { label: "Done", detail: "Finished or visited", tone: "#6E8F72" },
  skipped: { label: "Skipped", detail: "Not for now", tone: "#B85B53" },
};

const priorityChoices: Record<ItemPriority, { label: string; detail: string; tone: string }> = {
  low: { label: "Low", detail: "Nice to have", tone: "#8AA8A1" },
  medium: { label: "Medium", detail: "Worth keeping in rotation", tone: "#DFAE73" },
  high: { label: "High", detail: "Top of the list", tone: "#B85B53" },
};

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
  const [selectedMediaUri, setSelectedMediaUri] = useState<string | undefined>(editing?.mediaUri);
  const [selectedMediaType, setSelectedMediaType] = useState<"image" | "video" | undefined>(
    editing?.type === "image" ? "image" : editing?.type === "video" ? "video" : undefined
  );
  const [isSaving, setIsSaving] = useState(false);
  const folderRows = useMemo(() => getFolderHierarchyRows(folders), [folders]);
  const folderDepthById = useMemo(
    () => new Map(folderRows.map((row) => [row.folder.id, row.depth])),
    [folderRows],
  );

  const applySuggestion = useCallback((): void => {
    setTitle(suggestTitle(content));
    setType(detectItemType(content));
    setTags(suggestTags(content).join(", "));
    if (suggestions[0]) setFolderId(suggestions[0].folder.id);
  }, [content, suggestions]);

  const handleMediaSelected = useCallback((uri: string, mediaType: "image" | "video") => {
    setSelectedMediaUri(uri);
    setSelectedMediaType(mediaType);
  }, []);

  const save = useCallback(async (): Promise<void> => {
    setIsSaving(true);
    try {
      let mediaMetadata = undefined;

      // Upload media to Supabase Storage if selected
      if ((type === "image" || type === "video") && selectedMediaUri) {
        const tempId = editing?.id || `temp-${Date.now()}`;
        const uploadResult = await uploadMediaToSupabase(selectedMediaUri, tempId, selectedMediaType || "image");

        if ("error" in uploadResult) {
          Alert.alert("Upload failed", uploadResult.error);
          setIsSaving(false);
          return;
        }

        mediaMetadata = {
          storagePath: uploadResult.storagePath,
          mediaType: selectedMediaType,
        };
      }

      // Handle TikTok URLs
      if (type === "video" && content.includes("tiktok")) {
        mediaMetadata = {
          tiktokUrl: content,
        };
      }

      const payload = {
        folderId,
        title: title || suggestTitle(content),
        description: type === "video" && content.includes("tiktok") ? undefined : content,
        type,
        url: type === "link" ? content : undefined,
        media: mediaMetadata,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        status,
        priority,
      };

      if (editing) {
        updateItem(editing.id, payload);
        navigation.goBack();
      } else {
        const item = createItem(payload);
        navigation.replace("ItemDetail", { itemId: item.id });
      }
    } finally {
      setIsSaving(false);
    }
  }, [content, createItem, editing, folderId, navigation, priority, selectedMediaType, selectedMediaUri, status, tags, title, type, updateItem]);

  return (
    <View style={styles.screen}>
      <ScreenTopBar navigation={navigation} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>{editing ? "Edit item" : "Add item"}</Text>

        <Text style={styles.label}>Idea, URL, or media URI</Text>
        <TextInput
          style={[styles.input, styles.body]}
          multiline
          value={content}
          onChangeText={setContent}
          placeholder="Paste or type something worth saving..."
        />

        <AppButton label="Suggest title, folder & tags" variant="secondary" onPress={applySuggestion} style={styles.button} />

        <Text style={styles.label}>Title</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder={suggestTitle(content)} />

        <Text style={styles.section}>Type</Text>
        {types.map((choice) => {
          const option = typeChoices[choice];
          return (
            <OptionChoiceRow
              key={choice}
              label={option.label}
              detail={option.detail}
              tone={option.tone}
              isSelected={type === choice}
              onPress={() => setType(choice)}
            />
          );
        })}

        {(type === "image" || type === "video") && (
          <MediaPicker onMediaSelected={handleMediaSelected} initialUri={selectedMediaUri} style={styles.button} />
        )}

        <Text style={styles.section}>Folder</Text>
        {suggestions.map((suggestion) => (
          <FolderChoiceRow
            key={suggestion.folder.id}
            folder={suggestion.folder}
            depth={folderDepthById.get(suggestion.folder.id) ?? 0}
            prefix="Suggested"
            isSelected={folderId === suggestion.folder.id}
            onPress={() => setFolderId(suggestion.folder.id)}
          />
        ))}
        {folderRows.map(({ folder, depth }) => (
          <FolderChoiceRow
            key={folder.id}
            folder={folder}
            depth={depth}
            isSelected={folderId === folder.id}
            onPress={() => setFolderId(folder.id)}
          />
        ))}

        <Text style={styles.label}>Tags</Text>
        <TextInput
          style={styles.input}
          value={tags}
          onChangeText={setTags}
          placeholder="ramen, restaurant, dinner"
        />

        <Text style={styles.section}>Status</Text>
        {statuses.map((choice) => {
          const option = statusChoices[choice];
          return (
            <OptionChoiceRow
              key={choice}
              label={option.label}
              detail={option.detail}
              tone={option.tone}
              isSelected={status === choice}
              onPress={() => setStatus(choice)}
            />
          );
        })}

        <Text style={styles.section}>Priority</Text>
        {priorities.map((choice) => {
          const option = priorityChoices[choice];
          return (
            <OptionChoiceRow
              key={choice}
              label={option.label}
              detail={option.detail}
              tone={option.tone}
              isSelected={priority === choice}
              onPress={() => setPriority(choice)}
            />
          );
        })}

        <AppButton label={isSaving ? "Saving..." : "Save item"} onPress={save} disabled={isSaving} style={styles.button} />
        {isSaving && <ActivityIndicator size="large" style={styles.button} />}
      </ScrollView>
    </View>
  );
};
