export type ItemType = "text" | "link" | "image" | "video";
export type ItemStatus = "waiting" | "planned" | "done" | "skipped";
export type ItemPriority = "low" | "medium" | "high";

export type Folder = {
  id: string;
  name: string;
  parentFolderId: string | null;
  icon?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
};

export type SavedItem = {
  id: string;
  folderId: string;
  title: string;
  description?: string;
  type: ItemType;
  url?: string;
  mediaUri?: string;
  thumbnailUri?: string;
  tags: string[];
  status: ItemStatus;
  priority: ItemPriority;
  createdAt: string;
  updatedAt: string;
  notes?: string;
};

export type Tag = {
  id: string;
  name: string;
  color?: string;
};

export type WaitingListData = {
  folders: Folder[];
  items: SavedItem[];
};

export type FolderSuggestion = {
  folder: Folder;
  score: number;
  reasons: string[];
};
