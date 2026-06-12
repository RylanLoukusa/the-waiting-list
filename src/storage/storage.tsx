import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import { useAuth } from "../auth/AuthContext";
import { getSupabase } from "../lib/supabase";
import { syncShareExtensionFolders } from "../share/sharedImport";
import { deleteStoredMediaForItems } from "../lib/supabaseStorage";
import { ensureRemoteRowForUser, pullWaitingListForUser, pushWaitingListForUser } from "../sync/waitingListSync";
import { seedData } from "../data/seedData";
import { Folder, SavedItem, WaitingListData } from "../types/models";
import { createId } from "../utils/id";
import { canMoveFolder, deleteFolderRecursively, getFolderTreeIds } from "../utils/folderTree";
import { normalizeWaitingListData } from "../utils/itemTypes";

const STORAGE_KEY_PREFIX = "the-waiting-list:data:v1";
const emptyData: WaitingListData = { folders: [], items: [] };

type WaitingListContextValue = WaitingListData & {
  isReady: boolean;
  createFolder: (input: Pick<Folder, "name" | "parentFolderId"> & Partial<Pick<Folder, "icon" | "color" | "purpose">>) => Folder;
  updateFolder: (folderId: string, updates: Partial<Pick<Folder, "name" | "parentFolderId" | "icon" | "color" | "purpose">>) => boolean;
  deleteFolder: (folderId: string) => Promise<{ ok: boolean; error?: string }>;
  createItem: (input: Omit<SavedItem, "id" | "createdAt" | "updatedAt">) => SavedItem;
  updateItem: (itemId: string, updates: Partial<Omit<SavedItem, "id" | "createdAt">>) => void;
  deleteItem: (itemId: string) => Promise<{ ok: boolean; error?: string }>;
  resetToSeed: () => void;
  clearLocalData: () => void;
};

const WaitingListContext = createContext<WaitingListContextValue | undefined>(undefined);

const cleanOptionalText = (value?: string): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const storageKeyForUser = (userId?: string | null): string =>
  userId ? `${STORAGE_KEY_PREFIX}:user:${userId}` : `${STORAGE_KEY_PREFIX}:anonymous`;

export const loadWaitingListData = async (userId?: string | null): Promise<WaitingListData> => {
  const key = storageKeyForUser(userId);
  const stored = await AsyncStorage.getItem(key);
  if (!stored) {
    const initialData = userId ? emptyData : seedData;
    await AsyncStorage.setItem(key, JSON.stringify(initialData));
    return normalizeWaitingListData(initialData);
  }
  return normalizeWaitingListData(JSON.parse(stored) as WaitingListData);
};

export const saveWaitingListData = async (data: WaitingListData, userId?: string | null): Promise<void> => {
  await AsyncStorage.setItem(storageKeyForUser(userId), JSON.stringify(data));
};

