import { Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius, borders, sizes } from '../constants/theme';
import { BusMapData } from '../types';
import { distanceToStopMeters, formatDistance, pointBeforeEnd } from '../utils/geo';
import MapCanvas from './MapCanvas';

type Props = {
  data: BusMapData;
  now: number;
  selectedLineId?: string;
  onSelect?: (lineId: string) => void;
};

const ROUTE = 4;

// Ônibus chegando no mapa simulado. Cada ônibus aparece no caminho que faz até
// o ponto, na distância estimada pelo horário previsto, e anda a cada segundo.
export default function BusMap({ data, now, selectedLineId, onSelect }: Props) {
  const selected = data.buses.find((b) => b.arrival.lineId === selectedLineId);
  const onMap = data.buses
    .map((bus) => ({ bus, meters: distanceToStopMeters(bus.arrival.arrivalAt, now) }))
    .filter(({ bus, meters }) => meters <= bus.pathMeters); // os mais longe ainda estão fora da área

  const label =
    'Mapa simulado do entorno do ponto. ' +
    (onMap.length === 0
      ? 'Nenhum ônibus dentro da área do mapa agora.'
      : onMap.map(({ bus, meters }) => `Ônibus ${bus.arrival.lineCode} a ${formatDistance(meters)}`).join('. '));

  return (
    <MapCanvas
      base={data}
      accessibilityLabel={label}
      overlay={({ px }) =>
        onMap.map(({ bus, meters }) => {
          const at = px(pointBeforeEnd(bus.path, meters));
          const isSelected = bus.arrival.lineId === selectedLineId;
          return (
            <TouchableOpacity
              key={bus.arrival.id}
              onPress={() => onSelect?.(bus.arrival.lineId)}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={`Ônibus ${bus.arrival.lineCode}, a ${formatDistance(meters)} do ponto`}
              style={[
                styles.bus,
                isSelected && styles.busSelected,
                { left: at.left - sizes.lineBadgeMin / 2, top: at.top - fonts.large / 2 - spacing.xs },
              ]}
            >
              <Ionicons name="bus" size={fonts.small} color={colors.textDark} />
              <Text style={styles.busText}>{bus.arrival.lineCode}</Text>
            </TouchableOpacity>
          );
        })
      }
    >
      {({ segment }) =>
        /* Caminho do ônibus escolhido até o ponto */
        selected?.path
          .slice(1)
          .map((p, i) => <View key={`route-${i}`} style={[styles.route, segment(selected.path[i], p, ROUTE)]} />)
      }
    </MapCanvas>
  );
}

const styles = StyleSheet.create({
  route: { position: 'absolute', backgroundColor: colors.primary, borderRadius: radius.sm, opacity: 0.85 },
  bus: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
    width: sizes.lineBadgeMin,
    paddingVertical: spacing.xxs,
    backgroundColor: colors.bus,
    borderRadius: radius.round,
    borderWidth: borders.regular,
    borderColor: colors.background,
  },
  busSelected: { backgroundColor: colors.primary, borderColor: colors.text, borderWidth: borders.thick },
  busText: { fontSize: fonts.mapStrong, fontWeight: 'bold', color: colors.textDark },
});
