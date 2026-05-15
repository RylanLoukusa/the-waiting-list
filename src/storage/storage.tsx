import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { seedData } from "../data/seedData";
import { Folder, SavedItem, WaitingListData } from "../types/models";
import { createId } from "../utils/id";
import { canMoveFolder, deleteFolderRecursively } from "../utils/folderTree";

const STORAGE_KEY = "the-waiting-list:data:v1";

type WaitingListContextValue = WaitingListData & {
  isReady: boolean;
  createFolder: (input: Pick<Folder, "name" | "parentFolderId"> & Partial<Pick<Folder, "icon" | "color">>) => Folder;
  updateFolder: (folderId: string, updates: Partial<Pick<Folder, "name" | "parentFolderId" | "icon" | "color">>) => boolean;
  deleteFolder: (folderId: string) => void;
  createItem: (input: Omit<SavedItem, "id" | "createdAt" | "updatedAt">) => SavedItem;
  updateItem: (itemId: string, updates: Partial<Omit<SavedItem, "id" | "createdAt">>) => void;
  deleteItem: (itemId: string) => void;
  resetToSeed: () => void;
};

const WaitingListContext = createContext<WaitingListContextValue | undefined>(undefined);

export const loadWaitingListData = async (): Promise<WaitingListData> => {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  if (!stored) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
    return seedData;
  }
  return JSON.parse(stored) as WaitingListData;
};

export const saveWaitingListData = async (data: WaitingListData): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const WaitingListProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<WaitingListData>(seedData);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loadWaitingListData()
      .then(setData)
      .catch(() => setData(seedData))
      .finally(() => setIsReady(true));
  }, []);

  useEffect(() => {
    if (isReady) {
      void saveWaitingListData(data);
    }
  }, [data, isReady]);

  const createFolder = useCallback<WaitingListContextValue["createFolder"]>((input) => {
    const timestamp = new Date().toISOString();
    const folder: Folder = {
      id: createId("folder"),
      name: input.name.trim() || "Untitled folder",
      parentFolderId: input.parentFolderId,
      icon: input.icon || "📁",
      color: input.color || "#D8C7AA",
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    setData((current) => ({ ...current, folders: [...current.folders, folder] }));
    return folder;
  }, []);

  const updateFolder = useCallback<WaitingListContextValue["updateFolder"]>((folderId, updates) => {
    let didUpdate = false;
    setData((current) => {
      if (updates.parentFolderId !== undefined && !canMoveFolder(current.folders, folderId, updates.parentFolderId)) {
        Alert.alert("Cannot move folder", "That destination would create a loop or exceed the 5-level nesting limit.");
        return current;
      }
      didUpdate = true;
      return {
        ...current,
        folders: current.folders.map((folder) =>
          folder.id === folderId
            ? { ...folder, ...updates, name: updates.name?.trim() || folder.name, updatedAt: new Date().toISOString() }
            : folder,
        ),
      };
    });
    return didUpdate;
  }, []);

  const deleteFolder = useCallback<WaitingListContextValue["deleteFolder"]>((folderId) => {
    setData((current) => deleteFolderRecursively(current.folders, current.items, folderId));
  }, []);

  const createItem = useCallback<WaitingListContextValue["createItem"]>((input) => {
    const timestamp = new Date().toISOString();
    const item: SavedItem = {
      ...input,
      id: createId("item"),
      title: input.title.trim() || "Untitled idea",
      tags: input.tags.map((tag) => tag.trim()).filter(Boolean),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    setData((current) => ({ ...current, items: [item, ...current.items] }));
    return item;
  }, []);

  const updateItem = useCallback<WaitingListContextValue["updateItem"]>((itemId, updates) => {
    setData((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === itemId
          ? { ...item, ...updates, title: updates.title?.trim() || item.title, tags: updates.tags ?? item.tags, updatedAt: new Date().toISOString() }
          : item,
      ),
    }));
  }, []);

  const deleteItem = useCallback<WaitingListContextValue["deleteItem"]>((itemId) => {
    setData((current) => ({ ...current, items: current.items.filter((item) => item.id !== itemId) }));
  }, []);

  const resetToSeed = useCallback(() => setData(seedData), []);

  const value = useMemo<WaitingListContextValue>(
    () => ({ ...data, isReady, createFolder, updateFolder, deleteFolder, createItem, updateItem, deleteItem, resetToSeed }),
    [data, isReady, createFolder, updateFolder, deleteFolder, createItem, updateItem, deleteItem, resetToSeed],
  );

  return <WaitingListContext.Provider value={value}>{children}</WaitingListContext.Provider>;
};

export const useWaitingList = (): WaitingListContextValue => {
  const context = useContext(WaitingListContext);
  if (!context) throw new Error("useWaitingList must be used inside WaitingListProvider");
  return context;
};
