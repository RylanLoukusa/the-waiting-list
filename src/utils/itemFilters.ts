import { Folder, SavedItem } from "../types/models";
import { getDescendantFolderIds } from "./folderTree";

export const filterWaitingItems = (items: SavedItem[], folders: Folder[], folderId?: string, highPriorityOnly = false): SavedItem[] => {
  const allowedFolders = folderId ? [folderId, ...getDescendantFolderIds(folders, folderId)] : undefined;
  return items.filter((item) => item.status === "waiting" && (!allowedFolders || allowedFolders.includes(item.folderId)) && (!highPriorityOnly || item.priority === "high"));
};

// Simple MVP picker: choose from waiting items, optionally scoped by folder, and optionally only high priority.
export const pickRandomWaitingItem = (items: SavedItem[], folders: Folder[], folderId?: string, highPriorityOnly = false): SavedItem | undefined => {
  const pool = filterWaitingItems(items, folders, folderId, highPriorityOnly);
  if (pool.length === 0) return undefined;
  return pool[Math.floor(Math.random() * pool.length)];
};

export const searchFoldersAndItems = (query: string, folders: Folder[], items: SavedItem[]) => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return { folders: [], items: [] };

  return {
    folders: folders.filter((folder) => folder.name.toLowerCase().includes(normalized)),
    items: items.filter((item) =>
      [item.title, item.description, item.url, item.notes, item.tags.join(" ")]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    ),
  };
};
