import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius, borders } from '../constants/theme';
import { RouteOption } from '../types';
import { formatClock, formatDuration } from '../utils/format';
import Button from './Button';
import Tag, { CROWDING_INFO, MODE_INFO } from './Tag';

type Props = {
  option: RouteOption;
  onPressLine?: (lineId: string) => void;
};

// Uma alternativa de trajeto. A melhor opção ganha destaque amarelo.
export default function RouteCard({ option, onPressLine }: Props) {
  const firstLineId = option.legs.find((leg) => leg.lineId)?.lineId;
  const isWalkOnly = option.title === 'A pé';
  const crowding = option.crowding ? CROWDING_INFO[option.crowding] : null;

  const waitText = isWalkOnly ? 'Saia agora' : option.waitMinutes <= 1 ? 'Sai agora' : `Sai em ${option.waitMinutes} min`;
  const transferText = option.transfers === 0 ? 'Sem baldeação' : `${option.transfers} baldeação`;

  const spokenText =
    `${option.isBest ? 'Melhor opção. ' : ''}${option.title}. ` +
    `Tempo total ${option.totalMinutes} minutos, chegada às ${formatClock(option.arriveAt)}. ` +
    `${waitText}. ${transferText}. ` +
    (crowding ? `Lotação ${crowding.label.toLowerCase()}. ` : '') +
    option.highlight;

  return (
    <View style={[styles.card, option.isBest && styles.cardBest]}>
      <View accessible accessibilityLabel={spokenText} style={styles.summary}>
        {option.isBest && (
          <View style={styles.bestBadge}>
            <Ionicons name="star" size={fonts.small} color={colors.textDark} />
            <Text style={styles.bestBadgeText}>MELHOR OPÇÃO AGORA</Text>
          </View>
        )}

        <View style={styles.header}>
          <Text style={styles.title}>{option.title}</Text>
          <View style={styles.totalBox}>
            <Text style={[styles.total, option.isBest && styles.totalBest]}>{formatDuration(option.totalMinutes)}</Text>
            <Text style={styles.arrive}>chega {formatClock(option.arriveAt)}</Text>
          </View>
        </View>

        <Text style={[styles.highlight, option.isBest && styles.highlightBest]}>{option.highlight}</Text>

        <View style={styles.tags}>
          <Tag label={waitText} icon="time-outline" />
          <Tag label={transferText} icon="swap-horizontal-outline" />
          {crowding && <Tag label={crowding.label} color={crowding.color} icon="people-outline" />}
          {option.accessible && !isWalkOnly && <Tag label="Acessível" icon="accessibility-outline" />}
        </View>

        <View style={styles.legs}>
          {option.legs.map((leg, index) => {
            const mode = MODE_INFO[leg.mode];
            return (
              <View key={index} style={styles.leg}>
                <Ionicons name={mode.icon} size={fonts.large} color={mode.color} />
                <Text style={styles.legText}>
                  {leg.label} · {leg.minutes} min
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {firstLineId && onPressLine && (
        <Button
          small
          variant="secondary"
          title="Ver detalhes da linha"
          icon="information-circle-outline"
          accessibilityLabel={`Ver detalhes da linha ${option.title}`}
          onPress={() => onPressLine(firstLineId)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: borders.regular,
    borderColor: colors.border,
  },
  cardBest: { borderColor: colors.primary, borderWidth: borders.thick, backgroundColor: colors.cardLight },
  summary: { gap: spacing.sm },

  bestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: radius.round,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  bestBadgeText: { fontSize: fonts.small, fontWeight: 'bold', color: colors.textDark },

  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  title: { flex: 1, fontSize: fonts.large, fontWeight: 'bold', color: colors.text },
  totalBox: { alignItems: 'flex-end' },
  total: { fontSize: fonts.title, fontWeight: 'bold', color: colors.text },
  totalBest: { color: colors.primary },
  arrive: { fontSize: fonts.small, color: colors.textMuted },

  highlight: { fontSize: fonts.regular, color: colors.textMuted },
  highlightBest: { color: colors.success, fontWeight: 'bold' },

  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  legs: { gap: spacing.sm, paddingTop: spacing.xs },
  leg: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  legText: { flex: 1, fontSize: fonts.small, color: colors.text },
});
