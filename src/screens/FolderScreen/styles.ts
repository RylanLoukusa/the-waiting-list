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
  notFoundBody: {
    flex: 1,
    padding: spacing.lg,
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  title: {
    color: colors.ink,
    flex: 1,
    fontSize: 32,
    fontWeight: "900",
  },
  moreButton: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  moreButtonPressed: {
    opacity: 0.72,
  },
  moreButtonText: {
    color: colors.accentDark,
    fontSize: 14,
    fontWeight: "900",
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  action: {
    flex: 1,
  },
  section: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "900",
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  showAllSubfolders: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: spacing.xs,
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  showAllSubfoldersPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.99 }],
  },
  showAllSubfoldersText: {
    color: colors.accentDark,
    fontSize: 14,
    fontWeight: "900",
  },
});
