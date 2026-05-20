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
  },
  title: {
    color: colors.ink,
    flex: 1,
    fontSize: 32,
    fontWeight: "900",
  },
  link: {
    color: colors.accentDark,
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
});
