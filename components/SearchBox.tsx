import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius, borders, letterSpacing, TOUCH_SIZE } from '../constants/theme';
import { DestinationHint } from '../types';
import Button from './Button';

type Props = {
  onSearch: (text: string) => void;
  examples: { here: string[]; nearby: string[] };
  suggest: (text: string) => DestinationHint[];
};

// Campo "Para onde você vai?" + botão de buscar.
// Embaixo do campo: exemplos do que dá para buscar e, enquanto digita,
// a confirmação se o destino sai deste ponto ou de outro ponto perto.
export default function SearchBox({ onSearch, examples, suggest }: Props) {
  const [text, setText] = useState('');
  const typed = text.trim();
  const canSearch = typed.length >= 2;
  const hints = canSearch ? suggest(typed) : [];

  const handleSearch = () => {
    if (canSearch) onSearch(typed);
  };

  const pick = (name: string) => {
    setText('');
    onSearch(name);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label} accessibilityRole="header">
        Para onde você vai?
      </Text>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        onSubmitEditing={handleSearch}
        placeholder="Digite um bairro ou lugar. Ex.: Pinheiros"
        placeholderTextColor={colors.textMuted}
        returnKeyType="search"
        autoCorrect={false}
        accessibilityLabel="Para onde você vai? Digite o destino"
        accessibilityHint="Embaixo do campo aparece se o destino sai deste ponto"
      />

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
  input: {
    minHeight: TOUCH_SIZE + spacing.sm,
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderWidth: borders.regular,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: fonts.medium,
    color: colors.text,
  },

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
