import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../components/Button';
import LineCheckCard from '../components/LineCheckCard';
import Loading from '../components/Loading';
import Message from '../components/Message';
import RouteCard from '../components/RouteCard';
import { colors, fonts, spacing, radius, borders, letterSpacing } from '../constants/theme';
import { useHistory } from '../context/HistoryContext';
import { listExampleDestinations, searchRoutes } from '../services/busService';
import { RouteSearchResult } from '../types';

// TELA 2 — Alternativas para chegar ao destino, da mais rápida para a mais lenta.
export default function Rotas() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { destino = '' } = useLocalSearchParams<{ destino: string }>();
  const { saveSearch } = useHistory();

  const [result, setResult] = useState<RouteSearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0); // muda para "tentar de novo"
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const clock = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(clock);
  }, []);

  useEffect(() => {
    let active = true; // evita atualizar a tela se o usuário já trocou de busca

    const load = async () => {
      setLoading(true);
      setError(null);
      setResult(null);
      try {
        const data = await searchRoutes(destino);
        if (!active) return;

        // Destino não sai deste ponto, mas sai de um ponto perto: redireciona
        if (data.options.length === 0 && data.nearbyStopId) {
          router.replace({ pathname: '/outro-ponto', params: { destino } });
          return;
        }
        setResult(data);

        // Salva no banco toda busca que encontrou rotas
        if (data.destinationName && data.options.length > 0) {
          const best = data.options[0];
          saveSearch({
            query: data.query,
            destinationName: data.destinationName,
            bestOption: best.title,
            bestTotalMinutes: best.totalMinutes,
            optionsCount: data.options.length,
          }).catch(() => console.warn('Não foi possível salvar a busca'));
        }
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Erro ao calcular as rotas.');
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [destino, attempt]);

  const openLine = (id: string) => router.push({ pathname: '/linha/[id]', params: { id } });

  const linesHere = result?.linesHere ?? [];
  const goingCodes = linesHere.filter((l) => l.goesToDestination).map((l) => l.code);
  const notGoingCount = linesHere.length - goingCodes.length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
    >
      <View>
        <Text style={styles.goingTo}>INDO PARA</Text>
        <Text style={styles.destination} accessibilityRole="header">
          {result?.destinationName ?? destino}
        </Text>
      </View>

      {loading && <Loading message="Calculando as melhores opções..." />}

      {!loading && error && (
        <Message
          type="error"
          title="Ops, algo deu errado"
          message={error}
          actionTitle="Tentar de novo"
          onAction={() => setAttempt((n) => n + 1)}
        />
      )}

      {!loading && result && result.options.length === 0 && (
        <Message
          type="empty"
          title="Não encontramos esse destino"
          message={`Não achamos rotas para "${destino}" saindo deste ponto. Tente um destes:`}
        >
          <View style={styles.suggestions}>
            {[...listExampleDestinations().here, ...listExampleDestinations().nearby].map((name) => (
              <Button
                key={name}
                small
                variant="secondary"
                title={name}
                accessibilityHint={`Mostra como chegar em ${name}`}
                onPress={() => router.setParams({ destino: name })}
              />
            ))}
          </View>
        </Message>
      )}

      {!loading && result && result.options.length > 0 && (
        <>
          {/* Aviso: quais ônibus deste ponto vão para o destino */}
          <View style={styles.notice} accessible accessibilityLiveRegion="polite">
            <Text style={styles.noticeText}>
              {goingCodes.length > 0
                ? `Deste ponto, ${goingCodes.length === 1 ? 'só o ônibus' : 'os ônibus'} ${goingCodes.join(', ')} ${goingCodes.length === 1 ? 'vai' : 'vão'} para ${result.destinationName}.`
                : `Nenhum ônibus deste ponto vai direto para ${result.destinationName}.`}
            </Text>
            <Text style={styles.noticeSub}>
              {notGoingCount} {notGoingCount === 1 ? 'ônibus deste ponto não vai' : 'ônibus deste ponto não vão'}. Veja a lista
              completa no fim da tela.
            </Text>
          </View>

          <Text style={styles.info}>
            {result.options.length} opções encontradas. A primeira é a que chega mais cedo agora.
          </Text>
          {result.options.map((option) => (
            <RouteCard key={option.id} option={option} onPressLine={openLine} />
          ))}
          <Button
            variant="secondary"
            title="Atualizar tempos"
            icon="refresh-outline"
            onPress={() => setAttempt((n) => n + 1)}
          />

          <View style={styles.section}>
            <Text style={styles.sectionTitle} accessibilityRole="header">
              Ônibus deste ponto
            </Text>
            <Text style={styles.info}>Quais vão e quais não vão para {result.destinationName}.</Text>
            {result.linesHere.map((line) => (
              <LineCheckCard
                key={line.lineId}
                line={line}
                destinationName={result.destinationName ?? destino}
                now={now}
                onPress={() => openLine(line.lineId)}
              />
            ))}
          </View>
        </>
      )}

      <Button title="Fazer outra busca" icon="search-outline" onPress={() => router.dismissTo('/')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.lg },

  goingTo: { fontSize: fonts.small, fontWeight: 'bold', color: colors.primary, letterSpacing },
  destination: { fontSize: fonts.title, fontWeight: 'bold', color: colors.text },
  info: { fontSize: fonts.regular, color: colors.textMuted },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center' },

  notice: {
    backgroundColor: colors.cardLight,
    borderRadius: radius.md,
    borderLeftWidth: borders.accent,
    borderLeftColor: colors.success,
    padding: spacing.md,
    gap: spacing.xs,
  },
  noticeText: { fontSize: fonts.regular, fontWeight: 'bold', color: colors.text },
  noticeSub: { fontSize: fonts.small, color: colors.textMuted },

  section: { gap: spacing.md },
  sectionTitle: { fontSize: fonts.large, fontWeight: 'bold', color: colors.text },
});
