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
  color?: string; // cor oficial da linha (metrô)
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
  mapPath: MapPoint[]; // caminho a pé no mapa simulado: do totem até este ponto
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
  from?: string; // parada/estação onde embarca (precisa estar em line.stops)
  to?: string; // parada/estação onde desce
  transfer?: boolean; // trecho a pé de baldeação (troca de linha)
};

// Um trecho já pronto para desenhar no diagrama do trajeto.
export type DiagramLeg = {
  mode: Mode;
  label: string;
  minutes: number;
  color: string;
  transfer: boolean;
  lineCode?: string;
  lineName?: string;
  from?: string;
  to?: string;
  direction?: string; // "sentido Vila Madalena" (metrô)
  between: string[]; // paradas/estações no meio do caminho
};

// Ponto no mapa simulado (0 a 1 na horizontal e na vertical).
export type MapPoint = { x: number; y: number };

export type MapStreet = { name: string; from: MapPoint; to: MapPoint; major?: boolean };

export type MapPlace = {
  name: string;
  kind: 'metro' | 'parque' | 'marco';
  at: MapPoint;
  size?: { w: number; h: number }; // só para áreas (parque)
  labelLeft?: boolean; // nome à esquerda do ícone (para não cobrir o totem)
};

export type BusOnMap = {
  arrival: Arrival;
  path: MapPoint[]; // caminho até o ponto, terminando no totem
  pathMeters: number;
};

// O "fundo" do mapa simulado: ruas, lugares e onde fica o totem.
export type MapBase = {
  stop: MapPoint;
  streets: MapStreet[];
  places: MapPlace[];
};

export type BusMapData = MapBase & {
  buses: BusOnMap[];
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
  diagram: DiagramLeg[]; // o mesmo trajeto, pronto para o desenho passo a passo
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
  map: MapBase; // para desenhar o caminho a pé até o outro ponto
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
