/**
 * Dados SIMULADOS (mock). Nenhum dado é real.
 * Linhas, códigos e tempos são fictícios, inspirados no transporte de uma
 * grande cidade. Os horários são calculados a partir do relógio do aparelho
 * com base no intervalo (headway) de cada linha, então a tela "anda" sozinha.
 */
import type { BusStop, Line, MapPlace, MapPoint, MapStreet, NearbyStop, RouteLeg } from '../types';
import { colors } from './colors';

export const TOTEM_STOP: BusStop = {
  id: 'PT-1578',
  name: 'Ponto Av. Paulista – MASP',
  address: 'Av. Paulista, altura do nº 1578 (sentido Consolação)',
};

export const LINES: Line[] = [
  {
    id: '7B23',
    code: '7B23',
    name: 'Paulista – Pinheiros',
    mode: 'onibus',
    headwayMin: 15,
    offsetMin: 4,
    accessible: true,
    stopsHere: true,
    stops: ['Av. Paulista – MASP', 'Rua da Consolação', 'Av. Rebouças', 'Hospital das Clínicas', 'Largo de Pinheiros', 'Terminal Pinheiros'],
  },
  {
    id: '8C10',
    code: '8C10',
    name: 'Paulista – Lapa',
    mode: 'onibus',
    headwayMin: 20,
    offsetMin: 11,
    accessible: false,
    stopsHere: true,
    stops: ['Av. Paulista – MASP', 'Rua da Consolação', 'Av. Sumaré', 'Pompeia', 'Terminal Lapa'],
  },
  {
    id: '5M44',
    code: '5M44',
    name: 'Paulista – Parque Ibirapuera',
    mode: 'onibus',
    headwayMin: 12,
    offsetMin: 2,
    accessible: true,
    stopsHere: true,
    stops: ['Av. Paulista – MASP', 'Av. Brigadeiro Luís Antônio', 'Av. Brasil', 'Parque Ibirapuera (Portão 3)'],
  },
  {
    id: '6P01',
    code: '6P01',
    name: 'Paulista – Vila Mariana',
    mode: 'onibus',
    headwayMin: 10,
    offsetMin: 7,
    accessible: true,
    stopsHere: true,
    stops: ['Av. Paulista – MASP', 'Paraíso', 'Rua Vergueiro', 'Vila Mariana', 'Parque Ibirapuera (Portão 10)'],
  },
  {
    id: '9T02',
    code: '9T02',
    name: 'Paulista – Barra Funda',
    mode: 'onibus',
    headwayMin: 18,
    offsetMin: 9,
    accessible: true,
    stopsHere: true,
    stops: ['Av. Paulista – MASP', 'Rua da Consolação', 'Higienópolis', 'Perdizes', 'Terminal Barra Funda'],
  },
  {
    id: '2C05',
    code: '2C05',
    name: 'Paulista – Centro (Praça da Sé)',
    mode: 'onibus',
    headwayMin: 8,
    offsetMin: 1,
    accessible: true,
    stopsHere: true,
    stops: ['Av. Paulista – MASP', 'Consolação', 'Praça Roosevelt', 'Anhangabaú', 'Praça da Sé'],
  },
  // --- Metrô: estações na ordem real da linha (os tempos continuam simulados) ---
  {
    id: 'MET-VERDE',
    code: 'Linha Verde',
    name: 'Metrô – Linha 2-Verde',
    mode: 'metro',
    color: colors.lineGreen,
    headwayMin: 4,
    offsetMin: 1,
    accessible: true,
    stopsHere: false,
    stops: [
      'Vila Madalena',
      'Sumaré',
      'Clínicas',
      'Consolação',
      'Trianon-MASP',
      'Brigadeiro',
      'Paraíso',
      'Ana Rosa',
      'Chácara Klabin',
      'Santos-Imigrantes',
      'Alto do Ipiranga',
      'Sacomã',
      'Tamanduateí',
      'Vila Prudente',
    ],
  },
  {
    id: 'MET-AMARELA',
    code: 'Linha Amarela',
    name: 'Metrô – Linha 4-Amarela',
    mode: 'metro',
    color: colors.lineYellow,
    headwayMin: 4,
    offsetMin: 3,
    accessible: true,
    stopsHere: false,
    stops: [
      'Luz',
      'República',
      'Higienópolis-Mackenzie',
      'Paulista',
      'Oscar Freire',
      'Fradique Coutinho',
      'Faria Lima',
      'Pinheiros',
      'Butantã',
      'São Paulo-Morumbi',
      'Vila Sônia',
    ],
  },
  {
    id: 'MET-AZUL',
    code: 'Linha Azul',
    name: 'Metrô – Linha 1-Azul',
    mode: 'metro',
    color: colors.lineBlue,
    headwayMin: 4,
    offsetMin: 2,
    accessible: true,
    stopsHere: false,
    stops: [
      'Tucuruvi',
      'Parada Inglesa',
      'Jardim São Paulo-Ayrton Senna',
      'Santana',
      'Carandiru',
      'Portuguesa-Tietê',
      'Armênia',
      'Tiradentes',
      'Luz',
      'São Bento',
      'Sé',
      'Liberdade',
      'São Joaquim',
      'Vergueiro',
      'Paraíso',
      'Ana Rosa',
      'Vila Mariana',
      'Santa Cruz',
      'Praça da Árvore',
      'Saúde',
      'São Judas',
      'Conceição',
      'Jabaquara',
    ],
  },
  {
    id: '8L01',
    code: '8L01',
    name: 'Vila Madalena – Lapa',
    mode: 'onibus',
    headwayMin: 12,
    offsetMin: 4,
    accessible: true,
    stopsHere: false,
    stops: ['Terminal Vila Madalena', 'Rua Heitor Penteado', 'Pompeia', 'Terminal Lapa'],
  },

  // --- Ônibus que NÃO param neste totem, mas em pontos perto daqui (ver NEARBY_STOPS) ---
  {
    id: '875A',
    code: '875A',
    name: 'Augusta – Aeroporto de Congonhas',
    mode: 'onibus',
    headwayMin: 15,
    offsetMin: 6,
    accessible: true,
    stopsHere: false,
    stopId: 'PT-2010',
    stops: ['Rua Augusta', 'Av. Brasil', 'Av. Washington Luís', 'Aeroporto de Congonhas'],
  },
  {
    id: '702U',
    code: '702U',
    name: 'Augusta – Cidade Universitária',
    mode: 'onibus',
    headwayMin: 20,
    offsetMin: 13,
    accessible: false,
    stopsHere: false,
    stopId: 'PT-2010',
    stops: ['Rua Augusta', 'Av. Rebouças', 'Butantã', 'Cidade Universitária (USP)'],
  },
  {
    id: '917H',
    code: '917H',
    name: 'Augusta – Morumbi',
    mode: 'onibus',
    headwayMin: 25,
    offsetMin: 3,
    accessible: true,
    stopsHere: false,
    stopId: 'PT-2010',
    stops: ['Rua Augusta', 'Av. Europa', 'Ponte Cidade Jardim', 'Estádio do Morumbi'],
  },
  {
    id: '4M15',
    code: '4M15',
    name: 'Brigadeiro – Moema',
    mode: 'onibus',
    headwayMin: 12,
    offsetMin: 5,
    accessible: true,
    stopsHere: false,
    stopId: 'PT-0870',
    stops: ['Av. Brigadeiro Luís Antônio', 'Av. Ibirapuera', 'Moema'],
  },
  {
    id: '1S30',
    code: '1S30',
    name: 'Brigadeiro – Santana',
    mode: 'onibus',
    headwayMin: 18,
    offsetMin: 10,
    accessible: true,
    stopsHere: false,
    stopId: 'PT-0870',
    stops: ['Av. Brigadeiro Luís Antônio', 'Liberdade', 'Ponte Pequena', 'Santana'],
  },
];

