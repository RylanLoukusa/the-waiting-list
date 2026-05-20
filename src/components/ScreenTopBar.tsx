import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ArrowLeftIcon, MenuIcon } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RootStackParamList } from "../navigation/types";
import { colors, spacing } from "../theme/theme";

type Navigation = NativeStackScreenProps<RootStackParamList, "Home">["navigation"];

type Props = {
  navigation: Navigation;
  /** When false, only top safe-area padding is applied (e.g. Home). */
  showBack?: boolean;
  onMenuPress?: () => void;
};

export const ScreenTopBar = ({ navigation, showBack = true, onMenuPress }: Props) => {
  const insets = useSafeAreaInsets();
  const canGoBack = showBack && navigation.canGoBack();

  return (
    <View style={[styles.bar, { paddingTop: insets.top + spacing.xl }]}> 
      <View style={styles.leftActions}>
        {canGoBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={12}
            onPress={() => navigation.goBack()}
            style={({ pressed }: { pressed: boolean }) => [styles.action, pressed && styles.backPressed]}
          >
            <ArrowLeftIcon size={28} color={colors.accentDark} />
          </Pressable>
        ) : onMenuPress ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open menu"
            hitSlop={12}
            onPress={onMenuPress}
            style={({ pressed }: { pressed: boolean }) => [styles.action, pressed && styles.backPressed]}
          >
            <MenuIcon size={28} color={colors.accentDark} />
          </Pressable>
        ) : null}
      </View>
      {canGoBack && onMenuPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open menu"
          hitSlop={12}
          onPress={onMenuPress}
          style={({ pressed }: { pressed: boolean }) => [styles.action, pressed && styles.backPressed]}
        >
          <MenuIcon size={28} color={colors.accentDark} />
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  leftActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  action: {
    alignItems: "center",
    flexDirection: "row",
    gap: 2,
    paddingRight: spacing.md,
    paddingVertical: spacing.xs,
  },
  backPressed: {
    opacity: 0.55,
  },
});
