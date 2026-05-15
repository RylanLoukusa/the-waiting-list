import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RootStackParamList } from "../navigation/types";
import { colors, spacing } from "../theme/theme";
import { ArrowLeftIcon } from "lucide-react-native";

type Navigation = NativeStackScreenProps<RootStackParamList, "Home">["navigation"];

type Props = {
  navigation: Navigation;
  /** When false, only top safe-area padding is applied (e.g. Home). */
  showBack?: boolean;
};

export const ScreenTopBar = ({ navigation, showBack = true }: Props) => {
  const insets = useSafeAreaInsets();
  const canGoBack = showBack && navigation.canGoBack();

  return (
    <View style={[styles.bar, { paddingTop: insets.top + spacing.xl }]}>
      {canGoBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={12}
          onPress={() => navigation.goBack()}
          style={(state: { pressed: boolean }) => [styles.back, state.pressed && styles.backPressed]}
        >
          <ArrowLeftIcon size={28} color={colors.accentDark} />
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  back: {
    alignSelf: "flex-start",
    alignItems: "center",
    flexDirection: "row",
    gap: 2,
    paddingVertical: spacing.xs,
    paddingRight: spacing.md,
  },
  backPressed: {
    opacity: 0.55,
  },
  backChevron: {
    color: colors.accentDark,
    fontSize: 40,
    fontWeight: "300",
    lineHeight: 28,
    marginTop: -2,
  },
  backLabel: {
    color: colors.accentDark,
    fontSize: 17,
    fontWeight: "800",
  },
});
