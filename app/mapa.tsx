import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ArrivalCard from '../components/ArrivalCard';
import BusMap from '../components/BusMap';
import Button from '../components/Button';
import Loading from '../components/Loading';
import Message from '../components/Message';
import { colors, fonts, spacing, letterSpacing } from '../constants/theme';
import { getBusMap } from '../services/busService';
import { BusMapData } from '../types';
import { distanceToStopMeters } from '../utils/geo';

const AUTO_REFRESH_MS = 30000;

// TELA 6 — Onde estão os ônibus que vêm para este ponto (mapa simulado).
export default function Mapa() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { linha } = useLocalSearchParams<{ linha?: string }>();

  const [data, setData] = useState<BusMapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [selected, setSelected] = useState<string | undefined>(linha);

  const load = async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const result = await getBusMap();
      setData(result);
      setError(null);
      // Sem linha escolhida: destaca o ônibus que chega primeiro
      setSelected((current) => current ?? result.buses[0]?.arrival.lineId);
    } catch (e) {
      if (!silent) setError(e instanceof Error ? e.message : 'Erro ao carregar o mapa.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const clock = setInterval(() => setNow(Date.now()), 1000);
    const refresh = setInterval(() => load(true), AUTO_REFRESH_MS);
    return () => {
      clearInterval(clock);
      clearInterval(refresh);
    };
  }, []);

  // Ônibus que já passaram somem até a próxima atualização
  const buses = (data?.buses ?? []).filter((b) => b.arrival.arrivalAt > now - 30000);
  const outside = buses.filter((b) => distanceToStopMeters(b.arrival.arrivalAt, now) > b.pathMeters).length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
    >
      <Text style={styles.intro}>
        Posição estimada do próximo ônibus de cada linha que para aqui. Toque em um ônibus para ver o caminho dele até o
        ponto.
      </Text>

      {loading && <Loading message="Localizando os ônibus..." />}

      {!loading && error && (
        <Message type="error" title="Ops, algo deu errado" message={error} actionTitle="Tentar de novo" onAction={() => load()} />
      )}

      {!loading && !error && data && (
        <>
          <BusMap data={{ ...data, buses }} now={now} selectedLineId={selected} onSelect={setSelected} />

          <Text style={styles.note}>
            Simulação: o mapa é um desenho do entorno e a posição é calculada pelo horário previsto (cerca de 9 km/h na
            Av. Paulista).
            {outside > 0 ? ` ${outside} ${outside === 1 ? 'ônibus ainda está' : 'ônibus ainda estão'} fora da área do mapa.` : ''}
          </Text>

          <Text style={styles.sectionLabel}>PRÓXIMO DE CADA LINHA</Text>
          {buses.length === 0 && (
            <Message type="empty" title="Nenhum ônibus a caminho" message="Não há ônibus vindo para este ponto agora." />
          )}
          {buses.map((bus) => (
            <ArrivalCard
              key={bus.arrival.id}
              arrival={bus.arrival}
              now={now}
              selected={bus.arrival.lineId === selected}
              hint="Destaca este ônibus no mapa"
              onPress={() => setSelected(bus.arrival.lineId)}
            />
          ))}

          {selected && (
            <Button
              variant="secondary"
              title={`Detalhes da linha ${selected}`}
              icon="information-circle-outline"
              onPress={() => router.push({ pathname: '/linha/[id]', params: { id: selected } })}
            />
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md },
  intro: { fontSize: fonts.regular, color: colors.text },
  note: { fontSize: fonts.small, color: colors.textMuted },
  sectionLabel: { fontSize: fonts.small, fontWeight: 'bold', color: colors.primary, letterSpacing },
});
