// Tipos usados pelo app (dados de ônibus, rotas e histórico).

export type Mode = 'onibus' | 'metro' | 'caminhada';
export type Crowding = 'baixa' | 'media' | 'alta';

export type BusStop = {
  id: string;
  name: string;
  address: string;
};

export type Line = {
  id: string;
  code: string;
  name: string;
  mode: 'onibus' | 'metro';
  headwayMin: number; // passa a cada X minutos
  offsetMin: number; // desloca a grade para as linhas não chegarem juntas
  accessible: boolean;
  stopsHere: boolean; // true = para neste ponto (ônibus)
  stopId?: string; // ônibus que param em OUTRO ponto perto daqui
  stops: string[];
};

// Um passo do caminho a pé até outro ponto.
export type WalkStep = {
  kind: 'reto' | 'esquerda' | 'direita' | 'faixa' | 'chegada';
  text: string;
};

// Ponto de ônibus perto do totem (dá para ir a pé).
export type NearbyStop = BusStop & {
  walkMinutes: number;
  distanceMeters: number;
  path: WalkStep[];
};

// Uma linha e se ela vai ou não para o destino buscado.
export type LineCheck = {
  lineId: string;
  code: string;
  name: string;
  mode: 'onibus' | 'metro';
  accessible: boolean;
  goesToDestination: boolean;
  nextArrivalAt: number;
};

// Sugestão mostrada enquanto o passageiro digita.
export type DestinationHint = {
  name: string;
  where: 'aqui' | 'outro-ponto';
  stopName?: string;
  walkMinutes?: number;
};

export type Arrival = {
  id: string;
  lineId: string;
  lineCode: string;
  lineName: string;
  mode: 'onibus' | 'metro';
  arrivalAt: number; // horário previsto (timestamp)
  crowding: Crowding;
  accessible: boolean;
};

export type RouteLeg = {
  mode: Mode;
  lineId?: string;
  label: string;
  minutes: number;
};

export type RouteOption = {
  id: string;
  title: string;
  legs: RouteLeg[];
  waitMinutes: number;
  totalMinutes: number;
  arriveAt: number;
  transfers: number;
  crowding: Crowding | null;
  accessible: boolean;
  isBest: boolean;
  highlight: string;
};

export type RouteSearchResult = {
  query: string;
  destinationName: string | null;
  options: RouteOption[];
  linesHere: LineCheck[]; // ônibus deste ponto: quais vão e quais não vão
  nearbyStopId: string | null; // destino só sai de outro ponto perto daqui
};

export type NearbyStopResult = {
  query: string;
  destinationName: string;
  stop: NearbyStop;
  option: RouteOption; // caminhada + ônibus no outro ponto
  linesThere: LineCheck[];
  linesHere: LineCheck[];
};

export type LineDetails = {
  line: Line;
  arrivals: Arrival[];
  whereLabel: string; // "neste ponto", "no Ponto Rua Augusta"...
};

export type HistoryItem = {
  id: number;
  query: string;
  destinationName: string;
  bestOption: string;
  bestTotalMinutes: number;
  optionsCount: number;
  searchedAt: string;
};
