const MINUTE = 60_000;

/** Minutos inteiros que faltam até um horário (nunca negativo). */
export function minutesUntil(timestamp: number, now: number = Date.now()): number {
  return Math.max(0, Math.ceil((timestamp - now) / MINUTE));
}

/** Texto curto para o tempo de espera: "Chegando", "1 min", "12 min". */
export function formatWait(minutes: number): string {
  if (minutes <= 1) return minutes <= 0 ? 'Chegando' : '1 min';
  return `${minutes} min`;
}

/** Versão falada para leitores de tela. */
export function formatWaitSpoken(minutes: number): string {
  if (minutes <= 0) return 'chegando agora';
  if (minutes === 1) return 'chega em 1 minuto';
  return `chega em ${minutes} minutos`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

export function formatClock(timestamp: number | Date): string {
  const d = typeof timestamp === 'number' ? new Date(timestamp) : timestamp;
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month} às ${formatClock(d)}`;
}

/** Remove acentos, espaços extras e deixa minúsculo, para comparar o que foi digitado. */
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}
