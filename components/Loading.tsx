import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing, radius, borders } from '../constants/theme';

type Props = {
  message?: string;
};

export default function Loading({ message = 'Carregando...' }: Props) {
  return (
    <View
      style={styles.container}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={message}
      accessibilityLiveRegion="polite"
    >
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    padding: spacing.xl,
    borderRadius: radius.lg,
    alignItems: 'center',
    borderWidth: borders.thin,
    borderColor: colors.border,
  },
  text: {
    color: colors.textMuted,
    marginTop: spacing.md,
    fontSize: fonts.regular,
    textAlign: 'center',
  },
});
