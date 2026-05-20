import React, { useCallback } from "react";
import { Alert, Linking, ScrollView, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppButton } from "../../components/AppButton";
import { ScreenTopBar } from "../../components/ScreenTopBar";
import { RootStackParamList } from "../../navigation/types";
import { useWaitingList } from "../../storage/storage";
import { getFolderPathLabel } from "../../utils/folderTree";
import { styles } from "./styles";

type Props = NativeStackScreenProps<RootStackParamList, "ItemDetail">;

export const ItemDetailScreen = ({ navigation, route }: Props) => {
  const { folders, items, updateItem, deleteItem } = useWaitingList();
  const item = items.find((candidate) => candidate.id === route.params.itemId);

  const onPressEdit = useCallback(() => {
    if (!item) return;
    navigation.navigate("AddEditItem", { itemId: item.id });
  }, [item, navigation]);

  const onPressMarkDone = useCallback(() => {
    if (!item) return;
    updateItem(item.id, { status: "done" });
  }, [item, updateItem]);

  const onPressOpenUrl = useCallback(() => {
    if (item?.url) void Linking.openURL(item.url);
  }, [item?.url]);

  const confirmDelete = useCallback((): void => {
    if (!item) return;
    Alert.alert("Delete item?", "This removes it from your Waiting List.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteItem(item.id);
          navigation.navigate("Home");
        },
      },
    ]);
  }, [deleteItem, item, navigation]);

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

  return (
    <View style={styles.screen}>
      <ScreenTopBar navigation={navigation} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.type}>{item.type.toUpperCase()}</Text>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.path}>{getFolderPathLabel(folders, item.folderId)}</Text>

        {!!item.url && (
          <View style={styles.preview}>
            <Text style={styles.previewTitle}>Link preview</Text>
            <Text style={styles.url} onPress={onPressOpenUrl}>
              {item.url}
            </Text>
          </View>
        )}

        {!!item.mediaUri && (
          <View style={styles.preview}>
            <Text style={styles.previewTitle}>{item.type === "video" ? "Video" : "Image"} preview</Text>
            <Text style={styles.url}>{item.mediaUri}</Text>
          </View>
        )}

        {!!item.description && <Text style={styles.description}>{item.description}</Text>}

        <View style={styles.row}>
          <Text style={styles.pill}>{item.status}</Text>
          <Text style={styles.pill}>{item.priority} priority</Text>
        </View>

        <Text style={styles.section}>Tags</Text>
        <Text style={styles.meta}>{item.tags.join(", ") || "No tags"}</Text>

        <Text style={styles.section}>Created</Text>
        <Text style={styles.meta}>{new Date(item.createdAt).toLocaleString()}</Text>

        <AppButton label="Edit / Move" onPress={onPressEdit} style={styles.button} />
        <AppButton label="Mark as done" variant="secondary" onPress={onPressMarkDone} style={styles.button} />
        <AppButton label="Delete item" variant="danger" onPress={confirmDelete} style={styles.button} />
      </ScrollView>
    </View>
  );
};
