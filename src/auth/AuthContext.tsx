import type { Session } from "@supabase/supabase-js";
import Constants from "expo-constants";
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Alert, Platform } from "react-native";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import { getSupabase, isSupabaseConfigured } from "../lib/supabase";

const extra = Constants.expoConfig?.extra ?? (Constants.manifest as any)?.extra ?? {};
const googleIosClientId =
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? extra.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "";
const googleWebClientId =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? extra.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "";

type AuthContextValue = {
  session: Session | null;
  isAuthReady: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithPassword: (email: string, password: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setSession(null);
      setIsAuthReady(true);
      return;
    }

    let cancelled = false;

    void supabase.auth.getSession().then(({ data: { session: next } }) => {
      if (!cancelled) {
        setSession(next);
        setIsAuthReady(true);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    const supabase = getSupabase();
    if (!supabase) {
      Alert.alert("Supabase", "Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your environment.");
      return { error: "not_configured" };
    }
    const trimmed = email.trim();
    const { error } = await supabase.auth.signInWithPassword({ email: trimmed, password });
    if (error) return { error: error.message };
    return {};
  }, []);

  const signUpWithPassword = useCallback(async (email: string, password: string) => {
    const supabase = getSupabase();
    if (!supabase) {
      Alert.alert("Supabase", "Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your environment.");
      return { error: "not_configured" };
    }
    const trimmed = email.trim();
    const { error } = await supabase.auth.signUp({ email: trimmed, password });
    if (error) return { error: error.message };
    return {};
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) {
      Alert.alert("Supabase", "Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your environment.");
      return { error: "not_configured" };
    }

    if (Platform.OS === "ios" && !googleIosClientId) {
      Alert.alert(
        "Google Sign-In",
        "Add EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID to your environment to use native iOS Google login.",
      );
      return { error: "missing_google_client" };
    }

    if (!googleIosClientId && !googleWebClientId) {
      Alert.alert(
        "Google Sign-In",
        "Add EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID or EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to your environment.",
      );
      return { error: "missing_google_client" };
    }

    GoogleSignin.configure({
      scopes: ["email", "profile"],
      webClientId: googleWebClientId || undefined,
      iosClientId: googleIosClientId || undefined,
      offlineAccess: false,
    });

    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const result = await GoogleSignin.signIn();
      const idToken = result.idToken;
      if (!idToken) {
        return { error: "Missing Google ID token" };
      }

      const { error } = await supabase.auth.signInWithIdToken({ provider: "google", token: idToken });
      if (error) return { error: error.message };
      return {};
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "code" in error && (error as any).code === statusCodes.SIGN_IN_CANCELLED) {
        return { error: "Google sign-in cancelled" };
      }
      return { error: error instanceof Error ? error.message : "Unable to sign in with Google" };
    }
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthReady,
      signInWithPassword,
      signUpWithPassword,
      signInWithGoogle,
      signOut,
    }),
    [session, isAuthReady, signInWithPassword, signUpWithPassword, signInWithGoogle, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

export const useIsSupabaseConfigured = (): boolean => isSupabaseConfigured();
