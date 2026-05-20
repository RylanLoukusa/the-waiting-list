import { StyleSheet } from "react-native";
import { colors, spacing } from "../../theme/theme";

export const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  title: {
    color: colors.ink,
    fontSize: 32,
    fontWeight: "900",
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 999,
    padding: spacing.md,
  },
  section: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "900",
    marginTop: spacing.lg,
  },
});
