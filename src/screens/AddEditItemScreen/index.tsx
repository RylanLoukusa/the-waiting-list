import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppButton } from "../../components/AppButton";
import { FolderPickerField } from "../../components/FolderPickerField";
import { MediaPicker } from "../../components/MediaPicker";
import { OptionChoiceRow } from "../../components/OptionChoiceRow";
import { ScreenTopBar } from "../../components/ScreenTopBar";
import { RootStackParamList } from "../../navigation/types";
import { uploadMediaToSupabase } from "../../lib/supabaseStorage";
import { useWaitingList } from "../../storage/storage";
import { ItemAttachment, ItemPriority, ItemStatus, ItemType, ListItemKind, SavedListItem } from "../../types/models";
import { detectItemType, suggestFolders, suggestTags, suggestTitle } from "../../utils/folderSuggestions";
import { createId } from "../../utils/id";
import { styles } from "./styles";

type Props = NativeStackScreenProps<RootStackParamList, "AddEditItem">;

const types: ItemType[] = ["text", "list", "link", "image", "video"];
const statuses: ItemStatus[] = ["waiting", "planned", "done", "skipped"];
const priorities: ItemPriority[] = ["low", "medium", "high"];

const typeChoices: Record<ItemType, { label: string; detail: string; tone: string }> = {
  text: { label: "Note", detail: "Rich notes, ideas, reminders", tone: "#8A9A5B" },
  list: { label: "List", detail: "Checklist or bullet rows", tone: "#DFAE73" },
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
  const [listItems, setListItems] = useState<SavedListItem[]>(
    editing?.listItems?.length ? editing.listItems : [{ id: createId("list-item"), kind: "check", text: "", checked: false }],
  );
  const [attachments, setAttachments] = useState<ItemAttachment[]>(
    editing?.attachments ?? (editing?.mediaUri ? [{ id: createId("attachment"), uri: editing.mediaUri, mediaType: editing.type === "video" ? "video" : "image" }] : []),
  );
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

  const updateListItem = useCallback((itemId: string, updates: Partial<SavedListItem>): void => {
    setListItems((current) => current.map((item) => (item.id === itemId ? { ...item, ...updates } : item)));
  }, []);

  const addListItem = useCallback((kind: ListItemKind): void => {
    setListItems((current) => [...current, { id: createId("list-item"), kind, text: "", checked: false }]);
  }, []);

  const removeListItem = useCallback((itemId: string): void => {
    setListItems((current) => (current.length > 1 ? current.filter((item) => item.id !== itemId) : current));
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
        attachments: attachments.length > 0 ? attachments : undefined,
        listItems:
          type === "list"
            ? listItems
                .map((item) => ({ ...item, text: item.text.trim() }))
                .filter((item) => item.text.length > 0)
            : undefined,
        richText: content.trim() || undefined,
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
  }, [attachments, content, createItem, editing, folderId, listItems, navigation, priority, selectedMediaType, selectedMediaUri, status, tags, title, type, updateItem]);

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

        {type === "list" && (
          <View style={styles.listEditor}>
            {listItems.map((listItem) => (
              <View key={listItem.id} style={styles.listRow}>
                <Pressable
                  onPress={() =>
                    updateListItem(
                      listItem.id,
                      listItem.kind === "check" ? { checked: !listItem.checked } : { kind: "check", checked: false },
                    )
                  }
                  style={styles.listMarker}
                >
                  <Text style={styles.listMarkerText}>{listItem.kind === "check" ? (listItem.checked ? "☑" : "☐") : "•"}</Text>
                </Pressable>
                <TextInput
                  style={styles.listInput}
                  value={listItem.text}
                  onChangeText={(text) => updateListItem(listItem.id, { text })}
                  placeholder={listItem.kind === "check" ? "Checklist item" : "Bullet item"}
                />
                <Pressable onPress={() => updateListItem(listItem.id, { kind: listItem.kind === "check" ? "bullet" : "check", checked: false })}>
                  <Text style={styles.listAction}>{listItem.kind === "check" ? "Bullet" : "Check"}</Text>
                </Pressable>
                <Pressable onPress={() => removeListItem(listItem.id)}>
                  <Text style={styles.listRemove}>Remove</Text>
                </Pressable>
              </View>
            ))}
            <View style={styles.listButtons}>
              <AppButton label="Add checklist row" variant="secondary" onPress={() => addListItem("check")} style={styles.listButton} />
              <AppButton label="Add bullet row" variant="secondary" onPress={() => addListItem("bullet")} style={styles.listButton} />
            </View>
          </View>
        )}

        {(type === "image" || type === "video") && (
          <MediaPicker
            onMediaSelected={handleMediaSelected}
            initialUri={selectedMediaUri}
            attachments={attachments}
            onAttachmentsChange={setAttachments}
            style={styles.button}
          />
        )}

        <Text style={styles.section}>Folder</Text>
        <FolderPickerField folders={folders} selectedFolderId={folderId} onSelectFolder={setFolderId} />

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
