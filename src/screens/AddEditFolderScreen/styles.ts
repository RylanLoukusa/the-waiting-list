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
  iconInput: {
    fontSize: 24,
    minHeight: 56,
  },
  inputWarning: {
    borderColor: colors.danger,
    borderWidth: 1,
  },
  helpText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  colorGrid: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    padding: spacing.md,
  },
  colorTileSelected: {
    borderColor: colors.ink,
  },
  colorTilePressed: {
    opacity: 0.72,
    transform: [{ scale: 0.94 }],
  },
  colorSwatch: {
    alignItems: "center",
    borderColor: colors.surface,
    borderRadius: 18,
    borderWidth: 3,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  colorCheck: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 20,
    textShadowColor: "rgba(0, 0, 0, 0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  section: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900",
    marginTop: spacing.lg,
  },
  parentSummary: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: spacing.xs,
    minHeight: 60,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  parentSummaryPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.99 }],
  },
  parentSummaryIcon: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 12,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  parentSummaryIconText: {
    fontSize: 20,
  },
  parentSummaryCopy: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  parentSummaryTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900",
  },
  parentSummaryMeta: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  parentSummaryAction: {
    color: colors.accentDark,
    fontSize: 13,
    fontWeight: "900",
    marginLeft: spacing.sm,
  },
  modalScreen: {
    backgroundColor: colors.background,
  },
  modalContent: {
    padding: spacing.lg,
    paddingBottom: 60,
  },
  modalHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  modalTitle: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: "900",
  },
  modalClose: {
    color: colors.accentDark,
    fontWeight: "800",
  },
  modalSection: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900",
    marginTop: spacing.lg,
  },
  emptyPickerText: {
    color: colors.muted,
    marginTop: spacing.sm,
  },
  homeChoice: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: spacing.xs,
    minHeight: 54,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  homeChoiceSelected: {
    borderColor: colors.accent,
    borderWidth: 2,
  },
  homeChoicePressed: {
    opacity: 0.72,
    transform: [{ scale: 0.99 }],
  },
  homeIcon: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 10,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  homeIconText: {
    color: colors.accentDark,
    fontSize: 20,
    fontWeight: "900",
  },
  homeCopy: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  homeTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "800",
  },
  homeTitleSelected: {
    color: colors.accentDark,
  },
  homeMeta: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  homeCheck: {
    color: colors.accentDark,
    fontSize: 18,
    fontWeight: "900",
    marginLeft: spacing.sm,
  },
  save: {
    marginTop: spacing.lg,
  },
});