/** Onde o totem fica no mapa simulado (as ruas estão em MAP_STREETS, no fim do arquivo). */
export const MAP_STOP: MapPoint = { x: 0.5, y: 0.5 };

/**
 * Pontos de ônibus perto do totem. Quando o destino não sai DESTE ponto,
 * o app manda o passageiro a pé até um destes, mostrando o caminho.
 */
export const NEARBY_STOPS: NearbyStop[] = [
  {
    id: 'PT-2010',
    name: 'Ponto Rua Augusta',
    address: 'Rua Augusta, perto da esquina com a Av. Paulista',
    walkMinutes: 5,
    distanceMeters: 350,
    path: [
      { kind: 'reto', text: 'Saia do ponto e siga pela calçada da Av. Paulista, sentido Consolação (250 m).' },
      { kind: 'direita', text: 'Na esquina com a Rua Augusta, vire à direita.' },
      { kind: 'faixa', text: 'Atravesse na faixa de pedestres. O semáforo tem aviso sonoro.' },
      { kind: 'chegada', text: 'O ponto fica 100 m à frente, do lado direito, com cobertura.' },
    ],
    // No mapa: Paulista para a esquerda (sentido Consolação), direita na Augusta (para cima)
    mapPath: [MAP_STOP, { x: 0.26, y: 0.5 }, { x: 0.26, y: 0.37 }],
  },
  {
    id: 'PT-0870',
    name: 'Ponto Av. Brigadeiro Luís Antônio',
    address: 'Av. Brigadeiro Luís Antônio, a 1 quarteirão da Av. Paulista',
    walkMinutes: 7,
    distanceMeters: 550,
    path: [
      { kind: 'reto', text: 'Siga pela calçada da Av. Paulista, sentido Paraíso (400 m).' },
      { kind: 'direita', text: 'Na esquina com a Av. Brigadeiro Luís Antônio, vire à direita.' },
      { kind: 'reto', text: 'Desça a avenida por 1 quarteirão (150 m).' },
      { kind: 'faixa', text: 'Atravesse na faixa de pedestres com semáforo.' },
      { kind: 'chegada', text: 'O ponto fica do outro lado da rua, ao lado da banca de jornal.' },
    ],
    // No mapa: Paulista para a direita (sentido Paraíso), direita na Brigadeiro (para baixo)
    mapPath: [MAP_STOP, { x: 0.84, y: 0.5 }, { x: 0.84, y: 0.64 }],
  },
];

