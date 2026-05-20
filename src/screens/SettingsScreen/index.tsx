import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth, useIsSupabaseConfigured } from "../../auth/AuthContext";
import { AppButton } from "../../components/AppButton";
import { ScreenTopBar } from "../../components/ScreenTopBar";
import { RootStackParamList } from "../../navigation/types";
import { useWaitingList } from "../../storage/storage";
import { styles } from "./styles";

type Props = NativeStackScreenProps<RootStackParamList, "Settings">;

export const SettingsScreen = ({ navigation }: Props) => {
  const { folders, items, resetToSeed } = useWaitingList();
  const { session, isAuthReady, signOut } = useAuth();
  const supabaseConfigured = useIsSupabaseConfigured();

  const [busy, setBusy] = useState(false);

  const confirmReset = useCallback((): void => {
    Alert.alert(
      "Reset sample data?",
      "This replaces local data with the original sample folders and items.",
      [{ text: "Cancel", style: "cancel" }, { text: "Reset", style: "destructive", onPress: resetToSeed }],
    );
  }, [resetToSeed]);


  const onSignOut = useCallback(async () => {
    setBusy(true);
    await signOut();
    setBusy(false);
  }, [signOut]);

  const onPressLogin = useCallback(() => {
    navigation.navigate("Login");
  }, [navigation]);

  return (
    <View style={styles.screen}>
      <ScreenTopBar navigation={navigation} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.body}>
          The Waiting List works offline and stores folders and items locally on this device. Sign in to sync your
          Waiting List to Supabase when configured.
        </Text>
        <Text style={styles.stat}>{folders.length} folders</Text>
        <Text style={styles.stat}>{items.length} saved items</Text>

        <Text style={styles.sectionTitle}>Account</Text>
        {!supabaseConfigured ? (
          <Text style={styles.body}>
            Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY (see README) to enable cloud sync.
          </Text>
        ) : !isAuthReady ? (
          <ActivityIndicator style={styles.button} />
        ) : session?.user ? (
          <>
            <Text style={styles.signedIn}>Signed in as {session.user.email ?? session.user.id}</Text>
            <AppButton label="Sign out" variant="secondary" onPress={onSignOut} style={styles.button} />
          </>
        ) : (
          <>
            <Text style={styles.body}>
              Sign in to sync your Waiting List with Supabase. You can also create a new account from the login screen.
            </Text>
            <AppButton label="Go to login screen" variant="secondary" onPress={onPressLogin} style={styles.button} />
          </>
        )}

        <AppButton label="Reset to sample data" variant="danger" onPress={confirmReset} style={styles.button} />
        {busy ? <ActivityIndicator style={styles.button} /> : null}
      </ScrollView>
    </View>
  );
};
