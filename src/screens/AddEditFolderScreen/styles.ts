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
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.muted,
    fontWeight: "800",
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    color: colors.ink,
    padding: spacing.md,
  },
  section: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900",
    marginTop: spacing.lg,
  },
  choice: {
    color: colors.muted,
    paddingVertical: spacing.sm,
  },
  selected: {
    color: colors.accentDark,
    fontWeight: "900",
  },
  save: {
    marginTop: spacing.lg,
  },
});
