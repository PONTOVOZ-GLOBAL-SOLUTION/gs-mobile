import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius, borders, TOUCH_SIZE, TOUCH_SIZE_SMALL } from '../constants/theme';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  small?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

export default function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  small = false,
  accessibilityLabel,
  accessibilityHint,
}: Props) {
  const textColor = variant === 'primary' ? colors.textDark : variant === 'danger' ? colors.danger : colors.text;

  return (
    <TouchableOpacity
      style={[styles.button, styles[variant], small && styles.small, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
    >
      <View style={styles.row}>
        {icon && <Ionicons name={icon} size={small ? fonts.regular : fonts.large} color={textColor} />}
        <Text style={[styles.text, small && styles.textSmall, { color: textColor }]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: TOUCH_SIZE,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: borders.regular,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: colors.primary, borderColor: colors.primary },
  secondary: { backgroundColor: colors.cardLight, borderColor: colors.border },
  danger: { backgroundColor: colors.transparent, borderColor: colors.danger },
  small: { minHeight: TOUCH_SIZE_SMALL, paddingHorizontal: spacing.md },
  disabled: { opacity: 0.45 },

  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  text: { fontSize: fonts.regular, fontWeight: 'bold' },
  textSmall: { fontSize: fonts.small },
});
