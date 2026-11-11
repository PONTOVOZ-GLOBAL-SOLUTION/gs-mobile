import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors, fonts } from '../constants/theme';
import { HistoryProvider } from '../context/HistoryContext';
import DatabaseProvider from '../database/DatabaseProvider';

export default function RootLayout() {
  return (
    <DatabaseProvider>
      <HistoryProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.primary,
            headerTitleStyle: { color: colors.text, fontSize: fonts.medium, fontWeight: 'bold' },
            contentStyle: { backgroundColor: colors.background },
            headerBackButtonDisplayMode: 'minimal',
          }}
        >
          <Stack.Screen name="index" options={{ title: 'Parada Inteligente' }} />
          <Stack.Screen name="rotas" options={{ title: 'Melhores opções' }} />
          <Stack.Screen name="outro-ponto" options={{ title: 'Pegue em outro ponto' }} />
          <Stack.Screen name="linha/[id]" options={{ title: 'Detalhes da linha' }} />
          <Stack.Screen name="historico" options={{ title: 'Buscas recentes' }} />
          <Stack.Screen name="mapa" options={{ title: 'Ônibus no mapa' }} />
        </Stack>
      </HistoryProvider>
    </DatabaseProvider>
  );
}
