/**
 * Cliente da "API" de transporte.
 *
 * Hoje os dados são simulados (mock), mas toda chamada passa por aqui com
 * latência de rede e falhas ocasionais, para o app tratar carregamento e erro
 * como se fosse uma API real. Para trocar por uma API de verdade (ex.: GTFS
 * ou a API de tempo real da operadora), basta substituir `request` por um
 * `fetch` e manter as mesmas assinaturas no busService.
 */

export const API_CONFIG = {
  /** Latência mínima e máxima simuladas, em ms. */
  minLatencyMs: 500,
  maxLatencyMs: 1200,
  /** Chance de uma requisição falhar (0 a 1). Use 0 para desligar. */
  failureRate: 0.1,
};

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function request<T>(resolver: () => T): Promise<T> {
  const { minLatencyMs, maxLatencyMs, failureRate } = API_CONFIG;
  await wait(minLatencyMs + Math.random() * (maxLatencyMs - minLatencyMs));

  if (Math.random() < failureRate) {
    throw new ApiError('Não conseguimos falar com a central de ônibus agora.');
  }
  return resolver();
}
