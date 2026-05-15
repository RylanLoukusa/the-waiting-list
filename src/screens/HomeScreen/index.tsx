import React, { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppButton } from "../../components/AppButton";
import { EmptyState } from "../../components/EmptyState";
import { FolderCard } from "../../components/FolderCard";
import { ItemCard } from "../../components/ItemCard";
import { QuickAddModal } from "../../components/QuickAddModal";
import { ScreenTopBar } from "../../components/ScreenTopBar";
import { RootStackParamList } from "../../navigation/types";
import { useWaitingList } from "../../storage/storage";
import { Folder, SavedItem } from "../../types/models";
import { getChildFolders, getDescendantFolderIds, getFolderPathLabel } from "../../utils/folderTree";
import { styles } from "./styles";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

type FolderListItemProps = {
  folder: Folder;
  count: number;
  onOpenFolder: (folderId: string) => void;
};

const FolderListItem = React.memo(function FolderListItem({ folder, count, onOpenFolder }: FolderListItemProps) {
  const onPress = useCallback(() => {
    onOpenFolder(folder.id);
  }, [folder.id, onOpenFolder]);

  return <FolderCard folder={folder} count={count} onPress={onPress} />;
});

type RecentItemRowProps = {
  item: SavedItem;
  folderPath: string;
  onOpenItemDetail: (itemId: string) => void;
};

const RecentItemRow = React.memo(function RecentItemRow({ item, folderPath, onOpenItemDetail }: RecentItemRowProps) {
  const onPress = useCallback(() => {
    onOpenItemDetail(item.id);
  }, [item.id, onOpenItemDetail]);

  return <ItemCard item={item} folderPath={folderPath} onPress={onPress} />;
});

export const HomeScreen = ({ navigation }: Props) => {
  const { folders, items } = useWaitingList();
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const onCloseQuickAdd = useCallback(() => {
    setQuickAddOpen(false);
  }, []);

  const onPressSearch = useCallback(() => {
    navigation.navigate("Search");
  }, [navigation]);

  const onPressQuickAdd = useCallback(() => {
    setQuickAddOpen(true);
  }, []);

  const onPressPickSomething = useCallback(() => {
    navigation.navigate("PickSomething");
  }, [navigation]);

  const onPressNewFolder = useCallback(() => {
    navigation.navigate("AddEditFolder", { parentFolderId: null });
  }, [navigation]);

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

  const onPressSettings = useCallback(() => {
    navigation.navigate("Settings");
  }, [navigation]);

  const topFolders = getChildFolders(folders, null);
  const recentItems = [...items]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  const countForFolder = (folderId: string) => {
    const ids = [folderId, ...getDescendantFolderIds(folders, folderId)];
    return items.filter((item) => ids.includes(item.folderId)).length;
  };

  return (
    <View style={styles.screen}>
      <ScreenTopBar navigation={navigation} showBack={false} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>Save ideas now. Pick the perfect one later.</Text>
        <Text style={styles.title}>The Waiting List</Text>

        <Pressable style={styles.search} onPress={onPressSearch}>
          <Text style={styles.searchText}>Search folders, ideas, tags, URLs...</Text>
        </Pressable>

        <View style={styles.actions}>
          <AppButton label="Quick Add" onPress={onPressQuickAdd} style={styles.action} />
          <AppButton
            label="Pick Something"
            variant="secondary"
            onPress={onPressPickSomething}
            style={styles.action}
          />
        </View>

        <View style={styles.rowHeader}>
          <Text style={styles.section}>Folders</Text>
          <Pressable onPress={onPressNewFolder}>
            <Text style={styles.link}>New folder</Text>
          </Pressable>
        </View>

        {topFolders.length === 0 ? (
          <EmptyState
            title="No folders yet."
            message="Create folders to organize everything waiting for later."
          />
        ) : (
          topFolders.map((folder) => (
            <FolderListItem
              key={folder.id}
              folder={folder}
              count={countForFolder(folder.id)}
              onOpenFolder={onOpenFolder}
            />
          ))
        )}

        <Text style={styles.section}>Recently added</Text>
        {recentItems.length === 0 ? (
          <EmptyState
            title="No items here yet."
            message="Add an idea, link, image, or video to your Waiting List."
          />
        ) : (
          recentItems.map((item) => (
            <RecentItemRow
              key={item.id}
              item={item}
              folderPath={getFolderPathLabel(folders, item.folderId)}
              onOpenItemDetail={onOpenItemDetail}
            />
          ))
        )}

        <AppButton
          label="Settings"
          variant="secondary"
          onPress={onPressSettings}
          style={styles.settings}
        />
        <QuickAddModal visible={quickAddOpen} onClose={onCloseQuickAdd} />
      </ScrollView>
    </View>
  );
};
