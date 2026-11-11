/**
 * Camada de serviços: tudo o que as telas precisam saber sobre ônibus,
 * linhas e rotas passa por aqui. As telas nunca leem o mock diretamente.
 */
import { colors } from '../constants/colors';
import {
  BUS_APPROACH,
  DESTINATIONS,
  LINES,
  MAP_PLACES,
  MAP_STOP,
  MAP_STREETS,
  NEARBY_DESTINATIONS,
  NEARBY_STOPS,
  TOTEM_STOP,
  type DestinationTemplate,
  type NearbyDestination,
} from '../constants/mockData';
import type {
  Arrival,
  BusMapData,
  BusStop,
  Crowding,
  DiagramLeg,
  DestinationHint,
  LineCheck,
  LineDetails,
  NearbyStop,
  NearbyStopResult,
  RouteLeg,
  RouteOption,
  RouteSearchResult,
  Line,
} from '../types';
import { normalizeText } from '../utils/format';
import { pathLengthMeters } from '../utils/geo';
import { ApiError, request } from './apiClient';

const MINUTE = 60_000;
/** Veículos a menos de 20 s já são considerados "passando", não entram na lista. */
const MIN_LEAD_MS = 20_000;

function findLine(id: string): Line | undefined {
  return LINES.find((l) => l.id === id);
}

/** Próximos horários de uma linha a partir de um instante, seguindo o intervalo dela. */
function departuresAfter(line: Line, from: number, count: number): number[] {
  const headway = line.headwayMin * MINUTE;
  const offset = line.offsetMin * MINUTE;
  const first = Math.ceil((from - offset) / headway) * headway + offset;
  return Array.from({ length: count }, (_, i) => first + i * headway);
}

