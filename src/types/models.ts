export type ItemType = "text" | "list" | "link" | "image" | "video";
export type ItemStatus = "waiting" | "planned" | "done" | "skipped";
export type ItemPriority = "low" | "medium" | "high";
export type ListItemKind = "check" | "bullet";
export type ItemConnectionRelation = "related" | "similar" | "compare" | "alternative" | "part_of" | "inspired_by";

export type Folder = {
  id: string;
  name: string;
  parentFolderId: string | null;
  icon?: string;
  color?: string;
  purpose?: string;
  createdAt: string;
  updatedAt: string;
};

export type MediaMetadata = {
  storagePath?: string; // path in Supabase Storage bucket
  mediaType?: "image" | "video"; // type of file in storage
  tiktokUrl?: string; // external TikTok URL
  thumbnailPath?: string; // path to thumbnail in storage
};

export type SavedListItem = {
  id: string;
  kind: ListItemKind;
  text: string;
  checked?: boolean;
};

export type ItemAttachment = {
  id: string;
  uri: string;
  mediaType: "image" | "video";
  caption?: string;
};

export type ItemConnection = {
  itemId: string;
  relation: ItemConnectionRelation;
  note?: string;
  createdAt?: string;
};

export type SavedItem = {
  id: string;
  folderId: string;
  title: string;
  description?: string;
  type: ItemType;
  url?: string;
  mediaUri?: string; // local URI during editing
  thumbnailUri?: string; // local thumbnail URI during editing
  media?: MediaMetadata; // metadata for stored media
  attachments?: ItemAttachment[];
  listItems?: SavedListItem[];
  richText?: string;
  connections?: ItemConnection[];
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
