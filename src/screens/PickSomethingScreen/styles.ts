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
  },
  subtitle: {
    color: colors.muted,
    lineHeight: 21,
    marginTop: spacing.xs,
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
  button: {
    marginVertical: spacing.lg,
  },
});
