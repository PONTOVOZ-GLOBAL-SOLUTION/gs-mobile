import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius, borders, sizes } from '../constants/theme';
import { MapBase, MapPoint, NearbyStop } from '../types';
import MapCanvas, { MAP_PIN } from './MapCanvas';

type Props = {
  map: MapBase;
  to: NearbyStop;
  busCode?: string;
};

const DOT = spacing.sm;
const DOT_GAP = spacing.md; // distância entre as bolinhas do caminho a pé
const TURN = sizes.dot * 2;
const CLEAR_RADIUS = 0.18; // em fração do mapa

// Mapa simulado com o caminho a pé do totem até o ponto certo:
// bolinhas mostram por onde andar, setas mostram onde virar
// e o ponto de chegada fica marcado com o ônibus que se deve pegar.
export default function WalkMap({ map, to, busCode }: Props) {
  const path = to.mapPath;
  const end = path[path.length - 1];
  const turns = path.slice(1, -1);
  // Esconde estações/marcos colados no ponto de chegada, para o destaque ficar limpo
  const places = map.places.filter(
    (p) => p.kind === 'parque' || Math.hypot(p.at.x - end.x, p.at.y - end.y) > CLEAR_RADIUS,
  );

  return (
    <MapCanvas
      base={{ ...map, places }}
      accessibilityLabel={
        `Mapa simulado do caminho a pé até o ${to.name}: ${to.distanceMeters} metros, cerca de ${to.walkMinutes} minutos. ` +
        to.path.map((step, i) => `Passo ${i + 1}: ${step.text}`).join(' ')
      }
      overlay={({ px }) => {
        const at = px(end);
        return (
          <>
            {/* Onde virar */}
            {turns.map((p, i) => {
              const t = px(p);
              return (
                <View key={`turn-${i}`} style={[styles.turn, { left: t.left - TURN / 2, top: t.top - TURN / 2 }]}>
                  <Ionicons name={turnIcon(p, path[i + 2])} size={fonts.small} color={colors.textDark} />
                </View>
              );
            })}

            {/* Ponto certo */}
            <View style={[styles.target, { left: at.left - MAP_PIN / 2, top: at.top - MAP_PIN / 2 }]}>
              <Ionicons name="bus" size={fonts.large} color={colors.textDark} />
            </View>
            <View
              style={[
                styles.targetLabel,
                end.x > 0.6
                  ? { right: spacing.sm, top: at.top + MAP_PIN / 2 }
                  : { left: Math.max(spacing.sm, at.left - MAP_PIN), top: at.top - MAP_PIN / 2 - fonts.large * 2 },
              ]}
            >
              <Text style={styles.targetTitle}>PEGUE AQUI{busCode ? ` O ${busCode}` : ''}</Text>
              <Text style={styles.targetName}>{to.name}</Text>
            </View>
          </>
        );
      }}
    >
      {/* Caminho a pé (bolinhas) */}
      {({ px }) => dotsAlong(path, px).map((d, i) => (
        <View key={`dot-${i}`} style={[styles.dot, { left: d.left - DOT / 2, top: d.top - DOT / 2 }]} />
      ))}
    </MapCanvas>
  );
}

/** Bolinhas espaçadas igualmente ao longo do caminho (em pixels). */
function dotsAlong(path: MapPoint[], px: (p: MapPoint) => { left: number; top: number }) {
  const dots: { left: number; top: number }[] = [];
  for (let i = 1; i < path.length; i++) {
    const a = px(path[i - 1]);
    const b = px(path[i]);
    const length = Math.hypot(b.left - a.left, b.top - a.top);
    const count = Math.max(1, Math.floor(length / DOT_GAP));
    for (let k = 0; k < count; k++) {
      const t = k / count;
      dots.push({ left: a.left + (b.left - a.left) * t, top: a.top + (b.top - a.top) * t });
    }
  }
  return dots;
}

/** Seta na curva apontando para onde seguir. */
function turnIcon(at: MapPoint, next: MapPoint): 'arrow-forward' | 'arrow-back' | 'arrow-up' | 'arrow-down' {
  const dx = next.x - at.x;
  const dy = next.y - at.y;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'arrow-forward' : 'arrow-back';
  return dy > 0 ? 'arrow-down' : 'arrow-up';
}

const styles = StyleSheet.create({
  dot: {
    position: 'absolute',
    width: DOT,
    height: DOT,
    borderRadius: radius.round,
    backgroundColor: colors.walk,
  },
  turn: {
    position: 'absolute',
    width: TURN,
    height: TURN,
    borderRadius: radius.round,
    backgroundColor: colors.walk,
    borderWidth: borders.regular,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  target: {
    position: 'absolute',
    width: MAP_PIN,
    height: MAP_PIN,
    borderRadius: radius.round,
    backgroundColor: colors.success,
    borderWidth: borders.thick,
    borderColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetLabel: {
    position: 'absolute',
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    borderWidth: borders.regular,
    borderColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  targetTitle: { fontSize: fonts.mapStrong, fontWeight: 'bold', color: colors.success },
  targetName: { fontSize: fonts.mapLabel, fontWeight: 'bold', color: colors.text },
});
