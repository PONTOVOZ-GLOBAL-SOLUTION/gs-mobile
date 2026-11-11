import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import Loading from '../components/Loading';
import Message from '../components/Message';
import { colors, fonts, spacing, radius, borders, TOUCH_SIZE } from '../constants/theme';
import { useHistory } from '../context/HistoryContext';
import { HistoryItem } from '../types';
import { formatDateTime } from '../utils/format';

// Pede confirmação antes de apagar (no navegador usa o confirm padrão)
function confirmar(mensagem: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(mensagem)) onConfirm();
    return;
  }
  Alert.alert('Confirmar', mensagem, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Apagar', style: 'destructive', onPress: onConfirm },
  ]);
}

// TELA 4 — Histórico de buscas salvo no SQLite do totem.
export default function Historico() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { history, loading, error, removeSearch, clearHistory, reloadHistory } = useHistory();

  const handleRemove = (item: HistoryItem) => {
    confirmar(`Apagar a busca por "${item.destinationName}"?`, () => removeSearch(item.id));
  };

  const handleClearAll = () => {
    confirmar('Apagar todas as buscas deste totem?', () => clearHistory());
  };

  if (loading && history.length === 0) {
    return (
      <View style={[styles.container, styles.content]}>
        <Loading message="Carregando buscas salvas..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.content]}>
        <Message type="error" title="Ops, algo deu errado" message={error} actionTitle="Tentar de novo" onAction={reloadHistory} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
      data={history}
      keyExtractor={(item) => String(item.id)}
      ListHeaderComponent={
        <Text style={styles.info}>Buscas feitas neste ponto. Toque em uma para ver os horários de agora.</Text>
      }
      ListEmptyComponent={
        <Message
          type="empty"
          title="Nenhuma busca ainda"
          message="Quando alguém pesquisar um destino, ele aparece aqui."
          actionTitle="Fazer uma busca"
          onAction={() => router.dismissTo('/')}
        />
      }
      ListFooterComponent={
        history.length > 0 ? (
          <Button variant="danger" title="Apagar todas as buscas" icon="trash-outline" onPress={handleClearAll} />
        ) : undefined
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.cardMain}
            activeOpacity={0.75}
            onPress={() => router.push({ pathname: '/rotas', params: { destino: item.destinationName } })}
            accessibilityRole="button"
            accessibilityLabel={
              `${item.destinationName}. Buscado em ${formatDateTime(item.searchedAt)}. ` +
              `Melhor opção na hora: ${item.bestOption}, ${item.bestTotalMinutes} minutos.`
            }
            accessibilityHint="Busca este destino de novo com os horários de agora"
          >
            <Text style={styles.cardTitle}>{item.destinationName}</Text>
            <Text style={styles.cardDate}>{formatDateTime(item.searchedAt)}</Text>
            <Text style={styles.cardBest}>
              Melhor opção na hora: {item.bestOption} ({item.bestTotalMinutes} min)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleRemove(item)}
            accessibilityRole="button"
            accessibilityLabel={`Apagar busca por ${item.destinationName}`}
          >
            <Ionicons name="trash-outline" size={fonts.large} color={colors.danger} />
          </TouchableOpacity>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md },
  info: { fontSize: fonts.regular, color: colors.textMuted },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: borders.thin,
    borderColor: colors.border,
  },
  cardMain: { flex: 1, padding: spacing.md, gap: spacing.xs, minHeight: TOUCH_SIZE },
  cardTitle: { fontSize: fonts.medium, fontWeight: 'bold', color: colors.text },
  cardDate: { fontSize: fonts.small, color: colors.textMuted },
  cardBest: { fontSize: fonts.small, color: colors.text },

  deleteButton: {
    width: TOUCH_SIZE,
    height: TOUCH_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    borderRadius: radius.md,
    borderWidth: borders.regular,
    borderColor: colors.danger,
  },
});