/** Destinos que NÃO saem deste ponto, mas saem de um ponto perto (a pé). */
export interface NearbyDestination {
  id: string;
  name: string;
  aliases: string[];
  stopId: string;
  lineId: string;
  /** Tempo dentro do ônibus até o destino. */
  rideMinutes: number;
}

export const NEARBY_DESTINATIONS: NearbyDestination[] = [
  {
    id: 'congonhas',
    name: 'Aeroporto de Congonhas',
    aliases: ['congonhas', 'aeroporto'],
    stopId: 'PT-2010',
    lineId: '875A',
    rideMinutes: 32,
  },
  {
    id: 'usp',
    name: 'Cidade Universitária (USP)',
    aliases: ['usp', 'cidade universitaria', 'butanta', 'universidade'],
    stopId: 'PT-2010',
    lineId: '702U',
    rideMinutes: 35,
  },
  {
    id: 'morumbi',
    name: 'Estádio do Morumbi',
    aliases: ['morumbi', 'estadio'],
    stopId: 'PT-2010',
    lineId: '917H',
    rideMinutes: 40,
  },
  {
    id: 'moema',
    name: 'Moema',
    aliases: ['moema'],
    stopId: 'PT-0870',
    lineId: '4M15',
    rideMinutes: 22,
  },
  {
    id: 'santana',
    name: 'Santana',
    aliases: ['santana', 'zona norte'],
    stopId: 'PT-0870',
    lineId: '1S30',
    rideMinutes: 38,
  },
];

export interface DestinationTemplate {
  id: string;
  name: string;
  /** Outras formas que o passageiro pode digitar. */
  aliases: string[];
  /** Cada opção é uma sequência de trechos (caminhada, ônibus, metrô). */
  options: RouteLeg[][];
}


// Estações de metrô a pé a partir do totem
const WALK_TO_TRIANON: RouteLeg = { mode: 'caminhada', label: 'Caminhe até a estação Trianon-MASP (Linha Verde)', minutes: 2 };
const FROM_HERE = 'Av. Paulista – MASP';

