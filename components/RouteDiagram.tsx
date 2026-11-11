import { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius, borders, sizes, letterSpacing } from '../constants/theme';
import { DiagramLeg } from '../types';
import { MODE_INFO } from './Tag';

type Props = {
  origin: string;
  destination: string;
  legs: DiagramLeg[];
};

// Como a linha lateral (o "trilho") é desenhada em cada pedaço.
type Rail = { color: string; walk: boolean } | null;

type Row =
  | { kind: 'node'; dot: string; hollow?: boolean; above: Rail; below: Rail; content: ReactNode }
  | { kind: 'segment'; rail: Rail; content: ReactNode };

const WALK_DOTS = 5;

// Desenho do trajeto passo a passo, no estilo do mapa do metrô:
// onde embarcar, o sentido do trem, as estações do meio, a baldeação e onde descer.
export default function RouteDiagram({ origin, destination, legs }: Props) {
  const railOf = (leg?: DiagramLeg): Rail =>
    leg ? { color: leg.color, walk: leg.mode === 'caminhada' } : null;

  const rows: Row[] = [];

  rows.push({
    kind: 'node',
    dot: colors.primary,
    above: null,
    below: railOf(legs[0]),
    content: (
      <>
        <Text style={styles.kicker}>VOCÊ ESTÁ AQUI</Text>
        <Text style={styles.place}>{origin}</Text>
      </>
    ),
  });

  legs.forEach((leg, i) => {
    const prev = legs[i - 1];
    const next = legs[i + 1];

    if (leg.mode === 'caminhada') {
      rows.push({
        kind: 'segment',
        rail: railOf(leg),
        content: (
          <View style={styles.walkRow}>
            <Ionicons
              name={leg.transfer ? 'swap-horizontal' : 'walk'}
              size={fonts.regular}
              color={leg.transfer ? colors.warning : colors.walk}
            />
            <Text style={[styles.walkText, leg.transfer && styles.transferText]}>
              {leg.label} · {leg.minutes} min
            </Text>
          </View>
        ),
      });
      return;
    }

    const mode = MODE_INFO[leg.mode];
    const stopWord = leg.mode === 'metro' ? 'estação' : 'parada';
    const count = leg.between.length + 1;

    // Embarque
    rows.push({
      kind: 'node',
      dot: leg.color,
      above: railOf(prev),
      below: railOf(leg),
      content: (
        <>
          <View style={[styles.badge, { backgroundColor: leg.color }]}>
            <Ionicons name={mode.icon} size={fonts.regular} color={colors.textDark} />
            <Text style={styles.badgeText}>{leg.mode === 'metro' ? leg.lineCode : `Ônibus ${leg.lineCode}`}</Text>
          </View>
          <Text style={styles.place}>Embarque{leg.from ? ` em ${leg.from}` : ''}</Text>
          {leg.direction && (
            <Text style={[styles.direction, { color: leg.color }]}>Pegue o trem sentido {leg.direction}</Text>
          )}
        </>
      ),
    });

    // Trecho dentro do veículo
    rows.push({
      kind: 'segment',
      rail: railOf(leg),
      content: (
        <View style={styles.ride}>
          <Text style={styles.rideInfo}>
            {count} {count === 1 ? stopWord : `${stopWord === 'estação' ? 'estações' : 'paradas'}`} · {leg.minutes} min
          </Text>
          {leg.between.length > 0 && (
            <Text style={styles.between}>Passa por: {leg.between.join(' · ')}</Text>
          )}
        </View>
      ),
    });

    // Desembarque
    rows.push({
      kind: 'node',
      dot: leg.color,
      hollow: true,
      above: railOf(leg),
      below: railOf(next),
      content: <Text style={styles.place}>Desça em {leg.to ?? 'seu destino'}</Text>,
    });
  });

  rows.push({
    kind: 'node',
    dot: colors.success,
    above: railOf(legs[legs.length - 1]),
    below: null,
    content: (
      <>
        <Text style={styles.kicker}>CHEGADA</Text>
        <Text style={styles.place}>{destination}</Text>
      </>
    ),
  });

  return (
    <View style={styles.box} accessible accessibilityLabel={spokenRoute(origin, destination, legs)}>
      <Text style={styles.title}>Trajeto passo a passo</Text>
      {rows.map((row, index) =>
        row.kind === 'node' ? (
          <View key={index} style={styles.row}>
            <View style={styles.railColumn}>
              <RailPiece rail={row.above} />
              <View
                style={[
                  styles.dot,
                  { borderColor: row.dot, backgroundColor: row.hollow ? colors.background : row.dot },
                ]}
              />
              <RailPiece rail={row.below} />
            </View>
            <View style={styles.nodeContent}>{row.content}</View>
          </View>
        ) : (
          <View key={index} style={styles.row}>
            <View style={styles.railColumn}>
              <RailPiece rail={row.rail} />
            </View>
            <View style={styles.segmentContent}>{row.content}</View>
          </View>
        ),
      )}
    </View>
  );
}

