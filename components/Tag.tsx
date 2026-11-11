import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius, borders } from '../constants/theme';
import { Crowding, Mode } from '../types';

type Props = {
  label: string;
  color?: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

// Etiqueta pequena (lotação, acessível, "sem baldeação"...). Sempre tem TEXTO, não só cor.
export default function Tag({ label, color = colors.textMuted, icon }: Props) {
  return (
    <View style={[styles.tag, { borderColor: color }]} importantForAccessibility="no-hide-descendants">
      {icon && <Ionicons name={icon} size={fonts.small} color={color} />}
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

// Helpers para padronizar as etiquetas mais usadas.
export const CROWDING_INFO: Record<Crowding, { label: string; color: string }> = {
  baixa: { label: 'Vazio', color: colors.success },
  media: { label: 'Cheio', color: colors.warning },
  alta: { label: 'Lotado', color: colors.danger },
};

export const MODE_INFO: Record<Mode, { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  onibus: { label: 'Ônibus', color: colors.bus, icon: 'bus-outline' },
  metro: { label: 'Metrô', color: colors.metro, icon: 'subway-outline' },
  caminhada: { label: 'A pé', color: colors.walk, icon: 'walk-outline' },
};

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: borders.regular,
    borderRadius: radius.round,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    alignSelf: 'flex-start',
  },
  text: { fontSize: fonts.small, fontWeight: 'bold' },
});