export const DESTINATIONS: DestinationTemplate[] = [
  {
    id: 'pinheiros',
    name: 'Pinheiros',
    aliases: ['largo da batata', 'faria lima', 'terminal pinheiros', 'reboucas', 'hospital das clinicas'],
    options: [
      [
        { mode: 'onibus', lineId: '7B23', label: 'Ônibus 7B23 até o Largo de Pinheiros', minutes: 24, from: FROM_HERE, to: 'Largo de Pinheiros' },
        { mode: 'caminhada', label: 'Caminhe até o destino', minutes: 2 },
      ],
      [
        WALK_TO_TRIANON,
        { mode: 'metro', lineId: 'MET-VERDE', label: 'Metrô Linha Verde até Consolação', minutes: 2, from: 'Trianon-MASP', to: 'Consolação' },
        {
          mode: 'caminhada',
          transfer: true,
          label: 'Baldeação: siga as placas amarelas pelo corredor até a estação Paulista',
          minutes: 4,
        },
        { mode: 'metro', lineId: 'MET-AMARELA', label: 'Metrô Linha Amarela até Pinheiros', minutes: 7, from: 'Paulista', to: 'Pinheiros' },
        { mode: 'caminhada', label: 'Caminhe até o destino', minutes: 3 },
      ],
    ],
  },
  {
    id: 'lapa',
    name: 'Lapa',
    aliases: ['terminal lapa', 'pompeia', 'sumare'],
    options: [
      [{ mode: 'onibus', lineId: '8C10', label: 'Ônibus 8C10 até o Terminal Lapa', minutes: 35, from: FROM_HERE, to: 'Terminal Lapa' }],
      [
        WALK_TO_TRIANON,
        { mode: 'metro', lineId: 'MET-VERDE', label: 'Metrô Linha Verde até Vila Madalena', minutes: 8, from: 'Trianon-MASP', to: 'Vila Madalena' },
        { mode: 'caminhada', transfer: true, label: 'Saia da estação e vá ao Terminal Vila Madalena', minutes: 3 },
        { mode: 'onibus', lineId: '8L01', label: 'Ônibus 8L01 até o Terminal Lapa', minutes: 15, from: 'Terminal Vila Madalena', to: 'Terminal Lapa' },
      ],
    ],
  },
  {
    id: 'ibirapuera',
    name: 'Parque Ibirapuera',
    aliases: ['ibirapuera', 'parque'],
    options: [
      [{ mode: 'onibus', lineId: '5M44', label: 'Ônibus 5M44 até o Portão 3', minutes: 18, from: FROM_HERE, to: 'Parque Ibirapuera (Portão 3)' }],
      [
        { mode: 'onibus', lineId: '6P01', label: 'Ônibus 6P01 até o Portão 10', minutes: 20, from: FROM_HERE, to: 'Parque Ibirapuera (Portão 10)' },
        { mode: 'caminhada', label: 'Caminhe pelo parque até o destino', minutes: 6 },
      ],
      [
        WALK_TO_TRIANON,
        { mode: 'metro', lineId: 'MET-VERDE', label: 'Metrô Linha Verde até Ana Rosa', minutes: 7, from: 'Trianon-MASP', to: 'Ana Rosa' },
        { mode: 'caminhada', label: 'Caminhe até o parque', minutes: 14 },
      ],
    ],
  },
  {
    id: 'vila-mariana',
    name: 'Vila Mariana',
    aliases: ['vergueiro', 'ana rosa', 'paraiso'],
    options: [
      [{ mode: 'onibus', lineId: '6P01', label: 'Ônibus 6P01 até Vila Mariana', minutes: 17, from: FROM_HERE, to: 'Vila Mariana' }],
      [
        WALK_TO_TRIANON,
        { mode: 'metro', lineId: 'MET-VERDE', label: 'Metrô Linha Verde até Ana Rosa', minutes: 6, from: 'Trianon-MASP', to: 'Ana Rosa' },
        { mode: 'caminhada', transfer: true, label: 'Baldeação: troque para a Linha Azul na mesma estação', minutes: 2 },
        { mode: 'metro', lineId: 'MET-AZUL', label: 'Metrô Linha Azul até Vila Mariana', minutes: 2, from: 'Ana Rosa', to: 'Vila Mariana' },
        { mode: 'caminhada', label: 'Caminhe até o destino', minutes: 2 },
      ],
    ],
  },
  {
    id: 'barra-funda',
    name: 'Barra Funda',
    aliases: ['terminal barra funda', 'perdizes', 'memorial da america latina'],
    options: [
      [{ mode: 'onibus', lineId: '9T02', label: 'Ônibus 9T02 até o Terminal Barra Funda', minutes: 28, from: FROM_HERE, to: 'Terminal Barra Funda' }],
      [
        { mode: 'onibus', lineId: '8C10', label: 'Ônibus 8C10 até a Av. Sumaré', minutes: 15, from: FROM_HERE, to: 'Av. Sumaré' },
        { mode: 'caminhada', label: 'Caminhe até a Barra Funda', minutes: 15 },
      ],
    ],
  },
  {
    id: 'centro',
    name: 'Centro (Praça da Sé)',
    aliases: ['se', 'praca da se', 'centro', 'liberdade', 'anhangabau', 'republica'],
    options: [
      [{ mode: 'onibus', lineId: '2C05', label: 'Ônibus 2C05 até a Praça da Sé', minutes: 26, from: FROM_HERE, to: 'Praça da Sé' }],
      [
        WALK_TO_TRIANON,
        { mode: 'metro', lineId: 'MET-VERDE', label: 'Metrô Linha Verde até Paraíso', minutes: 4, from: 'Trianon-MASP', to: 'Paraíso' },
        { mode: 'caminhada', transfer: true, label: 'Baldeação: troque para a Linha Azul na mesma estação', minutes: 2 },
        { mode: 'metro', lineId: 'MET-AZUL', label: 'Metrô Linha Azul até Sé', minutes: 8, from: 'Paraíso', to: 'Sé' },
      ],
    ],
  },
  {
    id: 'consolacao',
    name: 'Rua da Consolação',
    aliases: ['consolacao', 'mackenzie', 'praca roosevelt'],
    options: [
      [
        { mode: 'onibus', lineId: '2C05', label: 'Ônibus 2C05 até a Rua da Consolação', minutes: 5, from: FROM_HERE, to: 'Consolação' },
        { mode: 'caminhada', label: 'Caminhe até o destino', minutes: 2 },
      ],
      [{ mode: 'caminhada', label: 'Vá a pé pela Av. Paulista', minutes: 10 }],
    ],
  },
];

