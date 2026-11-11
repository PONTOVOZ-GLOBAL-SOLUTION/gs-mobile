import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius, borders, sizes, lineHeight } from '../constants/theme';
import { BusStop, NearbyStop, WalkStep } from '../types';

type Props = {
  from: BusStop;
  to: NearbyStop;
};

const STEP_ICON: Record<WalkStep['kind'], keyof typeof Ionicons.glyphMap> = {
  reto: 'arrow-up',
  esquerda: 'arrow-back',
  direita: 'arrow-forward',
  faixa: 'walk',
  chegada: 'flag',
};

// Caminho a pé passo a passo: "Você está aqui" → instruções → ponto de destino.
export default function WalkPath({ from, to }: Props) {
  const total = to.path.length + 2;

  return (
    <View style={styles.container}>
      <View
        style={styles.summary}
        accessible
        accessibilityLabel={`Caminhada de ${to.walkMinutes} minutos, ${to.distanceMeters} metros, até o ${to.name}`}
      >
        <Ionicons name="walk-outline" size={fonts.large} color={colors.walk} />
        <Text style={styles.summaryText}>
          {to.walkMinutes} min a pé · {to.distanceMeters} m
        </Text>
      </View>

      <Step
        index={0}
        total={total}
        icon="location"
        iconColor={colors.primary}
        title="Você está aqui"
        text={from.name}
      />
      {to.path.map((step, i) => (
        <Step key={i} index={i + 1} total={total} icon={STEP_ICON[step.kind]} iconColor={colors.walk} text={step.text} />
      ))}
      <Step
        index={total - 1}
        total={total}
        icon="bus"
        iconColor={colors.bus}
        title={to.name}
        text={to.address}
        last
      />
    </View>
  );
}

type StepProps = {
  index: number;
  total: number;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title?: string;
  text: string;
  last?: boolean;
};

function Step({ index, total, icon, iconColor, title, text, last }: StepProps) {
  return (
    <View
      style={styles.step}
      accessible
      accessibilityLabel={`Passo ${index + 1} de ${total}: ${title ? `${title}, ` : ''}${text}`}
    >
      <View style={styles.rail}>
        <View style={[styles.iconCircle, { borderColor: iconColor }]}>
          <Ionicons name={icon} size={fonts.regular} color={iconColor} />
        </View>
        {!last && <View style={styles.line} />}
      </View>
      <View style={styles.stepBody}>
        {title && <Text style={styles.stepTitle}>{title}</Text>}
        <Text style={styles.stepText}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md },
  summary: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  summaryText: { fontSize: fonts.medium, fontWeight: 'bold', color: colors.text },

  step: { flexDirection: 'row', gap: spacing.md },
  rail: { alignItems: 'center' },
  iconCircle: {
    width: sizes.iconBox,
    height: sizes.iconBox,
    borderRadius: radius.round,
    borderWidth: borders.regular,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  line: { flex: 1, width: borders.thick, minHeight: spacing.md, backgroundColor: colors.border },
  stepBody: { flex: 1, paddingTop: spacing.sm, paddingBottom: spacing.md, gap: spacing.xxs },
  stepTitle: { fontSize: fonts.regular, fontWeight: 'bold', color: colors.text },
  stepText: { fontSize: fonts.small, color: colors.textMuted, lineHeight: fonts.small * lineHeight },
});
