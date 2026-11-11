import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius, borders, sizes, TOUCH_SIZE } from '../constants/theme';
import { Arrival } from '../types';
import { formatClock, formatWait, formatWaitSpoken, minutesUntil } from '../utils/format';
import Tag, { CROWDING_INFO, MODE_INFO } from './Tag';

type Props = {
  arrival: Arrival;
  now: number;
  onPress?: () => void;
};

// Um ônibus chegando: código da linha, nome, lotação e contagem regressiva.
export default function ArrivalCard({ arrival, now, onPress }: Props) {
  const minutes = minutesUntil(arrival.arrivalAt, now);
  const soon = minutes <= 2;
  const mode = MODE_INFO[arrival.mode];
  const crowding = CROWDING_INFO[arrival.crowding];

  const spokenText =
    `${mode.label} ${arrival.lineCode}, ${arrival.lineName}, ${formatWaitSpoken(minutes)}, ` +
    `lotação ${crowding.label.toLowerCase()}` +
    (arrival.accessible ? ', acessível para cadeira de rodas' : '');

  return (
    <TouchableOpacity
      style={[styles.card, soon && styles.cardSoon]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.75}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={spokenText}
      accessibilityHint={onPress ? 'Abre os detalhes da linha' : undefined}
    >
      <View style={[styles.lineBox, { backgroundColor: mode.color }]}>
        <Ionicons name={mode.icon} size={fonts.large} color={colors.textDark} />
        <Text style={[styles.lineCode, arrival.lineCode.length > 5 && styles.lineCodeLong]}>{arrival.lineCode}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.lineName} numberOfLines={2}>
          {arrival.lineName}
        </Text>
        <View style={styles.tags}>
          <Tag label={crowding.label} color={crowding.color} icon="people-outline" />
          {arrival.accessible && <Tag label="Acessível" icon="accessibility-outline" />}
        </View>
      </View>

      <View style={styles.timeBox}>
        <Text style={[styles.time, soon && styles.timeSoon]}>{formatWait(minutes)}</Text>
        <Text style={styles.clock}>{formatClock(arrival.arrivalAt)}</Text>
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
    borderColor: colors.card,
  },
  cardSoon: { borderColor: colors.primary },

  lineBox: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minWidth: sizes.lineBadgeMin,
    maxWidth: sizes.lineBadgeMax,
    alignItems: 'center',
  },
  lineCode: { fontSize: fonts.regular, fontWeight: 'bold', color: colors.textDark, textAlign: 'center' },
  lineCodeLong: { fontSize: fonts.small },

  info: { flex: 1, gap: spacing.xs },
  lineName: { fontSize: fonts.regular, fontWeight: '600', color: colors.text },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },

  timeBox: { alignItems: 'flex-end', minWidth: sizes.timeBoxMin },
  time: { fontSize: fonts.large, fontWeight: 'bold', color: colors.text },
  timeSoon: { color: colors.primary },
  clock: { fontSize: fonts.small, color: colors.textMuted },
});
