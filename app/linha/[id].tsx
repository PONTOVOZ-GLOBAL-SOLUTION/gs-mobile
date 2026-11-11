import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ArrivalCard from '../../components/ArrivalCard';
import Loading from '../../components/Loading';
import Message from '../../components/Message';
import Tag, { MODE_INFO } from '../../components/Tag';
import { colors, fonts, spacing, radius, borders, sizes } from '../../constants/theme';
import { getLineDetails } from '../../services/busService';
import { LineDetails } from '../../types';

// TELA 3 — Detalhes de uma linha: próximos horários e paradas.
export default function LinhaDetalhe() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [details, setDetails] = useState<LineDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  const loadDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      setDetails(await getLineDetails(id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar a linha.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
    const clock = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(clock);
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.container, styles.content]}>
        <Loading message="Carregando a linha..." />
      </View>
    );
  }

  if (error || !details) {
    return (
      <View style={[styles.container, styles.content]}>
        <Message
          type="error"
          title="Ops, algo deu errado"
          message={error ?? 'Linha não encontrada.'}
          actionTitle="Tentar de novo"
          onAction={loadDetails}
        />
      </View>
    );
  }

  const { line, arrivals, whereLabel } = details;
  const mode = MODE_INFO[line.mode];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
    >
      {/* Cabeçalho da linha */}
      <View style={styles.header}>
        <View style={[styles.lineBox, { backgroundColor: mode.color }]}>
          <Ionicons name={mode.icon} size={fonts.large} color={colors.textDark} />
          <Text style={styles.lineCode}>{line.code}</Text>
        </View>
        <Text style={styles.lineName} accessibilityRole="header">
          {line.name}
        </Text>
        <View style={styles.tags}>
          <Tag label={`Passa a cada ${line.headwayMin} min`} icon="time-outline" />
          <Tag
            label={line.accessible ? 'Acessível' : 'Sem rampa de acesso'}
            icon="accessibility-outline"
            color={line.accessible ? colors.textMuted : colors.warning}
          />
        </View>
      </View>

      {/* Próximos horários */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          Próximos horários {whereLabel}
        </Text>
        {arrivals.length === 0 ? (
          <Message type="empty" title="Sem horários previstos" message="Essa linha não tem veículos chegando agora." />
        ) : (
          arrivals.map((arrival) => <ArrivalCard key={arrival.id} arrival={arrival} now={now} />)
        )}
      </View>

      {/* Paradas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          Paradas do trajeto
        </Text>
        <View style={styles.stopsBox}>
          {line.stops.map((stop, index) => {
            const isEdge = index === 0 || index === line.stops.length - 1;
            return (
              <View
                key={stop}
                style={styles.stopRow}
                accessible
                accessibilityLabel={`Parada ${index + 1} de ${line.stops.length}: ${stop}`}
              >
                <View style={[styles.dot, index === 0 && styles.dotFirst]} />
                <Text style={[styles.stopText, isEdge && styles.stopTextBold]}>{stop}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.lg },

  header: { gap: spacing.sm, alignItems: 'flex-start' },
  lineBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  lineCode: { fontSize: fonts.medium, fontWeight: 'bold', color: colors.textDark },
  lineName: { fontSize: fonts.title, fontWeight: 'bold', color: colors.text },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },

  section: { gap: spacing.md },
  sectionTitle: { fontSize: fonts.large, fontWeight: 'bold', color: colors.text },

  stopsBox: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, gap: spacing.md },
  stopRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  dot: { width: sizes.dot, height: sizes.dot, borderRadius: radius.round, borderWidth: borders.thick, borderColor: colors.primary },
  dotFirst: { backgroundColor: colors.primary },
  stopText: { fontSize: fonts.regular, color: colors.text },
  stopTextBold: { fontWeight: 'bold' },
});
