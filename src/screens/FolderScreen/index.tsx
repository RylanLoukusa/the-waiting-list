import React, { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, Share, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppButton } from "../../components/AppButton";
import { Breadcrumbs } from "../../components/Breadcrumbs";
import { EmptyState } from "../../components/EmptyState";
import { FolderCard } from "../../components/FolderCard";
import { ItemCard } from "../../components/ItemCard";
import { ScreenTopBar } from "../../components/ScreenTopBar";
import { RootStackParamList } from "../../navigation/types";
import { useWaitingList } from "../../storage/storage";
import { Folder, SavedItem } from "../../types/models";
import { canAddChildFolder, getChildFolders, getFolderById, getFolderPath, getItemsInFolder } from "../../utils/folderTree";
import { pickRandomWaitingItem } from "../../utils/itemFilters";
import { styles } from "./styles";

type Props = NativeStackScreenProps<RootStackParamList, "Folder">;

type SubfolderRowProps = {
  child: Folder;
  count: number;
  onOpenFolder: (folderId: string) => void;
};

const SubfolderRow = React.memo(function SubfolderRow({ child, count, onOpenFolder }: SubfolderRowProps) {
  const onPress = useCallback(() => {
    onOpenFolder(child.id);
  }, [child.id, onOpenFolder]);

  return <FolderCard folder={child} count={count} onPress={onPress} />;
});

type FolderItemRowProps = {
  item: SavedItem;
  onOpenItemDetail: (itemId: string) => void;
};

const FolderItemRow = React.memo(function FolderItemRow({ item, onOpenItemDetail }: FolderItemRowProps) {
  const onPress = useCallback(() => {
    onOpenItemDetail(item.id);
  }, [item.id, onOpenItemDetail]);

  return <ItemCard item={item} onPress={onPress} />;
});

export const FolderScreen = ({ navigation, route }: Props) => {
  const { folders, items, deleteFolder } = useWaitingList();
  const [showAllSubfolders, setShowAllSubfolders] = useState(false);

  const folder = getFolderById(folders, route.params.folderId);

  const onBreadcrumbHome = useCallback(() => {
    navigation.navigate("Home");
  }, [navigation]);

  const onBreadcrumbFolder = useCallback(
    (folderId: string) => {
      navigation.navigate("Folder", { folderId });
    },
    [navigation],
  );

  const onOpenFolder = useCallback(
    (folderId: string) => {
      navigation.navigate("Folder", { folderId });
    },
    [navigation],
  );

  const onOpenItemDetail = useCallback(
    (itemId: string) => {
      navigation.navigate("ItemDetail", { itemId });
    },
    [navigation],
  );

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
  const visibleSubfolders = showAllSubfolders ? subfolders : subfolders.slice(0, 3);
  const hiddenSubfolderCount = subfolders.length - visibleSubfolders.length;
  const folderItems = getItemsInFolder(items, folder.id);
  const canNestMore = canAddChildFolder(folders, folder.id);

  const onPressEditFolder = useCallback(() => {
    navigation.navigate("AddEditFolder", { folderId: folder.id });
  }, [navigation, folder.id]);

  const onPressAddItem = useCallback(() => {
    navigation.navigate("AddEditItem", { folderId: folder.id });
  }, [navigation, folder.id]);

  const onPressAddSubfolder = useCallback(() => {
    if (canNestMore) {
      navigation.navigate("AddEditFolder", { parentFolderId: folder.id });
    }
  }, [canNestMore, navigation, folder.id]);

  const onPressPickSomething = useCallback(() => {
    const picked = pickRandomWaitingItem(items, folders, folder.id);
    if (!picked) {
      Alert.alert("Nothing waiting here", "This folder does not have any waiting items to pick from.");
      return;
    }
    navigation.navigate("ItemDetail", { itemId: picked.id });
  }, [folder.id, folders, items, navigation]);

  const onPressShare = useCallback(async (): Promise<void> => {
    const itemLines = folderItems.map((item) => `- ${item.title}`);
    const subfolderLines = subfolders.map((child) => `- ${child.icon ?? "📁"} ${child.name}`);
    const sections = [
      `${folder.icon ?? "📁"} ${folder.name}`,
      subfolderLines.length ? `Subfolders:\n${subfolderLines.join("\n")}` : "",
      itemLines.length ? `Items:\n${itemLines.join("\n")}` : "",
    ].filter(Boolean);

    await Share.share({ message: sections.join("\n\n") });
  }, [folder.icon, folder.name, folderItems, subfolders]);

  const confirmDelete = useCallback((): void => {
    Alert.alert(
      "Delete folder?",
      "This recursively deletes nested subfolders and saved items inside this folder.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteFolder(folder.id);
            navigation.navigate("Home");
          },
        },
      ],
    );
  }, [deleteFolder, folder.id, navigation]);

  const onOpenMenu = useCallback((): void => {
    Alert.alert("Folder actions", folder.name, [
      { text: "Edit", onPress: onPressEditFolder },
      { text: "Pick Something", onPress: onPressPickSomething },
      { text: "Share", onPress: () => void onPressShare() },
      { text: "Delete folder", style: "destructive", onPress: confirmDelete },
      { text: "Cancel", style: "cancel" },
    ]);
  }, [confirmDelete, folder.name, onPressEditFolder, onPressPickSomething, onPressShare]);

  return (
    <View style={styles.screen}>
      <ScreenTopBar navigation={navigation} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Breadcrumbs
          path={getFolderPath(folders, folder.id)}
          onHome={onBreadcrumbHome}
          onFolder={onBreadcrumbFolder}
        />

        <View style={styles.titleRow}>
          <Text style={styles.title}>
            {folder.icon} {folder.name}
          </Text>
          <Pressable onPress={onOpenMenu} style={({ pressed }) => [styles.moreButton, pressed && styles.moreButtonPressed]}>
            <Text style={styles.moreButtonText}>More</Text>
          </Pressable>
        </View>

        <View style={styles.actions}>
          <AppButton label="Add item" onPress={onPressAddItem} style={styles.action} />
          <AppButton
            label={canNestMore ? "Add subfolder" : "Max depth reached"}
            variant="secondary"
            onPress={onPressAddSubfolder}
            style={styles.action}
            disabled={!canNestMore}
          />
        </View>

        <Text style={styles.section}>Subfolders</Text>
        {subfolders.length === 0 ? (
          <EmptyState title="No subfolders yet." message="Create a subfolder to organize this list." />
        ) : (
          <>
            {visibleSubfolders.map((child) => (
              <SubfolderRow
                key={child.id}
                child={child}
                count={items.filter((item) => item.folderId === child.id).length}
                onOpenFolder={onOpenFolder}
              />
            ))}
            {subfolders.length > 3 && (
              <Pressable
                onPress={() => setShowAllSubfolders((current) => !current)}
                style={({ pressed }) => [styles.showAllSubfolders, pressed && styles.showAllSubfoldersPressed]}
              >
                <Text style={styles.showAllSubfoldersText}>
                  {showAllSubfolders ? "Show fewer subfolders" : `Show all subfolders (${hiddenSubfolderCount} more)`}
                </Text>
              </Pressable>
            )}
          </>
        )}

        <Text style={styles.section}>Items</Text>
        {folderItems.length === 0 ? (
          <EmptyState
            title="No items here yet."
            message="Add an idea, link, image, or video to this folder."
          />
        ) : (
          folderItems.map((item) => <FolderItemRow key={item.id} item={item} onOpenItemDetail={onOpenItemDetail} />)
        )}
      </ScrollView>
    </View>
  );
};
