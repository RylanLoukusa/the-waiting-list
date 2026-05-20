import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth, useIsSupabaseConfigured } from "../../auth/AuthContext";
import { AppButton } from "../../components/AppButton";
import { ScreenTopBar } from "../../components/ScreenTopBar";
import { RootStackParamList } from "../../navigation/types";
import { styles } from "./styles";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export const LoginScreen = ({ navigation }: Props) => {
  const { session, isAuthReady, signInWithPassword, signUpWithPassword, signInWithGoogle } = useAuth();
  const supabaseConfigured = useIsSupabaseConfigured();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const onSignIn = useCallback(async () => {
    setAuthError(null);
    setBusy(true);
    const result = await signInWithPassword(email, password);
    setBusy(false);
    if (result.error) {
      setAuthError(result.error);
      return;
    }
  }, [email, password, signInWithPassword]);

  const onSignUp = useCallback(async () => {
    setAuthError(null);
    setBusy(true);
    const result = await signUpWithPassword(email, password);
    setBusy(false);
    if (result.error) {
      setAuthError(result.error);
      return;
    }
    Alert.alert("Check your email", "Confirm the sign-up link if your project requires email verification.");
  }, [email, password, signUpWithPassword]);

  const onSignInWithGoogle = useCallback(async () => {
    setAuthError(null);
    setBusy(true);
    const result = await signInWithGoogle();
    setBusy(false);
    if (result.error) {
      setAuthError(result.error);
      return;
    }
  }, [signInWithGoogle]);

  const onClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  if (!supabaseConfigured) {
    return (
      <View style={styles.screen}>
        <ScreenTopBar navigation={navigation} />
        <View style={styles.content}>
          <Text style={styles.title}>Login</Text>
          <Text style={styles.body}>
            Supabase is not configured yet. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your environment.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenTopBar navigation={navigation} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Login</Text>
        {session?.user ? (
          <>
            <Text style={styles.body}>You are already signed in as {session.user.email ?? session.user.id}.</Text>
            <AppButton label="Back" onPress={() => navigation.goBack()} style={styles.button} />
          </>
        ) : (
          <>
            <Text style={styles.body}>Sign in with your Supabase email and password.</Text>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="you@example.com"
            />
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
            />
            {authError ? <Text style={styles.error}>{authError}</Text> : null}
            <AppButton label="Continue with Google" variant="secondary" onPress={onSignInWithGoogle} style={styles.button} />
            <AppButton label="Sign in" onPress={onSignIn} style={styles.button} />
            <AppButton label="Create account" variant="secondary" onPress={onSignUp} style={styles.button} />
            {busy ? <ActivityIndicator style={styles.button} /> : null}
          </>
        )}
      </ScrollView>
    </View>
  );
};
