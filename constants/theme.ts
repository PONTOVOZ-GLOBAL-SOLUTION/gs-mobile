// Tamanhos de fonte, espaçamentos e bordas usados em todo o app.
// Nenhuma tela usa número "solto" para isso: tudo vem daqui.
export { colors } from './colors';

export const fonts = {
  small: 16,
  regular: 20,
  medium: 22,
  large: 26,
  title: 32,
  huge: 48,
  // Só para rótulos dentro do mapa simulado. A mesma informação sempre aparece
  // também em texto grande na lista embaixo do mapa.
  mapLabel: 12,
  mapStrong: 14,
};

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  round: 999,
};

export const borders = {
  thin: 1,
  regular: 2,
  thick: 3,
  accent: 6,
};

// Tamanhos fixos de elementos visuais
export const sizes = {
  iconBox: 52,
  lineBadgeMin: 80,
  lineBadgeMax: 96,
  timeBoxMin: 84,
  dot: 16,
  mapMinHeight: 240,
};

export const letterSpacing = 1;
export const lineHeight = 1.4; // multiplicador da altura da linha

// Altura mínima de qualquer coisa tocável (acessibilidade).
export const TOUCH_SIZE = 56;
export const TOUCH_SIZE_SMALL = 48;
