import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ArrivalCard from '../components/ArrivalCard';
import Button from '../components/Button';
import Loading from '../components/Loading';
import Message from '../components/Message';
import SearchBox from '../components/SearchBox';
import StopHeader from '../components/StopHeader';
import { TOTEM_STOP } from '../constants/mockData';
import { colors, fonts, spacing, letterSpacing } from '../constants/theme';
import { useHistory } from '../context/HistoryContext';
import { getNextArrivals, listExampleDestinations, suggestDestinations } from '../services/busService';
import { Arrival } from '../types';

const AUTO_REFRESH_MS = 30000; // atualiza os horários a cada 30 s

// TELA 1 — Início do totem: próximos ônibus + "Para onde você vai?"
export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { recentDestinations } = useHistory();

  const [arrivals, setArrivals] = useState<Arrival[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  // silent = true atualiza sem mostrar o "Carregando" (usado na atualização automática)
  const loadArrivals = async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const data = await getNextArrivals();
      setArrivals(data);
      setError(null);
    } catch (e) {
      if (!silent) setError(e instanceof Error ? e.message : 'Erro ao buscar os ônibus.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArrivals();
    const clock = setInterval(() => setNow(Date.now()), 1000);
    const refresh = setInterval(() => loadArrivals(true), AUTO_REFRESH_MS);
    return () => {
      clearInterval(clock);
      clearInterval(refresh);
    };
  }, []);

  const goToRoutes = (destino: string) => {
    router.push({ pathname: '/rotas', params: { destino } });
  };

  // Esconde ônibus que já passaram enquanto a próxima atualização não chega
  const upcoming = arrivals.filter((a) => a.arrivalAt > now - 30000);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
      keyboardShouldPersistTaps="handled"
    >
      <StopHeader stop={TOTEM_STOP} now={now} />

      <SearchBox onSearch={goToRoutes} examples={listExampleDestinations()} suggest={suggestDestinations} />

      {/* Atalhos: buscas recentes salvas no banco (SQLite) */}
      {recentDestinations.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>BUSCADOS RECENTEMENTE NESTE PONTO</Text>
          <View style={styles.shortcuts}>
            {recentDestinations.map((name) => (
              <Button
                key={name}
                small
                variant="secondary"
                title={name}
                accessibilityHint={`Mostra como chegar em ${name}`}
                onPress={() => goToRoutes(name)}
              />
            ))}
          </View>
        </View>
      )}

      {/* Painel de próximos ônibus */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle} accessibilityRole="header">
            Próximos ônibus
          </Text>
          <Button small variant="secondary" title="Atualizar" icon="refresh-outline" onPress={() => loadArrivals()} />
        </View>

        <Button
          variant="secondary"
          title="Ver os ônibus no mapa"
          icon="map-outline"
          accessibilityHint="Mostra onde estão os ônibus que estão vindo para este ponto"
          onPress={() => router.push('/mapa')}
        />

        {loading && <Loading message="Buscando os próximos ônibus..." />}

        {!loading && error && (
          <Message type="error" title="Ops, algo deu errado" message={error} actionTitle="Tentar de novo" onAction={() => loadArrivals()} />
        )}

        {!loading && !error && upcoming.length === 0 && (
          <Message type="empty" title="Nenhum ônibus previsto" message="Não há ônibus chegando neste ponto agora." />
        )}

        {!loading &&
          !error &&
          upcoming.map((arrival) => (
            <ArrivalCard
              key={arrival.id}
              arrival={arrival}
              now={now}
              onPress={() => router.push({ pathname: '/linha/[id]', params: { id: arrival.lineId } })}
            />
          ))}
      </View>

      <Button
        variant="secondary"
        title="Ver buscas recentes"
        icon="time-outline"
        accessibilityHint="Mostra as buscas salvas neste totem"
        onPress={() => router.push('/historico')}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.lg },

  section: { gap: spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  sectionTitle: { fontSize: fonts.title, fontWeight: 'bold', color: colors.text },
  sectionLabel: { fontSize: fonts.small, fontWeight: 'bold', color: colors.primary, letterSpacing },
  shortcuts: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
