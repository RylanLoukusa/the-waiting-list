import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { EmptyState } from "../components/EmptyState";
import { FolderCard } from "../components/FolderCard";
import { ItemCard } from "../components/ItemCard";
import { RootStackParamList } from "../navigation/types";
import { useWaitingList } from "../storage/storage";
import { colors, spacing } from "../theme/theme";
import { getFolderPathLabel } from "../utils/folderTree";
import { searchFoldersAndItems } from "../utils/itemFilters";

type Props = NativeStackScreenProps<RootStackParamList, "Search">;

export const SearchScreen = ({ navigation }: Props) => {
  const { folders, items } = useWaitingList();
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchFoldersAndItems(query, folders, items), [query, folders, items]);
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Search</Text><TextInput style={styles.input} value={query} onChangeText={setQuery} placeholder="Folders, titles, tags, URLs..." autoFocus />
      <Text style={styles.section}>Folders</Text>{results.folders.length === 0 ? <EmptyState title="No folders found." message="Try another search term." /> : results.folders.map((folder) => <FolderCard key={folder.id} folder={folder} onPress={() => navigation.navigate("Folder", { folderId: folder.id })} />)}
      <Text style={styles.section}>Items</Text>{results.items.length === 0 ? <EmptyState title="No items found." message="Search looks across titles, descriptions, tags, and URLs." /> : results.items.map((item) => <ItemCard key={item.id} item={item} folderPath={getFolderPathLabel(folders, item.folderId)} onPress={() => navigation.navigate("ItemDetail", { itemId: item.id })} />)}
    </ScrollView>
  );
};

const styles = StyleSheet.create({ container: { backgroundColor: colors.background, flex: 1 }, content: { padding: spacing.lg, paddingTop: 64 }, title: { color: colors.ink, fontSize: 32, fontWeight: "900", marginBottom: spacing.md }, input: { backgroundColor: colors.surface, borderRadius: 999, padding: spacing.md }, section: { color: colors.ink, fontSize: 20, fontWeight: "900", marginTop: spacing.lg } });
