// Contas do mapa simulado: tamanho real da área, distância e posição dos ônibus.
import type { MapPoint } from '../types';

/** O mapa mostra uma área de 2,4 km de largura por 1,9 km de altura. */
export const MAP_WIDTH_METERS = 2400;
export const MAP_ASPECT = 0.8; // altura = 80% da largura
const MAP_HEIGHT_METERS = MAP_WIDTH_METERS * MAP_ASPECT;

/** Velocidade média estimada de um ônibus na Av. Paulista (9 km/h, com trânsito). */
export const BUS_SPEED_M_PER_MIN = 150;

const MINUTE = 60_000;

function segmentMeters(a: MapPoint, b: MapPoint): number {
  return Math.hypot((b.x - a.x) * MAP_WIDTH_METERS, (b.y - a.y) * MAP_HEIGHT_METERS);
}

export function pathLengthMeters(path: MapPoint[]): number {
  let total = 0;
  for (let i = 1; i < path.length; i++) total += segmentMeters(path[i - 1], path[i]);
  return total;
}

/** Ponto do caminho que fica a `meters` metros ANTES do fim (o fim é o totem). */
export function pointBeforeEnd(path: MapPoint[], meters: number): MapPoint {
  let remaining = meters;
  for (let i = path.length - 1; i > 0; i--) {
    const end = path[i];
    const start = path[i - 1];
    const length = segmentMeters(start, end);
    if (remaining <= length) {
      const t = length === 0 ? 0 : remaining / length;
      return { x: end.x + (start.x - end.x) * t, y: end.y + (start.y - end.y) * t };
    }
    remaining -= length;
  }
  return path[0];
}

/** Distância estimada do ônibus até o ponto, a partir do horário previsto. */
export function distanceToStopMeters(arrivalAt: number, now: number): number {
  return Math.max(0, ((arrivalAt - now) / MINUTE) * BUS_SPEED_M_PER_MIN);
}

/** "350 m", "1,2 km". */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.max(50, Math.round(meters / 50) * 50)} m`;
  return `${(meters / 1000).toFixed(1).replace('.', ',')} km`;
}

/** Versão falada: "350 metros", "1,2 quilômetro". */
export function formatDistanceSpoken(meters: number): string {
  if (meters < 1000) return `${Math.max(50, Math.round(meters / 50) * 50)} metros`;
  return `${(meters / 1000).toFixed(1).replace('.', ',')} quilômetros`;
}
