import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import LineCheckCard from '../components/LineCheckCard';
import Loading from '../components/Loading';
import Message from '../components/Message';
import RouteCard from '../components/RouteCard';
import WalkMap from '../components/WalkMap';
import WalkPath from '../components/WalkPath';
import { TOTEM_STOP } from '../constants/mockData';
import { colors, fonts, spacing, radius, borders, letterSpacing } from '../constants/theme';
import { useHistory } from '../context/HistoryContext';
import { getNearbyStopRoute } from '../services/busService';
import { NearbyStopResult } from '../types';

// TELA 5 — O destino não sai deste ponto: mostra o ponto mais perto que atende,
// o caminho a pé até lá e quais ônibus de cada ponto vão (ou não) para o destino.
export default function OutroPonto() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { destino = '' } = useLocalSearchParams<{ destino: string }>();
  const { saveSearch } = useHistory();

  const [result, setResult] = useState<NearbyStopResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    const clock = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(clock);
  }, []);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getNearbyStopRoute(destino);
        if (!active) return;
        setResult(data);

        // Também salva no banco (aparece em "Buscas recentes")
        if (data) {
          saveSearch({
            query: data.query,
            destinationName: data.destinationName,
            bestOption: `A pé até o ${data.stop.name} + ${data.option.title}`,
            bestTotalMinutes: data.option.totalMinutes,
            optionsCount: 1,
          }).catch(() => console.warn('Não foi possível salvar a busca'));
        }
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Erro ao buscar o outro ponto.');
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

  if (loading) {
    return (
      <View style={[styles.container, styles.content]}>
        <Loading message="Procurando um ponto perto daqui..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.content]}>
        <Message
          type="error"
          title="Ops, algo deu errado"
          message={error}
          actionTitle="Tentar de novo"
          onAction={() => setAttempt((n) => n + 1)}
        />
      </View>
    );
  }

  if (!result) {
    return (
      <View style={[styles.container, styles.content]}>
        <Message
          type="empty"
          title="Nenhum ponto perto atende esse destino"
          message={`Não achamos ônibus para "${destino}" aqui nem nos pontos próximos.`}
          actionTitle="Fazer outra busca"
          onAction={() => router.dismissTo('/')}
        />
      </View>
    );
  }

  const { stop, option, linesThere, linesHere, destinationName } = result;
  const busCode = linesThere.find((l) => l.goesToDestination)?.code ?? '';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
    >
      <View>
        <Text style={styles.goingTo}>INDO PARA</Text>
        <Text style={styles.destination} accessibilityRole="header">
          {destinationName}
        </Text>
      </View>

      {/* Aviso principal */}
      <View style={styles.alert} accessible accessibilityLiveRegion="polite">
        <Ionicons name="alert-circle" size={fonts.title} color={colors.warning} />
        <View style={styles.alertBody}>
          <Text style={styles.alertTitle}>Nenhum ônibus deste ponto vai para {destinationName}</Text>
          <Text style={styles.alertText}>
            Ande {stop.walkMinutes} min até o {stop.name} e pegue o ônibus {busCode}.
          </Text>
        </View>
      </View>

      <RouteCard
        option={option}
        origin={TOTEM_STOP.name}
        destination={destinationName}
        action={{
          title: showMap ? 'Esconder o mapa' : 'Como chegar no ponto certo',
          icon: showMap ? 'chevron-up-outline' : 'map-outline',
          hint: `Mostra no mapa o caminho a pé até o ${stop.name}`,
          onPress: () => setShowMap((v) => !v),
        }}
      />

      {/* Mapa com o caminho a pé até o ponto certo */}
      {showMap && <WalkMap map={result.map} to={stop} busCode={busCode} />}

      {/* Caminho a pé */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          Como chegar ao outro ponto
        </Text>
        <WalkPath from={TOTEM_STOP} to={stop} />
      </View>

      {/* Ônibus do outro ponto: quais vão e quais não */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          Ônibus no {stop.name}
        </Text>
        <Text style={styles.info}>Horários considerando que você chega lá a pé em {stop.walkMinutes} min.</Text>
        {linesThere.map((line) => (
          <LineCheckCard
            key={line.lineId}
            line={line}
            destinationName={destinationName}
            now={now}
            onPress={() => openLine(line.lineId)}
          />
        ))}
      </View>

      {/* Ônibus deste ponto: nenhum vai */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          Ônibus deste ponto
        </Text>
        <View
          style={styles.notHere}
          accessible
          accessibilityLabel={`Nenhum ônibus deste ponto vai para ${destinationName}: ${linesHere.map((l) => l.code).join(', ')}`}
        >
          {linesHere.map((line) => (
            <View key={line.lineId} style={styles.notHereRow}>
              <Ionicons name="close-circle" size={fonts.regular} color={colors.danger} />
              <Text style={styles.notHereCode}>{line.code}</Text>
              <Text style={styles.notHereText}>não vai para {destinationName}</Text>
            </View>
          ))}
        </View>
      </View>

      <Button
        variant="secondary"
        title="Atualizar tempos"
        icon="refresh-outline"
        onPress={() => setAttempt((n) => n + 1)}
      />
      <Button title="Fazer outra busca" icon="search-outline" onPress={() => router.dismissTo('/')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.lg },

  goingTo: { fontSize: fonts.small, fontWeight: 'bold', color: colors.primary, letterSpacing },
  destination: { fontSize: fonts.title, fontWeight: 'bold', color: colors.text },
  info: { fontSize: fonts.small, color: colors.textMuted },

  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.cardLight,
    borderRadius: radius.md,
    borderLeftWidth: borders.accent,
    borderLeftColor: colors.warning,
    padding: spacing.md,
  },
  alertBody: { flex: 1, gap: spacing.xs },
  alertTitle: { fontSize: fonts.regular, fontWeight: 'bold', color: colors.text },
  alertText: { fontSize: fonts.small, color: colors.textMuted },

  section: { gap: spacing.md },
  sectionTitle: { fontSize: fonts.large, fontWeight: 'bold', color: colors.text },

  notHere: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, gap: spacing.sm },
  notHereRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  notHereCode: { fontSize: fonts.regular, fontWeight: 'bold', color: colors.text },
  notHereText: { flex: 1, fontSize: fonts.small, color: colors.textMuted },
});