const InnerWaitingListProvider = ({ children }: { children: ReactNode }) => {
  const { session, isAuthReady } = useAuth();
  const [data, setData] = useState<WaitingListData>(seedData);
  const [isReady, setIsReady] = useState(false);
  const activeUserId = isAuthReady ? session?.user?.id ?? null : null;
  const dataRef = useRef(data);
  dataRef.current = data;
  const skipRemotePushRef = useRef(true);

  useEffect(() => {
    if (!isAuthReady) return;

    let cancelled = false;
    skipRemotePushRef.current = true;
    setIsReady(false);
    setData(activeUserId ? emptyData : seedData);

    void loadWaitingListData(activeUserId)
      .then((loaded) => {
        if (!cancelled) setData(loaded);
      })
      .catch(() => {
        if (!cancelled) setData(activeUserId ? emptyData : seedData);
      })
      .finally(() => {
        if (!cancelled) setIsReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [activeUserId, isAuthReady]);

  useEffect(() => {
    if (isReady) {
      void saveWaitingListData(data, activeUserId);
    }
  }, [activeUserId, data, isReady]);

  useEffect(() => {
    if (!isReady) return;
    void syncShareExtensionFolders(data.folders, data.folders[0]?.id ?? null);
  }, [data.folders, isReady]);

  useEffect(() => {
    if (!isReady || !isAuthReady) return;
    const userId = activeUserId;
    if (!userId) {
      skipRemotePushRef.current = false;
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      skipRemotePushRef.current = false;
      return;
    }

    skipRemotePushRef.current = true;
    let cancelled = false;

    void (async () => {
      try {
        const result = await pullWaitingListForUser(supabase, userId);
        if (cancelled) return;
        if (result.kind === "applied") {
          setData(result.data);
        } else if (result.kind === "noop_up_to_date") {
          const local = await loadWaitingListData(userId);
          if (!cancelled) setData(local);
        } else if (result.kind === "no_row") {
          await ensureRemoteRowForUser(supabase, userId, dataRef.current);
        }
      } finally {
        if (!cancelled) {
          skipRemotePushRef.current = false;
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeUserId, isReady, isAuthReady]);

  useEffect(() => {
    if (!isReady || !isAuthReady) return;
    const userId = activeUserId;
    if (!userId) return;
    const supabase = getSupabase();
    if (!supabase) return;
    if (skipRemotePushRef.current) return;

    const handle = setTimeout(() => {
      void pushWaitingListForUser(supabase, userId, data);
    }, 1500);

    return () => clearTimeout(handle);
  }, [activeUserId, data, isReady, isAuthReady]);

  const createFolder = useCallback<WaitingListContextValue["createFolder"]>((input) => {
    const timestamp = new Date().toISOString();
    const folder: Folder = {
      id: createId("folder"),
      name: input.name.trim() || "Untitled folder",
      parentFolderId: input.parentFolderId,
      icon: input.icon || "📁",
      color: input.color || "#D8C7AA",
      purpose: cleanOptionalText(input.purpose),
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
        folders: current.folders.map((folder) => {
          if (folder.id !== folderId) return folder;
          return {
            ...folder,
            ...updates,
            name: updates.name?.trim() || folder.name,
            purpose: updates.purpose !== undefined ? cleanOptionalText(updates.purpose) : folder.purpose,
            updatedAt: new Date().toISOString(),
          };
        }),
      };
    });
    return didUpdate;
  }, []);

  const deleteFolder = useCallback<WaitingListContextValue["deleteFolder"]>(async (folderId) => {
    const folderIdsToDelete = getFolderTreeIds(dataRef.current.folders, folderId);
    const itemsToDelete = dataRef.current.items.filter((item) => folderIdsToDelete.includes(item.folderId));
    const mediaResult = await deleteStoredMediaForItems(itemsToDelete);
    if (!mediaResult.ok) return mediaResult;

    setData((current) => deleteFolderRecursively(current.folders, current.items, folderId));
    return { ok: true };
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

  const deleteItem = useCallback<WaitingListContextValue["deleteItem"]>(async (itemId) => {
    const itemToDelete = dataRef.current.items.find((item) => item.id === itemId);
    if (itemToDelete) {
      const mediaResult = await deleteStoredMediaForItems([itemToDelete]);
      if (!mediaResult.ok) return mediaResult;
    }

    setData((current) => ({ ...current, items: current.items.filter((item) => item.id !== itemId) }));
    return { ok: true };
  }, []);

  const resetToSeed = useCallback(() => setData(seedData), []);
  const clearLocalData = useCallback(() => setData(emptyData), []);

  const value = useMemo<WaitingListContextValue>(
    () => ({ ...data, isReady, createFolder, updateFolder, deleteFolder, createItem, updateItem, deleteItem, resetToSeed, clearLocalData }),
    [data, isReady, createFolder, updateFolder, deleteFolder, createItem, updateItem, deleteItem, resetToSeed, clearLocalData],
  );

  return <WaitingListContext.Provider value={value}>{children}</WaitingListContext.Provider>;
};

export const WaitingListProvider = ({ children }: { children: ReactNode }) => (
  <InnerWaitingListProvider>{children}</InnerWaitingListProvider>
);

export const useWaitingList = (): WaitingListContextValue => {
  const context = useContext(WaitingListContext);
  if (!context) throw new Error("useWaitingList must be used inside WaitingListProvider");
  return context;
};
