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
  notFoundBody: {
    flex: 1,
    padding: spacing.lg,
  },
  notFoundText: {
    color: colors.muted,
    fontSize: 16,
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  type: {
    color: colors.accentDark,
    fontSize: 13,
    fontWeight: "900",
  },
  title: {
    color: colors.ink,
    fontSize: 32,
    fontWeight: "900",
    marginTop: spacing.xs,
  },
  path: {
    color: colors.accentDark,
    fontWeight: "800",
    marginTop: spacing.xs,
  },
  description: {
    color: colors.ink,
    fontSize: 16,
    lineHeight: 24,
    marginTop: spacing.lg,
  },
  preview: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  previewTitle: {
    color: colors.ink,
    fontWeight: "900",
  },
  url: {
    color: colors.blue,
    marginTop: spacing.xs,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  pill: {
    backgroundColor: colors.surface,
    borderRadius: 999,
    color: colors.muted,
    fontWeight: "800",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  section: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900",
    marginTop: spacing.lg,
  },
  meta: {
    color: colors.muted,
    marginTop: spacing.xs,
  },
  button: {
    marginTop: spacing.md,
  },
});
