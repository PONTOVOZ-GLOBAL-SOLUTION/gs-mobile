import { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius, borders, letterSpacing, TOUCH_SIZE } from '../constants/theme';
import { DestinationHint } from '../types';
import { extractDestination, isRealSpeechAvailable, SpeechMode, SpeechSession, startListening } from '../services/speechService';
import Button from './Button';

type VoiceState =
  | { status: 'parado' }
  | { status: 'ouvindo'; partial: string; mode: SpeechMode }
  | { status: 'ouvido'; phrase: string; mode: SpeechMode }
  | { status: 'erro'; message: string };

type Props = {
  onSearch: (text: string) => void;
  examples: { here: string[]; nearby: string[] };
  suggest: (text: string) => DestinationHint[];
};

// Campo "Para onde você vai?" + botão de buscar.
// Embaixo do campo: exemplos do que dá para buscar e, enquanto digita,
// a confirmação se o destino sai deste ponto ou de outro ponto perto.
// O botão de microfone permite falar o destino em vez de digitar.
export default function SearchBox({ onSearch, examples, suggest }: Props) {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState<VoiceState>({ status: 'parado' });
  const session = useRef<SpeechSession | null>(null);
  const typed = text.trim();
  const canSearch = typed.length >= 2;
  const hints = canSearch ? suggest(typed) : [];
  const listening = voice.status === 'ouvindo';

  // Para de ouvir se a pessoa sair da tela.
  useEffect(() => () => session.current?.stop(), []);

  const handleSearch = () => {
    if (canSearch) onSearch(typed);
  };

  const pick = (name: string) => {
    setText('');
    setVoice({ status: 'parado' });
    onSearch(name);
  };

  const stopListening = () => {
    session.current?.stop();
    session.current = null;
    setVoice({ status: 'parado' });
  };

  const startVoice = () => {
    if (listening) return stopListening();
    setText('');
    let mode: SpeechMode = isRealSpeechAvailable() ? 'real' : 'simulado';
    setVoice({ status: 'ouvindo', partial: '', mode });

    session.current = startListening([...examples.here, ...examples.nearby], {
      onMode: (m) => {
        mode = m;
        setVoice({ status: 'ouvindo', partial: '', mode: m });
      },
      onPartial: (partial) => setVoice({ status: 'ouvindo', partial, mode }),
      onError: (message) => {
        session.current = null;
        setVoice({ status: 'erro', message });
      },
      onFinal: (phrase) => {
        session.current = null;
        const destination = extractDestination(phrase);
        const found = suggest(destination);
        // Um único destino reconhecido: já mostra as opções.
        if (found.length === 1) return pick(found[0].name);
        // Vários ou nenhum: deixa no campo para a pessoa confirmar ou corrigir.
        setText(destination);
        setVoice({ status: 'ouvido', phrase, mode });
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label} accessibilityRole="header">
        Para onde você vai?
      </Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={(value) => {
            setText(value);
            if (voice.status !== 'parado') stopListening();
          }}
          onSubmitEditing={handleSearch}
          placeholder="Digite ou fale. Ex.: Pinheiros"
          placeholderTextColor={colors.textMuted}
          returnKeyType="search"
          autoCorrect={false}
          accessibilityLabel="Para onde você vai? Digite o destino"
          accessibilityHint="Embaixo do campo aparece se o destino sai deste ponto"
        />
        <TouchableOpacity
          style={[styles.micButton, listening && styles.micButtonActive]}
          onPress={startVoice}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={listening ? 'Parar de ouvir' : 'Falar o destino'}
          accessibilityHint={listening ? undefined : 'Toque e diga para onde você vai'}
          accessibilityState={{ selected: listening }}
        >
          <Ionicons name={listening ? 'stop' : 'mic'} size={fonts.large} color={listening ? colors.text : colors.textDark} />
          <Text style={[styles.micText, listening && styles.micTextActive]}>{listening ? 'Parar' : 'Falar'}</Text>
        </TouchableOpacity>
      </View>

      {/* Busca por voz: ouvindo / o que foi ouvido / erro */}
      {voice.status !== 'parado' && (
        <View style={styles.voicePanel} accessibilityLiveRegion="polite">
          {voice.status === 'ouvindo' && (
            <>
              <View style={styles.voiceRow}>
                <Ionicons name="mic" size={fonts.regular} color={colors.danger} />
                <Text style={styles.voiceTitle}>Ouvindo… diga para onde você vai</Text>
              </View>
              <Text style={styles.voiceTranscript}>
                {voice.partial ? `"${voice.partial}"` : 'Ex.: "Quero ir para Pinheiros"'}
              </Text>
            </>
          )}
          {voice.status === 'ouvido' && (
            <View style={styles.voiceRow}>
              <Ionicons name="chatbubble-ellipses-outline" size={fonts.regular} color={colors.primary} />
              <Text style={styles.voiceHeard}>Você disse: "{voice.phrase}"</Text>
            </View>
          )}
          {voice.status === 'erro' && (
            <View style={styles.voiceRow}>
              <Ionicons name="alert-circle-outline" size={fonts.regular} color={colors.warning} />
              <Text style={styles.voiceError}>{voice.message}</Text>
            </View>
          )}
          {voice.status !== 'erro' && voice.mode === 'simulado' && (
            <Text style={styles.voiceNote}>Transcrição simulada neste aparelho (demonstração).</Text>
          )}
        </View>
      )}

      {/* Verificação enquanto digita */}
      {canSearch && (
        <View style={styles.hints} accessibilityLiveRegion="polite">
          {hints.length === 0 ? (
            <View style={styles.notFound}>
              <Ionicons name="help-circle-outline" size={fonts.regular} color={colors.warning} />
              <Text style={styles.notFoundText}>
                Não encontramos "{typed}". Toque em um dos exemplos abaixo.
              </Text>
            </View>
          ) : (
            hints.map((hint) => (
              <TouchableOpacity
                key={hint.name}
                style={styles.hint}
                onPress={() => pick(hint.name)}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={
                  hint.where === 'aqui'
                    ? `${hint.name}. Sai deste ponto.`
                    : `${hint.name}. Sai de outro ponto: ${hint.stopName}, ${hint.walkMinutes} minutos a pé.`
                }
                accessibilityHint="Mostra como chegar"
              >
                <Ionicons
                  name={hint.where === 'aqui' ? 'checkmark-circle' : 'walk'}
                  size={fonts.large}
                  color={hint.where === 'aqui' ? colors.success : colors.warning}
                />
                <View style={styles.hintBody}>
                  <Text style={styles.hintName}>{hint.name}</Text>
                  <Text style={[styles.hintWhere, { color: hint.where === 'aqui' ? colors.success : colors.warning }]}>
                    {hint.where === 'aqui'
                      ? 'Sai deste ponto'
                      : `Sai de outro ponto: ${hint.stopName} (${hint.walkMinutes} min a pé)`}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={fonts.regular} color={colors.textMuted} />
              </TouchableOpacity>
            ))
          )}
        </View>
      )}

      <Button title="Ver melhores opções" icon="search-outline" onPress={handleSearch} disabled={!canSearch} />

      {/* Exemplos do que dá para buscar */}
      {hints.length === 0 && (
        <View style={styles.examples}>
          <Text style={styles.examplesLabel}>SAEM DESTE PONTO</Text>
          <View style={styles.chips}>
            {examples.here.map((name) => (
              <Button
                key={name}
                small
                variant="secondary"
                title={name}
                accessibilityHint={`Sai deste ponto. Mostra como chegar em ${name}`}
                onPress={() => pick(name)}
              />
            ))}
          </View>

          <Text style={styles.examplesLabel}>SAEM DE UM PONTO PERTO (A PÉ)</Text>
          <View style={styles.chips}>
            {examples.nearby.map((name) => (
              <Button
                key={name}
                small
                variant="secondary"
                icon="walk-outline"
                title={name}
                accessibilityHint={`Sai de outro ponto perto daqui. Mostra o caminho até lá`}
                onPress={() => pick(name)}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: borders.thin,
    borderColor: colors.border,
  },
  label: { fontSize: fonts.large, fontWeight: 'bold', color: colors.text },
  inputRow: { flexDirection: 'row', gap: spacing.sm },
  input: {
    flex: 1,
    minHeight: TOUCH_SIZE + spacing.sm,
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderWidth: borders.regular,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: fonts.medium,
    color: colors.text,
  },

  micButton: {
    minWidth: TOUCH_SIZE + spacing.md,
    minHeight: TOUCH_SIZE + spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
  },
  micButtonActive: { backgroundColor: colors.cardLight, borderWidth: borders.regular, borderColor: colors.danger },
  micText: { fontSize: fonts.small, fontWeight: 'bold', color: colors.textDark },
  micTextActive: { color: colors.text },

  voicePanel: {
    gap: spacing.xs,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: borders.thin,
    borderColor: colors.border,
  },
  voiceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  voiceTitle: { flex: 1, fontSize: fonts.regular, fontWeight: 'bold', color: colors.text },
  voiceTranscript: { fontSize: fonts.medium, color: colors.primary, fontStyle: 'italic' },
  voiceHeard: { flex: 1, fontSize: fonts.regular, color: colors.text },
  voiceError: { flex: 1, fontSize: fonts.small, color: colors.warning },
  voiceNote: { fontSize: fonts.small, color: colors.textMuted },

  hints: { gap: spacing.sm },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: TOUCH_SIZE,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.cardLight,
    borderRadius: radius.md,
  },
  hintBody: { flex: 1, gap: spacing.xxs },
  hintName: { fontSize: fonts.regular, fontWeight: 'bold', color: colors.text },
  hintWhere: { fontSize: fonts.small, fontWeight: 'bold' },
  notFound: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  notFoundText: { flex: 1, fontSize: fonts.small, color: colors.warning },

  examples: { gap: spacing.sm },
  examplesLabel: { fontSize: fonts.small, fontWeight: 'bold', color: colors.primary, letterSpacing },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