function RailPiece({ rail }: { rail: Rail }) {
  if (!rail) return <View style={styles.railEmpty} />;
  if (rail.walk) {
    return (
      <View style={styles.walkRail}>
        {Array.from({ length: WALK_DOTS }, (_, i) => (
          <View key={i} style={[styles.walkDot, { backgroundColor: rail.color }]} />
        ))}
      </View>
    );
  }
  return <View style={[styles.rail, { backgroundColor: rail.color }]} />;
}

/** O mesmo trajeto em frases, para o leitor de tela. */
function spokenRoute(origin: string, destination: string, legs: DiagramLeg[]): string {
  const parts = legs.map((leg) => {
    if (leg.mode === 'caminhada') return `${leg.label}, ${leg.minutes} minutos`;
    const vehicle = leg.mode === 'metro' ? `metrô ${leg.lineCode}` : `ônibus ${leg.lineCode}`;
    return (
      `Embarque no ${vehicle}${leg.from ? ` em ${leg.from}` : ''}` +
      (leg.direction ? `, sentido ${leg.direction}` : '') +
      `. Desça em ${leg.to ?? 'seu destino'}, depois de ${leg.between.length + 1} paradas, ${leg.minutes} minutos`
    );
  });
  return `Trajeto passo a passo. Saindo de ${origin}. ${parts.join('. ')}. Chegada em ${destination}.`;
}

const RAIL_WIDTH = sizes.dot / 2;
const RAIL_COLUMN = sizes.dot * 2;

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: borders.thin,
    borderColor: colors.border,
    padding: spacing.md,
  },
  title: { fontSize: fonts.small, fontWeight: 'bold', color: colors.primary, marginBottom: spacing.sm },

  row: { flexDirection: 'row', alignItems: 'stretch' },
  railColumn: { width: RAIL_COLUMN, alignItems: 'center' },
  rail: { flex: 1, width: RAIL_WIDTH, minHeight: spacing.sm },
  railEmpty: { flex: 1, minHeight: spacing.sm },
  walkRail: { flex: 1, justifyContent: 'space-evenly', alignItems: 'center', minHeight: spacing.xl },
  walkDot: { width: spacing.xs + spacing.xxs, height: spacing.xs + spacing.xxs, borderRadius: radius.round },
  dot: {
    width: sizes.dot + spacing.xs,
    height: sizes.dot + spacing.xs,
    borderRadius: radius.round,
    borderWidth: borders.thick,
  },

  nodeContent: { flex: 1, justifyContent: 'center', gap: spacing.xs, paddingVertical: spacing.sm, paddingLeft: spacing.sm },
  segmentContent: { flex: 1, justifyContent: 'center', paddingVertical: spacing.sm, paddingLeft: spacing.sm },

  kicker: { fontSize: fonts.small, fontWeight: 'bold', color: colors.textMuted, letterSpacing },
  place: { fontSize: fonts.regular, fontWeight: 'bold', color: colors.text },
  direction: { fontSize: fonts.small, fontWeight: 'bold' },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  badgeText: { fontSize: fonts.small, fontWeight: 'bold', color: colors.textDark },

  walkRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  walkText: { flex: 1, fontSize: fonts.small, color: colors.textMuted },
  transferText: { color: colors.warning, fontWeight: 'bold' },

  ride: { gap: spacing.xxs },
  rideInfo: { fontSize: fonts.small, fontWeight: 'bold', color: colors.text },
  between: { fontSize: fonts.small, color: colors.textMuted },
});
