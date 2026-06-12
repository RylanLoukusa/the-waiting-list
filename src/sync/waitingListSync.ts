import AsyncStorage from "@react-native-async-storage/async-storage";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { WaitingListData } from "../types/models";
import { normalizeWaitingListData } from "../utils/itemTypes";

const remoteUpdatedAtKey = (userId: string): string => `the-waiting-list:remoteUpdatedAt:${userId}`;

type RemoteRow = {
  payload: unknown;
  updated_at: string;
};

const isWaitingListPayload = (value: unknown): value is WaitingListData => {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return Array.isArray(record.folders) && Array.isArray(record.items);
};

export const readStoredRemoteUpdatedAt = async (userId: string): Promise<string | null> => {
  return AsyncStorage.getItem(remoteUpdatedAtKey(userId));
};

const writeStoredRemoteUpdatedAt = async (userId: string, iso: string): Promise<void> => {
  await AsyncStorage.setItem(remoteUpdatedAtKey(userId), iso);
};

export const clearStoredRemoteUpdatedAt = async (userId: string): Promise<void> => {
  await AsyncStorage.removeItem(remoteUpdatedAtKey(userId));
};

export type PullWaitingListResult =
  | { kind: "applied"; data: WaitingListData; remoteUpdatedAt: string }
  | { kind: "noop_up_to_date"; remoteUpdatedAt: string }
  | { kind: "noop_invalid" }
  | { kind: "error" }
  | { kind: "no_row" };

export const pullWaitingListForUser = async (
  supabase: SupabaseClient,
  userId: string,
): Promise<PullWaitingListResult> => {
  const { data: row, error } = await supabase
    .from("waiting_list_data")
    .select("payload, updated_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.warn("[sync] pull failed", error.message);
    return { kind: "error" };
  }

  if (!row) {
    return { kind: "no_row" };
  }

  const remote = row as RemoteRow;
  if (!isWaitingListPayload(remote.payload)) {
    console.warn("[sync] remote payload invalid shape");
    return { kind: "noop_invalid" };
  }

  const storedAt = await readStoredRemoteUpdatedAt(userId);
  if (storedAt && remote.updated_at <= storedAt) {
    return { kind: "noop_up_to_date", remoteUpdatedAt: remote.updated_at };
  }

  await writeStoredRemoteUpdatedAt(userId, remote.updated_at);
  return { kind: "applied", data: normalizeWaitingListData(remote.payload), remoteUpdatedAt: remote.updated_at };
};

export const pushWaitingListForUser = async (
  supabase: SupabaseClient,
  userId: string,
  data: WaitingListData,
): Promise<{ ok: boolean; updatedAt?: string }> => {
  const updatedAt = new Date().toISOString();
  const { error } = await supabase.from("waiting_list_data").upsert(
    {
      user_id: userId,
      payload: data,
      updated_at: updatedAt,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    console.warn("[sync] push failed", error.message);
    return { ok: false };
  }

  await writeStoredRemoteUpdatedAt(userId, updatedAt);
  return { ok: true, updatedAt };
};

export const ensureRemoteRowForUser = async (
  supabase: SupabaseClient,
  userId: string,
  local: WaitingListData,
): Promise<{ created: boolean }> => {
  const { data: row, error: selectError } = await supabase
    .from("waiting_list_data")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (selectError) {
    console.warn("[sync] ensureRemote select failed", selectError.message);
    return { created: false };
  }

  if (row) {
    return { created: false };
  }

  const { error: insertError } = await supabase.from("waiting_list_data").insert({
    user_id: userId,
    payload: local,
    updated_at: new Date().toISOString(),
  });

  if (insertError) {
    console.warn("[sync] ensureRemote insert failed", insertError.message);
    return { created: false };
  }

  await writeStoredRemoteUpdatedAt(userId, new Date().toISOString());
  return { created: true };
};
