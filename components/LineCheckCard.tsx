import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius, borders, sizes, TOUCH_SIZE } from '../constants/theme';
import { LineCheck } from '../types';
import { formatClock, formatWait, formatWaitSpoken, minutesUntil } from '../utils/format';
import { MODE_INFO } from './Tag';

type Props = {
  line: LineCheck;
  destinationName: string;
  now: number;
  onPress?: () => void;
};

// Uma linha do ponto com o aviso "Vai para X" ou "Não vai para X".
// O aviso sempre tem ícone + TEXTO, não depende só da cor.
export default function LineCheckCard({ line, destinationName, now, onPress }: Props) {
  const goes = line.goesToDestination;
  const minutes = minutesUntil(line.nextArrivalAt, now);
  const mode = MODE_INFO[line.mode];
  const statusText = goes ? `Vai para ${destinationName}` : `Não vai para ${destinationName}`;
  const statusColor = goes ? colors.success : colors.danger;

  const spokenText =
    `${mode.label} ${line.code}, ${line.name}. ${statusText}. Próximo ${formatWaitSpoken(minutes)}` +
    (line.accessible ? ', acessível para cadeira de rodas' : '');

  return (
    <TouchableOpacity
      style={[styles.card, { borderColor: goes ? colors.success : colors.border }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.75}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={spokenText}
      accessibilityHint={onPress ? 'Abre os detalhes da linha' : undefined}
    >
      <View style={[styles.lineBox, { backgroundColor: mode.color }]}>
        <Text style={styles.lineCode}>{line.code}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.lineName} numberOfLines={2}>
          {line.name}
        </Text>
        <View style={styles.status}>
          <Ionicons name={goes ? 'checkmark-circle' : 'close-circle'} size={fonts.regular} color={statusColor} />
          <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
        </View>
      </View>

      <View style={styles.timeBox}>
        <Text style={styles.time}>{formatWait(minutes)}</Text>
        <Text style={styles.clock}>{formatClock(line.nextArrivalAt)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: TOUCH_SIZE,
    borderWidth: borders.regular,
  },
  lineBox: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minWidth: sizes.lineBadgeMin,
    alignItems: 'center',
  },
  lineCode: { fontSize: fonts.regular, fontWeight: 'bold', color: colors.textDark },

  info: { flex: 1, gap: spacing.xs },
  lineName: { fontSize: fonts.small, color: colors.textMuted },
  status: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  statusText: { flexShrink: 1, fontSize: fonts.small, fontWeight: 'bold' },

  timeBox: { alignItems: 'flex-end', minWidth: sizes.timeBoxMin },
  time: { fontSize: fonts.medium, fontWeight: 'bold', color: colors.text },
  clock: { fontSize: fonts.small, color: colors.textMuted },
});