/** Lotação "estimada" estável para um mesmo veículo (não muda a cada atualização). */
function estimateCrowding(lineId: string, timestamp: number): Crowding {
  const seed = `${lineId}-${Math.round(timestamp / MINUTE)}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) % 1000;
  const bucket = hash % 10;
  if (bucket < 5) return 'baixa';
  if (bucket < 8) return 'media';
  return 'alta';
}

function toArrival(line: Line, arrivalAt: number): Arrival {
  return {
    id: `${line.id}-${arrivalAt}`,
    lineId: line.id,
    lineCode: line.code,
    lineName: line.name,
    mode: line.mode,
    arrivalAt,
    crowding: estimateCrowding(line.id, arrivalAt),
    accessible: line.accessible,
  };
}

function buildArrivalsAtStop(now: number): Arrival[] {
  return LINES.filter((l) => l.stopsHere)
    .flatMap((line) => departuresAfter(line, now + MIN_LEAD_MS, 2).map((t) => toArrival(line, t)))
    .sort((a, b) => a.arrivalAt - b.arrivalAt)
    .slice(0, 8);
}

function titleFor(legs: RouteLeg[]): string {
  const transit = legs.filter((l) => l.mode !== 'caminhada' && l.lineId).map((l) => findLine(l.lineId!)!);
  if (transit.length === 0) return 'A pé';
  const parts = transit.map((line, i) => {
    const prev = transit[i - 1];
    if (prev && prev.mode === line.mode) return line.code;
    return `${line.mode === 'metro' ? 'Metrô' : 'Ônibus'} ${line.code}`;
  });
  return parts.join(' + ');
}

/** Transforma os trechos em passos prontos para o desenho do trajeto. */
function buildDiagram(legs: RouteLeg[]): DiagramLeg[] {
  return legs.map((leg) => {
    const line = leg.lineId ? findLine(leg.lineId) : undefined;
    const base: DiagramLeg = {
      mode: leg.mode,
      label: leg.label,
      minutes: leg.minutes,
      transfer: leg.transfer ?? false,
      color: line?.color ?? (leg.mode === 'onibus' ? colors.bus : leg.mode === 'metro' ? colors.metro : colors.walk),
      between: [],
    };
    if (!line) return base;

    const fromIndex = leg.from ? line.stops.indexOf(leg.from) : -1;
    const toIndex = leg.to ? line.stops.indexOf(leg.to) : -1;
    const known = fromIndex >= 0 && toIndex >= 0;
    const forward = toIndex > fromIndex;

    return {
      ...base,
      lineCode: line.code,
      lineName: line.name,
      from: leg.from,
      to: leg.to,
      // Metrô: o sentido é a última estação da linha na direção da viagem
      direction:
        known && line.mode === 'metro' ? (forward ? line.stops[line.stops.length - 1] : line.stops[0]) : undefined,
      between: known
        ? forward
          ? line.stops.slice(fromIndex + 1, toIndex)
          : line.stops.slice(toIndex + 1, fromIndex).reverse()
        : [],
    };
  });
}

function buildOption(id: string, legs: RouteLeg[], now: number): Omit<RouteOption, 'isBest' | 'highlight'> {
  let cursor = now;
  let waitMs: number | null = null;
  let crowding: Crowding | null = null;
  let accessible = true;
  let transitCount = 0;

  for (const leg of legs) {
    if (leg.mode === 'caminhada' || !leg.lineId) {
      cursor += leg.minutes * MINUTE;
      continue;
    }
    const line = findLine(leg.lineId);
    if (!line) throw new ApiError(`Linha ${leg.lineId} não encontrada.`);

    const departure = departuresAfter(line, cursor + MIN_LEAD_MS, 1)[0];
    if (waitMs === null) {
      waitMs = departure - now;
      crowding = estimateCrowding(line.id, departure);
    }
    accessible = accessible && line.accessible;
    transitCount += 1;
    cursor = departure + leg.minutes * MINUTE;
  }

  return {
    id,
    title: titleFor(legs),
    legs,
    waitMinutes: waitMs === null ? 0 : Math.ceil(waitMs / MINUTE),
    totalMinutes: Math.ceil((cursor - now) / MINUTE),
    arriveAt: cursor,
    transfers: Math.max(0, transitCount - 1),
    crowding,
    accessible,
    diagram: buildDiagram(legs),
  };
}

function isDirectBus(option: Pick<RouteOption, 'legs'>): boolean {
  const transit = option.legs.filter((l) => l.mode !== 'caminhada');
  return transit.length === 1 && transit[0].mode === 'onibus';
}

function rankOptions(raw: ReturnType<typeof buildOption>[]): RouteOption[] {
  const sorted = [...raw].sort((a, b) => a.totalMinutes - b.totalMinutes || a.transfers - b.transfers);
  const best = sorted[0];
  const directBus = sorted.find(isDirectBus);

  return sorted.map((opt, index) => {
    let highlight: string;
    if (index === 0) {
      if (directBus && directBus.id !== opt.id) {
        const diff = directBus.totalMinutes - opt.totalMinutes;
        highlight =
          opt.title === 'A pé'
            ? `Ir a pé é mais rápido: chega ${diff} min antes do que esperar o ônibus.`
            : `Chega ${diff} min antes do que esperar o ${directBus.title.replace('Ônibus', 'ônibus')}.`;
      } else if (isDirectBus(opt)) {
        highlight = 'Opção mais rápida agora, sem trocar de veículo.';
      } else {
        highlight = 'Opção mais rápida agora.';
      }
    } else {
      const diff = opt.totalMinutes - best.totalMinutes;
      highlight = diff === 0 ? 'Mesmo tempo da melhor opção.' : `Leva ${diff} min a mais que a melhor opção.`;
    }
    return { ...opt, isBest: index === 0, highlight };
  });
}

/** O texto digitado bate com o nome ou com algum apelido do destino? */
function matchesText(query: string, name: string, aliases: string[]): boolean {
  const q = normalizeText(query);
  if (q.length < 2) return false;
  return [name, ...aliases].some((candidate) => {
    const c = normalizeText(candidate);
    return c.includes(q) || (q.length >= 4 && q.includes(c));
  });
}

function matchDestination(query: string): DestinationTemplate | null {
  return DESTINATIONS.find((d) => matchesText(query, d.name, d.aliases)) ?? null;
}

function matchNearbyDestination(query: string): NearbyDestination | null {
  return NEARBY_DESTINATIONS.find((d) => matchesText(query, d.name, d.aliases)) ?? null;
}

function findNearbyStop(id: string): NearbyStop | undefined {
  return NEARBY_STOPS.find((s) => s.id === id);
}

/** Um ônibus "vai para o destino" se ele é o primeiro veículo de alguma opção de rota. */
function lineGoesTo(lineId: string, template: DestinationTemplate): boolean {
  return template.options.some((legs) => legs.find((leg) => leg.mode !== 'caminhada')?.lineId === lineId);
}

/** Monta a lista "vai / não vai" para as linhas de um ponto. Quem vai aparece primeiro. */
function buildLineChecks(lines: Line[], goes: (line: Line) => boolean, from: number): LineCheck[] {
  return lines
    .map((line) => ({
      lineId: line.id,
      code: line.code,
      name: line.name,
      mode: line.mode,
      accessible: line.accessible,
      goesToDestination: goes(line),
      nextArrivalAt: departuresAfter(line, from + MIN_LEAD_MS, 1)[0],
    }))
    .sort((a, b) => Number(b.goesToDestination) - Number(a.goesToDestination) || a.nextArrivalAt - b.nextArrivalAt);
}

const busesHere = () => LINES.filter((l) => l.stopsHere);

// ---------------------------------------------------------------------------
// API pública do serviço
// ---------------------------------------------------------------------------

export function getStop(): Promise<BusStop> {
  return request(() => TOTEM_STOP);
}

export function getNextArrivals(): Promise<Arrival[]> {
  return request(() => buildArrivalsAtStop(Date.now()));
}

/**
 * Mapa simulado: o próximo ônibus de cada linha deste ponto e o caminho que ele
 * faz até aqui. A tela calcula onde ele está a cada segundo, pelo horário previsto.
 */
export function getBusMap(): Promise<BusMapData> {
  return request(() => {
    const now = Date.now();
    const buses = busesHere()
      .filter((line) => BUS_APPROACH[line.id])
      .map((line) => {
        const path = BUS_APPROACH[line.id];
        const arrival = toArrival(line, departuresAfter(line, now + MIN_LEAD_MS, 1)[0]);
        return { arrival, path, pathMeters: pathLengthMeters(path) };
      })
      .sort((a, b) => a.arrival.arrivalAt - b.arrival.arrivalAt);
    return { stop: MAP_STOP, streets: MAP_STREETS, places: MAP_PLACES, buses };
  });
}

export function getLineDetails(lineId: string): Promise<LineDetails> {
  return request(() => {
    const line = findLine(lineId);
    if (!line) throw new ApiError('Essa linha não existe ou foi desativada.');
    const now = Date.now();
    const arrivals = departuresAfter(line, now + MIN_LEAD_MS, 3).map((t) => toArrival(line, t));
    const nearbyStop = line.stopId ? findNearbyStop(line.stopId) : undefined;
    const whereLabel = line.stopsHere ? 'neste ponto' : nearbyStop ? `no ${nearbyStop.name}` : 'na estação mais próxima';
    return { line, arrivals, whereLabel };
  });
}

export function searchRoutes(query: string): Promise<RouteSearchResult> {
  return request(() => {
    const now = Date.now();
    const template = matchDestination(query);

    if (!template) {
      // Não sai deste ponto. Talvez saia de um ponto perto daqui?
      const nearby = matchNearbyDestination(query);
      return {
        query,
        destinationName: nearby?.name ?? null,
        options: [],
        linesHere: nearby ? buildLineChecks(busesHere(), () => false, now) : [],
        nearbyStopId: nearby?.stopId ?? null,
      };
    }

    const raw = template.options.map((legs, i) => buildOption(`${template.id}-${i}`, legs, now));
    return {
      query,
      destinationName: template.name,
      options: rankOptions(raw),
      linesHere: buildLineChecks(busesHere(), (line) => lineGoesTo(line.id, template), now),
      nearbyStopId: null,
    };
  });
}

/**
 * Destino que só sai de OUTRO ponto: caminho a pé até lá + ônibus que leva ao destino.
 * Retorna null se nenhum ponto perto atende esse destino.
 */
export function getNearbyStopRoute(query: string): Promise<NearbyStopResult | null> {
  return request(() => {
    const destination = matchNearbyDestination(query);
    if (!destination) return null;

    const stop = findNearbyStop(destination.stopId);
    const line = findLine(destination.lineId);
    if (!stop || !line) throw new ApiError('Não conseguimos carregar o outro ponto agora.');

    const now = Date.now();
    const legs: RouteLeg[] = [
      { mode: 'caminhada', label: `Caminhe até o ${stop.name} (${stop.distanceMeters} m)`, minutes: stop.walkMinutes },
      {
        mode: 'onibus',
        lineId: line.id,
        label: `Ônibus ${line.code} até ${destination.name}`,
        minutes: destination.rideMinutes,
        from: line.stops[0],
        to: line.stops[line.stops.length - 1],
      },
    ];
    const option: RouteOption = {
      ...buildOption(`${destination.id}-outro-ponto`, legs, now),
      isBest: true,
      highlight: `Nenhum ônibus deste ponto vai para lá. Caminhe ${stop.walkMinutes} min e pegue o ônibus ${line.code}.`,
    };

    // Horários no outro ponto contam a partir de quando o passageiro chega lá a pé
    const reachStopAt = now + stop.walkMinutes * MINUTE;
    const linesAtStop = LINES.filter((l) => l.stopId === stop.id);

    return {
      query,
      destinationName: destination.name,
      stop,
      option,
      linesThere: buildLineChecks(linesAtStop, (l) => l.id === line.id, reachStopAt),
      linesHere: buildLineChecks(busesHere(), () => false, now),
      map: { stop: MAP_STOP, streets: MAP_STREETS, places: MAP_PLACES },
    };
  });
}

/** Destinos conhecidos (deste ponto e dos pontos perto), usados como sugestão. */
export function listKnownDestinations(): string[] {
  return [...DESTINATIONS.map((d) => d.name), ...NEARBY_DESTINATIONS.map((d) => d.name)];
}

/** Exemplos mostrados embaixo do campo de busca, separados por onde o ônibus sai. */
export function listExampleDestinations(): { here: string[]; nearby: string[] } {
  return {
    here: DESTINATIONS.map((d) => d.name),
    nearby: NEARBY_DESTINATIONS.map((d) => d.name),
  };
}

/** Confere, enquanto o passageiro digita, se o destino existe e de qual ponto ele sai. */
export function suggestDestinations(text: string, limit = 4): DestinationHint[] {
  const here: DestinationHint[] = DESTINATIONS.filter((d) => matchesText(text, d.name, d.aliases)).map((d) => ({
    name: d.name,
    where: 'aqui',
  }));
  const nearby: DestinationHint[] = NEARBY_DESTINATIONS.filter((d) => matchesText(text, d.name, d.aliases)).map((d) => {
    const stop = findNearbyStop(d.stopId);
    return { name: d.name, where: 'outro-ponto', stopName: stop?.name, walkMinutes: stop?.walkMinutes };
  });
  return [...here, ...nearby].slice(0, limit);
}
