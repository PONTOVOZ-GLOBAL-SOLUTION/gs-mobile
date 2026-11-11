// Busca por voz: transforma a fala do passageiro em texto.
//
// - Na versão web (Chrome/Edge) usa o reconhecimento de voz do próprio navegador
//   (Web Speech API, em português). É gratuito e não precisa de chave.
// - No Expo Go não existe reconhecimento de voz embutido, então a transcrição é
//   SIMULADA: o totem "ouve" uma frase de exemplo e a escreve palavra por palavra.
//   Também cai na simulação se o navegador não suportar ou bloquear o microfone.
import { Platform } from 'react-native';

export type SpeechMode = 'real' | 'simulado';

export type SpeechHandlers = {
  /** Texto parcial enquanto a pessoa fala. */
  onPartial: (text: string) => void;
  /** Frase completa reconhecida. */
  onFinal: (text: string) => void;
  /** Algo deu errado (mensagem já em linguagem simples). */
  onError: (message: string) => void;
  /** Avisa qual modo está sendo usado (pode mudar de "real" para "simulado"). */
  onMode?: (mode: SpeechMode) => void;
};

export type SpeechSession = { stop: () => void };

// Tipos mínimos da Web Speech API (não fazem parte do TypeScript do React Native).
type WebRecognitionResult = { isFinal: boolean; 0: { transcript: string } };
type WebRecognitionEvent = { results: ArrayLike<WebRecognitionResult> };
type WebRecognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((event: WebRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};
type WebRecognitionConstructor = new () => WebRecognition;

function getWebRecognition(): WebRecognitionConstructor | null {
  if (Platform.OS !== 'web') return null;
  const w = globalThis as unknown as {
    SpeechRecognition?: WebRecognitionConstructor;
    webkitSpeechRecognition?: WebRecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** O aparelho consegue transcrever a fala de verdade? */
export function isRealSpeechAvailable(): boolean {
  return getWebRecognition() !== null;
}

const SIM_LISTEN_DELAY_MS = 900; // tempo "ouvindo" antes da primeira palavra
const SIM_WORD_MS = 320; // intervalo entre as palavras na simulação
const SIM_TEMPLATES = ['Quero ir para {d}', 'Como chego em {d}', 'Vou pra {d}', 'Me leva até {d}'];

function pickRandom<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

/** Simula a transcrição de uma frase com um dos destinos de exemplo. */
function simulate(destinations: string[], handlers: SpeechHandlers): SpeechSession {
  handlers.onMode?.('simulado');
  const phrase = pickRandom(SIM_TEMPLATES).replace('{d}', pickRandom(destinations));
  const words = phrase.split(' ');
  const timers: ReturnType<typeof setTimeout>[] = [];

  words.forEach((_, i) => {
    timers.push(
      setTimeout(() => {
        const partial = words.slice(0, i + 1).join(' ');
        if (i === words.length - 1) handlers.onFinal(partial);
        else handlers.onPartial(partial);
      }, SIM_LISTEN_DELAY_MS + i * SIM_WORD_MS),
    );
  });

  return { stop: () => timers.forEach(clearTimeout) };
}

/**
 * Começa a ouvir. `destinations` são usados só na simulação, para que a frase
 * "ouvida" seja de um destino que o totem conhece.
 */
export function startListening(destinations: string[], handlers: SpeechHandlers): SpeechSession {
  const Recognition = getWebRecognition();
  if (!Recognition) return simulate(destinations, handlers);

  handlers.onMode?.('real');
  const recognition = new Recognition();
  recognition.lang = 'pt-BR';
  recognition.interimResults = true;
  recognition.continuous = false;
  recognition.maxAlternatives = 1;

  let finished = false;
  let fallback: SpeechSession | null = null;

  recognition.onresult = (event) => {
    const results = Array.from(event.results);
    const text = results.map((r) => r[0].transcript).join(' ').trim();
    const isFinal = results.length > 0 && results[results.length - 1].isFinal;
    if (isFinal) {
      finished = true;
      handlers.onFinal(text);
    } else {
      handlers.onPartial(text);
    }
  };

  recognition.onerror = (event) => {
    if (finished) return;
    finished = true;
    if (event.error === 'not-allowed' || event.error === 'service-not-allowed' || event.error === 'audio-capture') {
      // Sem microfone ou acesso negado: mostra a simulação para a jornada continuar.
      fallback = simulate(destinations, handlers);
    } else if (event.error === 'no-speech') {
      handlers.onError('Não ouvimos nada. Toque no microfone e fale de novo.');
    } else if (event.error !== 'aborted') {
      handlers.onError('Não deu para entender. Tente de novo ou digite o destino.');
    }
  };

  recognition.onend = () => {
    if (!finished) {
      finished = true;
      handlers.onError('Não ouvimos nada. Toque no microfone e fale de novo.');
    }
  };

  try {
    recognition.start();
  } catch {
    return simulate(destinations, handlers);
  }

  return {
    stop: () => {
      finished = true;
      fallback?.stop();
      recognition.abort();
    },
  };
}

// Palavras que vêm antes do destino: "quero ir PARA ...", "como chego NO ...".
const CONNECTORS = ['para', 'pra', 'pro', 'ate', 'em', 'no', 'na', 'ao', 'a']; // normalizadas (sem acento)
const ARTICLES = ['o', 'a', 'os', 'as', 'ao', 'aos'];
const TRAILING = /\s*(por favor|obrigad[oa])\s*$/i;

/**
 * Tira da frase falada só o destino.
 * "Quero ir para a Cidade Universitária" → "Cidade Universitária"
 */
export function extractDestination(phrase: string): string {
  const clean = phrase.replace(/[.,!?]/g, ' ').replace(TRAILING, '').replace(/\s+/g, ' ').trim();
  const words = clean.split(' ');
  const plain = words.map((w) =>
    w
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase(),
  );

  let start = 0;
  plain.forEach((w, i) => {
    // usa o último conector que ainda deixa alguma palavra depois dele
    if (CONNECTORS.includes(w) && i < plain.length - 1) start = i + 1;
  });
  while (start < plain.length - 1 && ARTICLES.includes(plain[start])) start++;

  return words.slice(start).join(' ');
}
