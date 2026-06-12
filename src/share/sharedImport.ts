import { NativeModules, Platform } from "react-native";
import { Folder, MediaCollectionItem } from "../types/models";

export type SharedImportPayload = {
  autoSave?: boolean;
  folderId?: string;
  id: string;
  mediaItems?: MediaCollectionItem[];
  sharedText?: string;
  sourceUrl?: string;
  title?: string;
};

type SharedImportNativeModule = {
  clearImport: (importId: string) => Promise<boolean>;
  getLatestImportId?: () => Promise<string | null>;
  markImportConsumed?: (importId: string) => Promise<boolean>;
  readImport: (importId: string) => Promise<SharedImportPayload | null>;
  syncFolderSnapshot?: (snapshot: ShareExtensionFolderSnapshot) => Promise<boolean>;
};

const nativeModule = NativeModules.SharedImportModule as SharedImportNativeModule | undefined;

type ShareExtensionFolder = Pick<Folder, "id" | "name" | "parentFolderId" | "icon" | "color">;

type ShareExtensionFolderSnapshot = {
  defaultFolderId?: string | null;
  folders: ShareExtensionFolder[];
};

export const getLatestSharedImportId = async (): Promise<string | null> => {
  if (Platform.OS !== "ios" || !nativeModule?.getLatestImportId) return null;
  return nativeModule.getLatestImportId();
};

export const syncShareExtensionFolders = async (folders: Folder[], defaultFolderId?: string | null): Promise<void> => {
  if (Platform.OS !== "ios" || !nativeModule?.syncFolderSnapshot) return;

  await nativeModule.syncFolderSnapshot({
    defaultFolderId: defaultFolderId ?? null,
    folders: folders.map((folder) => ({
      id: folder.id,
      name: folder.name,
      parentFolderId: folder.parentFolderId,
      icon: folder.icon,
      color: folder.color,
    })),
  });
};

export const readSharedImport = async (importId: string): Promise<SharedImportPayload | null> => {
  if (Platform.OS !== "ios" || !nativeModule) return null;
  return nativeModule.readImport(importId);
};

export const clearSharedImport = async (importId: string): Promise<void> => {
  if (Platform.OS !== "ios" || !nativeModule) return;
  await nativeModule.clearImport(importId);
};

export const markSharedImportConsumed = async (importId: string): Promise<void> => {
  if (Platform.OS !== "ios" || !nativeModule?.markImportConsumed) return;
  await nativeModule.markImportConsumed(importId);
};

export const inferSourcePlatform = (sourceUrl?: string): string | undefined => {
  if (!sourceUrl) return undefined;

  try {
    const host = new URL(sourceUrl).hostname.replace(/^www\./, "").toLowerCase();
    if (host.includes("instagram")) return "Instagram";
    if (host.includes("tiktok")) return "TikTok";
    if (host.includes("x.com") || host.includes("twitter")) return "X";
    if (host.includes("youtube") || host.includes("youtu.be")) return "YouTube";
    if (host.includes("threads")) return "Threads";
    return host;
  } catch {
    return undefined;
  }
};

export const titleFromSharedImport = (payload: SharedImportPayload): string => {
  if (payload.title?.trim()) return payload.title.trim();
  const platform = inferSourcePlatform(payload.sourceUrl);
  if (platform) return `${platform} post`;
  if (payload.sharedText?.trim()) return payload.sharedText.trim().slice(0, 72);
  return "Shared item";
};