// ---------------------------------------------------------------------------
// Mapa SIMULADO ao redor do totem (como um "print" de mapa, desenhado no app).
// Coordenadas de 0 a 1: x da esquerda (Consolação) para a direita (Paraíso),
// y de cima (norte) para baixo (sul). Todas as ruas são retas para simplificar.
// ---------------------------------------------------------------------------

export const MAP_STREETS: MapStreet[] = [
  { name: 'Av. Paulista', from: { x: 0, y: 0.5 }, to: { x: 1, y: 0.5 }, major: true },
  { name: 'R. São Carlos do Pinhal', from: { x: 0, y: 0.3 }, to: { x: 1, y: 0.3 } },
  { name: 'Al. Santos', from: { x: 0, y: 0.7 }, to: { x: 1, y: 0.7 } },
  { name: 'R. da Consolação', from: { x: 0.08, y: 0 }, to: { x: 0.08, y: 1 }, major: true },
  { name: 'R. Augusta', from: { x: 0.26, y: 0 }, to: { x: 0.26, y: 1 } },
  { name: 'R. Pamplona', from: { x: 0.64, y: 0 }, to: { x: 0.64, y: 1 } },
  { name: 'Av. Brig. Luís Antônio', from: { x: 0.84, y: 0 }, to: { x: 0.84, y: 1 }, major: true },
];

export const MAP_PLACES: MapPlace[] = [
  { name: 'Parque Trianon', kind: 'parque', at: { x: 0.33, y: 0.55 }, size: { w: 0.11, h: 0.12 } },
  { name: 'MASP', kind: 'marco', at: { x: 0.58, y: 0.4 } },
  { name: 'Consolação', kind: 'metro', at: { x: 0.12, y: 0.63 } },
  { name: 'Trianon-MASP', kind: 'metro', at: { x: 0.42, y: 0.42 }, labelLeft: true },
  { name: 'Brigadeiro', kind: 'metro', at: { x: 0.88, y: 0.44 }, labelLeft: true },
];

/**
 * Caminho que cada ônibus faz até o totem (o último ponto é sempre o totem).
 * Este ponto fica no sentido Consolação, então todos chegam pela direita.
 */
export const BUS_APPROACH: Record<string, MapPoint[]> = {
  '2C05': [{ x: 1, y: 0.5 }, MAP_STOP],
  '7B23': [{ x: 1, y: 0.7 }, { x: 0.64, y: 0.7 }, { x: 0.64, y: 0.5 }, MAP_STOP],
  '6P01': [{ x: 1, y: 0.3 }, { x: 0.64, y: 0.3 }, { x: 0.64, y: 0.5 }, MAP_STOP],
  '5M44': [{ x: 0.84, y: 1 }, { x: 0.84, y: 0.5 }, MAP_STOP],
  '8C10': [{ x: 0.84, y: 0 }, { x: 0.84, y: 0.5 }, MAP_STOP],
  '9T02': [{ x: 0.64, y: 0 }, { x: 0.64, y: 0.5 }, MAP_STOP],
};
