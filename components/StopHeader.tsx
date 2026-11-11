import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius, borders, sizes, letterSpacing } from '../constants/theme';
import { BusStop } from '../types';
import { formatClock } from '../utils/format';

type Props = {
  stop: BusStop;
  now: number;
};

// Topo do totem: "Você está aqui", nome do ponto e relógio.
export default function StopHeader({ stop, now }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <Ionicons name="location" size={fonts.title} color={colors.primary} />
      </View>

      <View style={styles.info} accessible accessibilityLabel={`Você está no ${stop.name}. ${stop.address}`}>
        <Text style={styles.youAreHere}>VOCÊ ESTÁ AQUI</Text>
        <Text style={styles.name} accessibilityRole="header">
          {stop.name}
        </Text>
        <Text style={styles.address}>{stop.address}</Text>
      </View>

      <Text style={styles.clock} accessibilityLabel={`Agora são ${formatClock(now)}`}>
        {formatClock(now)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.cardLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderLeftWidth: borders.accent,
    borderLeftColor: colors.primary,
  },
  iconBox: {
    width: sizes.iconBox,
    height: sizes.iconBox,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, gap: spacing.xxs },
  youAreHere: { fontSize: fonts.small, fontWeight: 'bold', color: colors.primary, letterSpacing },
  name: { fontSize: fonts.large, fontWeight: 'bold', color: colors.text },
  address: { fontSize: fonts.small, color: colors.textMuted },
  clock: { fontSize: fonts.title, fontWeight: 'bold', color: colors.text },
});
