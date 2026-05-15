import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppButton } from "../components/AppButton";
import { EmptyState } from "../components/EmptyState";
import { ItemCard } from "../components/ItemCard";
import { RootStackParamList } from "../navigation/types";
import { useWaitingList } from "../storage/storage";
import { colors, spacing } from "../theme/theme";
import { SavedItem } from "../types/models";
import { getFolderPathLabel } from "../utils/folderTree";
import { pickRandomWaitingItem } from "../utils/itemFilters";

type Props = NativeStackScreenProps<RootStackParamList, "PickSomething">;

export const PickSomethingScreen = ({ navigation, route }: Props) => {
  const { folders, items } = useWaitingList();
  const [folderId, setFolderId] = useState<string | undefined>(route.params?.folderId);
  const [highPriorityOnly, setHighPriorityOnly] = useState(false);
  const [picked, setPicked] = useState<SavedItem | undefined>(() => pickRandomWaitingItem(items, folders, folderId, highPriorityOnly));
  const folderOptions = useMemo(() => folders, [folders]);
  const pick = (): void => setPicked(pickRandomWaitingItem(items, folders, folderId, highPriorityOnly));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Pick Something</Text>
      <Text style={styles.subtitle}>Randomly choose from waiting items. Narrow it by folder or high priority.</Text>
      <Text style={styles.section}>Folder</Text><Text onPress={() => setFolderId(undefined)} style={[styles.choice, !folderId && styles.selected]}>All folders</Text>{folderOptions.map((folder) => <Text key={folder.id} onPress={() => setFolderId(folder.id)} style={[styles.choice, folderId === folder.id && styles.selected]}>{getFolderPathLabel(folders, folder.id)}</Text>)}
      <Text style={styles.section}>Priority</Text><Text onPress={() => setHighPriorityOnly(false)} style={[styles.choice, !highPriorityOnly && styles.selected]}>Any priority</Text><Text onPress={() => setHighPriorityOnly(true)} style={[styles.choice, highPriorityOnly && styles.selected]}>High priority only</Text>
      <AppButton label="Pick for me" onPress={pick} style={styles.button} />
      {picked ? <ItemCard item={picked} folderPath={getFolderPathLabel(folders, picked.folderId)} onPress={() => navigation.navigate("ItemDetail", { itemId: picked.id })} /> : <EmptyState title="Nothing waiting here." message="Try a different folder or turn off high-priority filtering." />}
    </ScrollView>
  );
};

const styles = StyleSheet.create({ container: { backgroundColor: colors.background, flex: 1 }, content: { padding: spacing.lg, paddingTop: 64 }, title: { color: colors.ink, fontSize: 32, fontWeight: "900" }, subtitle: { color: colors.muted, lineHeight: 21, marginTop: spacing.xs }, section: { color: colors.ink, fontSize: 18, fontWeight: "900", marginTop: spacing.lg }, choice: { color: colors.muted, paddingVertical: spacing.sm }, selected: { color: colors.accentDark, fontWeight: "900" }, button: { marginVertical: spacing.lg } });
