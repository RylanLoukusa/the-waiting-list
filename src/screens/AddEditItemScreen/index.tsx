import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppButton } from "../../components/AppButton";
import { MediaPicker } from "../../components/MediaPicker";
import { ScreenTopBar } from "../../components/ScreenTopBar";
import { RootStackParamList } from "../../navigation/types";
import { uploadMediaToSupabase } from "../../lib/supabaseStorage";
import { useWaitingList } from "../../storage/storage";
import { ItemPriority, ItemStatus, ItemType } from "../../types/models";
import { detectItemType, suggestFolders, suggestTags, suggestTitle } from "../../utils/folderSuggestions";
import { getFolderPathLabel } from "../../utils/folderTree";
import { styles } from "./styles";

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
  const [selectedMediaUri, setSelectedMediaUri] = useState<string | undefined>(editing?.mediaUri);
  const [selectedMediaType, setSelectedMediaType] = useState<"image" | "video" | undefined>(
    editing?.type === "image" ? "image" : editing?.type === "video" ? "video" : undefined
  );
  const [isSaving, setIsSaving] = useState(false);

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
        {types.map((choice) => (
          <Text key={choice} onPress={() => setType(choice)} style={[styles.choice, type === choice && styles.selected]}>
            {choice}
          </Text>
        ))}

        {(type === "image" || type === "video") && (
          <MediaPicker onMediaSelected={handleMediaSelected} initialUri={selectedMediaUri} style={styles.button} />
        )}

        <Text style={styles.section}>Folder</Text>
        {suggestions.map((suggestion) => (
          <Text
            key={suggestion.folder.id}
            onPress={() => setFolderId(suggestion.folder.id)}
            style={[styles.choice, folderId === suggestion.folder.id && styles.selected]}
          >
            Suggested: {getFolderPathLabel(folders, suggestion.folder.id)}
          </Text>
        ))}
        {folders.map((folder) => (
          <Text
            key={folder.id}
            onPress={() => setFolderId(folder.id)}
            style={[styles.choice, folderId === folder.id && styles.selected]}
          >
            {getFolderPathLabel(folders, folder.id)}
          </Text>
        ))}

        <Text style={styles.label}>Tags</Text>
        <TextInput
          style={styles.input}
          value={tags}
          onChangeText={setTags}
          placeholder="ramen, restaurant, dinner"
        />

        <Text style={styles.section}>Status</Text>
        {statuses.map((choice) => (
          <Text
            key={choice}
            onPress={() => setStatus(choice)}
            style={[styles.choice, status === choice && styles.selected]}
          >
            {choice}
          </Text>
        ))}

        <Text style={styles.section}>Priority</Text>
        {priorities.map((choice) => (
          <Text
            key={choice}
            onPress={() => setPriority(choice)}
            style={[styles.choice, priority === choice && styles.selected]}
          >
            {choice}
          </Text>
        ))}

        <AppButton label={isSaving ? "Saving..." : "Save item"} onPress={save} disabled={isSaving} style={styles.button} />
        {isSaving && <ActivityIndicator size="large" style={styles.button} />}
      </ScrollView>
    </View>
  );
};
