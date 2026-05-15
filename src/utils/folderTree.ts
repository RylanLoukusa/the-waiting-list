import { Folder, SavedItem } from "../types/models";

export const MAX_FOLDER_DEPTH = 5;

export const getChildFolders = (folders: Folder[], parentFolderId: string | null): Folder[] =>
  folders
    .filter((folder) => folder.parentFolderId === parentFolderId)
    .sort((a, b) => a.name.localeCompare(b.name));

export const getItemsInFolder = (items: SavedItem[], folderId: string): SavedItem[] =>
  items.filter((item) => item.folderId === folderId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export const getFolderById = (folders: Folder[], folderId?: string | null): Folder | undefined =>
  folderId ? folders.find((folder) => folder.id === folderId) : undefined;

// Walks from the current folder toward the root so breadcrumbs and suggestion labels stay reliable for deep nesting.
export const getFolderPath = (folders: Folder[], folderId?: string | null): Folder[] => {
  const path: Folder[] = [];
  const seen = new Set<string>();
  let current = getFolderById(folders, folderId);

  while (current && !seen.has(current.id)) {
    path.unshift(current);
    seen.add(current.id);
    current = getFolderById(folders, current.parentFolderId);
  }

  return path;
};

export const getFolderPathLabel = (folders: Folder[], folderId?: string | null): string => {
  const path = getFolderPath(folders, folderId);
  return path.length > 0 ? path.map((folder) => folder.name).join(" > ") : "Home";
};

export const getFolderDepth = (folders: Folder[], folderId?: string | null): number => getFolderPath(folders, folderId).length;

export const canAddChildFolder = (folders: Folder[], parentFolderId: string | null): boolean =>
  getFolderDepth(folders, parentFolderId) < MAX_FOLDER_DEPTH;

export const getDescendantFolderIds = (folders: Folder[], folderId: string): string[] => {
  const descendants: string[] = [];
  const visit = (id: string): void => {
    getChildFolders(folders, id).forEach((child) => {
      descendants.push(child.id);
      visit(child.id);
    });
  };
  visit(folderId);
  return descendants;
};

// Prevents moving a folder beneath itself or one of its descendants, which would create an impossible cycle.
export const canMoveFolder = (folders: Folder[], folderId: string, nextParentFolderId: string | null): boolean => {
  if (folderId === nextParentFolderId) {
    return false;
  }

  if (nextParentFolderId && getDescendantFolderIds(folders, folderId).includes(nextParentFolderId)) {
    return false;
  }

  const movingFolder = getFolderById(folders, folderId);
  if (!movingFolder) {
    return false;
  }

  const subtreeDepth = Math.max(1, ...getDescendantFolderIds(folders, folderId).map((id) => getFolderDepth(folders, id) - getFolderDepth(folders, folderId) + 1));
  const nextDepth = getFolderDepth(folders, nextParentFolderId) + subtreeDepth;
  return nextDepth <= MAX_FOLDER_DEPTH;
};

export const deleteFolderRecursively = (folders: Folder[], items: SavedItem[], folderId: string) => {
  const folderIdsToDelete = [folderId, ...getDescendantFolderIds(folders, folderId)];
  return {
    folders: folders.filter((folder) => !folderIdsToDelete.includes(folder.id)),
    items: items.filter((item) => !folderIdsToDelete.includes(item.folderId)),
  };
};
