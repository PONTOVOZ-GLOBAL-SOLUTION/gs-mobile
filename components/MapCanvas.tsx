import { ReactNode, useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius, borders, sizes } from '../constants/theme';
import { MapBase, MapPoint } from '../types';
import { MAP_ASPECT } from '../utils/geo';

/** Ferramentas para desenhar por cima do mapa (em pixels da tela). */
export type MapTools = {
  width: number;
  height: number;
  px: (p: MapPoint) => { left: number; top: number };
  /** Retângulo de um trecho reto (horizontal ou vertical) entre dois pontos. */
  segment: (a: MapPoint, b: MapPoint, thickness: number) => { left: number; top: number; width: number; height: number };
};

type Props = {
  base: MapBase;
  accessibilityLabel: string;
  /** O que vai por cima das ruas (caminho, ônibus...). */
  children?: (tools: MapTools) => ReactNode;
  /** O que vai por cima de tudo, até do "você está aqui". */
  overlay?: (tools: MapTools) => ReactNode;
};

const STREET = 6;
const STREET_MAJOR = 12;
export const MAP_PIN = sizes.iconBox;

// Mapa SIMULADO do entorno do totem, desenhado com Views (sem serviço de mapas).
// Desenha ruas, parque, estações e o "você está aqui". Quem usa desenha o resto
// por cima (ônibus chegando, caminho a pé...).
export default function MapCanvas({ base, accessibilityLabel, children, overlay }: Props) {
  const [width, setWidth] = useState(0);
  const height = width * MAP_ASPECT;
  const px = (p: MapPoint) => ({ left: p.x * width, top: p.y * height });
  const segment = (a: MapPoint, b: MapPoint, thickness: number) => {
    const A = px(a);
    const B = px(b);
    return {
      left: Math.min(A.left, B.left) - thickness / 2,
      top: Math.min(A.top, B.top) - thickness / 2,
      width: Math.abs(B.left - A.left) + thickness,
      height: Math.abs(B.top - A.top) + thickness,
    };
  };
  const tools: MapTools = { width, height, px, segment };
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  const stop = px(base.stop);

  return (
    <View
      style={[styles.map, { height: height || undefined }]}
      onLayout={onLayout}
      accessible
      accessibilityLabel={accessibilityLabel}
    >
      {width > 0 && (
        <>
          {/* Áreas (parque) */}
          {base.places
            .filter((p) => p.kind === 'parque' && p.size)
            .map((p) => (
              <View
                key={p.name}
                style={[styles.park, { ...px(p.at), width: p.size!.w * width, height: p.size!.h * height }]}
              >
                <Text style={styles.parkLabel}>{p.name}</Text>
              </View>
            ))}

          {/* Ruas */}
          {base.streets.map((s) => (
            <View
              key={s.name}
              style={[styles.street, s.major && styles.streetMajor, segment(s.from, s.to, s.major ? STREET_MAJOR : STREET)]}
            />
          ))}
          {base.streets.map((s) => {
            // Horizontais: nome à esquerda. Verticais: principais no alto, as outras embaixo,
            // e as que ficam na direita do mapa com o nome antes da rua (para não cortar).
            const horizontal = s.from.y === s.to.y;
            const at = px(horizontal ? { x: 0.01, y: s.from.y } : { x: s.from.x, y: s.major ? 0.02 : 0.92 });
            const anchorRight = !horizontal && s.from.x > 0.7;
            const position = horizontal
              ? { left: at.left, top: at.top + spacing.sm }
              : anchorRight
                ? { right: width - at.left + spacing.sm, top: at.top }
                : { left: at.left + spacing.sm, top: at.top };
            return (
              <Text
                key={`label-${s.name}`}
                style={[styles.streetLabel, s.major && styles.streetLabelMajor, position]}
                numberOfLines={1}
              >
                {s.name}
              </Text>
            );
          })}

          {children?.(tools)}

          {/* Estações de metrô e marcos */}
          {base.places
            .filter((p) => p.kind !== 'parque')
            .map((p) => {
              const at = px(p.at);
              const position = p.labelLeft
                ? { right: width - at.left - sizes.dot, top: at.top - sizes.dot, flexDirection: 'row-reverse' as const }
                : { left: at.left - sizes.dot, top: at.top - sizes.dot };
              return (
                <View key={p.name} style={[styles.place, position]}>
                  <View style={[styles.placeIcon, p.kind === 'metro' ? styles.metroIcon : styles.landmarkIcon]}>
                    <Text style={styles.placeIconText}>{p.kind === 'metro' ? 'M' : '★'}</Text>
                  </View>
                  <Text style={styles.placeLabel}>{p.name}</Text>
                </View>
              );
            })}

          {/* Totem: "você está aqui" */}
          <View style={[styles.pin, { left: stop.left - MAP_PIN / 2, top: stop.top - MAP_PIN / 2 }]}>
            <Ionicons name="location" size={fonts.large} color={colors.textDark} />
          </View>
          <Text style={[styles.pinLabel, { left: stop.left - MAP_PIN / 2, top: stop.top + MAP_PIN / 2 }]}>
            VOCÊ ESTÁ AQUI
          </Text>

          {overlay?.(tools)}

          <Text style={styles.watermark}>MAPA SIMULADO</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    minHeight: sizes.mapMinHeight,
    backgroundColor: colors.mapGround,
    borderRadius: radius.lg,
    borderWidth: borders.regular,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  park: {
    position: 'absolute',
    backgroundColor: colors.mapPark,
    borderRadius: radius.sm,
    justifyContent: 'flex-end',
    padding: spacing.xs,
  },
  parkLabel: { fontSize: fonts.mapLabel, color: colors.mapLabel },

  street: { position: 'absolute', backgroundColor: colors.mapStreet, borderRadius: radius.sm },
  streetMajor: { backgroundColor: colors.mapStreetMajor },
  streetLabel: { position: 'absolute', fontSize: fonts.mapLabel, color: colors.mapLabel },
  streetLabelMajor: { fontWeight: 'bold', color: colors.textMuted },

  place: { position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  placeIcon: {
    width: sizes.dot * 2 - spacing.xs,
    height: sizes.dot * 2 - spacing.xs,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metroIcon: { backgroundColor: colors.lineGreen },
  landmarkIcon: { backgroundColor: colors.metro },
  placeIconText: { fontSize: fonts.mapStrong, fontWeight: 'bold', color: colors.textDark },
  placeLabel: { fontSize: fonts.mapLabel, fontWeight: 'bold', color: colors.text },

  pin: {
    position: 'absolute',
    width: MAP_PIN,
    height: MAP_PIN,
    borderRadius: radius.round,
    backgroundColor: colors.primary,
    borderWidth: borders.thick,
    borderColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinLabel: { position: 'absolute', fontSize: fonts.mapLabel, fontWeight: 'bold', color: colors.primary },

  watermark: {
    position: 'absolute',
    left: spacing.sm,
    bottom: spacing.xs,
    fontSize: fonts.mapLabel,
    fontWeight: 'bold',
    color: colors.mapLabel,
    opacity: 0.7,
  },
});
